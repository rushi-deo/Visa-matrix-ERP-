import type { IntelligenceEngine, IntelligenceManager } from './types.js';

export const createIntelligenceManager = (): IntelligenceManager => {
  const engines = new Map<string, IntelligenceEngine>();

  return {
    register: (name, engine) => {
      engines.set(name, engine);
    },
    get: (name) => engines.get(name),
  };
};
