import type { AIExecutionContext, AIExecutionHistory, AIExecutionManager, AIExecutionResult } from './types.js';

export const createAIExecutionManager = (): AIExecutionManager => ({
  execute: async (_context: AIExecutionContext): Promise<AIExecutionResult> => ({ ok: true, output: 'ok' }),
  history: async (sessionId: string): Promise<AIExecutionHistory> => ({ sessionId, results: [] }),
});
