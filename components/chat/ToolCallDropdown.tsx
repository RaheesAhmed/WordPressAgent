'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Search, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface ToolCallDropdownProps {
  toolName: string;
  toolArgs: Record<string, any>;
  toolResult?: string;
  isLoading?: boolean;
}

export function ToolCallDropdown({ 
  toolName, 
  toolArgs, 
  toolResult, 
  isLoading = false 
}: ToolCallDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getToolIcon = () => {
    // WordPress-specific icons
    if (toolName.startsWith('wordpress_')) {
      return <span className="text-xs">🔧</span>;
    }
    
    switch (toolName) {
      case 'web_search':
        return <Search className="size-3" />;
      default:
        return <Globe className="size-3" />;
    }
  };
  
  const getToolDisplayName = () => {
    if (toolName.startsWith('wordpress_')) {
      // Convert wordpress_get_plugins to "Get Plugins"
      return toolName
        .replace('wordpress_', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    if (toolName === 'web_search') {
      return 'Web Search';
    }
    
    return toolName;
  };

  const formatToolArgs = () => {
    if (toolName === 'web_search' && toolArgs.query) {
      return `"${toolArgs.query}"`;
    }
    return JSON.stringify(toolArgs, null, 2);
  };

  const formatToolResult = () => {
    if (!toolResult) return null;
    
    // Handle string results
    if (typeof toolResult === 'string') {
      try {
        const parsed = JSON.parse(toolResult);
        
        // Handle direct array of search results
        if (Array.isArray(parsed)) {
          const searchResults = parsed.filter((item: any) => item.type === 'web_search_result');
          if (searchResults.length > 0) {
            return (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Found {searchResults.length} results:</p>
                {searchResults.slice(0, 5).map((result: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-muted pl-3">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-600 hover:underline block"
                    >
                      {result.title}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.url}
                    </p>
                  </div>
                ))}
                {searchResults.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    ...and {searchResults.length - 5} more results
                  </p>
                )}
              </div>
            );
          }
        }
        
        // Handle nested results format
        if (parsed.results && Array.isArray(parsed.results)) {
          return (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Found {parsed.results.length} results:</p>
              {parsed.results.slice(0, 5).map((result: any, idx: number) => (
                <div key={idx} className="border-l-2 border-muted pl-3">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline block"
                  >
                    {result.title}
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.url}
                  </p>
                  {result.snippet && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {result.snippet}
                    </p>
                  )}
                </div>
              ))}
              {parsed.results.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  ...and {parsed.results.length - 5} more results
                </p>
              )}
            </div>
          );
        }
      } catch (error) {
        // Fallback to raw text for invalid JSON
      }

      return (
        <div className="text-xs">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-1 text-muted-foreground">{children}</p>,
              code: ({ children }) => <code className="bg-muted px-1 rounded text-xs">{children}</code>,
            }}
          >
            {toolResult.length > 300 ? `${toolResult.slice(0, 300)}...` : toolResult}
          </ReactMarkdown>
        </div>
      );
    }
    
    // Handle object/array results
    if (typeof toolResult === 'object' && toolResult !== null) {
      // Check if it's an array of search results
      if (Array.isArray(toolResult)) {
        const searchResults = (toolResult as any[]).filter((item: any) => item.type === 'web_search_result');
        if (searchResults.length > 0) {
          return (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Found {searchResults.length} results:</p>
              {searchResults.slice(0, 5).map((result: any, idx: number) => (
                <div key={idx} className="border-l-2 border-muted pl-3">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline block"
                  >
                    {result.title}
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.url}
                  </p>
                </div>
              ))}
              {searchResults.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  ...and {searchResults.length - 5} more results
                </p>
              )}
            </div>
          );
        }
      }
      
      const resultString = JSON.stringify(toolResult, null, 2);
      return (
        <div className="text-xs">
          <pre className="bg-muted/30 p-2 rounded text-xs whitespace-pre-wrap">
            {resultString.length > 300 ? `${resultString.slice(0, 300)}...` : resultString}
          </pre>
        </div>
      );
    }
    
    // Fallback for any other type
    return (
      <div className="text-xs text-muted-foreground">
        No result data available
      </div>
    );
  };

  return (
    <Card className="my-0.5  p-0 ">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-start text-xs h-6 px-2 py-0.5 hover:bg-muted/50 rounded-none"
      >
        <div className="flex items-center gap-2 flex-1">
          {getToolIcon()}
          <span className="font-medium">
            {getToolDisplayName()}
          </span>
          {isLoading && (
            <div className="flex space-x-1 ml-auto">
              <div
                className="size-1 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="size-1 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="size-1 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          )}
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </div>
        </div>
      </Button>

      {isExpanded && (
        <div className="px-2 pb-2 border-l-2 border-muted ml-2">
          <div className="space-y-2">
            {toolResult && (
              <div>
                <div className="bg-muted/30 p-2 rounded text-xs max-h-48 overflow-y-auto">
                  {formatToolResult()}
                </div>
              </div>
            )}

            {isLoading && !toolResult && (
              <div className="text-xs text-muted-foreground italic">
                Searching...
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
