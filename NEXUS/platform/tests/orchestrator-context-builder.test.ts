import { describe, expect, it } from 'vitest';

import { createExecutionContextBuilder } from '../src/orchestration/context-builder.js';
import { createOrchestrator, createRequestCoordinator } from '../src/orchestration/index.js';
import type { PlatformRuntime } from '../src/runtime/types.js';

describe('execution context builder', () => {
  const createRuntime = (): PlatformRuntime => ({
    initialize: async () => undefined,
    configure: async () => undefined,
    build: async () => undefined,
    start: async () => undefined,
    ready: async () => undefined,
    stop: async () => undefined,
    restart: async () => undefined,
    shutdown: async () => undefined,
    getStage: () => 'initialized',
    getContext: () => ({ config: { nodeEnv: 'development', port: 3000, logLevel: 'info' }, logger: { debug: () => undefined, info: () => undefined, warn: () => undefined, error: () => undefined, fatal: () => undefined }, container: {} as never }),
  }) as PlatformRuntime;

  const createContextBase = () => ({
    request: { id: 'req-1', source: 'internal' as const, payload: { hello: 'world' } },
    runtime: createRuntime(),
    brain: {} as never,
    memory: {} as never,
    knowledge: {} as never,
    worker: {} as never,
    workflow: { id: 'wf-1', name: 'wf', steps: [] },
    tools: { requestId: 'req-1', correlationId: 'corr-1' },
  });

  it('creates a context with enriched fields', () => {
    const builder = createExecutionContextBuilder();
    const context = builder.build(createContextBase());

    expect(context.requestId).toBe('req-1');
    expect(context.sessionId).toBeUndefined();
    expect(context.selectedAgents).toEqual([]);
    expect(context.selectedTools).toEqual([]);
    expect(context.metadata).toEqual({});
  });

  it('throws when required values are missing', () => {
    const builder = createExecutionContextBuilder();

    expect(() =>
      builder.build({
        request: { id: '', source: 'internal' },
        runtime: createRuntime(),
        brain: {} as never,
        memory: {} as never,
        knowledge: {} as never,
        worker: {} as never,
        workflow: { id: 'wf-1', name: 'wf', steps: [] },
        tools: { requestId: 'req-1', correlationId: 'corr-1' },
      }),
    ).toThrow(/request.id/i);
  });

  it('enriches the context from the request and preserves request metadata immutably', () => {
    const builder = createExecutionContextBuilder();
    const base = createContextBase();
    const originalPayload = base.request.payload;

    const context = builder.build({
      ...base,
      metadata: { source: 'unit-test' },
    });

    originalPayload!.hello = 'changed';

    expect(context.request.payload).toEqual({ hello: 'world' });
    expect(context.metadata).toEqual({ source: 'unit-test' });
    expect(context.requestId).toBe('req-1');
  });

  it('serializes the context output', () => {
    const builder = createExecutionContextBuilder();
    const context = builder.build(createContextBase());

    const serialized = JSON.stringify(context);

    expect(serialized).toContain('req-1');
    expect(JSON.parse(serialized).requestId).toBe('req-1');
  });

  it('integrates the builder into the orchestrator flow', async () => {
    const router = createRequestCoordinator();
    const context = await router.route({ id: 'req-2', source: 'api' });
    const orchestrator = createOrchestrator();

    await expect(orchestrator.execute(context)).resolves.toEqual({ ok: false });
    expect(context.requestId).toBe('req-2');
  });
});
