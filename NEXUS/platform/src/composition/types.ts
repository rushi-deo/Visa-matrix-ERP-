import type { APIHost, MiddlewareRegistry, RouteRegistry } from '../api/runtime.js';
import type { AutomationManager } from '../automation/types.js';
import type { BrainManager } from '../brain/types.js';
import type { ConnectorManager } from '../connectors/types.js';
import type { DeploymentProfile } from '../deployment/types.js';
import type { EngineManager } from '../engines/core/types.js';
import type { KnowledgeManager } from '../knowledge/types.js';
import type { MemoryManager } from '../memory/types.js';
import type { PluginManager } from '../plugins/manager.js';
import type { ProviderManager } from '../providers/types.js';
import type { ToolManager } from '../tools/types.js';
import type { WorkforceManager } from '../workforce/types.js';

export type PlatformComposer = Readonly<{
  service: ServiceComposer;
  module: ModuleComposer;
  engine: EngineComposer;
  provider: ProviderComposer;
  connector: ConnectorComposer;
  workflow: WorkflowComposer;
}>;

export interface ServiceComposer {
  compose(): Promise<void>;
}

export interface ModuleComposer {
  compose(): Promise<void>;
}

export interface EngineComposer {
  compose(): Promise<void>;
}

export interface ProviderComposer {
  compose(): Promise<void>;
}

export interface ConnectorComposer {
  compose(): Promise<void>;
}

export interface WorkflowComposer {
  compose(): Promise<void>;
}

export type CompositionContext = Readonly<{
  api: APIHost;
  routes: RouteRegistry;
  middleware: MiddlewareRegistry;
  brain: BrainManager;
  memory: MemoryManager;
  knowledge: KnowledgeManager;
  workforce: WorkforceManager;
  automation: AutomationManager;
  tools: ToolManager;
  engines: EngineManager;
  providers: ProviderManager;
  connectors: ConnectorManager;
  plugins: PluginManager;
  deployment: DeploymentProfile;
}>;
