/**
 * Artifact Types for n8nCopilot
 * Defines the structure for n8n workflow artifacts and related types
 */

export interface N8nWorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters?: Record<string, any>;
  credentials?: Record<string, string>;
  disabled?: boolean;
  notes?: string;
  notesInFlow?: boolean;
  color?: string;
  continueOnFail?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
}

export interface N8nWorkflowConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nWorkflowSettings {
  executionOrder?: 'v0' | 'v1';
  saveManualExecutions?: boolean;
  callerPolicy?: 'workflowsFromSameOwner' | 'workflowsFromAList' | 'any';
  callerIds?: string;
  errorWorkflow?: string;
  timezone?: string;
  saveExecutionProgress?: boolean;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
}

export interface N8nWorkflowData {
  id?: string;
  name: string;
  nodes: N8nWorkflowNode[];
  connections: Record<string, Record<string, N8nWorkflowConnection[]>>;
  active: boolean;
  settings?: N8nWorkflowSettings;
  staticData?: Record<string, any>;
  tags?: Array<{
    id: string;
    name: string;
  }>;
  triggerCount?: number;
  updatedAt?: string;
  createdAt?: string;
  versionId?: string;
  hash?: string;
  meta?: Record<string, any>;
  pinData?: Record<string, any>;
}

export interface ArtifactVersion {
  id: string;
  content: any;
  timestamp: Date;
  title?: string;
  description?: string;
  hash?: string;
}

export interface WorkflowArtifact {
  id: string;
  type: 'workflow';
  title: string;
  description?: string;
  workflowData: N8nWorkflowData;
  currentVersion: ArtifactVersion;
  versions: ArtifactVersion[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    complexity: 'simple' | 'medium' | 'complex';
    category: string;
    estimatedRuntime?: string;
    requiredCredentials?: string[];
    externalDependencies?: string[];
    useCases?: string[];
  };
}

export interface DocumentArtifact {
  id: string;
  type: 'document';
  title: string;
  description?: string;
  content: string;
  format: 'html' | 'markdown' | 'text';
  currentVersion: ArtifactVersion;
  versions: ArtifactVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeArtifact {
  id: string;
  type: 'code';
  title: string;
  description?: string;
  language: string;
  code: string;
  currentVersion: ArtifactVersion;
  versions: ArtifactVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SvgArtifact {
  id: string;
  type: 'svg';
  title: string;
  description?: string;
  svgContent: string;
  currentVersion: ArtifactVersion;
  versions: ArtifactVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export type Artifact = WorkflowArtifact | DocumentArtifact | CodeArtifact | SvgArtifact;

export interface ArtifactGenerationContext {
  userRequest: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  existingArtifacts?: Artifact[];
  preferences?: {
    complexity: 'simple' | 'medium' | 'complex';
    includeErrorHandling: boolean;
    includeDocumentation: boolean;
    preferredNodeTypes?: string[];
  };
}

export interface ArtifactValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export interface ArtifactDeploymentOptions {
  n8nInstanceUrl?: string;
  authToken?: string;
  activateAfterImport?: boolean;
  overwriteExisting?: boolean;
  tags?: string[];
}

// Utility types for artifact operations
export type ArtifactType = 'workflow' | 'document' | 'code' | 'svg';

export interface ArtifactAction {
  id: string;
  type: 'copy' | 'download' | 'deploy' | 'share' | 'edit' | 'duplicate' | 'delete';
  label: string;
  icon: string;
  handler: (artifact: Artifact) => Promise<void> | void;
  isAvailable?: (artifact: Artifact) => boolean;
  isLoading?: boolean;
}

// Event types for artifact interactions
export interface ArtifactEvent {
  type: 'create' | 'update' | 'delete' | 'deploy' | 'share' | 'copy';
  artifactId: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface ArtifactGenerationProgress {
  stage: 'parsing' | 'generating' | 'validating' | 'formatting' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number;
}

// Message types for streaming artifact generation
export interface ArtifactStreamMessage {
  type: 'progress' | 'artifact_start' | 'artifact_content' | 'artifact_complete' | 'error';
  data: any;
}

export interface ArtifactGenerationOptions {
  includeVisualPreview?: boolean;
  validateBeforeDisplay?: boolean;
  autoSave?: boolean;
  generateDescription?: boolean;
  complexity?: 'simple' | 'medium' | 'complex';
  includeComments?: boolean;
  preferredStyle?: 'minimal' | 'detailed' | 'enterprise';
}