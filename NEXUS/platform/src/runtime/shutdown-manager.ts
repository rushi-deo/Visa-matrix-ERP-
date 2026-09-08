import type { ShutdownManager } from './types.js';

export const createShutdownManager = (): ShutdownManager => ({
  stop: async () => undefined,
});
