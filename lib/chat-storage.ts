/**
 * Chat Storage Utilities for localStorage persistence
 */

import type { Message } from '@/components/chat/ChatInterface';

export interface StoredChat {
  threadId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'wpagent_chats';

/**
 * Get all stored chats from localStorage
 */
export function getStoredChats(): StoredChat[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const chats = JSON.parse(stored) as StoredChat[];
    return chats.map(chat => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map(message => ({
        ...message,
        timestamp: new Date(message.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Error loading chats from localStorage:', error);
    return [];
  }
}

/**
 * Save a chat to localStorage
 */
export function saveChat(threadId: string, messages: Message[]): void {
  try {
    if (messages.length === 0) return;

    const chats = getStoredChats();
    const existingChatIndex = chats.findIndex(chat => chat.threadId === threadId);
    
    // Generate title from first user message (truncated)
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    const title = firstUserMessage 
      ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
      : 'New Chat';

    const chatData: StoredChat = {
      threadId,
      title,
      messages,
      createdAt: existingChatIndex >= 0 ? chats[existingChatIndex].createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (existingChatIndex >= 0) {
      chats[existingChatIndex] = chatData;
    } else {
      chats.unshift(chatData); // Add to beginning
    }

    // Keep only last 50 chats
    const trimmedChats = chats.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedChats));
  } catch (error) {
    console.error('Error saving chat to localStorage:', error);
  }
}

/**
 * Get a specific chat by thread ID
 */
export function getChatByThreadId(threadId: string): StoredChat | null {
  try {
    const chats = getStoredChats();
    return chats.find(chat => chat.threadId === threadId) || null;
  } catch (error) {
    console.error('Error loading chat by thread ID:', error);
    return null;
  }
}

/**
 * Delete a chat from localStorage
 */
export function deleteChat(threadId: string): void {
  try {
    const chats = getStoredChats();
    const filteredChats = chats.filter(chat => chat.threadId !== threadId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredChats));
  } catch (error) {
    console.error('Error deleting chat from localStorage:', error);
  }
}

/**
 * Clear all chats from localStorage
 */
export function clearAllChats(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chats from localStorage:', error);
  }
}

/**
 * Generate a human-readable title from messages
 */
export function generateChatTitle(messages: Message[]): string {
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  
  // Extract key WordPress-related terms
  const content = firstUserMessage.content.toLowerCase();
  let title = firstUserMessage.content;
  
  // Try to extract WordPress operation types
  const wpKeywords = [
    'post', 'page', 'theme', 'plugin', 'woocommerce', 'product', 'order',
    'menu', 'widget', 'user', 'backup', 'optimize', 'seo', 'security',
    'media', 'image', 'category', 'tag', 'comment', 'database'
  ];
  
  const foundKeywords = wpKeywords.filter(keyword =>
    content.includes(keyword)
  );
  
  if (foundKeywords.length > 0) {
    title = foundKeywords.slice(0, 2).map(k =>
      k.charAt(0).toUpperCase() + k.slice(1)
    ).join(' + ') + ' Task';
  }
  
  // Truncate if too long
  return title.length > 50 ? title.slice(0, 47) + '...' : title;
}