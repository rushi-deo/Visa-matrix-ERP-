import type { PlatformModule } from './types.js';

export interface ModuleManager {
  install(module: PlatformModule): Promise<void>;
  initialize(module: PlatformModule): Promise<void>;
  start(module: PlatformModule): Promise<void>;
  stop(module: PlatformModule): Promise<void>;
  unload(module: PlatformModule): Promise<void>;
}

export const createModuleManager = (): ModuleManager => ({
  install: async (module) => module.install(),
  initialize: async (module) => module.initialize(),
  start: async (module) => module.start(),
  stop: async (module) => module.stop(),
  unload: async (module) => module.unload(),
});
