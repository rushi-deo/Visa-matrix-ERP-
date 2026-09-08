import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/service.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { AgentManagerToken, ProviderManagerToken, RuntimeToken, ToolManagerToken } from '../src/infrastructure/container/service-tokens.js';
import { createRequestCoordinator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';
import { createOpenAIProvider } from '../src/providers/index.js';
import type { ProviderManager } from '../src/providers/types.js';
import { createPlatformRuntime } from '../src/runtime/runtime.js';
import { createLoggerFactory } from '../src/shared/logger.js';
import type { ToolManager } from '../src/tools/types.js';
import type { AgentManager } from '../src/workforce/types.js';

describe('PASS4 execution wiring', () => {
  it('runs a mocked OpenAI plan through the planner and registered agent', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('openai', createOpenAIProvider(
      { providerName: 'openai', environment: 'testing' },
      { apiKey: 'test-key', model: 'gpt-test' },
      async () => new Response(JSON.stringify({
        output: [{ type: 'message', content: [{ type: 'output_text', text: '{"id":"plan","steps":["agent-openai"]}' }] }],
      }), { status: 200 }),
    ));

    let executed = false;
    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    agentManager.register('agent-openai', {
      initialize: async () => undefined,
      execute: async () => {
        executed = true;
        return { ok: true };
      },
    });

    const ctx = await createRequestCoordinator(container).route({ id: 'req-openai-agent', source: 'api' });
    const pipeline = createExecutionPipeline();
    const plan = await pipeline.createPlan(ctx);
    const result = await pipeline.execute(ctx, plan);

    expect(plan).toEqual({ id: 'plan', steps: ['agent-openai'] });
    expect(executed).toBe(true);
    expect(result.ok).toBe(true);
  });

  it('executes agent and tool steps from planner output and propagates results', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    // register provider that returns a plan with one agent and one tool
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('mock-model', {
      name: 'mock-model',
      configuration: { providerName: 'test', environment: 'testing' },
      request: async () => ({ ok: true, output: JSON.stringify({ id: 'plan', steps: ['agent-alice', 'echo-tool'] }) }),
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 0 }),
    });

    // register an agent that records execution
    const executedAgents: string[] = [];
    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    agentManager.register('agent-alice', {
      initialize: async () => undefined,
      execute: async (task, _ctx) => {
        executedAgents.push(task.id);
        return { ok: true };
      },
    });

    // register a tool that records execution
    const executedTools: string[] = [];
    const toolManager = container.resolve(ToolManagerToken) as ToolManager;
    toolManager.register({ definition: { name: 'echo-tool', version: '1.0' }, execute: async (ctx) => { executedTools.push(ctx.requestId ?? ''); return { ok: true }; } });

    const router = createRequestCoordinator(container);
    const ctx = await router.route({ id: 'req-pass4-1', source: 'api' });

    const pipeline = createExecutionPipeline();
    const plan = await pipeline.createPlan(ctx);
    const result = await pipeline.execute(ctx, plan);

    expect(plan.steps).toEqual(['agent-alice', 'echo-tool']);
    expect(executedAgents.length).toBe(1);
    expect(executedTools.length).toBe(1);
    expect(result.ok).toBe(true);
  });

  it('propagates failures from agent or tool execution', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('mock-model', {
      name: 'mock-model',
      configuration: { providerName: 'test', environment: 'testing' },
      request: async () => ({ ok: true, output: JSON.stringify({ id: 'plan', steps: ['agent-bad', 'echo-bad'] }) }),
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 0 }),
    });

    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    agentManager.register('agent-bad', {
      initialize: async () => undefined,
      execute: async () => ({ ok: false, details: 'agent failed' }),
    });

    const toolManager = container.resolve(ToolManagerToken) as ToolManager;
    toolManager.register({ definition: { name: 'echo-bad', version: '1.0' }, execute: async () => ({ ok: false, details: 'tool failed' }) });

    const router = createRequestCoordinator(container);
    const ctx = await router.route({ id: 'req-pass4-2', source: 'api' });

    const pipeline = createExecutionPipeline();
    const plan = await pipeline.createPlan(ctx);
    const result = await pipeline.execute(ctx, plan);

    expect(result.ok).toBe(false);
  });
});
