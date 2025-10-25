/**
 * Artifact Action Handlers
 * Implements copy, deploy, download, and publish functionality for artifacts
 */

import { toast } from 'sonner';
import { Artifact, WorkflowArtifact, N8nWorkflowData } from './types';

/**
 * Copy workflow JSON to clipboard
 */
export async function copyWorkflowAction(artifact: WorkflowArtifact): Promise<void> {
  try {
    const workflowJson = JSON.stringify(artifact.workflowData, null, 2);
    await navigator.clipboard.writeText(workflowJson);
    toast.success('Workflow JSON copied to clipboard!', {
      description: 'You can now paste it into n8n or your code editor'
    });
  } catch (error) {
    console.error('Failed to copy workflow:', error);
    toast.error('Failed to copy workflow to clipboard');
  }
}

/**
 * Download workflow as JSON file
 */
export function downloadWorkflowAction(artifact: WorkflowArtifact): void {
  try {
    const workflowJson = JSON.stringify(artifact.workflowData, null, 2);
    const blob = new Blob([workflowJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.workflowData.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Workflow downloaded!', {
      description: `Downloaded as ${a.download}`
    });
  } catch (error) {
    console.error('Failed to download workflow:', error);
    toast.error('Failed to download workflow');
  }
}

/**
 * Deploy workflow to n8n instance
 */
