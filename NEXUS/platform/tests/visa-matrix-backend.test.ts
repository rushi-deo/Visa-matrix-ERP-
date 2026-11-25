import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  VISA_MATRIX_ACTIONS,
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

const id = '123e4567-e89b-12d3-a456-426614174000';
const validPayloads: Record<string, Record<string, unknown>> = {
  'customer.get': { customerId: id },
  'customer.list': { page: 1, limit: 25 },
  'customer.create': { full_name: 'Test Customer' },
  'application.get': { applicationId: id },
  'application.list': { page: 1, limit: 25 },
  'document.get': { documentId: id },
  'document.list': { applicationId: id },
  'lead.get': { leadId: id },
  'lead.list': { page: 1 },
  'form.list': { countryId: id },
  'form.get': { formId: id },
  'form.getByCountryVisa': { countryId: id, visaTypeId: id },
  'country.list': {},
  'visa-type.list': { countryId: id },
  'visa-requirements.get': { countryId: id, visaTypeId: id },
  'visa-rules.get': { visaRuleId: id },
  'task.get': { taskId: id },
  'task.list': { applicationId: id },
  'workflow.get': { workflowId: id },
  'workflow.list': { triggerKey: 'application_created', isActive: true },
  'invoice.get': { invoiceId: id },
  'invoice.list': { page: 1, limit: 25 },
  'payment.get': { paymentId: id },
  'payment.list': { applicationId: id, currency: 'INR' },
};

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

  it('forwards customer.create requests to the ERP integration boundary', async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      expect(url).toBe('http://erp.example.test/api/integrations/nexus/customer.create');
      expect(init?.method).toBe('POST');
      expect(init?.headers).toEqual({
        'Content-Type': 'application/json',
        'X-Nexus-Internal-Token': 'test-internal-token',
        'X-Request-ID': 'request-create-123',
        'X-Correlation-ID': 'correlation-create-456',
        Authorization: 'Bearer user-jwt',
      });
      expect(init?.body).toBe(
        JSON.stringify({
          full_name: 'NEXUS Test Customer',
          email: 'nexus-test@example.com',
          phone: '+919999999999',
          passport_number: 'P1234567',
          nationality: 'Indian',
        }),
      );

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            full_name: 'NEXUS Test Customer',
          },
          requestId: 'request-create-123',
          correlationId: 'correlation-create-456',
        }),
        { status: 201 },
      );
    });

    globalThis.fetch = fetchMock as typeof fetch;

    const result = await connector().request(
      {
        action: 'customer.create',
        payload: {
          full_name: 'NEXUS Test Customer',
          email: 'nexus-test@example.com',
          phone: '+919999999999',
          passport_number: 'P1234567',
          nationality: 'Indian',
        },
      },
      {
        authorization: 'Bearer user-jwt',
        requestId: 'request-create-123',
        correlationId: 'correlation-create-456',
      },
    );

    expect(result.ok).toBe(true);
    expect(result.payload?.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid customer.create payload', async () => {
    await expect(
      connector().request(
        {
          action: 'customer.create',
          payload: {
            email: 'missing-name@example.com',
          },
        },
        {},
      ),
    ).rejects.toMatchObject({
      code: 'ERP_INVALID_CUSTOMER_CREATE_REQUEST',
    });
  });
  it('rejects unsupported actions and extra customer.get fields', async () => {
    await expect(
      connector().request({ action: 'customer.list', payload: { unexpected: true } }, {}),
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
    [404, 404, 'ERP_RESOURCE_NOT_FOUND'],
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

  it.each(Object.entries(VISA_MATRIX_ACTIONS))(
    'maps %s to its explicit ERP endpoint and accepts an array response',
    async (action, definition) => {
      const fetchMock = vi.fn(async () => new Response(JSON.stringify({
        success: true,
        data: [],
        requestId: 'request-action',
        correlationId: 'correlation-action',
      }), { status: 200 }));
      globalThis.fetch = fetchMock as typeof fetch;

      const result = await connector().request(
        { action, payload: validPayloads[action] },
        { requestId: 'request-action', correlationId: 'correlation-action' },
      );

      expect(fetchMock).toHaveBeenCalledWith(
        `http://erp.example.test${definition.path}`,
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.payload?.data).toEqual([]);
    },
  );

  it.each(Object.keys(VISA_MATRIX_ACTIONS))(
    'rejects unknown fields for %s before making a request',
    async (action) => {
      const fetchMock = vi.fn();
      globalThis.fetch = fetchMock as typeof fetch;

      await expect(connector().request(
        { action, payload: { unexpected: true } },
        {},
      )).rejects.toBeInstanceOf(ValidationError);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('does not route unknown actions to visa-rules.get', async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;
    await expect(connector().request({ action: 'visa-rule.lookup', payload: {} }, {}))
      .rejects.toMatchObject({ code: 'ERP_UNSUPPORTED_ACTION' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    { success: true, data: null, requestId: 'r', correlationId: 'c' },
    { success: true, data: {}, requestId: '', correlationId: 'c' },
    { success: true, data: {}, requestId: 'r', correlationId: 4 },
  ])('rejects malformed response envelopes', async (body) => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(body), { status: 200 }),
    ) as typeof fetch;

    await expect(connector().request(
      { action: 'country.list', payload: {} },
      {},
    )).rejects.toMatchObject({ code: 'ERP_INVALID_RESPONSE', status: 502 });
  });
});
