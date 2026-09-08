import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/service.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { AgentManagerToken, KnowledgeManagerToken, ProviderManagerToken, RuntimeToken } from '../src/infrastructure/container/service-tokens.js';
import { createOrchestrator,createRequestCoordinator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';
import { createOpenAIProvider } from '../src/providers/index.js';
import type { ProviderManager } from '../src/providers/types.js';
import { createPlatformRuntime } from '../src/runtime/runtime.js';
import { createLoggerFactory } from '../src/shared/logger.js';
import type { AgentContext, AgentManager, AgentTask } from '../src/workforce/types.js';

const agentNames = [
  'research-agent',
  'document-agent',
  'visa-agent',
  'crm-agent',
  'knowledge-agent',
  'document-intelligence-agent',
  'supervisor-agent',
] as const;

const createAgentContext = async () => {
  const container = createContainer();
  registerCoreServices(container);
  const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
  container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });
  const context = await createRequestCoordinator(container).route({
    id: 'req-specialized-agent',
    source: 'api',
    payload: { applicant: 'Ada', document: 'passport' },
    metadata: { traceId: 'trace-specialized' },
  });
  const agentContext: AgentContext = {
    ...context.worker,
    profile: { id: 'specialized', name: 'specialized', role: 'single' },
  };
  return { container, context, agentContext };
};

const task: AgentTask = {
  id: 'task-specialized',
  name: 'analyze supplied information',
  input: {
    request: {
      id: 'req-specialized-agent',
      source: 'api',
      payload: { applicant: 'Ada', document: 'passport' },
      metadata: { traceId: 'trace-specialized' },
    },
    metadata: {
      memory: [{ metadata: { id: 'm1', version: '1', type: 'working', createdAt: 'now', updatedAt: 'now', tags: [] }, content: 'memory finding' }],
      knowledge: [{ metadata: { id: 'k1', version: '1', tags: [], createdAt: 'now', updatedAt: 'now' }, title: 'Knowledge', content: 'knowledge finding' }],
    },
    memory: [],
    knowledge: [],
  },
};

