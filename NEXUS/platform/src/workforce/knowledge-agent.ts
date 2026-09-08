import { executeProviderAgent } from './provider-agent-support.js';
import type { Agent } from './types.js';

export const createKnowledgeAgent = (): Agent => ({
  initialize: async () => undefined,
  execute: async (task, context) => {
    let knowledge = task.input?.knowledge ?? [];
    if (knowledge.length === 0) {
      try {
        const result = await context.knowledge.search({ text: JSON.stringify(task.input?.request.payload ?? {}), limit: 5 });
        knowledge = result.isSuccess ? result.value : [];
      } catch {
        knowledge = [];
      }
    }

    return executeProviderAgent(
      'knowledge-agent',
      task,
      context,
      'Synthesize and explain the supplied knowledge records. Clearly distinguish retrieved information from your own reasoning and identify evidence used.',
      { knowledge },
    );
  },
});
