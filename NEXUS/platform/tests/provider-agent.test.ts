import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/service.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { AgentManagerToken, KnowledgeManagerToken, MemoryManagerToken, ProviderManagerToken, RuntimeToken } from '../src/infrastructure/container/service-tokens.js';
import type { KnowledgeManager } from '../src/knowledge/types.js';
import type { MemoryManager, MemoryProvider } from '../src/memory/types.js';
import { createRequestCoordinator } from '../src/orchestration/manager.js';
import { createOrchestrator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';
import { createOpenAIProvider } from '../src/providers/index.js';
import type { ProviderManager } from '../src/providers/types.js';
import { createPlatformRuntime } from '../src/runtime/runtime.js';
import { createLoggerFactory } from '../src/shared/logger.js';
import type { AgentContext, AgentManager, AgentTask } from '../src/workforce/types.js';

const createContext = async (requestId: string) => {
  const container = createContainer();
  registerCoreServices(container);
  const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
  container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });
  const context = await createRequestCoordinator(container).route({ id: requestId, source: 'api' });
  const agentContext: AgentContext = {
    ...context.worker,
    profile: { id: 'provider-agent', name: 'provider-agent', role: 'single' },
  };
  return { container, context, agentContext };
};

const task: AgentTask = { id: 'task-provider-agent', name: 'summarize request' };

const registerProvider = (container: ReturnType<typeof createContainer>, response: () => Promise<{ ok: boolean; output?: string }>) => {
  const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
  providerManager.register('openai', {
    name: 'openai',
    configuration: { providerName: 'openai', environment: 'testing' },
    request: response,
    health: async () => ({ ok: true }),
    metrics: async () => ({ requests: 0, errors: 0 }),
  });
};

describe('provider-backed workforce agent', () => {
  it('is registered through AgentManagerToken and returns successful provider output', async () => {
    const { container, agentContext } = await createContext('req-provider-agent-success');
    registerProvider(container, async () => ({ ok: true, output: 'completed by provider' }));

    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    const result = await agentManager.execute('provider-agent', task, agentContext);

    expect(result).toEqual({ ok: true, details: 'completed by provider' });
  });

  it('returns a failed AgentResponse when the provider throws', async () => {
    const { container, agentContext } = await createContext('req-provider-agent-error');
    registerProvider(container, async () => {
      throw new Error('provider unavailable');
    });

    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    const result = await agentManager.execute('provider-agent', task, agentContext);

    expect(result).toEqual({ ok: false, details: 'provider unavailable' });
  });

  it('returns a failed AgentResponse for empty provider output', async () => {
    const { container, agentContext } = await createContext('req-provider-agent-invalid');
    registerProvider(container, async () => ({ ok: true, output: '' }));

    const agentManager = container.resolve(AgentManagerToken) as AgentManager;
    const result = await agentManager.execute('provider-agent', task, agentContext);

    expect(result.ok).toBe(false);
    expect(result.details).toContain('no usable output');
  });

  it('executes a planner-selected provider-agent through the orchestration pipeline', async () => {
    const { container, context } = await createContext('req-provider-agent-orchestration');
    const responses = [
      JSON.stringify({ id: 'plan', steps: ['provider-agent'] }),
      'agent completed the request',
    ];
    container.resolve(ProviderManagerToken).register('openai', createOpenAIProvider(
      { providerName: 'openai', environment: 'testing' },
      { apiKey: 'test-key', model: 'gpt-test' },
      async () => new Response(JSON.stringify({
        output: [{ type: 'message', content: [{ type: 'output_text', text: responses.shift() ?? '' }] }],
      }), { status: 200 }),
    ));

    const pipeline = createExecutionPipeline();
    const plan = await pipeline.createPlan(context);
    const result = await pipeline.execute(context, plan);

    expect(plan).toEqual({ id: 'plan', steps: ['provider-agent'] });
    expect(result.ok).toBe(true);
  });

  it('routes Workforce provider execution to Anthropic without agent-specific code', async () => {
    const { container, agentContext } = await createContext('req-provider-agent-anthropic');
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('anthropic', {
      name: 'anthropic',
      configuration: { providerName: 'anthropic', environment: 'testing' },
      request: async (request) => ({ ok: true, output: `anthropic:${request.input}` }),
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 1, errors: 0 }),
    });

    const result = await (container.resolve(AgentManagerToken) as AgentManager).execute('provider-agent', {
      ...task,
      input: { request: { id: 'req-provider-agent-anthropic', source: 'api', payload: { message: 'use Claude' } }, metadata: { providerName: 'anthropic' }, memory: [], knowledge: [] },
    }, agentContext);

    expect(result).toEqual({ ok: true, details: expect.stringContaining('anthropic:') });
  });

  it('propagates request, metadata, memory, and knowledge to the second provider call', async () => {
    const { container } = await createContext('req-provider-agent-input');
    const memoryRecord = {
      metadata: { id: 'memory-1', version: '1', type: 'working' as const, createdAt: 'now', updatedAt: 'now', tags: [] },
      content: 'remembered context',
    };
    const knowledgeDocument = {
      metadata: { id: 'knowledge-1', version: '1', source: 'test', tags: [], createdAt: 'now', updatedAt: 'now' },
      title: 'Relevant document',
      content: 'knowledge context',
    };
    let memoryRecalls = 0;
    let knowledgeSearches = 0;
    const memory = container.resolve(MemoryManagerToken) as MemoryManager;
    const knowledge = container.resolve(KnowledgeManagerToken) as KnowledgeManager;
    const memoryProvider: MemoryProvider = {
      name: 'working',
      store: async () => undefined,
      recall: async () => {
        memoryRecalls += 1;
        return [memoryRecord];
      },
    };
    memory.register('working', memoryProvider);
    knowledge.search = async () => {
      knowledgeSearches += 1;
      return { isSuccess: true, isFailure: false, value: [knowledgeDocument] };
    };

    const providerInputs: Array<Record<string, unknown>> = [];
    const responses = [
      JSON.stringify({ id: 'plan', steps: ['provider-agent'] }),
      'meaningful agent output',
    ];
    container.resolve(ProviderManagerToken).register('openai', createOpenAIProvider(
      { providerName: 'openai', environment: 'testing' },
      { apiKey: 'test-key', model: 'gpt-test' },
      async (_url, init) => {
        providerInputs.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
        return new Response(JSON.stringify({
          output: [{ type: 'message', content: [{ type: 'output_text', text: responses.shift() ?? '' }] }],
        }), { status: 200 });
      },
    ));

    const request = {
      id: 'req-provider-agent-input',
      source: 'api' as const,
      payload: { question: 'What matters?' },
      metadata: { traceId: 'trace-1' },
    };
    const context = await createRequestCoordinator(container).route(request);
    const result = await createOrchestrator(createExecutionPipeline()).execute(context);
    const agentPayload = providerInputs[1]?.input as string;
    const agentInput = JSON.parse(agentPayload) as Record<string, unknown>;
    const taskInput = agentInput.taskInput as Record<string, unknown>;

    expect(providerInputs).toHaveLength(2);
    expect(taskInput.request).toEqual(expect.objectContaining({ id: request.id, payload: request.payload, metadata: request.metadata }));
    expect(taskInput.metadata).toEqual(expect.objectContaining({ memory: [memoryRecord], knowledge: [knowledgeDocument] }));
    expect(taskInput.memory).toEqual([memoryRecord]);
    expect(taskInput.knowledge).toEqual([knowledgeDocument]);
    expect(memoryRecalls).toBe(2);
    expect(knowledgeSearches).toBe(2);
    expect(result.ok).toBe(true);
  });
});
