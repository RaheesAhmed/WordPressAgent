/**
 * MCP Client Manager - Singleton Pattern
 * Manages WordPress MCP client lifecycle to avoid reinitializing on every request
 */

import { MultiServerMCPClient } from "@langchain/mcp-adapters";

interface MCPClientConfig {
  wordpressUrl: string;
  wordpressUsername: string;
  wordpressPassword: string;
}

class MCPClientManager {
  private static instance: MCPClientManager;
  private client: MultiServerMCPClient | null = null;
  private currentConfig: MCPClientConfig | null = null;
  private initializationPromise: Promise<MultiServerMCPClient> | null = null;
  private tools: any[] | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): MCPClientManager {
    if (!MCPClientManager.instance) {
      MCPClientManager.instance = new MCPClientManager();
    }
    return MCPClientManager.instance;
  }

  /**
   * Check if configuration has changed
   */
  private hasConfigChanged(newConfig: MCPClientConfig): boolean {
    if (!this.currentConfig) return true;
    
    return (
      this.currentConfig.wordpressUrl !== newConfig.wordpressUrl ||
      this.currentConfig.wordpressUsername !== newConfig.wordpressUsername ||
      this.currentConfig.wordpressPassword !== newConfig.wordpressPassword
    );
  }

  /**
   * Initialize MCP client with configuration
   */
  async initialize(config: MCPClientConfig): Promise<MultiServerMCPClient> {
    // If already initializing with same config, wait for it
    if (this.initializationPromise && !this.hasConfigChanged(config)) {
      return this.initializationPromise;
    }

    // If config changed or no client exists, create new one
    if (this.hasConfigChanged(config)) {
      // Close existing client if any
      if (this.client) {
        try {
          await this.client.close();
        } catch (error) {
          console.error('Error closing existing MCP client:', error);
        }
        this.client = null;
        this.tools = null;
      }

      // Create initialization promise
      this.initializationPromise = this.createClient(config);
      
      try {
        this.client = await this.initializationPromise;
        this.currentConfig = config;
        console.log('✅ MCP Client initialized successfully');
        return this.client;
      } catch (error) {
        this.initializationPromise = null;
        console.error('❌ Failed to initialize MCP client:', error);
        throw error;
      }
    }

    // Return existing client
    if (this.client) {
      return this.client;
    }

    // Should not reach here, but fallback to create new
    this.initializationPromise = this.createClient(config);
    this.client = await this.initializationPromise;
    this.currentConfig = config;
    return this.client;
  }

  /**
   * Create new MCP client
   */
  private async createClient(config: MCPClientConfig): Promise<MultiServerMCPClient> {
    console.log('🔧 Creating new MCP client...');
    console.log('Environment:', process.env.VERCEL ? 'Vercel' : 'Local');
    console.log('WordPress URL:', config.wordpressUrl);
    console.log('Node version:', process.version);
    console.log('Working directory:', process.cwd());
    
    try {
      // Use npx consistently - it works better on Vercel when package is in dependencies
      const client = new MultiServerMCPClient({
        mcpServers: {
          wordpress: {
            command: "npx",
            args: ["--yes", "wpmcp@3.0.0"],
            env: {
              WORDPRESS_URL: config.wordpressUrl,
              WORDPRESS_USERNAME: config.wordpressUsername,
              WORDPRESS_PASSWORD: config.wordpressPassword,
              NODE_ENV: process.env.NODE_ENV || 'production',
              ...(process.env.PATH && { PATH: process.env.PATH }),
            },
            transport: "stdio",
          },
        },
      });

      console.log('✅ MCP client configuration created');
      return client;
    } catch (error) {
      console.error('❌ Error creating MCP client:', error);
      throw new Error(`Failed to create MCP client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get tools from MCP client (cached)
   */
  async getTools(config: MCPClientConfig): Promise<any[]> {
    try {
      // If tools are cached and config hasn't changed, return cached tools
      if (this.tools && !this.hasConfigChanged(config)) {
        console.log('📦 Using cached MCP tools');
        return this.tools;
      }

      // Initialize client if needed
      console.log('🔄 Initializing MCP client for tools...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('MCP client initialization timeout (30s)')), 30000);
      });
      
      const client = await Promise.race([
        this.initialize(config),
        timeoutPromise
      ]);
      
      // Get and cache tools
      console.log('🔄 Fetching MCP tools from client...');
      
      const toolsPromise = new Promise<any[]>((resolve, reject) => {
        setTimeout(() => reject(new Error('Tools fetch timeout (15s)')), 15000);
        client.getTools().then(resolve).catch(reject);
      });
      
      this.tools = await toolsPromise;
      console.log(`✅ Loaded ${this.tools.length} MCP tools`);
      
      if (this.tools.length === 0) {
        console.warn('⚠️ Warning: No tools loaded from MCP client');
      }
      
      return this.tools;
    } catch (error) {
      console.error('❌ Error getting MCP tools:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('If on Vercel, ensure maxDuration is set to 60s in vercel.json');
      
      throw new Error(`Failed to get MCP tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Get current client (may return null)
   */
  getClient(): MultiServerMCPClient | null {
    return this.client;
  }

  /**
   * Force close and reset client
   */
  async reset(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        console.log('✅ MCP Client closed successfully');
      } catch (error) {
        console.error('Error closing MCP client:', error);
      }
    }
    
    this.client = null;
    this.currentConfig = null;
    this.initializationPromise = null;
    this.tools = null;
  }
}

// Export singleton instance
export const mcpClientManager = MCPClientManager.getInstance();

// Export type
export type { MCPClientConfig };