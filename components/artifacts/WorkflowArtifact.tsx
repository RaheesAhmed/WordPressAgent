'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Copy, 
  Download, 
  ExternalLink, 
  Share2, 
  Play,
  Eye,
  Code2,
  Workflow,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters?: Record<string, any>;
  credentials?: Record<string, string>;
}

interface WorkflowConnection {
  node: string;
  type: string;
  index: number;
}

interface WorkflowArtifactData {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: Record<string, WorkflowConnection[]>;
  active: boolean;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
  tags?: string[];
  triggerCount?: number;
  updatedAt?: string;
  createdAt?: string;
  versionId?: string;
}

interface WorkflowArtifactProps {
  data: WorkflowArtifactData;
  onClose?: () => void;
  isVisible?: boolean;
}

export function WorkflowArtifact({ data, onClose, isVisible = true }: WorkflowArtifactProps) {
  const [activeView, setActiveView] = useState<'visual' | 'code'>('visual');
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyWorkflow = async () => {
    try {
      const workflowJson = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(workflowJson);
      toast.success('Workflow JSON copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy workflow');
    }
  };

  const handleDownloadWorkflow = () => {
    const workflowJson = JSON.stringify(data, null, 2);
    const blob = new Blob([workflowJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Workflow downloaded!');
  };

  const handleDeployToN8n = async () => {
    setIsLoading(true);
    try {
      // Get n8n connection details
      const { getN8nConnection } = await import('@/lib/n8n-connection');
      const connection = getN8nConnection();
      
      if (!connection?.connected) {
        toast.error('Please connect to n8n first in settings');
        return;
      }

      // Deploy via proxy API route
      const response = await fetch('/api/n8n-deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: connection.url,
          apiKey: connection.apiKey,
          workflow: data,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Workflow deployed successfully!');
      } else {
        toast.error(result.error || 'Failed to deploy workflow');
      }
    } catch (error) {
      toast.error('Failed to deploy to n8n');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishWorkflow = async () => {
    try {
      // Generate a shareable URL (simulate)
      const shareUrl = `${window.location.origin}/shared-workflow/${data.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const getNodeIcon = (nodeType: string) => {
    // Return appropriate icons based on node type
    const iconMap: Record<string, string> = {
      'trigger': '🚀',
      'webhook': '🔗',
      'http': '🌐',
      'schedule': '⏰',
      'slack': '💬',
      'email': '📧',
      'github': '🐙',
      'discord': '🎮',
      'googlesheets': '📊',
      'airtable': '🗃️',
      'if': '❓',
      'switch': '🔀',
      'merge': '🔄',
      'set': '✏️',
      'function': '⚙️',
      'code': '💻'
    };
    
    return iconMap[nodeType.toLowerCase()] || '⚡';
  };

  const renderNodeCard = (node: WorkflowNode) => (
    <div
      key={node.id}
      className="relative p-4 rounded-lg border border-border bg-card hover:bg-card-hover transition-all duration-200 group w-full"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getNodeIcon(node.type)}</span>
          <div>
            <h4 className="font-semibold text-sm text-foreground">{node.name}</h4>
            <p className="text-xs text-muted-foreground">{node.type}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          v{node.typeVersion}
        </Badge>
      </div>
      
      {node.parameters && Object.keys(node.parameters).length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-1">Parameters:</p>
          <div className="space-y-1">
            {Object.entries(node.parameters).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate">{key}:</span>
                <span className="text-foreground ml-2 truncate max-w-[100px]">
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </span>
              </div>
            ))}
            {Object.keys(node.parameters).length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{Object.keys(node.parameters).length - 3} more...
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
      </div>
    </div>
  );

  const calculateTriggerCount = () => {
    return data.nodes.filter(node =>
      node.type.toLowerCase().includes('trigger') ||
      node.type.toLowerCase().includes('webhook') ||
      node.type.toLowerCase().includes('schedule') ||
      node.type.toLowerCase().includes('cron') ||
      node.name.toLowerCase().includes('trigger')
    ).length;
  };

  const renderWorkflowStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center p-3 rounded-lg bg-muted/50">
        <div className="text-2xl font-bold text-primary">{data.nodes.length}</div>
        <div className="text-xs text-muted-foreground">Nodes</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted/50">
        <div className="text-2xl font-bold text-blue-500">
          {Object.keys(data.connections).length}
        </div>
        <div className="text-xs text-muted-foreground">Connections</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted/50">
        <div className="text-2xl font-bold text-green-500">
          {calculateTriggerCount()}
        </div>
        <div className="text-xs text-muted-foreground">Triggers</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted/50">
        <div className="flex items-center justify-center gap-1">
          {data.active ? (
            <CheckCircle className="size-4 text-green-500" />
          ) : (
            <AlertCircle className="size-4 text-orange-500" />
          )}
          <span className={cn(
            "text-xs font-medium",
            data.active ? "text-green-500" : "text-orange-500"
          )}>
            {data.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">Status</div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <Card className="w-full h-full flex flex-col bg-background border-0">
      <CardHeader className="shrink-0 pb-4 w-full">
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <Workflow className="size-5 text-primary" />
            <CardTitle className="text-lg flex-1">{data.name}</CardTitle>
          </div>
          
          {data.tags && data.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {data.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="w-full">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'visual' | 'code')}>
              <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
                <TabsTrigger value="visual" className="text-xs">
                  <Eye className="size-3 mr-1" />
                  Visual
                </TabsTrigger>
                <TabsTrigger value="code" className="text-xs">
                  <Code2 className="size-3 mr-1" />
                  Code
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <Separator className="mt-4" />
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-1 pt-2 w-full justify-center">
          <Button
            onClick={handleCopyWorkflow}
            variant="outline"
            size="sm"
            className="text-xs h-6 px-2 py-0"
          >
            <Copy className="size-2.5 mr-1" />
            Copy
          </Button>
          
          <Button
            onClick={handleDownloadWorkflow}
            variant="outline"
            size="sm"
            className="text-xs h-6 px-2 py-0"
          >
            <Download className="size-2.5 mr-1" />
            Download
          </Button>
          
          <Button
            onClick={handlePublishWorkflow}
            variant="outline"
            size="sm"
            className="text-xs h-6 px-2 py-0"
          >
            <Share2 className="size-2.5 mr-1" />
            Share
          </Button>
          
          <Button
            onClick={() => window.open('https://n8n.io', '_blank')}
            variant="outline"
            size="sm"
            className="text-xs h-6 px-2 py-0"
          >
            <ExternalLink className="size-2.5 mr-1" />
            Open
          </Button>
          
          <Button
            onClick={handleDeployToN8n}
            variant="outline"
            size="sm"
            className="text-xs bg-brand-primary/10 hover:bg-brand-primary/20 border-brand-primary/30 h-6 px-2 py-0"
            disabled={isLoading}
          >
            <Play className="size-2.5 mr-1" />
            {isLoading ? 'Deploying...' : 'Deploy'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0 w-full">
        <Tabs value={activeView} className="w-full h-full">
          <TabsContent value="visual" className="w-full h-full mt-0 p-0">
            <ScrollArea className="w-full h-full">
              <div className="space-y-6 w-full p-4">
                {renderWorkflowStats()}
                
                <div className="w-full">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Workflow className="size-4" />
                    Workflow Nodes ({data.nodes.length})
                  </h3>
                  <div className="space-y-3 w-full">
                    {data.nodes.map(renderNodeCard)}
                  </div>
                </div>
                
                {data.connections && Object.keys(data.connections).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-4">Connections</h3>
                    <div className="space-y-2">
                      {Object.entries(data.connections).map(([nodeId, connections]) => (
                        <div key={nodeId} className="text-xs bg-muted/30 rounded p-2">
                          <span className="font-medium">{nodeId}</span> → {connections.length} connection(s)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="code" className="w-full h-full mt-0 p-0">
            <ScrollArea className="w-full h-full">
              <pre className="text-xs bg-muted/30 rounded-lg p-4 overflow-x-auto m-4 w-[calc(100%-2rem)]">
                <code className="text-foreground">
                  {JSON.stringify(data, null, 2)}
                </code>
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}