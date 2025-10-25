import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

// Types for database operations
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
  updatedAt: string;
}

export interface ChatThread {
  id: string;
  userId: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  metadata?: any;
  createdAt: string;
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  workflowData: any;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPublic: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Database operations
export const database = {
  // User operations
  users: {
    // Create user profile after successful authentication
    create: async (user: User, firstName: string, lastName: string) => {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            plan: 'FREE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      return { data, error };
    },

    // Get user profile
    getById: async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    },

    // Update user profile
    update: async (userId: string, updates: Partial<UserProfile>) => {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    },

    // Delete user profile
    delete: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      return { error };
    },
  },

  // Chat operations
  chats: {
    // Create new chat thread
    createThread: async (userId: string, title?: string) => {
      const { data, error } = await supabase
        .from('chat_threads')
        .insert([
          {
            user_id: userId,
            title: title || 'New Chat',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      return { data, error };
    },

    // Get user's chat threads
    getUserThreads: async (userId: string) => {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      return { data, error };
    },

    // Update chat thread
    updateThread: async (threadId: string, updates: Partial<ChatThread>) => {
      const { data, error } = await supabase
        .from('chat_threads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', threadId)
        .select()
        .single();

      return { data, error };
    },

    // Delete chat thread
    deleteThread: async (threadId: string) => {
      const { error } = await supabase
        .from('chat_threads')
        .delete()
        .eq('id', threadId);

      return { error };
    },

    // Add message to chat thread
    addMessage: async (threadId: string, role: 'USER' | 'ASSISTANT' | 'SYSTEM', content: string, metadata?: any) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            thread_id: threadId,
            role,
            content,
            metadata,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      return { data, error };
    },

    // Get messages for a chat thread
    getMessages: async (threadId: string) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      return { data, error };
    },
  },

  // Workflow operations
  workflows: {
    // Create new workflow
    create: async (userId: string, name: string, workflowData: any, description?: string) => {
      const { data, error } = await supabase
        .from('workflows')
        .insert([
          {
            user_id: userId,
            name,
            description,
            workflow_data: workflowData,
            status: 'DRAFT',
            is_public: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      return { data, error };
    },

    // Get user's workflows
    getUserWorkflows: async (userId: string) => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      return { data, error };
    },

    // Get public workflows
    getPublicWorkflows: async (limit: number = 20, offset: number = 0) => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'PUBLISHED')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data, error };
    },

    // Get workflow by ID
    getById: async (workflowId: string) => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      return { data, error };
    },

    // Update workflow
    update: async (workflowId: string, updates: Partial<Workflow>) => {
      const { data, error } = await supabase
        .from('workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workflowId)
        .select()
        .single();

      return { data, error };
    },

    // Delete workflow
    delete: async (workflowId: string) => {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      return { error };
    },

    // Create workflow version
    createVersion: async (workflowId: string, workflowData: any, changeLog?: string) => {
      const { data, error } = await supabase
        .from('workflow_versions')
        .insert([
          {
            workflow_id: workflowId,
            workflow_data: workflowData,
            version_number: 1, // This should be incremented based on existing versions
            change_log: changeLog,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      return { data, error };
    },
  },

  // Usage tracking
  usage: {
    // Record usage
    record: async (userId: string, usageType: 'WORKFLOW_GENERATION' | 'API_CALL' | 'DEPLOYMENT', amount: number = 1) => {
      const { data, error } = await supabase
        .from('usage_records')
        .insert([
          {
            user_id: userId,
            usage_type: usageType,
            amount,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      return { data, error };
    },

    // Get user usage for current month
    getMonthlyUsage: async (userId: string) => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('usage_records')
        .select('usage_type, amount')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      return { data, error };
    },
  },
};