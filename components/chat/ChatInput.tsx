'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { ArrowUp, Plus, Paperclip, Square, X, FileText, Image, File, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import type { User } from '@supabase/supabase-js';

interface AttachedFile {
  id: string;
  file: File;
  content?: string;
  type: 'text' | 'image' | 'other';
  preview?: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, attachedFiles?: AttachedFile[]) => void;
  onStop?: () => void;
  isLoading: boolean;
  isStreaming?: boolean;
  hasMessages: boolean;
  value?: string;
  onChange?: (value: string) => void;
  user?: User | null;
  userMessageCount?: number;
}

export function ChatInput({ onSendMessage, onStop, isLoading, isStreaming, hasMessages, value, onChange, user, userMessageCount = 0 }: ChatInputProps) {
  const [internalMessage, setInternalMessage] = useState('');
  const message = value !== undefined ? value : internalMessage;
  const setMessage = onChange !== undefined ? onChange : setInternalMessage;
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((message.trim() || attachedFiles.length > 0) && !isLoading && !isStreaming) {
      onSendMessage(message, attachedFiles);
      setMessage('');
      setAttachedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      const attachedFile: AttachedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        type: getFileType(file),
      };

      // Read file content based on type
      try {
        if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.csv') || file.name.endsWith('.xml')) {
          const content = await readTextFile(file);
          attachedFile.content = content;
          attachedFile.type = 'text';
        } else if (file.type.startsWith('image/')) {
          const preview = await readImageFile(file);
          attachedFile.preview = preview;
          attachedFile.type = 'image';
        } else {
          attachedFile.type = 'other';
        }
      } catch (error) {
        console.error('Error reading file:', error);
      }

      setAttachedFiles(prev => [...prev, attachedFile]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const readImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getFileType = (file: File): 'text' | 'image' | 'other' => {
    if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.csv') || file.name.endsWith('.xml')) {
      return 'text';
    } else if (file.type.startsWith('image/')) {
      return 'image';
    }
    return 'other';
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleStop = () => {
    if (onStop && isStreaming) {
      onStop();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <div className={`w-full max-w-3xl mx-auto px-4 ${hasMessages ? '' : 'animate-scale-in'}`}>
      <div className="glass rounded-2xl border border-border-hover shadow-lg">
        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="p-4 pb-0">
            <div className="flex flex-wrap gap-2 scrollbar-hide">
              {attachedFiles.map((attachedFile) => (
                <div
                  key={attachedFile.id}
                  className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 border border-border/20"
                >
                  {attachedFile.type === 'text' && <FileText className="size-4 text-blue-500" />}
                  {attachedFile.type === 'image' && <Image className="size-4 text-green-500" />}
                  {attachedFile.type === 'other' && <File className="size-4 text-gray-500" />}
                  
                  <span className="text-sm text-foreground truncate max-w-32">
                    {attachedFile.file.name}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(attachedFile.id)}
                    className="size-6 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-4">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.json,.csv,.xml,.md,.js,.ts,.py,.html,.css,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAttachClick}
            className="shrink-0 glass-subtle size-10 p-2 hover:bg-muted/50 transition-colors"
            disabled={isLoading || isStreaming}
            title="Attach file"
          >
            <Paperclip className="size-4 text-foreground-muted" />
          </Button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={hasMessages ? "Ask a follow-up question..." : "what you want to build today?"}
              className="w-full resize-none border-0 bg-transparent px-0 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-base leading-6 scrollbar-hide"
              style={{
                minHeight: '24px',
                maxHeight: '200px'
              }}
              disabled={isLoading || isStreaming}
              rows={1}
            />
          </div>

          {/* Send/Stop Button */}
          {isStreaming ? (
            <Button
              onClick={handleStop}
              className="shrink-0 size-10 p-2 rounded-xl transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:scale-110"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={(!message.trim() && attachedFiles.length === 0) || isLoading}
              className={`shrink-0 size-10 p-2 rounded-xl transition-all duration-300 ${
                (message.trim() || attachedFiles.length > 0) && !isLoading
                  ? 'bg-gradient-to-r from-[#FF6D6B] to-[#FF5A57] hover:from-[#FF5A57] hover:to-[#FF4F4C] text-white shadow-lg hover:scale-110'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground/70">
            <div className="flex items-center gap-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {attachedFiles.length > 0 && (
                <span>• {attachedFiles.length} file{attachedFiles.length > 1 ? 's' : ''} attached</span>
              )}
            </div>
            {/* Message Limit Indicator for Guest Users */}
            {!user && (
              <div className="flex items-center gap-2 text-xs">
                <Crown className="size-3 text-[#FF6D6B]" />
                <span className={userMessageCount >= 3 ? 'text-[#FF6D6B] font-medium' : ''}>
                  {userMessageCount >= 3 ? 'Login to continue' : `${userMessageCount}/3 free messages`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}