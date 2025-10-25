'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { WelcomeScreen } from './WelcomeScreen';
import { Sidebar } from './Sidebar';
import { ArtifactContainer, type ArtifactData, type ArtifactVersion } from '@/components/artifacts/ArtifactContainer';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { saveChat, getChatByThreadId, generateChatTitle } from '@/lib/chat-storage';
import { parseArtifactFromStream, createWorkflowArtifact, generateArtifactId } from '@/lib/artifacts/utils';
import type { WorkflowArtifact, Artifact } from '@/lib/artifacts/types';
import { getGuestMessageCount, incrementGuestMessageCount, resetGuestMessageCount, hasReachedGuestMessageLimit } from '@/lib/guest-limits';
import { getWordPressCredentials } from '@/lib/wordpress-connection';

export interface AttachedFile {
  id: string;
  file: File;
  content?: string;
  type: 'text' | 'image' | 'other';
  preview?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: string;
  isLoading?: boolean;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  toolCalls?: ToolCall[];
  artifact?: ArtifactData;
  attachedFiles?: AttachedFile[];
}

export function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [threadId, setThreadId] = useState<string>(() =>
    `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  
  // Artifact state management
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [isArtifactVisible, setIsArtifactVisible] = useState(false);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Load guest message count on mount and reset when user logs in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGuestMessageCount(getGuestMessageCount());
    }
  }, []);

  // Debug auth state and auto-close modal when authenticated
  useEffect(() => {
    console.log('Auth state changed in ChatInterface:', {
      hasUser: !!user,
      userEmail: user?.email,
      authLoading,
      timestamp: new Date().toISOString()
    });

    // Auto-close auth modal when user is successfully authenticated
    if (user && !authLoading && isAuthModalOpen) {
      console.log('Auto-closing auth modal - user authenticated');
      setIsAuthModalOpen(false);
    }

    // Reset guest message count when user logs in
    if (user && !authLoading) {
      resetGuestMessageCount();
      setGuestMessageCount(0);
    }
  }, [user, authLoading, isAuthModalOpen]);

  // Load chat from URL parameter or localStorage on mount
  useEffect(() => {
    const urlThreadId = searchParams.get('t');
    if (urlThreadId) {
      const storedChat = getChatByThreadId(urlThreadId);
      if (storedChat) {
        setThreadId(urlThreadId);
        setMessages(storedChat.messages);
        return;
      }
    }
  }, [searchParams]);

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChat(threadId, messages);
      // Dispatch custom event to update sidebar
      window.dispatchEvent(new CustomEvent('chatUpdated'));
    }
  }, [messages, threadId]);

  // Save chat before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        saveChat(threadId, messages);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages, threadId]);

  const handleNewChat = () => {
    // Save current chat before starting new one
    if (messages.length > 0) {
      saveChat(threadId, messages);
    }

    // Cancel any ongoing streaming
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    // Reset state for new chat
    setMessages([]);
    setIsLoading(false);
    setIsStreaming(false);
    setInputValue('');
    
    // Reset artifact state
    setCurrentArtifact(null);
    setIsArtifactVisible(false);
    
    // Generate new thread ID for new conversation
    const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setThreadId(newThreadId);
    
    // Update URL without thread parameter (new chat)
    router.push('/');
  };

  const handleChatSelect = (selectedThreadId: string) => {
    // Save current chat before switching
    if (messages.length > 0 && threadId !== selectedThreadId) {
      saveChat(threadId, messages);
    }

    // Cancel any ongoing streaming
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }

    // Load selected chat
    const storedChat = getChatByThreadId(selectedThreadId);
    if (storedChat) {
      setThreadId(selectedThreadId);
      setMessages(storedChat.messages);
      setIsLoading(false);
      setIsStreaming(false);
      setInputValue('');
      
      // Update URL with thread parameter
      router.push(`/?t=${selectedThreadId}`);
    }
  };

  const handleFillInput = (content: string) => {
    setInputValue(content);
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsLoading(false);
    setIsStreaming(false);
  };

  const handleArtifactClose = () => {
    setIsArtifactVisible(false);
    setCurrentArtifact(null);
  };

  const handleArtifactVersionChange = (versionId: string) => {
    if (!currentArtifact) return;
    
    const version = currentArtifact.versions.find(v => v.id === versionId);
    if (version) {
      setCurrentArtifact({
        ...currentArtifact,
        currentVersion: version,
        updatedAt: new Date()
      });
    }
  };

  const handleOpenArtifact = (artifact: ArtifactData) => {
    setCurrentArtifact(artifact);
    setIsArtifactVisible(true);
  };

  const handleLoginClick = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleAuthClose = () => {
    setIsAuthModalOpen(false);
  };

  const handleSendMessage = async (content: string, attachedFiles?: AttachedFile[]) => {
    if (!content.trim() && (!attachedFiles || attachedFiles.length === 0)) return;

    // Check global message limit for unauthenticated users
    if (!user && hasReachedGuestMessageLimit()) {
      // Open auth modal instead of sending message
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    // Increment guest message count for unauthenticated users
    if (!user) {
      const newCount = incrementGuestMessageCount();
      setGuestMessageCount(newCount);
    }

    // Create content for AI processing (includes file content)
    let aiProcessingContent = content.trim();
    if (attachedFiles && attachedFiles.length > 0) {
      const fileContents: string[] = [];
      
      for (const file of attachedFiles) {
        if (file.type === 'text' && file.content) {
          fileContents.push(`\n\n**File: ${file.file.name}**\n\`\`\`\n${file.content}\n\`\`\``);
        } else if (file.type === 'image') {
          fileContents.push(`\n\n**Image: ${file.file.name}** (attached)`);
        } else {
          fileContents.push(`\n\n**File: ${file.file.name}** (${file.file.type || 'unknown type'})`);
        }
      }
      
      if (fileContents.length > 0) {
        aiProcessingContent += fileContents.join('');
      }
    }

    // Create user message for display (does NOT include file content)
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(), // Only show user's text, not file content
      role: 'user',
      timestamp: new Date(),
      attachedFiles: attachedFiles,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);
    setInputValue(''); // Clear input after sending

    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    const assistantMessageId = (Date.now() + 1).toString();
    let assistantMessageCreated = false;

    try {
      // Get WordPress credentials from localStorage (if available)
      const wpCredentials = getWordPressCredentials();
      
      // Call server-side API route with streaming
      const response = await fetch('/api/wordpress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: aiProcessingContent, // Send enhanced content with file data to AI
          thread_id: threadId,
          wordpress_credentials: wpCredentials // Include WordPress credentials if available
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let buffer = ''; // Buffer for incomplete JSON

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsLoading(false);
          setIsStreaming(false);
          setAbortController(null);
          break;
        }

        const chunk = decoder.decode(value);
        buffer += chunk;
        const lines = buffer.split('\n');
        
        // Keep the last line in buffer if it doesn't end with newline
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue; // Skip empty data lines
              
              const eventData = JSON.parse(jsonStr);
              
              if (eventData.type === 'tool_call') {
                // Create assistant message if not created, or update with tool call
                if (!assistantMessageCreated) {
                  const assistantMessage: Message = {
                    id: assistantMessageId,
                    content: '',
                    role: 'assistant',
                    timestamp: new Date(),
                    toolCalls: [{
                      id: eventData.id,
                      name: eventData.name,
                      args: eventData.args,
                      isLoading: true
                    }]
                  };
                  setMessages(prev => [...prev, assistantMessage]);
                  setIsLoading(false); // Hide loading dot
                  assistantMessageCreated = true;
                } else {
                  // Add tool call to existing message
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          toolCalls: [...(msg.toolCalls || []), {
                            id: eventData.id,
                            name: eventData.name,
                            args: eventData.args,
                            isLoading: true
                          }]
                        }
                      : msg
                  ));
                }
              } else if (eventData.type === 'tool_result') {
                // Update tool call with result - match by tool name since we might not have exact ID match
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        toolCalls: msg.toolCalls?.map(tool =>
                          tool.name === eventData.name
                            ? { ...tool, result: eventData.content, isLoading: false }
                            : tool
                        )
                      }
                    : msg
                ));
              } else if (eventData.type === 'token' && eventData.content) {
                accumulatedContent += eventData.content;
                
                // Create assistant message on first token if no tool calls yet
                if (!assistantMessageCreated) {
                  const assistantMessage: Message = {
                    id: assistantMessageId,
                    content: accumulatedContent,
                    role: 'assistant',
                    timestamp: new Date(),
                  };
                  setMessages(prev => [...prev, assistantMessage]);
                  setIsLoading(false); // Hide loading dot
                  assistantMessageCreated = true;
                } else {
                  // Update existing assistant message content
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                }
                
                // Check if we have a complete artifact
                if (accumulatedContent.includes('</artifact>')) {
                  const parsedArtifact = parseArtifactFromStream(accumulatedContent);
                  
                  if (parsedArtifact && parsedArtifact.type && parsedArtifact.data) {
                    // Show artifact container
                    if (!isArtifactVisible) {
                      setIsArtifactVisible(true);
                    }
                    
                    const artifactId = generateArtifactId();
                    const now = new Date();
                    
                    // Create version structure compatible with ArtifactContainer
                    const version: ArtifactVersion = {
                      id: generateArtifactId(),
                      content: parsedArtifact.data,
                      timestamp: now,
                      title: parsedArtifact.title || 'Version 1'
                    };
                    
                    // Create final artifact data structure
                    const fullArtifactData: ArtifactData = {
                      id: artifactId,
                      type: parsedArtifact.type,
                      title: parsedArtifact.title || 'Generated Workflow',
                      description: `Generated ${parsedArtifact.type} artifact`,
                      currentVersion: version,
                      versions: [version],
                      createdAt: now,
                      updatedAt: now
                    };
                    
                    // Remove artifact content from chat message and update with clean text
                    const cleanContent = accumulatedContent
                      .replace(/<artifact[\s\S]*?<\/artifact>/gi, '')
                      .trim();
                    
                    // Update message with clean content and artifact data
                    setMessages(prev => prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: cleanContent, artifact: fullArtifactData }
                        : msg
                    ));
                    
                    // Update artifact container with final content
                    setCurrentArtifact(fullArtifactData);
                  }
                } else {
                  // For incomplete artifacts, show clean content without artifact tags
                  let displayContent = accumulatedContent;
                  if (accumulatedContent.includes('<artifact')) {
                    // Remove partial artifact content from display
                    displayContent = accumulatedContent
                      .replace(/<artifact[\s\S]*$/gi, '')
                      .trim();
                      
                    // Show artifact container with loading state when artifact is detected
                    if (!isArtifactVisible) {
                      setIsArtifactVisible(true);
                      
                      // Create loading artifact
                      const artifactMatch = accumulatedContent.match(/<artifact(?:\s+type="([^"]+)")?(?:\s+title="([^"]+)")?/);
                      const [, type, title] = artifactMatch || [];
                      
                      const loadingArtifact: ArtifactData = {
                        id: generateArtifactId(),
                        type: type as any || 'workflow',
                        title: title || 'Generating Workflow...',
                        description: 'Workflow is being generated, please wait...',
                        currentVersion: {
                          id: generateArtifactId(),
                          content: {
                            name: title || 'Loading...',
                            nodes: [],
                            connections: {},
                            active: false
                          },
                          timestamp: new Date(),
                          title: 'Loading...'
                        },
                        versions: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                      };
                      
                      setCurrentArtifact(loadingArtifact);
                    }
                  }
                  
                  // Update message with clean display content
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: displayContent }
                      : msg
                  ));
                }
              } else if (eventData.type === 'complete') {
                setIsLoading(false);
                setIsStreaming(false);
                setAbortController(null);
                return;
              } else if (eventData.type === 'error') {
                console.error('Streaming error:', eventData.content);
                if (!assistantMessageCreated) {
                  const errorMessage: Message = {
                    id: assistantMessageId,
                    content: `Error: ${eventData.content || 'Failed to generate workflow'}`,
                    role: 'assistant',
                    timestamp: new Date(),
                  };
                  setMessages(prev => [...prev, errorMessage]);
                } else {
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: `Error: ${eventData.content || 'Failed to generate workflow'}` }
                      : msg
                  ));
                }
                setIsLoading(false);
                setIsStreaming(false);
                setAbortController(null);
                return;
              }
            } catch (parseError) {
              console.error('Error parsing event data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      // Handle abort signal
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted by user');
        if (!assistantMessageCreated) {
          const abortMessage: Message = {
            id: assistantMessageId,
            content: '',
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, abortMessage]);
        } else {
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content  }
              : msg
          ));
        }
      } else {
        console.error('Error generating workflow:', error);
        if (!assistantMessageCreated) {
          const errorMessage: Message = {
            id: assistantMessageId,
            content: 'Sorry, I encountered an error while generating your workflow. Please check the server logs and ensure your API key is configured correctly.',
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        } else {
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: 'Sorry, I encountered an error while generating your workflow. Please check the server logs and ensure your API key is configured correctly.' }
              : msg
          ));
        }
      }
      setIsLoading(false);
      setIsStreaming(false);
      setAbortController(null);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex w-full h-screen bg-gradient-bg overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        currentThreadId={threadId}
        user={user}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden flex-col">
        {/* Header with Auth Buttons */}
        {!authLoading && !user && (
          <div className="flex justify-end items-center p-4 bg-background/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoginClick}
                className="gap-2 hover:bg-[#FF6D6B]/10 hover:text-[#FF6D6B] transition-colors"
              >
                <LogIn className="size-4" />
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={handleSignUpClick}
                className="gap-2 bg-[#FF6D6B] hover:bg-[#FF5A57] text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <UserPlus className="size-4" />
                Sign Up
              </Button>
            </div>
          </div>
        )}

        {/* Chat Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className={`flex flex-col ${isArtifactVisible ? 'w-2/5' : 'w-full'} overflow-hidden transition-all duration-300`}>
          {!hasMessages ? (
            /* Welcome Screen with Centered Input */
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8">
                <WelcomeScreen />
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onStop={handleStopGeneration}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                  hasMessages={hasMessages}
                  value={inputValue}
                  onChange={setInputValue}
                  user={user}
                  userMessageCount={guestMessageCount}
                />
                
                {/* Example Prompt Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
                  {[
                    "Create a Slack notification workflow when GitHub issues are created",
                    "Build an automated email sequence for new subscribers",
                    "Set up data sync between Google Sheets and Airtable",
                    "Monitor website changes and send Discord alerts"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleFillInput(example)}
                      className="text-left p-4 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-primary/30 transition-all duration-200 text-sm text-foreground-muted hover:text-foreground group"
                      disabled={isLoading}
                    >
                      <span className="block truncate">{example}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat View with Bottom Input */
            <>
              <div
                className="flex-1 overflow-y-auto scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  onOpenArtifact={handleOpenArtifact}
                />
              </div>
              <div className="backdrop-blur-md bg-background/80 p-4 shrink-0">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onStop={handleStopGeneration}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                  hasMessages={hasMessages}
                  value={inputValue}
                  onChange={setInputValue}
                  user={user}
                  userMessageCount={guestMessageCount}
                />
              </div>
            </>
          )}
        </div>
        
        {/* Desktop Artifact Container */}
        {isArtifactVisible && (
          <div className="hidden md:flex w-3/5 border-l border-border flex-col">
            <ArtifactContainer
              artifact={currentArtifact}
              isVisible={isArtifactVisible}
              onClose={handleArtifactClose}
              onVersionChange={handleArtifactVersionChange}
              className="w-full h-full"
            />
          </div>
        )}
        </div>
      </div>
      
      {/* Mobile Artifact Overlay */}
      {isArtifactVisible && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <ArtifactContainer
            artifact={currentArtifact}
            isVisible={isArtifactVisible}
            onClose={handleArtifactClose}
            onVersionChange={handleArtifactVersionChange}
          />
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthClose}
        defaultMode={authMode}
      />
    </div>
  );
}