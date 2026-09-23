import type { BrainContext, BrainSession } from '../brain/types.js';
import type { EngineManager } from '../engines/core/types.js';
import type { EventBus } from '../events/event-bus.js';
import { createContainer } from '../infrastructure/container/container.js';
import { registerCoreServices } from '../infrastructure/container/registrations.js';
import { EngineManagerToken, EventBusToken, KnowledgeManagerToken, MemoryManagerToken, PluginManagerToken, RuntimeToken } from '../infrastructure/container/service-tokens.js';
import type { KnowledgeManager } from '../knowledge/types.js';
import type { MemoryManager } from '../memory/types.js';
import { createMetrics } from '../observability/metrics.js';
import type { PluginManager } from '../plugins/manager.js';
import type { PlatformRuntime } from '../runtime/types.js';
import { createSecurityManager } from '../security/manager.js';
import type { Container } from '../shared/di.js';
import type { WorkerContext, WorkerSession } from '../workforce/types.js';
import { createExecutionContextBuilder } from './context-builder.js';
import { createHealthDashboard, type HealthDashboard } from './health.js';
import { createExecutionPipeline } from './pipeline.js';
import type { AgentCoordinator, ExecutionContext, ExecutionCoordinator, ExecutionRequest, ExecutionResult, ExecutionState, Orchestrator, PipelineCoordinator, RequestCoordinator, ToolCoordinator, WorkflowCoordinator } from './types.js';

const contextBuilder = createExecutionContextBuilder();

const classifyFailure = (error: unknown): 'timeout' | 'cancellation' | 'retryable' | 'fatal' => {
  if (error instanceof Error && /timeout/i.test(error.message)) {
    return 'timeout';
  }
  if (error instanceof Error && /cancel/i.test(error.message)) {
    return 'cancellation';
  }
  if (error instanceof Error && /network|temporar/i.test(error.message)) {
    return 'retryable';
  }
  return 'fatal';
};

const getTimeoutMs = (context: ExecutionContext): number => {
  const value = context.metadata?.timeoutMs;
  return typeof value === 'number' ? value : 0;
};

const getAuthorization = (context: ExecutionContext): { roles: readonly string[]; permissions: readonly string[] } | undefined => {
  const authorization = context.metadata?.authorization;
  if (!authorization || typeof authorization !== 'object') {
    return undefined;
  }

  const source = authorization as { roles?: unknown; permissions?: unknown };
  const roles = Array.isArray(source.roles) ? source.roles.filter((role): role is string => typeof role === 'string') : [];
  const permissions = Array.isArray(source.permissions) ? source.permissions.filter((permission): permission is string => typeof permission === 'string') : [];

  return { roles, permissions };
};

const isCancelled = (context: ExecutionContext): boolean => {
  const signal = context.metadata?.signal;
  return Boolean(signal && typeof signal === 'object' && 'aborted' in signal && signal.aborted);
};

