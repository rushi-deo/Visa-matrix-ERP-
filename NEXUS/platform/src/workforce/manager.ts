import type {
  Agent,
  AgentManager,
  AgentRegistry,
  Worker,
  WorkerRegistry,
  WorkforceManager,
} from './types.js';

export const createWorkerRegistry = (): WorkerRegistry => {
  const workers = new Map<string, Worker>();

  return {
    register: (name, worker) => {
      workers.set(name, worker);
    },
    get: (name) => workers.get(name),
  };
};

export const createWorkforceManager = (registry: WorkerRegistry = createWorkerRegistry()): WorkforceManager => ({
  register: (name, worker) => {
    registry.register(name, worker);
  },
  initialize: async (name, context) => {
    const worker = registry.get(name);
    if (!worker) {
      throw new Error(`Worker not registered: ${name}`);
    }

    await worker.initialize(context);
  },
  assign: async (name, assignment) => {
    const worker = registry.get(name);
    if (!worker) {
      throw new Error(`Worker not registered: ${name}`);
    }

    await worker.assign(assignment);
  },
  execute: async (name, context) => {
    const worker = registry.get(name);
    if (!worker) {
      throw new Error(`Worker not registered: ${name}`);
    }

    return worker.execute(context);
  },
  pause: async (name, context) => {
    const worker = registry.get(name);
    if (!worker) {
      throw new Error(`Worker not registered: ${name}`);
    }

    await worker.pause(context);
  },
  resume: async (name, context) => {
    const worker = registry.get(name);
    if (!worker) {
      throw new Error(`Worker not registered: ${name}`);
    }

    await worker.resume(context);
  },
  complete: async (name, context) => {
    const worker = registry.get(name);
    if (!worker) {
      throw new Error(`Worker not registered: ${name}`);
    }

    await worker.complete(context);
  },
  terminate: async (name, context) => {
    const worker = registry.get(name);
    if (!worker) {
      throw new Error(`Worker not registered: ${name}`);
    }

    await worker.terminate(context);
  },
});

export const createAgentRegistry = (): AgentRegistry => {
  const agents = new Map<string, Agent>();

  return {
    register: (name, agent) => {
      agents.set(name, agent);
    },
    get: (name) => agents.get(name),
  };
};

const validateAgentName = (name: string): void => {
  if (name.trim().length === 0) {
    throw new Error('Agent identifier is required');
  }
};

export const createAgentManager = (registry: AgentRegistry = createAgentRegistry()): AgentManager => ({
  register: (name, agent) => {
    registry.register(name, agent);
  },
  initialize: async (name, context) => {
    const agent = registry.get(name);
    if (!agent) {
      throw new Error(`Agent not registered: ${name}`);
    }

    await agent.initialize(context);
  },
  execute: async (name, task, context) => {
    validateAgentName(name);
    const agent = registry.get(name);
    if (!agent) {
      throw new Error(`Agent not registered: ${name}`);
    }

    return agent.execute(task, context);
  },
});
