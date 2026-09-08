import { createEngineRegistry } from './registry.js';
import type { EngineContext, EngineManager } from './types.js';

export const createEngineManager = (): EngineManager => {
  const registry = createEngineRegistry();

  const resolve = (name: string, context: EngineContext) => {
    const factory = registry.get(name);
    if (!factory) {
      throw new Error(`Engine not registered: ${name}`);
    }

    return factory.create(context);
  };

  return {
    initialize: async (name, context) => resolve(name, context).initialize(),
    start: async (name, context) => resolve(name, context).start(),
    execute: async (name, context) => resolve(name, context).execute(),
    pause: async (name, context) => resolve(name, context).pause(),
    resume: async (name, context) => resolve(name, context).resume(),
    stop: async (name, context) => resolve(name, context).stop(),
    dispose: async (name, context) => resolve(name, context).dispose(),
    health: async (name, context) => resolve(name, context).health(),
  };
};
