import { createProviderBackedAgent } from './provider-agent-support.js';
import type { Agent } from './types.js';

export const createProviderAgent = (): Agent => createProviderBackedAgent(
  'provider-agent',
  'Complete the supplied execution task using the request and available context.',
);
