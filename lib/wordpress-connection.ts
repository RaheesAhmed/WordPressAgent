/**
 * WordPress Connection Management
 * Stores and manages WordPress site credentials
 */

export interface WordPressConnection {
  url: string;
  username: string;
  password: string;
  anthropicApiKey?: string;
  connected: boolean;
  lastConnected?: Date;
  siteName?: string;
}

const WP_CONNECTION_KEY = 'wordpress_connection';

/**
 * Get WordPress connection from localStorage
 */
export function getWordPressConnection(): WordPressConnection | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(WP_CONNECTION_KEY);
    if (!stored) return null;
    
    const connection = JSON.parse(stored);
    if (connection.lastConnected) {
      connection.lastConnected = new Date(connection.lastConnected);
    }
    
    return connection;
  } catch (error) {
    console.error('Failed to get WordPress connection:', error);
    return null;
  }
}

/**
 * Save WordPress connection to localStorage
 */
export function saveWordPressConnection(connection: WordPressConnection): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(WP_CONNECTION_KEY, JSON.stringify(connection));
  } catch (error) {
    console.error('Failed to save WordPress connection:', error);
    throw new Error('Failed to save connection');
  }
}

/**
 * Remove WordPress connection from localStorage
 */
export function removeWordPressConnection(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(WP_CONNECTION_KEY);
  } catch (error) {
    console.error('Failed to remove WordPress connection:', error);
  }
}

/**
 * Test WordPress connection
 */
export async function testWordPressConnection(
  url: string,
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; siteName?: string }> {
  try {
    // Format URL
    const cleanUrl = formatWordPressUrl(url);
    
    // Create Basic Auth credentials
    const credentials = btoa(`${username}:${password}`);
    
    // Test connection by fetching site info
    const response = await fetch(`${cleanUrl}/wp-json`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: 'Invalid username or password' };
      }
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    const siteName = data.name || 'WordPress Site';

    return { success: true, siteName };
  } catch (error) {
    console.error('WordPress connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

/**
 * Format WordPress URL to ensure correct format
 */
export function formatWordPressUrl(url: string): string {
  let cleanUrl = url.trim();
  
  // Remove trailing slash
  cleanUrl = cleanUrl.replace(/\/$/, '');
  
  // Add protocol if missing
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }
  
  return cleanUrl;
}

/**
 * Check if WordPress is connected
 */
export function isWordPressConnected(): boolean {
  const connection = getWordPressConnection();
  return connection?.connected === true;
}

/**
 * Get WordPress credentials for API use
 */
export function getWordPressCredentials(): {
  url: string;
  username: string;
  password: string;
  anthropicApiKey?: string;
} | null {
  const connection = getWordPressConnection();
  if (!connection?.connected) return null;
  
  return {
    url: connection.url,
    username: connection.username,
    password: connection.password,
    anthropicApiKey: connection.anthropicApiKey,
  };
}