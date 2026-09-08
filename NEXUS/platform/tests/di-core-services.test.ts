import { describe, expect, it } from 'vitest';

import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { EngineManagerToken, EventBusToken, KnowledgeManagerToken, MemoryManagerToken, PluginManagerToken, RuntimeToken, ToolManagerToken, WorkforceManagerToken } from '../src/infrastructure/container/service-tokens.js';
import type { PlatformRuntime } from '../src/runtime/types.js';
import type { Logger } from '../src/shared/logger.js';

describe('container core services wiring', () => {
  it('registers and resolves core managers and utilities', () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime: PlatformRuntime = {
      initialize: async () => undefined,
      configure: async () => undefined,
      build: async () => undefined,
      start: async () => undefined,
      ready: async () => undefined,
      stop: async () => undefined,
      restart: async () => undefined,
      shutdown: async () => undefined,
      getStage: () => 'initialized',
      getContext: () => ({ config: { nodeEnv: 'test', port: 0, logLevel: 'debug' }, logger: { debug: () => undefined, info: () => undefined, warn: () => undefined, error: () => undefined, fatal: () => undefined } as Logger, container }),
    };

    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    const mem = container.resolve(MemoryManagerToken);
    const know = container.resolve(KnowledgeManagerToken);
    const tools = container.resolve(ToolManagerToken);
    const workforce = container.resolve(WorkforceManagerToken);
    const engines = container.resolve(EngineManagerToken);
    const plugins = container.resolve(PluginManagerToken);
    const bus = container.resolve(EventBusToken);

    expect(mem).toBeDefined();
    expect(know).toBeDefined();
    expect(tools).toBeDefined();
    expect(workforce).toBeDefined();
    expect(engines).toBeDefined();
    expect(plugins).toBeDefined();
    expect(bus).toBeDefined();
  });
});