export const createRequestCoordinator = (container?: Container): RequestCoordinator => ({
  route: async (request: ExecutionRequest): Promise<ExecutionContext> => {
    const c: Container = container ?? (() => {
      const cLocal = createContainer();
      registerCoreServices(cLocal);
      // create a minimal runtime so context builder validation passes
      const runtime = {
        initialize: async () => undefined,
        configure: async () => undefined,
        build: async () => undefined,
        start: async () => undefined,
        ready: async () => undefined,
        stop: async () => undefined,
        restart: async () => undefined,
        shutdown: async () => undefined,
        getStage: () => 'initialized',
        getContext: () => ({ config: { nodeEnv: 'development', port: 3000, logLevel: 'info' }, logger: { debug: () => undefined, info: () => undefined, warn: () => undefined, error: () => undefined, fatal: () => undefined }, container: cLocal } ),
      } as const;

      // register runtime so other resolved factories may use it
      // runtime token is registered at bootstrap in production
      try {
        cLocal.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime as never });
      } catch {
        // ignore registration errors in tests where token may not be available
      }

      return cLocal;
    })();

    const runtime = c.resolve(RuntimeToken) as PlatformRuntime;
    const memory = c.resolve(MemoryManagerToken) as MemoryManager;
    const knowledge = c.resolve(KnowledgeManagerToken) as KnowledgeManager;
    const engines = c.resolve(EngineManagerToken) as EngineManager;
    const plugins = c.resolve(PluginManagerToken) as PluginManager;
    const events = c.resolve(EventBusToken) as EventBus<unknown>;

    const brainSession: BrainSession = { id: `brain-${request.id}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const brain: BrainContext = {
      knowledge,
      memory,
      runtime,
      engines,
      plugins,
      events,
      session: brainSession,
    };

    const workerSession: WorkerSession = { id: `session-${request.id}`, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
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

    return contextBuilder.build({
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
      tools: { requestId: request.id, correlationId: request.correlationId ?? request.id },
    });
  },
});

export const createPipelineCoordinator = (): PipelineCoordinator => createExecutionPipeline();

export const createExecutionCoordinator = (): ExecutionCoordinator => ({
  coordinate: async (_context): Promise<ExecutionState> => ({ status: 'idle' }),
});

export const createOrchestrator = (
  pipeline: PipelineCoordinator = createPipelineCoordinator(),
  options: { timeoutMs?: number; maxRetries?: number } = {},
): Orchestrator & { getHealth: () => HealthDashboard; shutdown: () => Promise<void> } => {
  const health = createHealthDashboard();
  const security = createSecurityManager();
  const metrics = createMetrics();

  return {
    execute: async (context: ExecutionContext): Promise<ExecutionResult> => {
      const normalizedContext = contextBuilder.build(context);
      const timeoutMs = getTimeoutMs(normalizedContext) || options.timeoutMs || 0;
      const maxRetries = options.maxRetries ?? 1;
      const startedAt = Date.now();
      const timer = metrics.timer('orchestrator.execute');
      timer.start();

      const authorization = getAuthorization(normalizedContext);
      if (authorization) {
        const securityContext = normalizedContext.user?.id
          ? {
              subjectId: normalizedContext.user.id,
              roles: authorization.roles,
              permissions: authorization.permissions,
            }
          : {
              roles: authorization.roles,
              permissions: authorization.permissions,
            };

        const allowed = security.evaluate(
          securityContext,
          {
            name: 'execution-authorization',
            roles: authorization.roles.map((role) => ({
              name: role,
              permissions: authorization.permissions.map((permission) => ({ name: permission })),
            })),
          },
        );

        if (!allowed) {
          timer.stop();
          await (typeof pipeline.recover === 'function' ? pipeline.recover(normalizedContext, new Error('execution unauthorized')) : Promise.resolve({ status: 'recovered' }));
          return { ok: false, details: 'unauthorized' };
        }
      }

      const publishEvent = async (type: string, status: string) => {
        await normalizedContext.events?.publish({ type, status, requestId: normalizedContext.requestId });
      };

      await publishEvent('orchestrator:start', 'started');

      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        if (isCancelled(normalizedContext)) {
          throw new Error('execution cancelled');
        }
        if (timeoutMs > 0 && Date.now() - startedAt > timeoutMs) {
          throw new Error('execution timeout');
        }

        try {
          const validatedContext = typeof pipeline.buildContext === 'function'
            ? await pipeline.buildContext(normalizedContext)
            : normalizedContext;
          await pipeline.validate(validatedContext);
          const memoryLoaded = typeof pipeline.loadMemory === 'function'
            ? await pipeline.loadMemory(validatedContext)
            : validatedContext;
          const knowledgeLoaded = typeof pipeline.loadKnowledge === 'function'
            ? await pipeline.loadKnowledge(memoryLoaded)
            : memoryLoaded;
          const plan = typeof pipeline.createPlan === 'function'
            ? await pipeline.createPlan(knowledgeLoaded)
            : await pipeline.plan(knowledgeLoaded);
          const agentsResolved = typeof pipeline.resolveAgents === 'function'
            ? await pipeline.resolveAgents(knowledgeLoaded)
            : knowledgeLoaded;
          const toolsResolved = typeof pipeline.resolveTools === 'function'
            ? await pipeline.resolveTools(agentsResolved)
            : agentsResolved;
          const result = await pipeline.execute(toolsResolved, plan);
          await pipeline.observe(toolsResolved, result);
          if (typeof pipeline.audit === 'function') {
            await pipeline.audit(toolsResolved, result);
          }
          const response = typeof pipeline.buildResponse === 'function'
            ? await pipeline.buildResponse(toolsResolved, result)
            : result;
          await pipeline.complete(toolsResolved, response);
          timer.stop();
          await publishEvent('orchestrator:complete', 'completed');
          return response;
        } catch (error) {
          const failureType = classifyFailure(error);
          if (attempt >= maxRetries || failureType === 'cancellation' || failureType === 'timeout') {
            await (typeof pipeline.recover === 'function' ? pipeline.recover(normalizedContext, error) : Promise.resolve({ status: 'recovered' }));
            await publishEvent('orchestrator:fail', 'failed');
            timer.stop();
            return { ok: false, details: 'recovered' };
          }

          await (typeof pipeline.recover === 'function' ? pipeline.recover(normalizedContext, error) : Promise.resolve({ status: 'recovered' }));
        }
      }

      await publishEvent('orchestrator:fail', 'failed');
      timer.stop();
      return { ok: false, details: 'recovered' };
    },
    getHealth: () => health,
    shutdown: async () => {
      await Promise.resolve();
    },
  };
};

export const createWorkflowCoordinator = (): WorkflowCoordinator => ({
  execute: async (_workflow, _context) => ({ ok: true }),
});

export const createAgentCoordinator = (): AgentCoordinator => ({
  execute: async (_context) => ({ ok: true }),
});

export const createToolCoordinator = (): ToolCoordinator => ({
  execute: async (_context) => ({ ok: true }),
});
