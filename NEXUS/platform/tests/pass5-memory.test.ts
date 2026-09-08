import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/service.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { AgentManagerToken,KnowledgeManagerToken, MemoryManagerToken, ProviderManagerToken, RuntimeToken } from '../src/infrastructure/container/service-tokens.js';
import type { KnowledgeManager } from '../src/knowledge/types.js';
import type { MemoryProvider, MemoryRecord } from '../src/memory/types.js';
import type { MemoryManager } from '../src/memory/types.js';
import { createRequestCoordinator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';
import type { ProviderManager } from '../src/providers/types.js';
import { createPlatformRuntime } from '../src/runtime/runtime.js';
import { createLoggerFactory } from '../src/shared/logger.js';
import type { AgentManager } from '../src/workforce/types.js';

describe('PASS5 memory & knowledge integration', () => {
  it('consumes memory and knowledge before planning and persists result after execution', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    // install a memory provider that returns a record and captures stored records
    const stored: MemoryRecord[] = [];
    const recallCalled: string[] = [];
    const memProvider: MemoryProvider = {
      name: 'test-mem',
      store: async (record, _context) => {
        stored.push(record);
      },
      recall: async (context) => {
        recallCalled.push(context.subjectId ?? '');
        return [
          { metadata: { id: 'm1', version: '1', type: 'working', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: [] }, content: 'mem-content' },
        ];
      },
    };

    const memoryManager = container.resolve(MemoryManagerToken) as MemoryManager;
    memoryManager.register('working', memProvider);

    // patch knowledge manager search to return a doc
    const knowledgeManager = container.resolve(KnowledgeManagerToken) as KnowledgeManager;
    let knowledgeSearched = false;
    knowledgeManager.search = async (_query) => {
      knowledgeSearched = true;
      return { isSuccess: true, isFailure: false, value: [{ metadata: { id: 'k1', version: '1', source: 'test', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, title: 'doc', content: 'doc-content' }] };
    };

    // provider for planner that returns a trivial plan
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('mock-model', {
      name: 'mock-model',
      configuration: { providerName: 'test', environment: 'testing' },
      request: async () => ({ ok: true, output: JSON.stringify({ id: 'plan', steps: ['agent-x'] }) }),
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 0 }),
    });

    // register an agent that simply returns ok
    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    agentManager.register('agent-x', { initialize: async () => undefined, execute: async () => ({ ok: true }) });

    const router = createRequestCoordinator(container);
    const ctx = await router.route({ id: 'req-pass5-1', source: 'api' });

    const pipeline = createExecutionPipeline();
    const plan = await pipeline.createPlan(ctx);

    // ensure memory recall and knowledge search were invoked
    expect(recallCalled[0]).toBe('req-pass5-1');
    expect(knowledgeSearched).toBe(true);

    const result = await pipeline.execute(ctx, plan);

    // execution should have been persisted to memory by store
    expect(stored.length).toBeGreaterThanOrEqual(1);
    expect(result.ok).toBe(true);
  });

  it('handles empty/unavailable memory/knowledge safely', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    // ensure memory recall throws
    const memoryManager = container.resolve(MemoryManagerToken) as MemoryManager;
    memoryManager.recall = async () => {
      throw new Error('unavailable');
    };

    const knowledgeManager = container.resolve(KnowledgeManagerToken) as KnowledgeManager;
    knowledgeManager.search = async () => ({ isSuccess: true, isFailure: false, value: [] });

    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('mock-model', {
      name: 'mock-model',
      configuration: { providerName: 'test', environment: 'testing' },
      request: async () => ({ ok: true, output: JSON.stringify({ id: 'plan', steps: [] }) }),
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 0 }),
    });

    const router = createRequestCoordinator(container);
    const ctx = await router.route({ id: 'req-pass5-2', source: 'api' });

    const pipeline = createExecutionPipeline();
    const plan = await pipeline.createPlan(ctx);
    const result = await pipeline.execute(ctx, plan);

    expect(plan.steps.length).toBeGreaterThanOrEqual(0);
    expect(result.ok).toBe(false);
  });

  it('reports memory persistence failure instead of returning fake success', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    const memoryManager = container.resolve(MemoryManagerToken) as MemoryManager;
    memoryManager.store = async () => {
      throw new Error('memory unavailable');
    };

    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    agentManager.register('persist-agent', { initialize: async () => undefined, execute: async () => ({ ok: true }) });
    const context = await createRequestCoordinator(container).route({ id: 'req-pass5-persistence', source: 'api' });
    const result = await createExecutionPipeline().execute({ ...context, selectedAgents: ['persist-agent'] }, { id: 'plan', steps: [] });

    expect(result).toEqual({ ok: false, details: 'execution result could not be persisted to memory' });
  });
});
