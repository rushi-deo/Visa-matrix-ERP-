import { describe, expect, it } from 'vitest';

import { createExecutionPipeline, createOrchestrator, createRequestRouter } from '../src/orchestration/index.js';
import type { PipelineCoordinator } from '../src/orchestration/types.js';

describe('execution pipeline', () => {
  it('builds context and response through the pipeline stages', async () => {
    const pipeline = createExecutionPipeline();
    const context = await createRequestRouter().route({ id: 'req-3', source: 'api' });

    const prepared = await pipeline.buildContext(context);
    const plan = await pipeline.createPlan(prepared);
    const resolvedAgents = await pipeline.resolveAgents(prepared);
    const resolvedTools = await pipeline.resolveTools(prepared);
    const result = await pipeline.execute(prepared, plan);
    const observed = await pipeline.observe(prepared, result);
    const audited = await pipeline.audit(prepared, result);
    const response = await pipeline.buildResponse(prepared, result);

    expect(prepared.requestId).toBe('req-3');
    expect(plan.id).toBe('plan');
    expect(resolvedAgents.requestId).toBe('req-3');
    expect(resolvedTools.requestId).toBe('req-3');
    expect(observed.status).toBe('observed');
    expect(audited.status).toBe('completed');
    expect(response.ok).toBe(false);
  });

  it('recovers from execution failures through the orchestrator', async () => {
    const failingPipeline: PipelineCoordinator = {
      validate: async () => ({ status: 'validated' }),
      buildContext: async (context) => context,
      loadMemory: async (context) => context,
      loadKnowledge: async (context) => context,
      createPlan: async () => ({ id: 'plan', steps: ['fail'] }),
      resolveAgents: async (context) => context,
      resolveTools: async (context) => context,
      plan: async () => ({ id: 'plan', steps: ['fail'] }),
      execute: async () => {
        throw new Error('boom');
      },
      observe: async () => ({ status: 'observed' }),
      audit: async () => ({ status: 'completed' }),
      complete: async () => ({ status: 'completed' }),
      buildResponse: async (_context, result) => ({ ok: result.ok }),
      recover: async () => ({ status: 'recovered' }),
    };

    const orchestrator = createOrchestrator(failingPipeline);
    const context = await createRequestRouter().route({ id: 'req-4', source: 'event' });
    const result = await orchestrator.execute(context);

    expect(result.ok).toBe(false);
    expect(result.details).toContain('recovered');
  });
});
