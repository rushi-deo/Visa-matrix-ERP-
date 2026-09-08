import type { BrainPipeline } from './types.js';

export const createBrainPipeline = (): BrainPipeline => ({
  stages: ['initialize', 'plan', 'reason', 'execute', 'evaluate', 'learn', 'complete'],
});
