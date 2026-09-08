import type { ModuleLoader } from './types.js';

export const createModuleLoader = (): ModuleLoader => ({
  load: async () => undefined,
});
