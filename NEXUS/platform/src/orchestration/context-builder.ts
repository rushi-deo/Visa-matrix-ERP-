import type { ExecutionContext, ExecutionContextInput } from './types.js';

const cloneValue = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      return value;
    }
  }

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
};

const ensureValue = (value: unknown, message: string): void => {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
};

const ensureNonEmptyString = (value: unknown, message: string): void => {
  ensureValue(value, message);
  if (typeof value === 'string' && value.trim().length === 0) {
    throw new Error(message);
  }
};

const ensurePresent = <T>(value: T | undefined | null, message: string): T => {
  ensureValue(value, message);
  return value as T;
};

export interface ExecutionContextBuilder {
  build(input: ExecutionContextInput): ExecutionContext;
}

export const validateExecutionContext = (context: ExecutionContextInput | ExecutionContext): ExecutionContext => {
  const request = ensurePresent(context.request, 'ExecutionContext requires request');
  ensureNonEmptyString(request.id, 'ExecutionContext requires request.id');
  ensureNonEmptyString(request.source, 'ExecutionContext requires request.source');
  const runtime = ensurePresent(context.runtime, 'ExecutionContext requires runtime');
  const brain = ensurePresent(context.brain, 'ExecutionContext requires brain');
  const memory = ensurePresent(context.memory, 'ExecutionContext requires memory');
  const knowledge = ensurePresent(context.knowledge, 'ExecutionContext requires knowledge');
  const worker = ensurePresent(context.worker, 'ExecutionContext requires worker');
  const workflow = ensurePresent(context.workflow, 'ExecutionContext requires workflow');
  const tools = ensurePresent(context.tools, 'ExecutionContext requires tools');

  return {
    request: cloneValue(request),
    runtime,
    brain,
    memory,
    knowledge,
    worker,
    workflow,
    tools,
    requestId: context.requestId ?? request.id,
    correlationId: context.correlationId ?? request.correlationId ?? request.id,
    ...(context.sessionId !== undefined ? { sessionId: context.sessionId } : {}),
    ...(context.conversationId !== undefined ? { conversationId: context.conversationId } : {}),
    ...(context.user !== undefined ? { user: context.user } : {}),
    ...(context.organization !== undefined ? { organization: context.organization } : {}),
    ...(context.planner !== undefined ? { planner: context.planner } : {}),
    selectedAgents: context.selectedAgents ? cloneValue(context.selectedAgents) : [],
    selectedTools: context.selectedTools ? cloneValue(context.selectedTools) : [],
    ...(context.events !== undefined ? { events: context.events } : {}),
    ...(context.metrics !== undefined ? { metrics: context.metrics } : {}),
    ...(context.audit !== undefined ? { audit: context.audit } : {}),
    ...(context.response !== undefined ? { response: context.response } : {}),
    metadata: context.metadata ? cloneValue(context.metadata) : {},
  };
};

export const serializeExecutionContext = (context: ExecutionContext): Record<string, unknown> => {
  const cloned = cloneValue(context);
  return JSON.parse(JSON.stringify(cloned)) as Record<string, unknown>;
};

export const cloneExecutionContext = (context: ExecutionContext): ExecutionContext => cloneValue(context);

export const createExecutionContextBuilder = (): ExecutionContextBuilder => ({
  build: (input) => {
    const request = ensurePresent(input.request, 'ExecutionContext requires request');
    ensureNonEmptyString(request.id, 'ExecutionContext requires request.id');
    ensureNonEmptyString(request.source, 'ExecutionContext requires request.source');
    const runtime = ensurePresent(input.runtime, 'ExecutionContext requires runtime');
    const brain = ensurePresent(input.brain, 'ExecutionContext requires brain');
    const memory = ensurePresent(input.memory, 'ExecutionContext requires memory');
    const knowledge = ensurePresent(input.knowledge, 'ExecutionContext requires knowledge');
    const worker = ensurePresent(input.worker, 'ExecutionContext requires worker');
    const workflow = ensurePresent(input.workflow, 'ExecutionContext requires workflow');
    const tools = ensurePresent(input.tools, 'ExecutionContext requires tools');

    const requestId = input.requestId ?? request.id;
    const metadata = input.metadata ? cloneValue(input.metadata) : {};

    return {
      request: cloneValue(request),
      runtime,
      brain,
      memory,
      knowledge,
      worker,
      workflow,
      tools,
      requestId,
      correlationId: input.correlationId ?? request.correlationId ?? request.id,
      ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
      ...(input.conversationId !== undefined ? { conversationId: input.conversationId } : {}),
      ...(input.user !== undefined ? { user: input.user } : {}),
      ...(input.organization !== undefined ? { organization: input.organization } : {}),
      ...(input.planner !== undefined ? { planner: input.planner } : {}),
      selectedAgents: input.selectedAgents ? cloneValue(input.selectedAgents) : [],
      selectedTools: input.selectedTools ? cloneValue(input.selectedTools) : [],
      ...(input.events !== undefined ? { events: input.events } : {}),
      ...(input.metrics !== undefined ? { metrics: input.metrics } : {}),
      ...(input.audit !== undefined ? { audit: input.audit } : {}),
      ...(input.response !== undefined ? { response: input.response } : {}),
      metadata,
    };
  },
});
