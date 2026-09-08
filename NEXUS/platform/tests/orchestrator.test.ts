import { describe, expect, it } from 'vitest';

import { createExecutionPipeline, createHealthDashboard,createOrchestrator, createRequestRouter } from '../src/orchestration/index.js';

describe('orchestration', () => {
  it('creates an orchestrator and request router', async () => {
    const router = createRequestRouter();
    const context = await router.route({ id: 'req-1', source: 'internal' });
    const orchestrator = createOrchestrator();

    await expect(orchestrator.execute(context)).resolves.toEqual({ ok: false });
  });

  it('creates an execution pipeline', async () => {
    const pipeline = createExecutionPipeline();
    const context = await createRequestRouter().route({ id: 'req-2', source: 'api' });
    const plan = await pipeline.plan(context);

    expect(plan.steps).toEqual([]);
  });

  it('creates a health dashboard', () => {
    expect(createHealthDashboard().overall.ok).toBe(true);
  });
});
