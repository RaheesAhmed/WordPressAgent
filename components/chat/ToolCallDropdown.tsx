'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Search, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    if (toolName.startsWith('wordpress_')) {
      return <span className="text-base">🔧</span>;
    }
    
    switch (toolName) {
      case 'web_search':
        return <Search className="size-4 text-blue-500" />;
      default:
        return <Globe className="size-4 text-gray-500" />;
    }
  };
  
  const getToolDisplayName = () => {
    if (toolName.startsWith('wordpress_')) {
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

  return (
    <div className="my-1.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="shrink-0">
            {getToolIcon()}
          </div>
          <span className="text-sm font-medium text-foreground">
            {getToolDisplayName()}
          </span>
          {isLoading && (
            <Loader2 className="size-3.5 animate-spin text-blue-500 ml-auto" />
          )}
          <div className={`ml-auto transition-transform ${isExpanded ? 'rotate-0' : ''}`}>
            {isExpanded ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-border/30">
          <div className="mt-2">
            {toolResult ? (
              <div className="bg-card border border-border rounded-md p-3 max-h-96 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono text-foreground leading-relaxed">
                  {toolResult}
                </pre>
              </div>
            ) : isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                <Loader2 className="size-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                No result available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
