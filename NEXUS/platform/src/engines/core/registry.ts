import type { EngineFactory, EngineRegistry } from './types.js';

export const createEngineRegistry = (): EngineRegistry => {
  const engines = new Map<string, EngineFactory>();

  return {
    register: (name, factory) => {
      engines.set(name, factory);
    },
    get: (name) => engines.get(name),
  };
};
