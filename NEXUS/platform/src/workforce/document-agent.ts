import { createProviderBackedAgent } from './provider-agent-support.js';

export const createDocumentAgent = () => createProviderBackedAgent(
  'document-agent',
  'Analyze document-related input. Identify available, missing, incomplete, inconsistent, and relevant details, then provide recommendations.',
);
