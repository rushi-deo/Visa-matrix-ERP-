import type { LifecycleManager } from './types.js';

export const createLifecycleManager = (): LifecycleManager => ({
  initialize: async () => undefined,
  configure: async () => undefined,
  build: async () => undefined,
  start: async () => undefined,
  ready: async () => undefined,
  stop: async () => undefined,
  restart: async () => undefined,
  shutdown: async () => undefined,
});
