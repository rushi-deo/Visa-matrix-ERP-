import type { Brain, BrainManager, BrainRegistry } from './types.js';

export const createBrainRegistry = (): BrainRegistry => {
  const brains = new Map<string, Brain>();

  return {
    register: (name, brain) => {
      brains.set(name, brain);
    },
    get: (name) => brains.get(name),
  };
};

export const createBrainManager = (registry: BrainRegistry = createBrainRegistry()): BrainManager => ({
  register: (name, brain) => {
    registry.register(name, brain);
  },
  get: (name) => registry.get(name),
});
