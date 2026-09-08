import type { InferencePipeline } from './types.js';

export const createInferencePipeline = (): InferencePipeline => ({
  stages: ['reason', 'plan', 'execute', 'evaluate', 'feedback', 'learn', 'retry'],
});
