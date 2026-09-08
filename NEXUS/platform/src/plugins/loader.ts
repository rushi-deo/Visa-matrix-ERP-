import type { Plugin, PluginManifest } from './types.js';

export interface PluginLoader {
  discover(name: string): Promise<PluginManifest | undefined>;
  register(plugin: Plugin): Promise<void>;
  enable(name: string): Promise<void>;
  disable(name: string): Promise<void>;
  validateVersion(name: string, version: string): Promise<boolean>;
  validateDependencies(name: string): Promise<boolean>;
}

export const createPluginLoader = (): PluginLoader => {
  const plugins = new Map<string, Plugin>();

  return {
    discover: async (name) => plugins.get(name)?.manifest,
    register: async (plugin) => {
      plugins.set(plugin.manifest.name, plugin);
      await plugin.install();
    },
    enable: async (name) => {
      const plugin = plugins.get(name);
      if (!plugin) throw new Error(`Plugin not registered: ${name}`);
      await plugin.enable();
    },
    disable: async (name) => {
      const plugin = plugins.get(name);
      if (!plugin) throw new Error(`Plugin not registered: ${name}`);
      await plugin.disable();
    },
    validateVersion: async (name, version) => plugins.get(name)?.manifest.version === version,
    validateDependencies: async () => true,
  };
};
