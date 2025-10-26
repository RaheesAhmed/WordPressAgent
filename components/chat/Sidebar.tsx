'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
  Mail,
  Crown,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { Logo, LogoIcon } from '../ui/Logo';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { getStoredChats, deleteChat, type StoredChat } from '@/lib/chat-storage';
import { useAuth } from '@/hooks/useAuth';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { WordPressSettings } from '@/components/settings/WordPressSettings';

interface SidebarProps {
  onNewChat: () => void;
  onChatSelect: (threadId: string) => void;
  currentThreadId?: string;
  user?: SupabaseUser | null;
}

export function Sidebar({ onNewChat, onChatSelect, currentThreadId, user }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [storedChats, setStoredChats] = useState<StoredChat[]>([]);
  const [isWordPressSettingsOpen, setIsWordPressSettingsOpen] = useState(false);
  const { signOut } = useAuth();

  // Load chats from localStorage on mount and when localStorage changes
  useEffect(() => {
    const loadChats = () => {
      setStoredChats(getStoredChats());
    };

    loadChats();
    
    // Listen for storage changes
    window.addEventListener('storage', loadChats);
    
    // Custom event for when we save chats
    const handleChatUpdate = () => loadChats();
    window.addEventListener('chatUpdated', handleChatUpdate);
    
    return () => {
      window.removeEventListener('storage', loadChats);
      window.removeEventListener('chatUpdated', handleChatUpdate);
    };
  }, []);

  const handleDeleteChat = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(threadId);
    setStoredChats(getStoredChats());
    
    // If we deleted the current chat, trigger new chat
    if (currentThreadId === threadId) {
      onNewChat();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={`
      flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out
      ${isExpanded ? 'w-64' : 'w-16'}
    `}>
      {/* Header */}
      <div className={`border-b border-sidebar-border ${
        isExpanded
          ? 'flex items-center justify-between p-3'
          : 'flex flex-col items-center p-2 gap-1'
      }`}>
        {isExpanded ? (
          <div style={{ color: 'hsl(var(--foreground))' }}>
            <Logo variant="compact" />
          </div>
        ) : (
          <Logo variant="mini" />
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-1 hover:bg-sidebar-accent shrink-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronLeft className="size-4 text-sidebar-foreground" />
          ) : (
            <ChevronRight className="size-4 text-sidebar-foreground" />
          )}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className={`
            w-full glass-subtle hover:glass border border-sidebar-border
            ${isExpanded ? 'justify-start gap-3 px-4 py-3' : 'justify-center p-3'}
          `}
          variant="ghost"
        >
          <Plus className="size-4 text-sidebar-foreground shrink-0" />
          {isExpanded && (
            <span className="text-sidebar-foreground font-medium">New Chat</span>
          )}
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 px-3 overflow-y-auto scrollbar-hide">
        {isExpanded ? (
          <div className="space-y-1">
            <div className="text-xs font-medium text-sidebar-foreground/60 px-3 py-2 uppercase tracking-wide">
              Recent Chats
            </div>
            {storedChats.length === 0 ? (
              <div className="text-xs text-sidebar-foreground/40 px-3 py-4 text-center">
                No previous chats
              </div>
            ) : (
              storedChats.map((chat) => (
                <div
                  key={chat.threadId}
                  className={`
                    group relative rounded-lg transition-all duration-200
                    ${currentThreadId === chat.threadId
                      ? 'bg-sidebar-accent border border-sidebar-border'
                      : 'hover:bg-sidebar-accent/50'
                    }
                  `}
                >
                  <Button
                    variant="ghost"
                    onClick={() => onChatSelect(chat.threadId)}
                    className="w-full justify-start gap-3 px-3 py-2 h-auto text-left hover:bg-transparent"
                  >
                    <MessageSquare className="size-4 text-sidebar-foreground/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-sidebar-foreground/80 truncate group-hover:text-sidebar-foreground">
                        {chat.title}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-sidebar-foreground/40">
                        <Calendar className="size-3" />
                        {formatDate(chat.updatedAt)}
                        <span className="ml-1">• {chat.messages.length} msgs</span>
                      </div>
                    </div>
                  </Button>
                  
                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteChat(chat.threadId, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity size-6 p-1 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {storedChats.slice(0, 8).map((chat) => (
              <Button
                key={chat.threadId}
                variant="ghost"
                onClick={() => onChatSelect(chat.threadId)}
                className={`
                  w-full justify-center p-3 hover:bg-sidebar-accent transition-all
                  ${currentThreadId === chat.threadId
                    ? 'bg-sidebar-accent border border-sidebar-border'
                    : ''
                  }
                `}
                title={chat.title}
              >
                <MessageSquare className="size-4 text-sidebar-foreground/60" />
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* Settings */}
        <Button
          variant="ghost"
          onClick={() => setIsWordPressSettingsOpen(true)}
          className={`
            w-full hover:bg-sidebar-accent
            ${isExpanded ? 'justify-start gap-3 px-3 py-2' : 'justify-center p-3'}
          `}
        >
          <Settings className="size-4 text-sidebar-foreground/60 shrink-0" />
          {isExpanded && (
            <span className="text-sm text-sidebar-foreground/80">WordPress Settings</span>
          )}
        </Button>

        {/* User Profile */}
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={`
                  w-full hover:bg-sidebar-accent transition-all
                  ${isExpanded ? 'justify-start gap-3 px-3 py-2' : 'justify-center p-3'}
                `}
              >
                {/* Profile Avatar */}
                <div className="shrink-0">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="size-8 rounded-full object-cover border border-sidebar-border"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-gradient-to-br from-[#21759B] to-[#1a5f7e] flex items-center justify-center text-white font-medium text-sm">
                      {(user.email?.charAt(0) || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
                {isExpanded && (
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-sm font-medium text-sidebar-foreground">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-sidebar-foreground/60">
                      View profile
                    </span>
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" side={isExpanded ? "right" : "top"} align="start">
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="shrink-0">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="size-12 rounded-full object-cover border-2 border-sidebar-border"
                      />
                    ) : (
                      <div className="size-12 rounded-full bg-gradient-to-br from-[#21759B] to-[#1a5f7e] flex items-center justify-center text-white font-medium text-lg">
                        {(user.email?.charAt(0) || 'U').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-3" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Account Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Crown className="size-4 text-[#21759B]" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Free Plan</div>
                      <div className="text-xs text-muted-foreground">10 credits remaining</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Member since {new Date(user.created_at).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Actions */}
                <div className="space-y-2">
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-left"
                  >
                    <Settings className="size-4" />
                    Account Settings
                  </Button> */}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="w-full justify-start gap-2 text-left hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button
            variant="ghost"
            className={`
              w-full hover:bg-sidebar-accent opacity-50 cursor-default
              ${isExpanded ? 'justify-start gap-3 px-3 py-2' : 'justify-center p-3'}
            `}
          >
            <div className="glass-subtle rounded-full p-1 shrink-0">
              <User className="size-3 text-sidebar-foreground" />
            </div>
            {isExpanded && (
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-sidebar-foreground">Not signed in</span>
                <span className="text-xs text-sidebar-foreground/60">Guest mode</span>
              </div>
            )}
          </Button>
        )}
      </div>
      
      {/* n8n Settings Modal */}
      <WordPressSettings
        isOpen={isWordPressSettingsOpen}
        onClose={() => setIsWordPressSettingsOpen(false)}
      />
    </div>
  );
}