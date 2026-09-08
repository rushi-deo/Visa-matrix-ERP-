import type { Plugin } from './types.js';

export interface PluginRegistry {
  register(plugin: Plugin): void;
  get(name: string): Plugin | undefined;
}

export const createPluginRegistry = (): PluginRegistry => {
  const plugins = new Map<string, Plugin>();

  return {
    register: (plugin) => {
      plugins.set(plugin.manifest.name, plugin);
    },
    get: (name) => plugins.get(name),
  };
};
