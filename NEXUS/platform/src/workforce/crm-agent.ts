import { createProviderBackedAgent } from './provider-agent-support.js';

export const createCrmAgent = () => createProviderBackedAgent(
  'crm-agent',
  'Analyze customer, lead, or application input. Summarize context, identify missing information and risks, and recommend follow-up actions.',
);