describe('specialized workforce agents', () => {
  it('registers every required specialized agent through AgentManagerToken', async () => {
    const { container, agentContext } = await createAgentContext();
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('openai', {
      name: 'openai',
      configuration: { providerName: 'openai', environment: 'testing' },
      request: async () => ({ ok: true, output: 'specialized result' }),
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 0 }),
    });

    const manager = container.resolve(AgentManagerToken) as AgentManager;
    for (const name of agentNames) {
      await expect(manager.execute(name, task, agentContext)).resolves.toMatchObject({ ok: true });
    }
  });

  it('sends each specialized role and supplied context to the provider', async () => {
    const { container, agentContext } = await createAgentContext();
    const inputs: Record<string, unknown>[] = [];
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('openai', createOpenAIProvider(
      { providerName: 'openai', environment: 'testing' },
      { apiKey: 'test-key', model: 'gpt-test' },
      async (_url, init) => {
        const body = JSON.parse(String(init?.body)) as { input: string };
        inputs.push(JSON.parse(body.input) as Record<string, unknown>);
        return new Response(JSON.stringify({ output: 'ok' }), { status: 200 });
      },
    ));

    const manager = container.resolve(AgentManagerToken) as AgentManager;
    await manager.execute('visa-agent', task, agentContext);

    expect(inputs[0]).toEqual(expect.objectContaining({ role: 'visa-agent', task, requestPayload: task.input?.request.payload, requestMetadata: task.input?.request.metadata, memory: task.input?.memory, knowledge: task.input?.knowledge }));
    expect(String(inputs[0]?.instruction)).toContain('visa');
  });

  it('lets research-agent and knowledge-agent use the existing KnowledgeManager when input records are absent', async () => {
    const { container, agentContext } = await createAgentContext();
    let searches = 0;
    const knowledge = container.resolve(KnowledgeManagerToken);
    knowledge.search = async () => {
      searches += 1;
      return {
        isSuccess: true,
        isFailure: false,
        value: [{ metadata: { id: 'k-search', version: '1', tags: [], createdAt: 'now', updatedAt: 'now' }, title: 'Retrieved', content: 'retrieved finding' }],
      };
    };
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    const inputs: Record<string, unknown>[] = [];
    providerManager.register('openai', createOpenAIProvider(
      { providerName: 'openai', environment: 'testing' },
      { apiKey: 'test-key', model: 'gpt-test' },
      async (_url, init) => {
        const body = JSON.parse(String(init?.body)) as { input: string };
        inputs.push(JSON.parse(body.input) as Record<string, unknown>);
        return new Response(JSON.stringify({ output: 'knowledge synthesis' }), { status: 200 });
      },
    ));
    const emptyInputTask = { ...task, input: { ...task.input!, knowledge: [] } };
    const manager = container.resolve(AgentManagerToken) as AgentManager;

    await manager.execute('research-agent', emptyInputTask, agentContext);
    await manager.execute('knowledge-agent', emptyInputTask, agentContext);

    expect(searches).toBe(2);
    expect(inputs[0]?.knowledge).toEqual(expect.arrayContaining([expect.objectContaining({ content: 'retrieved finding' })]));
    expect(inputs[1]?.knowledge).toEqual(expect.arrayContaining([expect.objectContaining({ content: 'retrieved finding' })]));
  });

  it('supports document, document-intelligence, visa, and CRM role-specific analysis', async () => {
    const { container, agentContext } = await createAgentContext();
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    const instructions: string[] = [];
    providerManager.register('openai', createOpenAIProvider(
      { providerName: 'openai', environment: 'testing' },
      { apiKey: 'test-key', model: 'gpt-test' },
      async (_url, init) => {
        const body = JSON.parse(String(init?.body)) as { input: string };
        instructions.push(String((JSON.parse(body.input) as { instruction: string }).instruction));
        return new Response(JSON.stringify({ output: 'analysis' }), { status: 200 });
      },
    ));
    const manager = container.resolve(AgentManagerToken) as AgentManager;
    for (const name of ['document-agent', 'document-intelligence-agent', 'visa-agent', 'crm-agent']) {
      await manager.execute(name, task, agentContext);
    }

    expect(instructions[0]).toContain('document');
    expect(instructions[1]).toContain('document intelligence');
    expect(instructions[2]).toContain('visa');
    expect(instructions[3]).toContain('customer');
  });

  it('returns failed responses when the shared provider call fails', async () => {
    const { container, agentContext } = await createAgentContext();
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('openai', {
      name: 'openai',
      configuration: { providerName: 'openai', environment: 'testing' },
      request: async () => { throw new Error('provider failed'); },
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 0 }),
    });

    const result = await (container.resolve(AgentManagerToken) as AgentManager).execute('research-agent', task, agentContext);
    expect(result).toEqual({ ok: false, details: 'provider failed' });
  });

  it('supports planner to supervisor-agent to pipeline execution', async () => {
    const { container, context } = await createAgentContext();
    const responses = [
      JSON.stringify({ id: 'plan', steps: ['supervisor-agent'] }),
      'document result',
      'document intelligence result',
      'knowledge result',
    ];
    container.resolve(ProviderManagerToken).register('openai', createOpenAIProvider(
      { providerName: 'openai', environment: 'testing' },
      { apiKey: 'test-key', model: 'gpt-test' },
      async () => new Response(JSON.stringify({ output: [{ type: 'message', content: [{ type: 'output_text', text: responses.shift() ?? '' }] }] }), { status: 200 }),
    ));

    const result = await createOrchestrator(createExecutionPipeline()).execute(context);
    expect(result.ok).toBe(true);
  });

  it('supervisor-agent delegates sequentially, collects results, and never recurses', async () => {
    const { container, agentContext } = await createAgentContext();
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    let calls = 0;
    providerManager.register('openai', {
      name: 'openai',
      configuration: { providerName: 'openai', environment: 'testing' },
      request: async () => {
        calls += 1;
        return { ok: true, output: `result-${calls}` };
      },
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: calls, errors: 0 }),
    });
    const manager = container.resolve(AgentManagerToken) as AgentManager;
    const response = await manager.execute('supervisor-agent', {
      ...task,
      name: 'visa document review',
    }, agentContext);

    expect(response.ok).toBe(true);
    const details = JSON.parse(response.details ?? '{}') as { selectedAgents?: string[]; results?: unknown[] };
    expect(details.selectedAgents).toEqual(['visa-agent', 'document-agent', 'document-intelligence-agent']);
    expect(details.results).toHaveLength(3);
    expect(calls).toBe(3);
    expect(details.selectedAgents).not.toContain('supervisor-agent');
  });

  it('preserves specialized agent failure responses', async () => {
    const { container, agentContext } = await createAgentContext();
    const providerManager = container.resolve(ProviderManagerToken) as ProviderManager;
    providerManager.register('openai', {
      name: 'openai',
      configuration: { providerName: 'openai', environment: 'testing' },
      request: async () => { throw new Error('specialized provider failure'); },
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 1 }),
    });

    const result = await (container.resolve(AgentManagerToken) as AgentManager).execute('document-agent', task, agentContext);
    expect(result).toEqual({ ok: false, details: 'specialized provider failure' });
  });

  it('aggregates successful and failed delegated agents without discarding results', async () => {
    const { container, agentContext } = await createAgentContext();
    const manager = container.resolve(AgentManagerToken) as AgentManager;
    manager.register('visa-agent', {
      initialize: async () => undefined,
      execute: async () => ({ ok: true, details: 'visa succeeded' }),
    });
    manager.register('document-agent', {
      initialize: async () => undefined,
      execute: async () => { throw new Error('document unavailable'); },
    });
    manager.register('document-intelligence-agent', {
      initialize: async () => undefined,
      execute: async () => ({ ok: true, details: 'document intelligence succeeded' }),
    });

    const response = await manager.execute('supervisor-agent', {
      ...task,
      name: 'visa document review',
    }, agentContext);
    const details = JSON.parse(response.details ?? '{}') as {
      results?: Array<{ agent: string; response: { ok: boolean; details?: string } }>;
    };

    expect(response.ok).toBe(false);
    expect(details.results).toEqual([
      { agent: 'visa-agent', response: { ok: true, details: 'visa succeeded' } },
      { agent: 'document-agent', response: { ok: false, details: 'document unavailable' } },
      { agent: 'document-intelligence-agent', response: { ok: true, details: 'document intelligence succeeded' } },
    ]);
  });
});
