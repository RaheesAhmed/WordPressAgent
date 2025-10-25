/**
 * wpAgent Main Agent
 * AI Agent for WordPress site management with MCP integration
 */

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { ChatAnthropic } from '@langchain/anthropic';
import { mcpClientManager } from '@/lib/mcp-client-manager';
import { WP_AGENT_SYSTEM_PROMPT } from './prompts/system-prompt';
import type { WpAgentConfig } from './types';

/**
 * Default configuration for wpAgent
 */
const DEFAULT_CONFIG: WpAgentConfig = {
  model: "claude-sonnet-4-20250514",
  enableWebSearch: true,
  enableTemplates: false,
  enableSubAgents: false,
  customNodes: [],
};

/**
 * Memory saver instance for conversation persistence
 */
const memory = new MemorySaver();

/**
 * Get WordPress MCP tools using persistent client
 */
async function getWordPressMCPTools(config: WpAgentConfig): Promise<any[]> {
  const wpUrl = config.wordpressUrl || process.env.WORDPRESS_URL;
  const wpUsername = config.wordpressUsername || process.env.WORDPRESS_USERNAME;
  const wpPassword = config.wordpressAppPassword || process.env.WORDPRESS_APP_PASSWORD;

  if (!wpUrl || !wpUsername || !wpPassword) {
    console.warn('WordPress credentials not fully configured. Some tools may be unavailable.');
    return [];
  }

  try {
    // Use singleton MCP client manager
    const tools = await mcpClientManager.getTools({
      wordpressUrl: wpUrl,
      wordpressUsername: wpUsername,
      wordpressPassword: wpPassword,
    });
    
    return tools;
  } catch (error) {
    console.error('Failed to get WordPress MCP tools:', error);
    return [];
  }
}

/**
 * Create wpAgent with specified configuration and memory support
 */
export async function createWpAgent(config: WpAgentConfig = {}): Promise<any> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Validate required API key
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicKey) {
    throw new Error(
      'Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable or pass anthropicApiKey in config.'
    );
  }

  // Configure model
  const model = new ChatAnthropic({
    model: "claude-sonnet-4-20250514",
    anthropicApiKey: anthropicKey as string,
    temperature: 0.1,
    maxTokens: 64000,
    clientOptions: {
      defaultHeaders: {
        "anthropic-beta": ["token-efficient-tools-2025-02-19",
        "fine-grained-tool-streaming-2025-05-14"]
      },
    },   
  });

  // Get WordPress MCP tools using persistent client
  const wpTools = await getWordPressMCPTools(finalConfig);

  // Combine MCP tools with web search
  const allTools = [
    ...wpTools,
    {
      type: "web_search_20250305",
      name: "web_search",
      max_uses: 5,
    } as any,
  ];

  // Create ReAct Agent with WordPress MCP tools and memory support
  const agent = createReactAgent({
    tools: allTools,
    stateModifier: WP_AGENT_SYSTEM_PROMPT,
    llm: model,
    checkpointSaver: memory,
  });

  return agent;
}

/**
 * Validate environment setup for wpAgent
 */
