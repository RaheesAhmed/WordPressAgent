'use client';

import { useState, useEffect } from 'react';
import { X, Globe, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getWordPressConnection,
  saveWordPressConnection,
  removeWordPressConnection,
  testWordPressConnection,
  formatWordPressUrl,
  type WordPressConnection
} from '@/lib/wordpress-connection';
import { toast } from 'sonner';

interface WordPressSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange?: () => void;
}

export function WordPressSettings({ isOpen, onClose, onConnectionChange }: WordPressSettingsProps) {
  const [connection, setConnection] = useState<WordPressConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const currentConnection = getWordPressConnection();
      setConnection(currentConnection);
      
      if (currentConnection) {
        setUrl(currentConnection.url);
        setUsername(currentConnection.username);
        setPassword(currentConnection.password);
        setAnthropicApiKey(currentConnection.anthropicApiKey || '');
      } else {
        setUrl('');
        setUsername('');
        setPassword('');
        setAnthropicApiKey('');
      }
    }
  }, [isOpen]);

  const handleConnect = async () => {
    if (!url.trim() || !username.trim() || !password.trim()) {
      toast.error('Please enter URL, username, and application password');
      return;
    }

    if (!anthropicApiKey.trim()) {
      toast.error('Please enter your Anthropic API key');
      return;
    }

    setIsConnecting(true);
    try {
      const cleanUrl = formatWordPressUrl(url.trim());
      const result = await testWordPressConnection(
        cleanUrl,
        username.trim(),
        password.trim()
      );

      if (result.success) {
        const newConnection: WordPressConnection = {
          url: cleanUrl,
          username: username.trim(),
          password: password.trim(),
          anthropicApiKey: anthropicApiKey.trim(),
          connected: true,
          lastConnected: new Date(),
          siteName: result.siteName || 'WordPress Site'
        };

        saveWordPressConnection(newConnection);
        setConnection(newConnection);
        toast.success('Connected to WordPress successfully!');
        
        // Notify parent component about connection change
        if (onConnectionChange) {
          onConnectionChange();
        }
      } else {
        toast.error(result.error || 'Connection failed');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    removeWordPressConnection();
    setConnection(null);
    setUrl('');
    setUsername('');
    setPassword('');
    setAnthropicApiKey('');
    toast.success('Disconnected from WordPress');
    
    // Notify parent component about connection change
    if (onConnectionChange) {
      onConnectionChange();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">WordPress Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Connection Status */}
        {connection?.connected ? (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Connected to {connection.siteName}</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">{connection.url}</p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <XCircle className="w-4 h-4" />
              <span>Not connected</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">WordPress URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://your-site.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isConnecting}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Your WordPress username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isConnecting}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Application Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your WordPress app password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isConnecting}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="anthropicApiKey">Anthropic API Key *</Label>
            <Input
              id="anthropicApiKey"
              type="password"
              placeholder="sk-ant-..."
              value={anthropicApiKey}
              onChange={(e) => setAnthropicApiKey(e.target.value)}
              disabled={isConnecting}
              className="mt-1"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required: Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-[#21759B] hover:underline">console.anthropic.com</a>
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            {connection?.connected ? (
              <>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || !url.trim() || !username.trim() || !password.trim() || !anthropicApiKey.trim()}
                  className="flex-1 bg-[#21759B] hover:bg-[#1a5f7e]"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Connection'
                  )}
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="flex-1"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !url.trim() || !username.trim() || !password.trim() || !anthropicApiKey.trim()}
                className="w-full bg-[#21759B] hover:bg-[#1a5f7e]"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect to WordPress'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>WordPress Password:</strong> Admin → Users → Profile → Application Passwords → Create new
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-xs text-purple-700 dark:text-purple-400">
              <strong>Anthropic API Key:</strong> Required. Get your key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}