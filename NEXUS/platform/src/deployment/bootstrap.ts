import type { ConnectorManager } from '../connectors/types.js';
import type { EngineManager } from '../engines/core/types.js';
import type { PluginManager } from '../plugins/manager.js';
import type { ProviderManager } from '../providers/types.js';
import type { ToolManager } from '../tools/types.js';
import type { WorkforceManager } from '../workforce/types.js';

export interface StartupBootstrap {
  registerModules(): Promise<void>;
  registerProviders(): Promise<void>;
  registerConnectors(): Promise<void>;
  registerTools(): Promise<void>;
  registerWorkers(): Promise<void>;
  registerEngines(): Promise<void>;
  registerPlugins(): Promise<void>;
}

export const createStartupBootstrap = (
  _input: Readonly<{
    modules: unknown;
    providers: ProviderManager;
    connectors: ConnectorManager;
    tools: ToolManager;
    workers: WorkforceManager;
    engines: EngineManager;
    plugins: PluginManager;
  }>,
): StartupBootstrap => ({
  registerModules: async () => undefined,
  registerProviders: async () => undefined,
  registerConnectors: async () => undefined,
  registerTools: async () => undefined,
  registerWorkers: async () => undefined,
  registerEngines: async () => undefined,
  registerPlugins: async () => undefined,
});
