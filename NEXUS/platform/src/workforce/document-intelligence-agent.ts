import { createProviderBackedAgent } from './provider-agent-support.js';

export const createDocumentIntelligenceAgent = () => createProviderBackedAgent(
  'document-intelligence-agent',
  'Perform deeper document intelligence on the supplied request and records. Extract and summarize relevant information and identify missing or inconsistent details.',
);
