export interface N8nConnection {
  url: string;
  apiKey: string;
  connected: boolean;
  lastConnected?: Date;
  instanceName?: string;
}

const N8N_CONNECTION_KEY = 'n8n_copilot_connection';

export function getN8nConnection(): N8nConnection | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(N8N_CONNECTION_KEY);
  if (!stored) return null;
  
  try {
    const connection = JSON.parse(stored);
    // Convert lastConnected string back to Date if exists
    if (connection.lastConnected) {
      connection.lastConnected = new Date(connection.lastConnected);
    }
    return connection;
  } catch {
    return null;
  }
}

export function saveN8nConnection(connection: N8nConnection): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(N8N_CONNECTION_KEY, JSON.stringify(connection));
}

export function removeN8nConnection(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(N8N_CONNECTION_KEY);
}

export function isN8nConnected(): boolean {
  const connection = getN8nConnection();
  return connection?.connected === true;
}

export async function testN8nConnection(url: string, apiKey: string): Promise<{ success: boolean; error?: string; instanceName?: string }> {
  try {
    // Use our proxy API route to avoid CORS issues
    const response = await fetch('/api/n8n-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formatN8nUrl(url),
        apiKey: apiKey
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

export function formatN8nUrl(url: string): string {
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  // Remove trailing slash
  return url.replace(/\/$/, '');
}