import type { BrainContext } from '../brain/types.js';
import type { IntegrationExecutionRequest } from '../connectors/types.js';
import type { EngineManager } from '../engines/core/types.js';
import type { EventBus } from '../events/event-bus.js';
import { createContainer } from '../infrastructure/container/container.js';
import { registerCoreServices } from '../infrastructure/container/registrations.js';
import { AgentManagerToken, AutomationManagerToken, ConnectorManagerToken, EngineManagerToken, EventBusToken, KnowledgeManagerToken, MemoryManagerToken, PlannerToken, PluginManagerToken, RuntimeToken, ToolManagerToken } from '../infrastructure/container/service-tokens.js';
import type { KnowledgeDocument, KnowledgeManager } from '../knowledge/types.js';
import type { MemoryManager, MemoryRecord, MemoryType } from '../memory/types.js';
import type { PluginManager } from '../plugins/manager.js';
import type { PlatformRuntime } from '../runtime/types.js';
import type { ToolManager } from '../tools/types.js';
import type { AgentContext, AgentManager, AgentTask, WorkerContext } from '../workforce/types.js';
import { cloneExecutionContext, createExecutionContextBuilder } from './context-builder.js';
import type { ExecutionContext, ExecutionPlan, ExecutionRequest, ExecutionResult, ExecutionState } from './types.js';

const safeJson = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
};

const createAgentTaskInput = (context: ExecutionContext): NonNullable<AgentTask['input']> => ({
  request: context.request,
  metadata: context.metadata ?? {},
  memory: (context.metadata?.memory as readonly MemoryRecord[] | undefined) ?? [],
  knowledge: (context.metadata?.knowledge as readonly KnowledgeDocument[] | undefined) ?? [],
});

const publishLifecycle = async (
  events: EventBus<Record<string, unknown>> | undefined,
  type: string,
  payload: Record<string, unknown>,
): Promise<void> => {
  if (!events) {
    return;
  }

  try {
    await events.publish({ type, ...payload });
  } catch {
    // Lifecycle telemetry is best-effort.
  }
};

const getIntegrationFailureDetails = (error: unknown): string => {
  if (error instanceof Error && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }

  return 'INTEGRATION_EXECUTION_FAILED';
};

const getPlannerRequest = (request: ExecutionRequest): ExecutionRequest => {
  if (!request.integration?.authorization) {
    return request;
  }

  const integration: IntegrationExecutionRequest = {
    connector: request.integration.connector,
    request: request.integration.request,
    ...(request.integration.correlationId
      ? { correlationId: request.integration.correlationId }
      : {}),
  };

  return { ...request, integration };
};

export interface ExecutionPipeline {
  validate(context: ExecutionContext): Promise<ExecutionState>;
  buildContext(context: ExecutionContext): Promise<ExecutionContext>;
  loadMemory(context: ExecutionContext): Promise<ExecutionContext>;
  loadKnowledge(context: ExecutionContext): Promise<ExecutionContext>;
  createPlan(context: ExecutionContext): Promise<ExecutionPlan>;
  resolveAgents(context: ExecutionContext): Promise<ExecutionContext>;
  resolveTools(context: ExecutionContext): Promise<ExecutionContext>;
  plan(context: ExecutionContext): Promise<ExecutionPlan>;
  execute(context: ExecutionContext, plan: ExecutionPlan): Promise<ExecutionResult>;
  observe(context: ExecutionContext, result: ExecutionResult): Promise<ExecutionState>;
  audit(context: ExecutionContext, result: ExecutionResult): Promise<ExecutionState>;
  complete(context: ExecutionContext, result: ExecutionResult): Promise<ExecutionState>;
  buildResponse(context: ExecutionContext, result: ExecutionResult): Promise<ExecutionResult>;
  recover(context: ExecutionContext, error: unknown): Promise<ExecutionState>;
}

