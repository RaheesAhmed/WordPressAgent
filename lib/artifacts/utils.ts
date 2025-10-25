/**
 * Artifact Utilities for n8nCopilot
 * Helper functions for artifact creation, validation, and management
 */

import { 
  Artifact, 
  WorkflowArtifact, 
  N8nWorkflowData, 
  ArtifactVersion, 
  ArtifactValidationResult,
  ArtifactGenerationContext
} from './types';

/**
 * Generate a unique artifact ID
 */
export function generateArtifactId(): string {
  return `artifact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique version ID
 */
export function generateVersionId(): string {
  return `version_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Create a new workflow artifact from n8n workflow data
 */
export function createWorkflowArtifact(
  workflowData: N8nWorkflowData,
  title?: string,
  description?: string
): WorkflowArtifact {
  const now = new Date();
  const artifactId = generateArtifactId();
  const versionId = generateVersionId();
  
  const version: ArtifactVersion = {
    id: versionId,
    content: workflowData,
    timestamp: now,
    title: title || workflowData.name,
    hash: generateContentHash(workflowData)
  };

  return {
    id: artifactId,
    type: 'workflow',
    title: title || workflowData.name,
    description: description || `n8n workflow with ${workflowData.nodes.length} nodes`,
    workflowData,
    currentVersion: version,
    versions: [version],
    createdAt: now,
    updatedAt: now,
    metadata: {
      complexity: determineWorkflowComplexity(workflowData),
      category: categorizeWorkflow(workflowData),
      requiredCredentials: extractRequiredCredentials(workflowData),
      externalDependencies: extractExternalDependencies(workflowData),
      useCases: generateUseCases(workflowData)
    }
  };
}

/**
 * Add a new version to an existing artifact
 */
export function addArtifactVersion(
  artifact: Artifact,
  content: any,
  title?: string,
  description?: string
): Artifact {
  const versionId = generateVersionId();
  const now = new Date();
  
  const newVersion: ArtifactVersion = {
    id: versionId,
    content,
    timestamp: now,
    title: title || `Version ${artifact.versions.length + 1}`,
    description,
    hash: generateContentHash(content)
  };

  return {
    ...artifact,
    currentVersion: newVersion,
    versions: [...artifact.versions, newVersion],
    updatedAt: now
  };
}

/**
 * Validate n8n workflow data
 */
export function validateWorkflowData(workflowData: N8nWorkflowData): ArtifactValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check required fields
  if (!workflowData.name) {
    errors.push('Workflow name is required');
  }

  if (!workflowData.nodes || workflowData.nodes.length === 0) {
    errors.push('Workflow must contain at least one node');
  }

  // Validate nodes
  if (workflowData.nodes) {
    const nodeIds = new Set<string>();
    const triggerNodes = workflowData.nodes.filter(node => 
      node.type.toLowerCase().includes('trigger') || 
      node.type.toLowerCase().includes('webhook')
    );

    workflowData.nodes.forEach((node, index) => {
      // Check for duplicate node IDs
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node ID found: ${node.id}`);
      }
      nodeIds.add(node.id);

      // Check required node fields
      if (!node.name) {
        errors.push(`Node at index ${index} is missing a name`);
      }
      if (!node.type) {
        errors.push(`Node at index ${index} is missing a type`);
      }
      if (!node.position || node.position.length !== 2) {
        warnings.push(`Node "${node.name}" has invalid position data`);
      }
    });

    // Check for trigger nodes
    if (triggerNodes.length === 0) {
      warnings.push('Workflow has no trigger nodes - it can only be executed manually');
    }
    if (triggerNodes.length > 1) {
      suggestions.push('Consider using a single trigger with conditional logic instead of multiple triggers');
    }
  }

  // Validate connections
  if (workflowData.connections) {
    Object.entries(workflowData.connections).forEach(([nodeId, outputs]) => {
      if (!workflowData.nodes?.some(node => node.id === nodeId)) {
        errors.push(`Connection references non-existent node: ${nodeId}`);
      }

      Object.entries(outputs).forEach(([outputName, connections]) => {
        connections.forEach(connection => {
          if (!workflowData.nodes?.some(node => node.id === connection.node)) {
            errors.push(`Connection references non-existent target node: ${connection.node}`);
          }
        });
      });
    });
  }

  // Performance suggestions
  if (workflowData.nodes && workflowData.nodes.length > 20) {
    suggestions.push('Large workflows may benefit from being split into smaller, reusable workflows');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Determine workflow complexity based on node count and types
 */
function determineWorkflowComplexity(workflowData: N8nWorkflowData): 'simple' | 'medium' | 'complex' {
  const nodeCount = workflowData.nodes.length;
  const hasConditionalLogic = workflowData.nodes.some(node => 
    ['if', 'switch', 'merge'].includes(node.type.toLowerCase())
  );
  const hasSubworkflows = workflowData.nodes.some(node => 
    node.type.toLowerCase().includes('subworkflow')
  );
  const hasLoops = workflowData.nodes.some(node => 
    node.type.toLowerCase().includes('splitinbatches')
  );

  if (nodeCount <= 5 && !hasConditionalLogic && !hasSubworkflows && !hasLoops) {
    return 'simple';
  } else if (nodeCount <= 15 && (!hasSubworkflows && !hasLoops)) {
    return 'medium';
  } else {
    return 'complex';
  }
}

/**
 * Categorize workflow based on node types and patterns
 */
function categorizeWorkflow(workflowData: N8nWorkflowData): string {
  const nodeTypes = workflowData.nodes.map(node => node.type.toLowerCase());
  
  if (nodeTypes.some(type => type.includes('webhook'))) {
    return 'API Integration';
  } else if (nodeTypes.some(type => type.includes('schedule') || type.includes('cron'))) {
    return 'Scheduled Automation';
  } else if (nodeTypes.some(type => type.includes('email') || type.includes('slack'))) {
    return 'Communication';
  } else if (nodeTypes.some(type => type.includes('sheets') || type.includes('airtable'))) {
    return 'Data Processing';
  } else if (nodeTypes.some(type => type.includes('github') || type.includes('gitlab'))) {
    return 'Development';
  } else {
    return 'General Automation';
  }
}

/**
 * Extract required credentials from workflow
 */
function extractRequiredCredentials(workflowData: N8nWorkflowData): string[] {
  const credentials = new Set<string>();
  
  workflowData.nodes.forEach(node => {
    if (node.credentials) {
      Object.values(node.credentials).forEach(credType => {
        if (typeof credType === 'string') {
          credentials.add(credType);
        }
      });
    }
  });
  
  return Array.from(credentials);
}

/**
 * Extract external dependencies from workflow
 */
function extractExternalDependencies(workflowData: N8nWorkflowData): string[] {
  const dependencies = new Set<string>();
  
  workflowData.nodes.forEach(node => {
    // Extract service names from node types
    const serviceMatch = node.type.match(/^n8n-nodes-([a-zA-Z]+)/);
    if (serviceMatch) {
      dependencies.add(serviceMatch[1]);
    } else if (node.type !== 'n8n-nodes-base.start') {
      // Remove common prefixes to get clean service names
      const cleanType = node.type
        .replace('n8n-nodes-base.', '')
        .replace('n8n-nodes-', '');
      dependencies.add(cleanType);
    }
  });
  
  return Array.from(dependencies);
}

/**
 * Generate potential use cases for the workflow
 */
function generateUseCases(workflowData: N8nWorkflowData): string[] {
  const useCases: string[] = [];
  const nodeTypes = workflowData.nodes.map(node => node.type.toLowerCase());
  
  if (nodeTypes.some(type => type.includes('webhook')) && 
      nodeTypes.some(type => type.includes('slack'))) {
    useCases.push('Webhook to Slack notifications');
  }
  
  if (nodeTypes.some(type => type.includes('schedule')) && 
      nodeTypes.some(type => type.includes('email'))) {
    useCases.push('Automated email reporting');
  }
  
  if (nodeTypes.some(type => type.includes('github')) && 
      nodeTypes.some(type => type.includes('discord'))) {
    useCases.push('GitHub to Discord integration');
  }
  
  if (nodeTypes.some(type => type.includes('sheets')) && 
      nodeTypes.some(type => type.includes('airtable'))) {
    useCases.push('Data synchronization between platforms');
  }
  
  // Add generic use case if no specific patterns found
  if (useCases.length === 0) {
    useCases.push('Custom automation workflow');
  }
  
  return useCases;
}

/**
 * Generate a hash for content to detect changes
 */
export function generateContentHash(content: any): string {
  const str = JSON.stringify(content, Object.keys(content).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if artifact content has changed
 */
export function hasArtifactChanged(artifact: Artifact, newContent: any): boolean {
  const currentHash = artifact.currentVersion.hash;
  const newHash = generateContentHash(newContent);
  return currentHash !== newHash;
}

/**
 * Parse artifact from streaming response
 */
export function parseArtifactFromStream(content: string): {
  type: 'workflow' | 'document' | 'code' | 'svg' | null;
  title?: string;
  data?: any;
} {
  try {
    // Look for artifact markers in the content
    const artifactRegex = /<artifact(?:\s+type="([^"]+)")?(?:\s+title="([^"]+)")?\s*>([\s\S]*?)<\/artifact>/gi;
    const match = artifactRegex.exec(content);
    
    if (!match) {
      // Try to detect JSON workflow without markers
      if (content.trim().startsWith('{') && content.includes('"nodes"')) {
        try {
          const workflowData = JSON.parse(content.trim());
          return {
            type: 'workflow',
            title: workflowData.name || 'Generated Workflow',
            data: workflowData
          };
        } catch {
          return { type: null };
        }
      }
      return { type: null };
    }
    
    const [, type, title, artifactContent] = match;
    
    switch (type) {
      case 'workflow':
        try {
          const workflowData = JSON.parse(artifactContent.trim());
          return {
            type: 'workflow',
            title: title || workflowData.name || 'Generated Workflow',
            data: workflowData
          };
        } catch {
          return { type: null };
        }
      
      case 'document':
        return {
          type: 'document',
          title: title || 'Generated Document',
          data: artifactContent
        };
      
      case 'code':
        return {
          type: 'code',
          title: title || 'Generated Code',
          data: artifactContent
        };
      
      case 'svg':
        return {
          type: 'svg',
          title: title || 'Generated Diagram',
          data: artifactContent
        };
      
      default:
        return { type: null };
    }
  } catch (error) {
    console.error('Error parsing artifact from stream:', error);
    return { type: null };
  }
}

/**
 * Format workflow for display
 */
export function formatWorkflowForDisplay(workflowData: N8nWorkflowData) {
  return {
    ...workflowData,
    nodes: workflowData.nodes.map(node => ({
      ...node,
      // Ensure position is valid
      position: Array.isArray(node.position) && node.position.length === 2 
        ? node.position 
        : [0, 0]
    }))
  };
}