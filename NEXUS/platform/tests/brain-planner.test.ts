import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/service.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { ProviderManagerToken, RuntimeToken } from '../src/infrastructure/container/service-tokens.js';
import { createRequestCoordinator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';
import type { ProviderManager } from '../src/providers/types.js';
import { createPlatformRuntime } from '../src/runtime/runtime.js';
import { createLoggerFactory } from '../src/shared/logger.js';

describe('brain planner integration (pass 3)', () => {
  it('invokes the planner which uses provider output to build a structured plan', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    const providerManager = container.resolve(ProviderManagerToken) as unknown as ProviderManager;
    providerManager.register('mock-model', {
      name: 'mock-model',
      configuration: { providerName: 'test', environment: 'testing' },
      request: async () => ({ ok: true, output: JSON.stringify({ id: 'plan', steps: ['step-a', 'step-b'] }) }),
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 0 }),
    });

    const router = createRequestCoordinator(container);
    const ctx = await router.route({ id: 'req-plan-1', source: 'api' });

    const pipeline = createExecutionPipeline();
    const plan = await pipeline.createPlan(ctx);

    expect(plan.id).toBe('plan');
    expect(plan.steps).toEqual(['step-a', 'step-b']);
  });

  it('handles invalid/failed provider output safely and falls back to empty plan', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    const providerManager = container.resolve(ProviderManagerToken) as unknown as ProviderManager;
    providerManager.register('mock-model', {
      name: 'mock-model',
      configuration: { providerName: 'test', environment: 'testing' },
      request: async () => ({ ok: true, output: 'not-a-json' }),
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 0 }),
    });

    const router = createRequestCoordinator(container);
    const ctx = await router.route({ id: 'req-plan-2', source: 'api' });

    const pipeline = createExecutionPipeline();
    const plan = await pipeline.createPlan(ctx);

    expect(plan.id).toBe('plan');
    expect(plan.steps).toEqual([]);
  });
});