export const createExecutionPipeline = (): ExecutionPipeline => {
  const pipeline: ExecutionPipeline = {
  validate: async (context) => ({ status: context.request.id ? 'validated' : 'idle' }),
  buildContext: async (context) => createExecutionContextBuilder().build(context),
  loadMemory: async (context) => {
    const container = context.runtime.getContext().container;
    const memory = container.resolve(MemoryManagerToken) as MemoryManager;
    try {
      const records = await memory.recall({ type: 'working', subjectId: context.request.id });
      return {
        ...cloneExecutionContext(context),
        metadata: { ...(context.metadata ?? {}), memory: records },
      };
    } catch {
      return {
        ...cloneExecutionContext(context),
        metadata: { ...(context.metadata ?? {}), memoryUnavailable: true },
      };
    }
  },
  loadKnowledge: async (context) => {
    const container = context.runtime.getContext().container;
    const knowledge = container.resolve(KnowledgeManagerToken) as KnowledgeManager;
    try {
      const result = await knowledge.search({ text: safeJson(context.request.payload ?? {}), limit: 5 });
      return {
        ...cloneExecutionContext(context),
        metadata: { ...(context.metadata ?? {}), knowledge: result.isSuccess ? result.value : [] },
      };
    } catch {
      return {
        ...cloneExecutionContext(context),
        metadata: { ...(context.metadata ?? {}), knowledgeUnavailable: true },
      };
    }
  },
  createPlan: async (context) => {
    const container = context.runtime.getContext().container;
    const memory = container.resolve(MemoryManagerToken) as MemoryManager;
    const knowledge = container.resolve(KnowledgeManagerToken) as KnowledgeManager;

    let memRecords: readonly MemoryRecord[] = [];
    try {
      memRecords = await memory.recall({ type: 'working', subjectId: context.request.id });
    } catch {
      memRecords = [];
    }

    let knowledgeDocs: readonly KnowledgeDocument[] = [];
    try {
      const result = await knowledge.search({ text: safeJson(context.request.payload ?? {}), limit: 5 });
      knowledgeDocs = result.isSuccess ? (result.value as readonly KnowledgeDocument[]) : [];
    } catch {
      knowledgeDocs = [];
    }

    const enhancedContext: ExecutionContext = {
      ...cloneExecutionContext(context),
      request: getPlannerRequest(context.request),
      metadata: {
        ...(context.metadata ?? {}),
        memory: memRecords,
        knowledge: knowledgeDocs,
      },
    };

    try {
      const planner = container.resolve(PlannerToken);
      return await planner(enhancedContext);
    } catch {
      const steps = enhancedContext.workflow?.steps?.map((step) => step.id) ?? [];
      if (steps.length === 0) {
        const tools = enhancedContext.selectedTools ?? [];
        const agents = enhancedContext.selectedAgents ?? [];
        return { id: 'plan', steps: [...agents, ...tools] } as ExecutionPlan;
      }
      return { id: 'plan', steps } as ExecutionPlan;
    }
  },
  resolveAgents: async (context) => ({ ...context, selectedAgents: context.selectedAgents ?? [] }),
  resolveTools: async (context) => ({ ...context, selectedTools: context.selectedTools ?? [] }),
  plan: async (context) => pipeline.createPlan(context),
  execute: async (context, plan) => {
    const container = context.runtime.getContext().container;
    const integration = context.request.integration;

    if (integration) {
      const connectorManager = container.resolve(ConnectorManagerToken);
      const connector = connectorManager.get(integration.connector);

      if (!connector) {
        return { ok: false, details: 'INTEGRATION_CONNECTOR_NOT_FOUND' };
      }

      try {
        const response = await connector.request(integration.request, {
          requestId: context.requestId ?? context.request.id,
          correlationId: context.correlationId ?? integration.correlationId ?? context.request.id,
          ...(integration.authorization ? { authorization: integration.authorization } : {}),
        });

        return response.ok
          ? { ok: true, details: 'INTEGRATION_EXECUTION_SUCCEEDED' }
          : { ok: false, details: 'INTEGRATION_EXECUTION_FAILED' };
      } catch (error) {
        return { ok: false, details: getIntegrationFailureDetails(error) };
      }
    }

    const toolManager = container.resolve(ToolManagerToken) as ToolManager;
    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    const automationManager = container.resolve(AutomationManagerToken);
    const events = container.resolve(EventBusToken) as EventBus<Record<string, unknown>>;

    await publishLifecycle(events, 'execution:start', {
      status: 'started',
      requestId: context.requestId,
      planId: plan.id,
    });

    const steps = context.workflow.steps.length > 0 ? [] : (plan?.steps ?? []);
    let allOk = steps.length > 0
      || (context.selectedAgents?.length ?? 0) > 0
      || (context.selectedTools?.length ?? 0) > 0
      || context.workflow.steps.length > 0;
    if (context.metadata?.memoryUnavailable === true || context.metadata?.knowledgeUnavailable === true) {
      allOk = false;
    }
    let executionDetails: string | undefined;

    if (steps.length > 0) {
      // execute each plan step; prefer agent execution, fall back to tool execution
      for (const stepName of steps) {
        try {
          try {
            await publishLifecycle(events, 'execution:step:start', {
              step: stepName,
              requestId: context.requestId,
              planId: plan.id,
            });

            const task: AgentTask = {
              id: `${plan.id}:agent:${stepName}`,
              name: 'execute',
              input: createAgentTaskInput(context),
            };
            const agentContext: AgentContext = {
              ...context.worker,
              profile: { id: stepName, name: stepName, role: 'single' },
            };
            const agentResult = await agentManager.execute(stepName, task, agentContext);
            if (agentResult?.details) executionDetails = agentResult.details;
            if (!agentResult?.ok) {
              throw new Error(agentResult?.details ?? `agent execution failed for ${stepName}`);
            }

            await publishLifecycle(events, 'execution:step:complete', {
              step: stepName,
              kind: 'agent',
              ok: agentResult?.ok ?? false,
              requestId: context.requestId,
              planId: plan.id,
            });
            continue;
          } catch (agentErr) {
            void agentErr;
          }

          // try tool execution
          try {
            const toolResult = await toolManager.execute(stepName, context.tools);
            if (!toolResult || !toolResult.ok) allOk = false;
            if (toolResult?.details) executionDetails = toolResult.details;
            await publishLifecycle(events, 'execution:step:complete', {
              step: stepName,
              kind: 'tool',
              ok: toolResult?.ok ?? false,
              requestId: context.requestId,
              planId: plan.id,
            });
          } catch (toolErr) {
            void toolErr;
            allOk = false;
          }
        } catch (err) {
          void err;
          allOk = false;
        }
      }
    } else {
      // fallback: execute selected agents then selected tools (legacy behavior)
      for (const agentName of context.selectedAgents ?? []) {
        try {
          const task: AgentTask = {
            id: `${plan.id}:agent:${agentName}`,
            name: 'execute',
            input: createAgentTaskInput(context),
          };
          const agentContext: AgentContext = { ...(context.worker ?? {}), profile: { id: agentName, name: agentName, role: 'single' } } as unknown as AgentContext;
          const agentResult = await agentManager.execute(agentName, task, agentContext);
          if (!agentResult.ok) allOk = false;
          if (agentResult.details) executionDetails = agentResult.details;
        } catch (_error) {
          void _error;
          allOk = false;
        }
      }

      for (const toolName of context.selectedTools ?? []) {
        try {
          const toolResult = await toolManager.execute(toolName, context.tools);
          if (!toolResult.ok) allOk = false;
          if (toolResult.details) executionDetails = toolResult.details;
        } catch (_error) {
          void _error;
          allOk = false;
        }
      }
    }

    if (context.workflow.steps.length > 0) {
      try {
        const workflowResult = await automationManager.execute(
          context.workflow,
          { workflowId: context.workflow.id, executionContext: context } as never,
        );
        allOk = allOk && workflowResult.ok;
        await publishLifecycle(events, 'workflow:complete', {
          workflowId: context.workflow.id,
          ok: workflowResult.ok,
          requestId: context.requestId,
          planId: plan.id,
        });
      } catch {
        allOk = false;
        await publishLifecycle(events, 'workflow:failed', {
          workflowId: context.workflow.id,
          requestId: context.requestId,
          planId: plan.id,
        });
      }
    }

    await publishLifecycle(events, 'execution:complete', {
      status: allOk ? 'ok' : 'failed',
      requestId: context.requestId,
      planId: plan.id,
    });

    try {
      const memory = container.resolve(MemoryManagerToken) as MemoryManager;
      const record = {
        metadata: {
          id: `${context.requestId}:execution:${plan.id}`,
          version: '1',
          type: 'working' as MemoryType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [] as readonly string[],
        },
        content: safeJson({
          requestId: context.requestId,
          planId: plan.id,
          ok: allOk,
          steps: plan.steps,
        }),
      } as const;
      await memory.store(record, { type: 'working', subjectId: context.request.id, collection: 'working' });
    } catch {
      allOk = false;
      executionDetails ??= 'execution result could not be persisted to memory';
    }

    return { ok: allOk, ...(executionDetails ? { details: executionDetails } : {}) };
  },
  observe: async (_context, _result) => ({ status: 'observed' }),
  audit: async (_context, _result) => ({ status: 'completed' }),
  complete: async (_context, _result) => ({ status: 'completed' }),
  buildResponse: async (_context, result) => ({ ok: result.ok, ...(result.details ? { details: result.details } : {}) }),
  recover: async (_context, _error) => ({ status: 'recovered' }),
  };

  return pipeline;
};

