import type { IntegrationExecutionRequest } from '../connectors/types.js';
import { createRequestCoordinator } from '../orchestration/manager.js';
import { createExecutionPipeline } from '../orchestration/pipeline.js';
import type { ExecutionPlan, ExecutionRequest } from '../orchestration/types.js';
import { createBootstrap } from '../runtime/bootstrap.js';

export type NexusRequest = Readonly<{
  id?: string;
  correlationId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  integration?: IntegrationExecutionRequest;
}>;

export type NexusResponse = Readonly<{
  ok: boolean;
  requestId: string;
  plan?: ExecutionPlan;
  result?: unknown;
  error?: Readonly<{ message: string }>;
}>;

const isValidRequest = (request: NexusRequest): boolean =>
  typeof request?.message === 'string' && request.message.trim().length > 0;

export const executeNexusRequest = async (request: NexusRequest): Promise<NexusResponse> => {
  const requestId = typeof request?.id === 'string' && request.id.trim().length > 0
    ? request.id
    : crypto.randomUUID();

  if (!isValidRequest(request)) {
    return { ok: false, requestId, error: { message: 'message is required' } };
  }

  const correlationId = request.correlationId ?? request.integration?.correlationId;
  const executionRequest: ExecutionRequest = {
    id: requestId,
    ...(correlationId ? { correlationId } : {}),
    source: 'api',
    payload: { message: request.message },
    ...(request.integration ? { integration: request.integration } : {}),
    ...(request.metadata ? { metadata: request.metadata } : {}),
  };

  try {
    const runtime = await createBootstrap().bootstrap();
    const context = await createRequestCoordinator(runtime.getContext().container).route(executionRequest);
    const pipeline = createExecutionPipeline();
    const builtContext = await pipeline.buildContext(context);
    await pipeline.validate(builtContext);
    const memoryContext = await pipeline.loadMemory(builtContext);
    const knowledgeContext = await pipeline.loadKnowledge(memoryContext);
    const plan = await pipeline.createPlan(knowledgeContext);
    const agentsContext = await pipeline.resolveAgents(knowledgeContext);
    const toolsContext = await pipeline.resolveTools(agentsContext);
    const result = await pipeline.execute(toolsContext, plan);
    await pipeline.observe(toolsContext, result);
    await pipeline.audit(toolsContext, result);
    await pipeline.complete(toolsContext, result);

    return {
      ok: result.ok,
      requestId,
      plan,
      result,
    };
  } catch (error) {
    return {
      ok: false,
      requestId,
      error: { message: error instanceof Error ? error.message : 'NEXUS execution failed' },
    };
  }
};