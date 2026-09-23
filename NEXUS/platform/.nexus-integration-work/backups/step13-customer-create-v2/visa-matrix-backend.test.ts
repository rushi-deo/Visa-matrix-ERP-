import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  VisaMatrixBackendConnector,
} from '../src/connectors/visa-matrix-backend.js';
import { ValidationError } from '../src/shared/errors.js';

const originalFetch = globalThis.fetch;

const configuration = {
  name: 'visa-matrix-backend',
  environment: 'testing' as const,
};

const connector = (timeoutMs = 1_000) =>
  new VisaMatrixBackendConnector(configuration, {
    baseUrl: 'http://erp.example.test/',
    internalToken: 'test-internal-token',
    timeoutMs,
  });

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('Visa Matrix ERP connector', () => {
  it('forwards service, user, and correlation context for customer.get', async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      expect(url).toBe('http://erp.example.test/api/integrations/nexus/customer.get');
      expect(init?.method).toBe('POST');
      expect(init?.headers).toEqual({
        'Content-Type': 'application/json',
        'X-Nexus-Internal-Token': 'test-internal-token',
        'X-Request-ID': 'request-123',
        'X-Correlation-ID': 'correlation-456',
        Authorization: 'Bearer user-jwt',
      });
      expect(init?.body).toBe(JSON.stringify({ customerId: '123e4567-e89b-12d3-a456-426614174000' }));

      return new Response(
        JSON.stringify({
          success: true,
          data: { id: '123e4567-e89b-12d3-a456-426614174000' },
          requestId: 'request-123',
          correlationId: 'correlation-456',
        }),
        { status: 200 },
      );
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await connector().request(
      {
        action: 'customer.get',
        payload: { customerId: '123e4567-e89b-12d3-a456-426614174000' },
      },
      {
        authorization: 'Bearer user-jwt',
        requestId: 'request-123',
        correlationId: 'correlation-456',
      },
    );

    expect(result.ok).toBe(true);
    expect(result.payload?.success).toBe(true);
  });

  it('rejects unsupported actions and extra customer.get fields', async () => {
    await expect(
      connector().request({ action: 'customer.list' }, {}),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      connector().request(
        {
          action: 'customer.get',
          payload: {
            customerId: '123e4567-e89b-12d3-a456-426614174000',
            organization_id: 'attacker-org',
          },
        },
        {},
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([
    [401, 401, 'ERP_AUTHENTICATION_FAILED'],
    [403, 403, 'ERP_AUTHORIZATION_FAILED'],
    [404, 404, 'ERP_CUSTOMER_NOT_FOUND'],
    [500, 502, 'ERP_UPSTREAM_FAILURE'],
  ])('maps ERP status %s safely', async (upstreamStatus, status, code) => {
    globalThis.fetch = vi.fn(async () => new Response('{}', { status: upstreamStatus })) as typeof fetch;

    await expect(
      connector().request(
        {
          action: 'customer.get',
          payload: { customerId: '123e4567-e89b-12d3-a456-426614174000' },
        },
        {},
      ),
    ).rejects.toMatchObject({ status, code });
  });

  it('maps timeout and malformed ERP responses without exposing upstream payloads', async () => {
    globalThis.fetch = vi.fn(async (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        });
      }),
    ) as typeof fetch;

    await expect(
      connector(100).request(
        {
          action: 'customer.get',
          payload: { customerId: '123e4567-e89b-12d3-a456-426614174000' },
        },
        {},
      ),
    ).rejects.toMatchObject({ status: 504, code: 'ERP_REQUEST_TIMEOUT' });

    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    ) as typeof fetch;

    await expect(
      connector().request(
        {
          action: 'customer.get',
          payload: { customerId: '123e4567-e89b-12d3-a456-426614174000' },
        },
        {},
      ),
    ).rejects.toMatchObject({ status: 502, code: 'ERP_INVALID_RESPONSE' });
  });

  it('reports readiness only after connector initialization', async () => {
    const instance = connector();

    await expect(instance.health()).resolves.toEqual({ ok: false });
    await instance.connect({ requestId: 'bootstrap', correlationId: 'bootstrap' });
    await expect(instance.health()).resolves.toEqual({ ok: true });
  });
});