export function validateWpAgentEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for Anthropic API key
  if (!process.env.ANTHROPIC_API_KEY) {
    errors.push('ANTHROPIC_API_KEY environment variable is not set');
  }

  // Check for WordPress credentials
  if (!process.env.WORDPRESS_URL) {
    warnings.push('WORDPRESS_URL not configured - WordPress operations will be limited');
  }

  if (!process.env.WORDPRESS_USERNAME) {
    warnings.push('WORDPRESS_USERNAME not configured');
  }

  if (!process.env.WORDPRESS_APP_PASSWORD) {
    warnings.push('WORDPRESS_APP_PASSWORD not configured');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get memory saver instance
 */
export function getMemory() {
  return memory;
}

/**
 * Stream WordPress operations with tool call visibility and memory support
 */
export async function* streamWordPressOperations(
  description: string,
  threadId: string,
  config: WpAgentConfig = {}
): AsyncGenerator<any, void, unknown> {
  const agent = await createWpAgent(config);
  
  const messages = [
    {
      role: 'user' as const,
      content: description
    }
  ];

  try {
    // Use multiple stream modes to see both updates (tool calls) and messages
    const stream = await agent.stream(
      { messages },
      {
        streamMode: ["updates", "messages"],
        configurable: { thread_id: threadId }
      }
    );

    for await (const chunk of stream) {
      const [streamType, data] = chunk;
      
      if (streamType === "updates") {
        // Handle state updates (includes tool calls)
        for (const [nodeName, nodeData] of Object.entries(data)) {
          if (nodeData && typeof nodeData === 'object' && 'messages' in nodeData) {
            const messages = nodeData.messages as any[];
            for (const message of messages) {
              // Check if this message has tool calls
              if (message.tool_calls && message.tool_calls.length > 0) {
                for (const toolCall of message.tool_calls) {
                  yield {
                    type: 'tool_call',
                    name: toolCall.name || toolCall.function?.name,
                    args: toolCall.args || toolCall.function?.arguments,
                    id: toolCall.id
                  };
                }
              }
              
              // Check for tool call results
              if (message.name && message.content) {
                yield {
                  type: 'tool_result',
                  name: message.name,
                  content: message.content
                };
              }
              
              // Regular assistant message content
              if (message.role === 'assistant' && message.content && !message.tool_calls) {
                const content = Array.isArray(message.content)
                  ? message.content.map((part: any) => typeof part === 'string' ? part : part.text || '').join('')
                  : message.content;
                
                if (content.trim()) {
                  yield {
                    type: 'content',
                    content: content
                  };
                }
              }
            }
          }
        }
      } else if (streamType === "messages") {
        // Handle streaming messages (tokens and tool calls)
        const [message, metadata] = data;
        
        if (message && message.content && Array.isArray(message.content)) {
          // Look for tool calls and results in content array
          for (const contentPart of message.content) {
            if (contentPart.type === 'server_tool_use') {
              yield {
                type: 'tool_call',
                name: contentPart.name,
                args: contentPart.input || contentPart.arguments || contentPart.parameters || {},
                id: contentPart.id
              };
            } else if (contentPart.type === 'web_search_tool_result') {
              yield {
                type: 'tool_result',
                name: 'web_search',
                content: contentPart.content || contentPart.result || 'Search completed',
                data: contentPart
              };
            } else if (contentPart.type === 'text' && contentPart.text) {
              // Filter out MCP tool results (they show in dropdown)
              const text = contentPart.text.trim();
              
              // Skip empty content
              if (!text) continue;
              
              // Skip if it starts with emoji indicator (MCP tool output)
              if (/^[🔌📄✅❌⚙️🎯💡⚠️🔧📊🔍🎨🔐💾🏷️👤📝ℹ️]/.test(text)) {
                continue;
              }
              
              // Skip if it looks like JSON data (any line starting with { or [)
              if (text.startsWith('{') || text.startsWith('[')) {
                continue;
              }
              
              // Skip if it contains WordPress-specific patterns (tool output)
              const toolOutputPatterns = [
                /Retrieved \d+/,
                /Connected as .+ user to/,
                /Site:/,
                /^\{[\s\S]*"id"[\s\S]*"title"[\s\S]*\}$/, // JSON object
                /^\[[\s\S]*\]$/, // JSON array
                /"plugin[s]?":/,
                /"post[s]?":/,
                /"page[s]?":/,
                /"user[s]?":/,
                /"theme[s]?":/,
                /"media":/,
                /"name":/,
                /"url":/,
                /"status":/,
                /"author":/,
                /"content":/,
              ];
              
              const isToolOutput = toolOutputPatterns.some(pattern => pattern.test(text));
              if (isToolOutput) {
                continue;
              }
              
              // Only yield actual assistant conversational content
              if (text) {
                yield {
                  type: 'token',
                  content: contentPart.text
                };
              }
            }
          }
        } else if (message && message.content) {
          // Handle simple content
          const content = Array.isArray(message.content)
            ? message.content.map((part: any) => typeof part === 'string' ? part : part.text || '').join('')
            : message.content;
          
          if (content.trim()) {
            yield {
              type: 'token',
              content: content
            };
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming WordPress operations:', error);
    yield {
      type: 'error',
      content: error instanceof Error ? error.message : 'Unknown streaming error'
    };
  }
}

/**
 * Stream WordPress operations using updates mode to see tool calls with memory support
 */
export async function* streamWordPressUpdates(
  description: string,
  threadId: string,
  config: WpAgentConfig = {}
): AsyncGenerator<any, void, unknown> {
  const agent = await createWpAgent(config);
  
  const messages = [
    {
      role: 'user' as const,
      content: description
    }
  ];

  try {
    // Use stream with updates mode to see tool calls and state changes
    const stream = await agent.stream(
      { messages },
      {
        streamMode: "updates",
        configurable: { thread_id: threadId }
      }
    );

    for await (const chunk of stream) {
      for (const [nodeName, values] of Object.entries(chunk)) {
        yield {
          type: 'update',
          node: nodeName,
          data: values
        };
      }
    }
  } catch (error) {
    console.error('Error streaming WordPress updates:', error);
    yield {
      type: 'error',
      content: error instanceof Error ? error.message : 'Unknown streaming error'
    };
  }
}

export { WP_AGENT_SYSTEM_PROMPT } from './prompts/system-prompt';
export type { WpAgentConfig } from './types';
export default createWpAgent;