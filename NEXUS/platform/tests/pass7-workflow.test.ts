import { describe, expect, it } from 'vitest';

import type { AutomationManager } from '../src/automation/types.js';
import { createPlatformConfig } from '../src/config/service.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { AgentManagerToken, AutomationManagerToken, EventBusToken, RuntimeToken, ToolManagerToken } from '../src/infrastructure/container/service-tokens.js';
import { createRequestCoordinator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';
import { createPlatformRuntime } from '../src/runtime/runtime.js';
import { createLoggerFactory } from '../src/shared/logger.js';
import type { ToolManager } from '../src/tools/types.js';
import type { AgentManager } from '../src/workforce/types.js';

const createExecutionContext = async (requestId: string) => {
  const container = createContainer();
  registerCoreServices(container);

  const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
  container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

  const router = createRequestCoordinator(container);
  const context = await router.route({ id: requestId, source: 'api' });
  const events: string[] = [];
  const eventBus = container.resolve(EventBusToken);
  eventBus.subscribe({
    handle: (event) => {
      if (event && typeof event === 'object' && 'type' in event && typeof event.type === 'string') {
        events.push(event.type);
      }
    },
  });

  return { container, context, events };
};

describe('PASS7 workflow & automation integration', () => {
  it('runs workflow execution through the existing automation manager', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    let executedWorkflowId = '';
    const automationManager = container.resolve(AutomationManagerToken) as AutomationManager;
    automationManager.execute = async (definition, context) => {
      executedWorkflowId = context.workflowId;
      return { ok: true, details: definition.id };
    };

    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    agentManager.register('step-1', {
      initialize: async () => undefined,
      execute: async () => ({ ok: true }),
    });

    const toolManager = container.resolve(ToolManagerToken) as ToolManager;
    toolManager.register({
      definition: { name: 'step-1', version: '1.0' },
      execute: async () => ({ ok: true }),
    });

    const router = createRequestCoordinator(container);
    const ctx = await router.route({ id: 'req-pass7-1', source: 'api' });
    const workflow = { id: 'workflow-pass7', name: 'Workflow', steps: [{ id: 'step-1', name: 'Review' }] } as const;
    const pipeline = createExecutionPipeline();
    const workflowContext = { ...ctx, workflow };

    const plan = await pipeline.createPlan(workflowContext);
    const result = await pipeline.execute(workflowContext, plan);

    expect(executedWorkflowId).toBe('workflow-pass7');
    expect(result.ok).toBe(true);
  });

  it('executes a registered agent and emits ordered success lifecycle events', async () => {
    const { container, context, events } = await createExecutionContext('req-pass7-agent');
    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    let executed = false;
    agentManager.register('agent-step', {
      initialize: async () => undefined,
      execute: async () => {
        executed = true;
        return { ok: true };
      },
    });

    const result = await createExecutionPipeline().execute(context, { id: 'plan', steps: ['agent-step'] });

    expect(executed).toBe(true);
    expect(result.ok).toBe(true);
    expect(events).toEqual(['execution:start', 'execution:step:start', 'execution:step:complete', 'execution:complete']);
  });

  it('falls back from a failing agent to a same-named tool', async () => {
    const { container, context, events } = await createExecutionContext('req-pass7-fallback');
    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    const toolManager = container.resolve(ToolManagerToken) as ToolManager;
    let toolExecuted = false;
    agentManager.register('shared-step', {
      initialize: async () => undefined,
      execute: async () => {
        throw new Error('agent failed');
      },
    });
    toolManager.register({
      definition: { name: 'shared-step', version: '1.0' },
      execute: async () => {
        toolExecuted = true;
        return { ok: true };
      },
    });

    const result = await createExecutionPipeline().execute(context, { id: 'plan', steps: ['shared-step'] });

    expect(toolExecuted).toBe(true);
    expect(result.ok).toBe(true);
    expect(events).toEqual(['execution:start', 'execution:step:start', 'execution:step:complete', 'execution:complete']);
  });

  it('falls back when an agent returns an unsuccessful result', async () => {
    const { container, context, events } = await createExecutionContext('req-pass7-agent-result-failure');
    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    const toolManager = container.resolve(ToolManagerToken) as ToolManager;
    let toolExecuted = false;
    agentManager.register('result-failure', {
      initialize: async () => undefined,
      execute: async () => ({ ok: false, details: 'agent failed' }),
    });
    toolManager.register({
      definition: { name: 'result-failure', version: '1.0' },
      execute: async () => {
        toolExecuted = true;
        return { ok: true };
      },
    });

    const result = await createExecutionPipeline().execute(context, { id: 'plan', steps: ['result-failure'] });

    expect(toolExecuted).toBe(true);
    expect(result.ok).toBe(true);
    expect(events).toEqual(['execution:start', 'execution:step:start', 'execution:step:complete', 'execution:complete']);
  });

  it('fails when a plan step resolves to neither an agent nor a tool', async () => {
    const { context, events } = await createExecutionContext('req-pass7-missing');

    const result = await createExecutionPipeline().execute(context, { id: 'plan', steps: ['missing-step'] });

    expect(result.ok).toBe(false);
    expect(events).toEqual(['execution:start', 'execution:step:start', 'execution:complete']);
  });

  it('marks tool failure and emits failed execution completion', async () => {
    const { container, context, events } = await createExecutionContext('req-pass7-tool-failure');
    const toolManager = container.resolve(ToolManagerToken) as ToolManager;
    toolManager.register({
      definition: { name: 'failing-tool', version: '1.0' },
      execute: async () => ({ ok: false, details: 'tool failed' }),
    });

    const result = await createExecutionPipeline().execute(context, { id: 'plan', steps: ['failing-tool'] });

    expect(result.ok).toBe(false);
    expect(events).toEqual(['execution:start', 'execution:step:start', 'execution:step:complete', 'execution:complete']);
  });

  it('processes workflow steps in plan order before invoking automation', async () => {
    const { container, context, events } = await createExecutionContext('req-pass7-order');
    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    const order: string[] = [];
    agentManager.register('first', {
      initialize: async () => undefined,
      execute: async () => {
        order.push('first');
        return { ok: true };
      },
    });
    agentManager.register('second', {
      initialize: async () => undefined,
      execute: async () => {
        order.push('second');
        return { ok: true };
      },
    });
    const workflow = { id: 'workflow-order', name: 'Workflow', steps: [{ id: 'first', name: 'First' }, { id: 'second', name: 'Second' }] } as const;
    const result = await createExecutionPipeline().execute({ ...context, workflow }, { id: 'plan', steps: ['first', 'second'] });

    expect(order).toEqual(['first', 'second']);
    expect(result.ok).toBe(true);
    expect(events).toEqual([
      'execution:start',
      'workflow:complete',
      'execution:complete',
    ]);
  });

  it('marks a returned automation failure and emits workflow completion failure', async () => {
    const { container, context, events } = await createExecutionContext('req-pass7-automation-failure');
    const automationManager = container.resolve(AutomationManagerToken) as AutomationManager;
    automationManager.execute = async () => ({ ok: false, details: 'workflow failed' });

    const workflow = { id: 'workflow-failure', name: 'Workflow', steps: [{ id: 'step', name: 'Step' }] } as const;
    const result = await createExecutionPipeline().execute({ ...context, workflow }, { id: 'plan', steps: [] });

    expect(result.ok).toBe(false);
    expect(events).toEqual(['execution:start', 'workflow:complete', 'execution:complete']);
  });

  it('marks a thrown automation failure and emits workflow failure', async () => {
    const { container, context, events } = await createExecutionContext('req-pass7-automation-throw');
    const automationManager = container.resolve(AutomationManagerToken) as AutomationManager;
    automationManager.execute = async () => {
      throw new Error('workflow failed');
    };

    const workflow = { id: 'workflow-throw', name: 'Workflow', steps: [{ id: 'step', name: 'Step' }] } as const;
    const result = await createExecutionPipeline().execute({ ...context, workflow }, { id: 'plan', steps: [] });

    expect(result.ok).toBe(false);
    expect(events).toEqual(['execution:start', 'workflow:failed', 'execution:complete']);
  });
});
