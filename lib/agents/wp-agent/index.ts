/**
 * wpAgent - Main Export
 * AI-powered WordPress site management through natural language
 */

import { validateWpAgentEnvironment as validateEnv } from './agent';

export {
  createWpAgent,
  validateWpAgentEnvironment,
  getMemory,
  streamWordPressOperations,
  streamWordPressUpdates
} from './agent';
export { WP_AGENT_SYSTEM_PROMPT } from './prompts/system-prompt';
export type * from './types';

/**
 * Check if wpAgent environment is properly configured
 */
export function checkWpAgentEnvironment() {
  const validation = validateEnv();
  
  if (validation.isValid) {
    return {
      isReady: true,
      message: '✅ wpAgent environment is ready!'
    };
  }

  return {
    isReady: false,
    message: '❌ wpAgent environment setup required',
    steps: [
      'Set ANTHROPIC_API_KEY environment variable',
      'Configure WordPress credentials (WORDPRESS_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD)',
      'Ensure WordPress REST API is enabled',
      'Test connection to WordPress site'
    ],
    errors: validation.errors,
    warnings: validation.warnings
  };
}

export const VERSION = '1.0.0';
export const DESCRIPTION = 'AI-powered WordPress site management through natural language';
export const AUTHOR = 'wpAgent Team';

/**
 * Quick start examples for wpAgent
 */
export const EXAMPLES = {
  basic: {
    title: 'Create and Use wpAgent',
    code: `
import { createWpAgent } from './lib/agents/wp-agent';

const agent = createWpAgent({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  wordpressUrl: process.env.WORDPRESS_URL,
  wordpressUsername: process.env.WORDPRESS_USERNAME,
  wordpressAppPassword: process.env.WORDPRESS_APP_PASSWORD
});

// Use the agent for WordPress operations
const response = await agent.invoke({
  messages: [{ role: 'user', content: 'Create a blog post about WordPress security' }]
});
`
  },
  streaming: {
    title: 'Stream WordPress Operations',
    code: `
import { streamWordPressOperations } from './lib/agents/wp-agent';

for await (const chunk of streamWordPressOperations(userMessage, threadId)) {
  console.log(chunk);
}
`
  },
  advanced: {
    title: 'Advanced Configuration',
    code: `
import { createWpAgent } from './lib/agents/wp-agent';

const agent = createWpAgent({
  enableWebSearch: true,
  enableSubAgents: true,
  wordpressUrl: 'https://your-site.com',
  // ... other config
});
`
  }
};