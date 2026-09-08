import type { KernelModule, ModuleRegistry } from './types.js';

export const createModuleRegistry = (): ModuleRegistry => {
  const modules = new Map<string, KernelModule>();

  return {
    register: (name, module) => {
      modules.set(name, module);
    },
    get: (name) => modules.get(name),
  };
};
