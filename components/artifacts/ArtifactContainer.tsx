'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowArtifact } from './WorkflowArtifact';
import { toast } from 'sonner';

export interface ArtifactVersion {
  id: string;
  content: any;
  timestamp: Date;
  title?: string;
}

export interface ArtifactData {
  id: string;
  type: 'workflow' | 'document' | 'code' | 'svg';
  title: string;
  description?: string;
  currentVersion: ArtifactVersion;
  versions: ArtifactVersion[];
  createdAt: Date;
  updatedAt: Date;
}

interface ArtifactContainerProps {
  artifact: ArtifactData | null;
  isVisible: boolean;
  onClose: () => void;
  onVersionChange?: (versionId: string) => void;
  className?: string;
}

export function ArtifactContainer({ 
  artifact, 
  isVisible, 
  onClose, 
  onVersionChange,
  className 
}: ArtifactContainerProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (artifact) {
      setCurrentVersionId(artifact.currentVersion.id);
    }
  }, [artifact]);

  if (!isVisible || !artifact) {
    return null;
  }

  const currentVersion = currentVersionId 
    ? artifact.versions.find(v => v.id === currentVersionId) || artifact.currentVersion
    : artifact.currentVersion;

  const handleVersionChange = (versionId: string) => {
    setCurrentVersionId(versionId);
    onVersionChange?.(versionId);
    toast.success('Version switched');
  };

  const handleResetToLatest = () => {
    setCurrentVersionId(artifact.currentVersion.id);
    onVersionChange?.(artifact.currentVersion.id);
    toast.success('Reset to latest version');
  };

  const renderArtifactContent = () => {
    switch (artifact.type) {
      case 'workflow':
        return (
          <WorkflowArtifact 
            data={currentVersion.content}
            isVisible={true}
          />
        );
      
      case 'document':
        return (
          <div className="size-full overflow-auto p-6 bg-background">
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: currentVersion.content }}
            />
          </div>
        );
      
      case 'code':
        return (
          <div className="size-full overflow-auto">
            <pre className="text-xs bg-muted/30 rounded-lg p-4 size-full overflow-auto">
              <code className="text-foreground">
                {currentVersion.content}
              </code>
            </pre>
          </div>
        );
      
      case 'svg':
        return (
          <div className="size-full flex items-center justify-center bg-background p-6">
            <div 
              className="max-w-full max-h-full"
              dangerouslySetInnerHTML={{ __html: currentVersion.content }}
            />
          </div>
        );
      
      default:
        return (
          <div className="size-full flex items-center justify-center text-muted-foreground">
            <p>Unsupported artifact type: {artifact.type}</p>
          </div>
        );
    }
  };

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'workflow': return '⚡';
      case 'document': return '📄';
      case 'code': return '💻';
      case 'svg': return '🎨';
      default: return '📋';
    }
  };

  return (
    <div className={cn(
      "w-full h-full bg-background",
      className
    )}>
      <Card className="w-full h-full rounded-none border-0 flex flex-col">
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-border bg-background/80 backdrop-blur-sm w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-lg">{getArtifactIcon(artifact.type)}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base truncate">{artifact.title}</h2>
                {artifact.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {artifact.description}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="shrink-0">
                {artifact.type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 ml-4">
              {/* Version History Toggle */}
              {artifact.versions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className={cn(
                    "size-8 p-0",
                    showVersionHistory && "bg-muted"
                  )}
                >
                  <History className="size-4" />
                </Button>
              )}
              
              {/* Reset to Latest */}
              {currentVersionId !== artifact.currentVersion.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetToLatest}
                  className="size-8 p-0"
                >
                  <RotateCcw className="size-4" />
                </Button>
              )}
              
              {/* Maximize/Minimize */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMaximized(!isMaximized)}
                className="size-8 p-0"
              >
                {isMaximized ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </Button>
              
              {/* Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="size-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          
          {/* Version History */}
          {showVersionHistory && artifact.versions.length > 1 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {artifact.versions.map((version, index) => (
                  <Button
                    key={version.id}
                    variant={currentVersionId === version.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVersionChange(version.id)}
                    className="text-xs h-7"
                  >
                    {version.title || `v${artifact.versions.length - index}`}
                    {version.id === artifact.currentVersion.id && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Latest
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderArtifactContent()}
        </div>
      </Card>
    </div>
  );
}