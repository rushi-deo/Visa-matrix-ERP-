import { randomUUID } from 'node:crypto';

import { ConfigurationError, IntegrationError, ValidationError } from '../shared/errors.js';
import type {
  Connector,
  ConnectorConfiguration,
  ConnectorContext,
  ConnectorHealth,
  ConnectorRequest,
  ConnectorResponse,
} from './types.js';

const CUSTOMER_GET_ACTION = 'customer.get';
const CUSTOMER_GET_PATH = '/api/integrations/nexus/customer.get';
const DEFAULT_TIMEOUT_MS = 5_000;

export type VisaMatrixBackendConnectorOptions = Readonly<{
  baseUrl: string;
  internalToken: string;
  timeoutMs?: number;
}>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const parseTimeout = (value: number | undefined): number => {
  const timeoutMs = value ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 30_000) {
    throw new ConfigurationError('Invalid ERP connector timeout', {
      code: 'ERP_CONNECTOR_INVALID_TIMEOUT',
    });
  }

  return timeoutMs;
};

const validateConfiguration = (options: VisaMatrixBackendConnectorOptions): number => {
  if (!options.baseUrl.trim()) {
    throw new ConfigurationError('ERP connector base URL is required', {
      code: 'ERP_CONNECTOR_MISSING_BASE_URL',
    });
  }

  if (!options.internalToken.trim()) {
    throw new ConfigurationError('ERP connector internal token is required', {
      code: 'ERP_CONNECTOR_MISSING_TOKEN',
    });
  }

  return parseTimeout(options.timeoutMs);
};

const createUpstreamError = (status: number): IntegrationError => {
  if (status === 401) {
    return new IntegrationError('ERP authentication failed', {
      code: 'ERP_AUTHENTICATION_FAILED',
      status: 401,
      metadata: { upstreamStatus: status },
    });
  }

  if (status === 403) {
    return new IntegrationError('ERP authorization failed', {
      code: 'ERP_AUTHORIZATION_FAILED',
      status: 403,
      metadata: { upstreamStatus: status },
    });
  }

  if (status === 404) {
    return new IntegrationError('ERP customer not found', {
      code: 'ERP_CUSTOMER_NOT_FOUND',
      status: 404,
      metadata: { upstreamStatus: status },
    });
  }

  if (status === 408 || status === 504) {
    return new IntegrationError('ERP request timed out', {
      code: 'ERP_REQUEST_TIMEOUT',
      status: 504,
      metadata: { upstreamStatus: status },
    });
  }

  return new IntegrationError('ERP request failed', {
    code: status >= 500 ? 'ERP_UPSTREAM_FAILURE' : 'ERP_REQUEST_REJECTED',
    status: status >= 500 ? 502 : status,
    metadata: { upstreamStatus: status },
  });
};

export class VisaMatrixBackendConnector implements Connector {
  public readonly name: string;
  public readonly configuration: ConnectorConfiguration;
  private readonly baseUrl: string;
  private readonly internalToken: string;
  private readonly timeoutMs: number;
  private connected = false;

  public constructor(
    configuration: ConnectorConfiguration,
    options: VisaMatrixBackendConnectorOptions,
  ) {
    this.name = configuration.name;
    this.configuration = configuration;
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.internalToken = options.internalToken;
    this.timeoutMs = validateConfiguration(options);
  }

  public async connect(_context: ConnectorContext): Promise<void> {
    this.connected = true;
  }

  public async request(
    request: ConnectorRequest,
    context: ConnectorContext,
  ): Promise<ConnectorResponse> {
    if (request.action !== CUSTOMER_GET_ACTION) {
      throw new ValidationError('Unsupported ERP connector action', {
        code: 'ERP_UNSUPPORTED_ACTION',
      });
    }

    const payload = request.payload;
    if (
      !isRecord(payload) ||
      Object.keys(payload).length !== 1 ||
      !isUuid(payload.customerId)
    ) {
      throw new ValidationError('Invalid customer.get request', {
        code: 'ERP_INVALID_CUSTOMER_GET_REQUEST',
      });
    }

    const requestId = context.requestId ?? randomUUID();
    const correlationId = context.correlationId ?? requestId;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Nexus-Internal-Token': this.internalToken,
      'X-Request-ID': requestId,
      'X-Correlation-ID': correlationId,
    };

    if (context.authorization?.startsWith('Bearer ')) {
      headers.Authorization = context.authorization;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${CUSTOMER_GET_PATH}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new IntegrationError('ERP request timed out', {
          code: 'ERP_REQUEST_TIMEOUT',
          status: 504,
          cause: error,
        });
      }

      throw new IntegrationError('ERP service unavailable', {
        code: 'ERP_UNAVAILABLE',
        status: 502,
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw createUpstreamError(response.status);
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch (error) {
      throw new IntegrationError('Invalid ERP response', {
        code: 'ERP_INVALID_RESPONSE',
        status: 502,
        cause: error,
      });
    }

    if (
      !isRecord(body) ||
      body.success !== true ||
      !isRecord(body.data) ||
      typeof body.requestId !== 'string' ||
      typeof body.correlationId !== 'string'
    ) {
      throw new IntegrationError('Invalid ERP response', {
        code: 'ERP_INVALID_RESPONSE',
        status: 502,
      });
    }

    return { ok: true, payload: body };
  }

  public async health(): Promise<ConnectorHealth> {
    return { ok: this.connected };
  }
}

export const createVisaMatrixBackendConnector = (
  configuration: ConnectorConfiguration,
  options: VisaMatrixBackendConnectorOptions,
): VisaMatrixBackendConnector =>
  new VisaMatrixBackendConnector(configuration, options);