import type { StartupManager } from './types.js';

export const createStartupManager = (): StartupManager => ({
  start: async () => undefined,
});
