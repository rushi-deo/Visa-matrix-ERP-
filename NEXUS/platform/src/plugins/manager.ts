import { createPluginRegistry, type PluginRegistry } from './registry.js';
import type { Plugin } from './types.js';

export interface PluginManager {
  install(plugin: Plugin): Promise<void>;
  enable(name: string): Promise<void>;
  disable(name: string): Promise<void>;
  unload(name: string): Promise<void>;
  update(name: string): Promise<void>;
  registry: PluginRegistry;
}

export const createPluginManager = (): PluginManager => {
  const registry = createPluginRegistry();

  const resolve = (name: string): Plugin => {
    const plugin = registry.get(name);
    if (!plugin) {
      throw new Error(`Plugin not registered: ${name}`);
    }

    return plugin;
  };

  return {
    registry,
    install: async (plugin) => {
      registry.register(plugin);
      await plugin.install();
    },
    enable: async (name) => resolve(name).enable(),
    disable: async (name) => resolve(name).disable(),
    unload: async (name) => resolve(name).unload(),
    update: async (name) => resolve(name).update(),
  };
};
