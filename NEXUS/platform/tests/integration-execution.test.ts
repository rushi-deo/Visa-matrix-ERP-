import { describe, expect, it, vi } from 'vitest';

import type { Connector, IntegrationExecutionRequest } from '../src/connectors/types.js';
import { createContainer } from '../src/infrastructure/container/container.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { ConnectorManagerToken, RuntimeToken } from '../src/infrastructure/container/service-tokens.js';
import { createRequestCoordinator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';
import { createPlatformRuntime } from '../src/runtime/runtime.js';
import { IntegrationError, ValidationError } from '../src/shared/errors.js';

const createContext = async (integration?: IntegrationExecutionRequest) => {
  const container = createContainer();
  registerCoreServices(container);
  const runtime = createPlatformRuntime({
    config: { nodeEnv: 'testing', port: 3000, logLevel: 'info' },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
    container,
  });
  container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });
  const context = await createRequestCoordinator(container).route({
    id: 'request-123',
    source: 'api',
    ...(integration?.correlationId ? { correlationId: integration.correlationId } : {}),
    ...(integration ? { integration } : {}),
  });
  return { container, context: await createExecutionPipeline().buildContext(context) };
};

const connector = (request: Connector['request']): Connector => ({
  name: 'visa-matrix-backend',
  configuration: { name: 'visa-matrix-backend', environment: 'testing' },
  connect: async () => undefined,
  request,
  health: async () => ({ ok: true }),
});

const integration = {
  connector: 'visa-matrix-backend',
  request: {
    action: 'customer.get',
    payload: { customerId: '123e4567-e89b-12d3-a456-426614174000' },
  },
  authorization: 'Bearer user-jwt',
  correlationId: 'correlation-456',
} as const;

describe('pipeline integration execution', () => {
  it('resolves ConnectorManagerToken and executes a connector successfully', async () => {
    const request = vi.fn(async () => ({ ok: true, payload: { success: true } }));
    const { container, context } = await createContext(integration);
    container.resolve(ConnectorManagerToken).register('visa-matrix-backend', connector(request));

    const result = await createExecutionPipeline().execute(context, { id: 'plan', steps: [] });

    expect(result).toEqual({ ok: true, details: 'INTEGRATION_EXECUTION_SUCCEEDED' });
    expect(request).toHaveBeenCalledWith(integration.request, {
      requestId: 'request-123',
      correlationId: 'correlation-456',
      authorization: 'Bearer user-jwt',
    });
  });

  it('returns a safe failure when the connector is missing', async () => {
    const { context } = await createContext(integration);

    await expect(createExecutionPipeline().execute(context, { id: 'plan', steps: [] }))
      .resolves.toEqual({ ok: false, details: 'INTEGRATION_CONNECTOR_NOT_FOUND' });
  });

  it('maps connector validation and upstream failures without raw error bodies', async () => {
    const validationRequest = vi.fn(async () => {
      throw new ValidationError('invalid customer request', { code: 'ERP_INVALID_CUSTOMER_GET_REQUEST' });
    });
    const upstreamRequest = vi.fn(async () => {
      throw new IntegrationError('ERP request failed', { code: 'ERP_UPSTREAM_FAILURE', cause: new Error('secret response') });
    });
    const validation = await createContext(integration);
    validation.container.resolve(ConnectorManagerToken).register('visa-matrix-backend', connector(validationRequest));
    const upstream = await createContext(integration);
    upstream.container.resolve(ConnectorManagerToken).register('visa-matrix-backend', connector(upstreamRequest));

    await expect(createExecutionPipeline().execute(validation.context, { id: 'plan', steps: [] }))
      .resolves.toEqual({ ok: false, details: 'ERP_INVALID_CUSTOMER_GET_REQUEST' });
    await expect(createExecutionPipeline().execute(upstream.context, { id: 'plan', steps: [] }))
      .resolves.toEqual({ ok: false, details: 'ERP_UPSTREAM_FAILURE' });
  });

  it('leaves non-integration requests on the existing execution path', async () => {
    const { container, context } = await createContext();
    const request = vi.fn();
    container.resolve(ConnectorManagerToken).register('visa-matrix-backend', connector(request));

    const result = await createExecutionPipeline().execute(context, { id: 'plan', steps: [] });

    expect(result).toEqual({ ok: false });
    expect(request).not.toHaveBeenCalled();
  });
});
