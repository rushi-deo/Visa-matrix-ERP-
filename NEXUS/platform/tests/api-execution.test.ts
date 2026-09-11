import { afterEach, describe, expect, it, vi } from 'vitest';

import { executeNexusRequest } from '../src/api/execution.js';

const originalEnv = process.env;
const originalFetch = globalThis.fetch;

const configureProvider = (outputs: string[]) => {
  process.env = { ...originalEnv, NODE_ENV: 'testing', OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-test' };
  const inputs: Record<string, unknown>[] = [];
  globalThis.fetch = (async (_url, init) => {
    const body = JSON.parse(String(init?.body)) as { input: string };
    inputs.push(JSON.parse(body.input) as Record<string, unknown>);
    return new Response(JSON.stringify({
      output: [{ type: 'message', content: [{ type: 'output_text', text: outputs.shift() ?? '' }] }],
    }), { status: 200 });
  }) as typeof fetch;
  return inputs;
};

afterEach(() => {
  process.env = originalEnv;
  globalThis.fetch = originalFetch;
});

describe('NEXUS public execution API', () => {
  it('executes a specialized agent and exposes its useful result', async () => {
    const inputs = configureProvider([
      JSON.stringify({ id: 'plan', steps: ['research-agent'] }),
      'research findings for the request',
    ]);

    const response = await executeNexusRequest({
      message: 'Research the supplied case',
      metadata: { traceId: 'trace-api-1' },
    });

    expect(response.ok).toBe(true);
    expect(response.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.plan).toEqual({ id: 'plan', steps: ['research-agent'] });
    expect(response.result).toEqual({ ok: true, details: 'research findings for the request' });
    expect(inputs[0]?.request).toEqual(expect.objectContaining({ payload: { message: 'Research the supplied case' }, metadata: { traceId: 'trace-api-1' } }));
  });

  it('preserves a supplied request ID and runs supervisor delegation', async () => {
    const inputs = configureProvider([
      JSON.stringify({ id: 'plan', steps: ['supervisor-agent'] }),
      'document result',
      'visa result',
    ]);

    const response = await executeNexusRequest({
      id: 'request-supplied-1',
      message: 'Review visa documents',
      metadata: { source: 'test' },
    });

    expect(response.requestId).toBe('request-supplied-1');
    expect(response.ok).toBe(true);
    expect(response.plan?.steps).toEqual(['supervisor-agent']);
    expect(String((response.result as { details?: string }).details)).toContain('document-agent');
    expect(inputs).toHaveLength(3);
  });

  it('rejects an empty message without bootstrapping execution', async () => {
    const response = await executeNexusRequest({ message: '   ' });

    expect(response.ok).toBe(false);
    expect(response.error?.message).toBe('message is required');
    expect(response.plan).toBeUndefined();
  });

  it('uses the deterministic planner fallback without a provider', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'testing' };

    const response = await executeNexusRequest({ id: 'fallback-request', message: 'Continue without AI' });

    expect(response.ok).toBe(false);
    expect(response.requestId).toBe('fallback-request');
    expect(response.plan).toEqual({ id: 'plan', steps: [] });
    expect(response.result).toEqual({ ok: false });
  });

  it('returns an unsuccessful external response when an agent provider fails', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'testing', OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-test' };
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      if (calls > 1) throw new Error('provider unavailable');
      return new Response(JSON.stringify({
        output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ id: 'plan', steps: ['research-agent'] }) }] }],
      }), { status: 200 });
    }) as typeof fetch;

    const response = await executeNexusRequest({ id: 'failed-agent-request', message: 'Research this case' });

    expect(response.ok).toBe(false);
    expect(response.plan).toEqual({ id: 'plan', steps: ['research-agent'] });
    expect(response.result).toEqual(expect.objectContaining({ ok: false }));
  });

  it('executes a typed ERP integration through the public API', async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'testing',
      VISA_MATRIX_ERP_BASE_URL: 'http://erp.example.test',
      NEXUS_INTERNAL_TOKEN: 'test-internal-token',
    };
    const fetchMock = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      expect(init?.headers).toEqual({
        'Content-Type': 'application/json',
        'X-Nexus-Internal-Token': 'test-internal-token',
        'X-Request-ID': 'request-integration-1',
        'X-Correlation-ID': 'correlation-integration-1',
        Authorization: 'Bearer user-jwt',
      });
      return new Response(JSON.stringify({
        success: true,
        data: { id: '123e4567-e89b-12d3-a456-426614174000' },
        requestId: 'request-integration-1',
        correlationId: 'correlation-integration-1',
      }), { status: 200 });
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const response = await executeNexusRequest({
      id: 'request-integration-1',
      message: 'Retrieve the customer record',
      integration: {
        connector: 'visa-matrix-backend',
        request: {
          action: 'customer.get',
          payload: { customerId: '123e4567-e89b-12d3-a456-426614174000' },
        },
        authorization: 'Bearer user-jwt',
        correlationId: 'correlation-integration-1',
      },
    });

    expect(response).toEqual(expect.objectContaining({
      ok: true,
      requestId: 'request-integration-1',
      result: { ok: true, details: 'INTEGRATION_EXECUTION_SUCCEEDED' },
    }));
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('does not expose integration authorization to the planner provider', async () => {
    const inputs = configureProvider([JSON.stringify({ id: 'plan', steps: [] })]);
    process.env = {
      ...originalEnv,
      NODE_ENV: 'testing',
      OPENAI_API_KEY: 'test-key',
      OPENAI_MODEL: 'gpt-test',
    };

    await executeNexusRequest({
      message: 'Plan this integration request',
      integration: {
        connector: 'visa-matrix-backend',
        request: { action: 'customer.get', payload: { customerId: '123e4567-e89b-12d3-a456-426614174000' } },
        authorization: 'Bearer secret-user-jwt',
      },
    });

    expect(JSON.stringify(inputs[0])).not.toContain('secret-user-jwt');
  });
});
