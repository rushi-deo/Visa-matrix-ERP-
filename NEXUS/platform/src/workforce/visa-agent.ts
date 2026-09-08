import { createProviderBackedAgent } from './provider-agent-support.js';

export const createVisaAgent = () => createProviderBackedAgent(
  'visa-agent',
  'Analyze the visa-related request using supplied evidence. Return eligibility considerations, requirements, risks, missing information, and next actions. Do not invent rules when evidence is unavailable.',
);