export interface RequestRouter {
  route(request: ExecutionRequest): Promise<ExecutionContext>;
}

export const createRequestRouter = (): RequestRouter => ({
  route: async (request) => {
    const container = (() => {
      const c = createContainer();
      registerCoreServices(c);

      const runtimeLocal: PlatformRuntime = {
        initialize: async () => undefined,
        configure: async () => undefined,
        build: async () => undefined,
        start: async () => undefined,
        ready: async () => undefined,
        stop: async () => undefined,
        restart: async () => undefined,
        shutdown: async () => undefined,
        getStage: () => 'initialized',
        getContext: () => ({ config: { nodeEnv: 'development', port: 3000, logLevel: 'info' }, logger: { debug: () => undefined, info: () => undefined, warn: () => undefined, error: () => undefined, fatal: () => undefined }, container: c }),
      };

      c.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtimeLocal });

      return c;
    })();

    const runtime = container.resolve(RuntimeToken) as PlatformRuntime;
    const memory = container.resolve(MemoryManagerToken) as MemoryManager;
    const knowledge = container.resolve(KnowledgeManagerToken) as KnowledgeManager;
    const events = container.resolve(EventBusToken) as EventBus<Record<string, unknown>>;

    const brainSession = { id: `brain-${request.id}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const engines = container.resolve(EngineManagerToken) as EngineManager;
    const plugins = container.resolve(PluginManagerToken) as PluginManager;

    const brain: BrainContext = {
      knowledge,
      memory,
      runtime,
      engines,
      plugins,
      events,
      session: brainSession,
    };

    const workerSession = { id: `session-${request.id}`, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const worker: WorkerContext = {
      brain,
      knowledge,
      memory,
      runtime,
      engines,
      plugins,
      events,
      session: workerSession,
    };

    return createExecutionContextBuilder().build({
      request: {
        ...request,
        metadata: request.metadata ?? { source: request.source },
      },
      runtime,
      brain,
      memory,
      knowledge,
      worker,
      workflow: { id: 'workflow', name: 'workflow', steps: [] },
      tools: { requestId: request.id, correlationId: request.id },
    });
  },
});