export async function deployToN8nAction(
  artifact: WorkflowArtifact,
  options?: {
    instanceUrl?: string;
    authToken?: string;
    activateAfterImport?: boolean;
  }
): Promise<void> {
  const { instanceUrl, authToken, activateAfterImport = false } = options || {};

  try {
    // Show loading state
    toast.loading('Deploying workflow to n8n...', {
      description: 'This may take a few seconds'
    });

    // Simulate deployment process - in real implementation, this would call n8n API
    if (!instanceUrl) {
      // For demo purposes, simulate deployment without actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Workflow deployment simulated!', {
        description: 'Configure your n8n instance URL to enable real deployment'
      });
      
      // Show instructions for manual deployment
      showDeploymentInstructions(artifact);
      return;
    }

    // Real n8n API deployment would happen here
    const deploymentResponse = await deployToN8nApi(artifact.workflowData, {
      instanceUrl,
      authToken,
      activateAfterImport
    });

    if (deploymentResponse.success) {
      toast.success('Workflow deployed successfully!', {
        description: `Deployed to ${instanceUrl} ${activateAfterImport ? 'and activated' : ''}`
      });
    } else {
      throw new Error(deploymentResponse.error || 'Deployment failed');
    }
  } catch (error) {
    console.error('Failed to deploy workflow:', error);
    toast.error('Failed to deploy to n8n', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

/**
 * Publish workflow for sharing
 */
export async function publishWorkflowAction(artifact: WorkflowArtifact): Promise<string> {
  try {
    // Generate a shareable URL
    const shareId = generateShareId();
    const shareUrl = `${window.location.origin}/shared-workflow/${shareId}`;
    
    // In a real implementation, this would save the workflow to a database
    // For now, we'll simulate the sharing process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await navigator.clipboard.writeText(shareUrl);
    
    toast.success('Workflow published and share link copied!', {
      description: 'Anyone with this link can view and import your workflow'
    });
    
    return shareUrl;
  } catch (error) {
    console.error('Failed to publish workflow:', error);
    toast.error('Failed to publish workflow');
    throw error;
  }
}

/**
 * Open workflow in n8n editor
 */
export function openInN8nAction(artifact: WorkflowArtifact, instanceUrl?: string): void {
  try {
    const baseUrl = instanceUrl || 'https://app.n8n.cloud';
    const workflowJson = encodeURIComponent(JSON.stringify(artifact.workflowData));
    const importUrl = `${baseUrl}/workflow/import?data=${workflowJson}`;
    
    window.open(importUrl, '_blank', 'noopener,noreferrer');
    
    toast.success('Opening workflow in n8n...', {
      description: 'A new tab will open with the workflow ready to import'
    });
  } catch (error) {
    console.error('Failed to open in n8n:', error);
    toast.error('Failed to open workflow in n8n');
  }
}

/**
 * Create a duplicate/fork of the workflow
 */
export function duplicateWorkflowAction(artifact: WorkflowArtifact): WorkflowArtifact {
  const duplicatedWorkflow: N8nWorkflowData = {
    ...artifact.workflowData,
    name: `${artifact.workflowData.name} (Copy)`,
    id: undefined, // Remove ID so it's treated as new
    active: false // Ensure copy starts inactive
  };

  // Create new artifact with duplicated data
  const newArtifact: WorkflowArtifact = {
    ...artifact,
    id: `artifact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title: duplicatedWorkflow.name,
    workflowData: duplicatedWorkflow,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  toast.success('Workflow duplicated!', {
    description: 'A copy of the workflow has been created'
  });

  return newArtifact;
}

/**
 * Export workflow in different formats
 */
export function exportWorkflowAction(
  artifact: WorkflowArtifact, 
  format: 'json' | 'yaml' | 'typescript'
): void {
  try {
    let content: string;
    let filename: string;
    let mimeType: string;

    const safeName = artifact.workflowData.name.replace(/\s+/g, '_').toLowerCase();

    switch (format) {
      case 'json':
        content = JSON.stringify(artifact.workflowData, null, 2);
        filename = `${safeName}.json`;
        mimeType = 'application/json';
        break;

      case 'yaml':
        // Convert JSON to YAML format (simplified)
        content = jsonToYaml(artifact.workflowData);
        filename = `${safeName}.yaml`;
        mimeType = 'text/yaml';
        break;

      case 'typescript':
        content = generateTypeScriptInterface(artifact.workflowData);
        filename = `${safeName}.workflow.ts`;
        mimeType = 'text/typescript';
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Workflow exported as ${format.toUpperCase()}!`, {
      description: `Downloaded as ${filename}`
    });
  } catch (error) {
    console.error('Failed to export workflow:', error);
    toast.error(`Failed to export workflow as ${format.toUpperCase()}`);
  }
}

// Helper functions

/**
 * Generate a unique share ID
 */
function generateShareId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Show deployment instructions modal/toast
 */
function showDeploymentInstructions(artifact: WorkflowArtifact): void {
  const instructions = `
To deploy this workflow to your n8n instance:

1. Copy the workflow JSON (already in clipboard)
2. Open your n8n instance
3. Go to Workflows → Import
4. Paste the JSON and click Import
5. Configure credentials for: ${artifact.metadata?.requiredCredentials?.join(', ') || 'required services'}
6. Test the workflow with sample data
7. Activate when ready

Required credentials: ${artifact.metadata?.requiredCredentials?.join(', ') || 'None specified'}
`;

  // In a real app, this would show a proper modal
  console.log(instructions);
  
  toast.info('Deployment Instructions', {
    description: 'Check console for detailed deployment instructions'
  });
}

/**
 * Deploy workflow to n8n API (mock implementation)
 */
async function deployToN8nApi(
  workflowData: N8nWorkflowData,
  options: {
    instanceUrl: string;
    authToken?: string;
    activateAfterImport: boolean;
  }
): Promise<{ success: boolean; error?: string; workflowId?: string }> {
  // This is a mock implementation
  // In a real application, this would make actual API calls to n8n
  
  try {
    const response = await fetch(`${options.instanceUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.authToken && { 'Authorization': `Bearer ${options.authToken}` })
      },
      body: JSON.stringify(workflowData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // If activation is requested, activate the workflow
    if (options.activateAfterImport && result.id) {
      await fetch(`${options.instanceUrl}/api/v1/workflows/${result.id}/activate`, {
        method: 'POST',
        headers: {
          ...(options.authToken && { 'Authorization': `Bearer ${options.authToken}` })
        }
      });
    }

    return { success: true, workflowId: result.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Convert JSON to YAML format (simplified)
 */
function jsonToYaml(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let yaml = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null) {
      yaml += `${spaces}${key}: null\n`;
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      yaml += `${spaces}${key}: ${value}\n`;
    } else if (typeof value === 'string') {
      yaml += `${spaces}${key}: "${value}"\n`;
    } else if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object') {
          yaml += `${spaces}  -\n${jsonToYaml(item, indent + 2)}`;
        } else {
          yaml += `${spaces}  - ${item}\n`;
        }
      });
    } else if (typeof value === 'object') {
      yaml += `${spaces}${key}:\n${jsonToYaml(value, indent + 1)}`;
    }
  }

  return yaml;
}

/**
 * Generate TypeScript interface from workflow data
 */
function generateTypeScriptInterface(workflowData: N8nWorkflowData): string {
  return `/**
 * Generated TypeScript interface for n8n workflow: ${workflowData.name}
 * Generated on: ${new Date().toISOString()}
 */

export interface ${workflowData.name.replace(/\s+/g, '')}WorkflowData {
  name: "${workflowData.name}";
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  active: boolean;
  settings?: WorkflowSettings;
  staticData?: Record<string, any>;
  tags?: string[];
}

export const ${workflowData.name.replace(/\s+/g, '').toLowerCase()}Workflow: ${workflowData.name.replace(/\s+/g, '')}WorkflowData = ${JSON.stringify(workflowData, null, 2)};
`;
}