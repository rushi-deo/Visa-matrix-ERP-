import { executeProviderAgent } from './provider-agent-support.js';
import type { Agent } from './types.js';

export const createResearchAgent = (): Agent => ({
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
      'research-agent',
      task,
      context,
      'Research and analyze the supplied memory and knowledge. Return structured findings, evidence, uncertainties, and recommended next actions.',
      { knowledge },
    );
  },
});
