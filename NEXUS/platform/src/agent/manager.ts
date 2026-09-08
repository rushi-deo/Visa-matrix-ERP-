import type { Agent, AgentContext, AgentManager, AgentRegistry, AgentResult, AgentRuntime,AgentTask } from './types.js';

export const createAgentRegistry = (): AgentRegistry => {
  const agents = new Map<string, Agent>();

  return {
    register: (name, agent) => {
      agents.set(name, agent);
    },
    get: (name) => agents.get(name),
    list: () => [...agents.keys()],
  };
};

export const createAgentManager = (registry: AgentRegistry = createAgentRegistry()): AgentManager => ({
  register: (name, agent) => {
    registry.register(name, agent);
  },
  load: async () => undefined,
  execute: async (name: string, task: AgentTask, context: AgentContext): Promise<AgentResult> => {
    const agent = registry.get(name);
    if (!agent) {
      throw new Error(`Agent not registered: ${name}`);
    }

    return agent.execute(task, context);
  },
  pause: async () => undefined,
  resume: async () => undefined,
  stop: async () => undefined,
});

export const createAgentRuntime = (manager: AgentManager): AgentRuntime => ({
  execute: async (name, task, context) => {
    const result = await manager.execute(name, task, context);

if (result.output !== undefined) {
  return {
    ok: result.ok,
    output: result.output,
  };
}

return {
  ok: result.ok,
};
  },
});
