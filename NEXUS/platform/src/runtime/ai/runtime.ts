import type { AIExecutionContext, AIExecutionResult,AIRuntime } from './types.js';

export const createAIRuntime = (): AIRuntime => ({
  execute: async (_context: AIExecutionContext): Promise<AIExecutionResult> => ({ ok: true, output: 'ok' }),
});
