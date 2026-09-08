import type {
  Agent,
  AgentContext,
  AgentResponse,
  AgentTask,
} from '../types.js';

/**
 * Foundational NEXUS Supervisor Agent.
 *
 * The first concrete agent in the Workforce architecture.
 * Its initial purpose is to validate the complete
 * AgentManager -> Agent -> execution flow.
 */
export const createSupervisorAgent = (): Agent => ({
  initialize: async (context: AgentContext): Promise<void> => {
    await context.events.publish({
      type: 'agent.initialized',
      agent: context.profile.name,
      agentId: context.profile.id,
      sessionId: context.session.id,
    });
  },

  execute: async (
    task: AgentTask,
    context: AgentContext,
  ): Promise<AgentResponse> => {
    const memoryAvailable = Boolean(context.memory);
    const knowledgeAvailable = Boolean(context.knowledge);

    await context.events.publish({
      type: 'agent.executing',
      agent: context.profile.name,
      agentId: context.profile.id,
      taskId: task.id,
      taskName: task.name,
      sessionId: context.session.id,
    });

    return {
      ok: true,
      details: [
        `Supervisor agent executed task "${task.name}"`,
        `Memory available: ${memoryAvailable}`,
        `Knowledge available: ${knowledgeAvailable}`,
        `Session: ${context.session.id}`,
      ].join(' | '),
    };
  },
});