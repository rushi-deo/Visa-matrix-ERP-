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
const CUSTOMER_CREATE_ACTION = 'customer.create';
const CUSTOMER_CREATE_PATH = '/api/integrations/nexus/customer.create';
const CUSTOMER_LIST_ACTION = 'customer.list';
const CUSTOMER_LIST_PATH = '/api/integrations/nexus/customer.list';
const APPLICATION_GET_ACTION = 'application.get';
const APPLICATION_GET_PATH = '/api/integrations/nexus/application.get';
const APPLICATION_LIST_ACTION = 'application.list';
const APPLICATION_LIST_PATH = '/api/integrations/nexus/application.list';
const DOCUMENT_GET_ACTION = 'document.get';
const DOCUMENT_GET_PATH = '/api/integrations/nexus/document.get';
const DOCUMENT_LIST_ACTION = 'document.list';
const DOCUMENT_LIST_PATH = '/api/integrations/nexus/document.list';
const LEAD_GET_ACTION = 'lead.get';
const LEAD_GET_PATH = '/api/integrations/nexus/lead.get';
const LEAD_LIST_ACTION = 'lead.list';
const LEAD_LIST_PATH = '/api/integrations/nexus/lead.list';
const FORM_LIST_ACTION = 'form.list';
const FORM_LIST_PATH = '/api/integrations/nexus/form.list';
const FORM_GET_ACTION = 'form.get';
const FORM_GET_PATH = '/api/integrations/nexus/form.get';
const FORM_GET_BY_COUNTRY_VISA_ACTION = 'form.getByCountryVisa';
const FORM_GET_BY_COUNTRY_VISA_PATH = '/api/integrations/nexus/form.getByCountryVisa';
const COUNTRY_LIST_ACTION = 'country.list';
const COUNTRY_LIST_PATH = '/api/integrations/nexus/country.list';
const VISA_TYPE_LIST_ACTION = 'visa-type.list';
const VISA_TYPE_LIST_PATH = '/api/integrations/nexus/visa-type.list';
const VISA_REQUIREMENTS_GET_ACTION = 'visa-requirements.get';
const VISA_REQUIREMENTS_GET_PATH = '/api/integrations/nexus/visa-requirements.get';
const VISA_RULES_GET_ACTION = 'visa-rules.get';
const VISA_RULES_GET_PATH = '/api/integrations/nexus/visa-rules.get';
const TASK_GET_ACTION = 'task.get';
const TASK_GET_PATH = '/api/integrations/nexus/task.get';
const TASK_LIST_ACTION = 'task.list';
const TASK_LIST_PATH = '/api/integrations/nexus/task.list';
const WORKFLOW_GET_ACTION = 'workflow.get';
const WORKFLOW_GET_PATH = '/api/integrations/nexus/workflow.get';
const WORKFLOW_LIST_ACTION = 'workflow.list';
const WORKFLOW_LIST_PATH = '/api/integrations/nexus/workflow.list';
const INVOICE_GET_ACTION = 'invoice.get';
const INVOICE_GET_PATH = '/api/integrations/nexus/invoice.get';
const INVOICE_LIST_ACTION = 'invoice.list';
const INVOICE_LIST_PATH = '/api/integrations/nexus/invoice.list';
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
    if (request.action !== CUSTOMER_GET_ACTION && request.action !== CUSTOMER_LIST_ACTION && request.action !== CUSTOMER_CREATE_ACTION && request.action !== APPLICATION_GET_ACTION && request.action !== APPLICATION_LIST_ACTION && request.action !== DOCUMENT_GET_ACTION && request.action !== DOCUMENT_LIST_ACTION && request.action !== LEAD_GET_ACTION && request.action !== LEAD_LIST_ACTION && request.action !== FORM_LIST_ACTION && request.action !== FORM_GET_ACTION && request.action !== FORM_GET_BY_COUNTRY_VISA_ACTION && request.action !== COUNTRY_LIST_ACTION && request.action !== VISA_TYPE_LIST_ACTION && request.action !== VISA_REQUIREMENTS_GET_ACTION && request.action !== VISA_RULES_GET_ACTION && request.action !== TASK_GET_ACTION && request.action !== TASK_LIST_ACTION && request.action !== WORKFLOW_GET_ACTION && request.action !== WORKFLOW_LIST_ACTION && request.action !== INVOICE_GET_ACTION && request.action !== INVOICE_LIST_ACTION) {
      throw new ValidationError('Unsupported ERP connector action', {
        code: 'ERP_UNSUPPORTED_ACTION',
      });
    }

    const payload = request.payload;

    if (request.action === CUSTOMER_GET_ACTION) {
      if (
        !isRecord(payload) ||
        Object.keys(payload).length !== 1 ||
        !isUuid(payload.customerId)
      ) {
        throw new ValidationError('Invalid customer.get request', {
          code: 'ERP_INVALID_CUSTOMER_GET_REQUEST',
        });
      }
    } else if (request.action === CUSTOMER_LIST_ACTION) {
      if (!isRecord(payload)) {
        throw new ValidationError('Invalid customer.list request', {
          code: 'ERP_INVALID_CUSTOMER_LIST_REQUEST',
        });
      }

      const allowedKeys = new Set(['page', 'limit', 'search']);
      const unknownKeys = Object.keys(payload).filter(
        (key) => !allowedKeys.has(key),
      );

      if (unknownKeys.length > 0) {
        throw new ValidationError('Invalid customer.list request', {
          code: 'ERP_INVALID_CUSTOMER_LIST_REQUEST',
        });
      }
    } else if (request.action === CUSTOMER_CREATE_ACTION) {
      if (
        !isRecord(payload) ||
        typeof payload.full_name !== 'string' ||
        payload.full_name.trim().length < 2
      ) {
        throw new ValidationError('Invalid customer.create request', {
          code: 'ERP_INVALID_CUSTOMER_CREATE_REQUEST',
        });
      }} else if (request.action === APPLICATION_GET_ACTION) {
      if (
        !isRecord(payload) ||
        Object.keys(payload).length !== 1 ||
        !isUuid(payload.applicationId)
      ) {
        throw new ValidationError('Invalid application.get request', {
          code: 'ERP_INVALID_APPLICATION_GET_REQUEST',
        });
      }
    } else {
      if (!isRecord(payload)) {
        throw new ValidationError('Invalid application.list request', {
          code: 'ERP_INVALID_APPLICATION_LIST_REQUEST',
        });
      }

      const allowedKeys = new Set([
        'page',
        'limit',
        'search',
        'status',
        'country_id',
        'visa_type_id',
      ]);

      const unknownKeys = Object.keys(payload).filter(
        (key) => !allowedKeys.has(key),
      );

      if (unknownKeys.length > 0) {
        throw new ValidationError('Invalid application.list request', {
          code: 'ERP_INVALID_APPLICATION_LIST_REQUEST',
        });
      }
    }
    if (request.action === DOCUMENT_GET_ACTION) {
      if (
        !isRecord(payload) ||
        Object.keys(payload).length !== 1 ||
        !isUuid(payload.documentId)
      ) {
        throw new ValidationError('Invalid document.get request', {
          code: 'ERP_INVALID_DOCUMENT_GET_REQUEST',
        });
      }
    }

    if (request.action === DOCUMENT_LIST_ACTION) {
      if (!isRecord(payload)) {
        throw new ValidationError('Invalid document.list request', {
          code: 'ERP_INVALID_DOCUMENT_LIST_REQUEST',
        });
      }
    }
    if (request.action === LEAD_GET_ACTION) {
      if (
        !isRecord(payload) ||
        Object.keys(payload).length !== 1 ||
        !isUuid(payload.leadId)
      ) {
        throw new ValidationError('Invalid lead.get request', {
          code: 'ERP_INVALID_LEAD_GET_REQUEST',
        });
      }
    }

    if (request.action === LEAD_LIST_ACTION) {
      if (!isRecord(payload)) {
        throw new ValidationError('Invalid lead.list request', {
          code: 'ERP_INVALID_LEAD_LIST_REQUEST',
        });
      }
    }
    if (request.action === TASK_GET_ACTION) {
      if (!isRecord(payload) || Object.keys(payload).length !== 1 || !isUuid(payload.taskId)) {
        throw new ValidationError('Invalid task.get request', { code: 'ERP_INVALID_TASK_GET_REQUEST' });
      }
    } else if (request.action === TASK_LIST_ACTION) {
      if (!isRecord(payload)) {
        throw new ValidationError('Invalid task.list request', { code: 'ERP_INVALID_TASK_LIST_REQUEST' });
      }
    }
    if (request.action === WORKFLOW_GET_ACTION) {
      if (!isRecord(payload) || Object.keys(payload).length !== 1 || !isUuid(payload.workflowId)) {
        throw new ValidationError('Invalid workflow.get request', { code: 'ERP_INVALID_WORKFLOW_GET_REQUEST' });
      }
    } else if (request.action === WORKFLOW_LIST_ACTION) {
      if (!isRecord(payload)) {
        throw new ValidationError('Invalid workflow.list request', { code: 'ERP_INVALID_WORKFLOW_LIST_REQUEST' });
      }
    }
    if (request.action === INVOICE_GET_ACTION) {
      if (
        !isRecord(payload) ||
        Object.keys(payload).length !== 1 ||
        !isUuid(payload.invoiceId)
      ) {
        throw new ValidationError('Invalid invoice.get request', {
          code: 'ERP_INVALID_INVOICE_GET_REQUEST',
        });
      }
    } else if (request.action === INVOICE_LIST_ACTION) {
      if (!isRecord(payload)) {
        throw new ValidationError('Invalid invoice.list request', {
          code: 'ERP_INVALID_INVOICE_LIST_REQUEST',
        });
      }

      const allowedKeys = new Set(['page', 'limit', 'search']);
      const invalidKeys = Object.keys(payload).filter(
        (key) => !allowedKeys.has(key),
      );

      if (invalidKeys.length > 0) {
        throw new ValidationError('Invalid invoice.list request', {
          code: 'ERP_INVALID_INVOICE_LIST_REQUEST',
        });
      }
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
    const endpointPath =
      request.action === CUSTOMER_GET_ACTION
        ? CUSTOMER_GET_PATH
        : request.action === CUSTOMER_LIST_ACTION
          ? CUSTOMER_LIST_PATH
          : request.action === CUSTOMER_CREATE_ACTION
            ? CUSTOMER_CREATE_PATH
          : request.action === APPLICATION_GET_ACTION
            ? APPLICATION_GET_PATH
            : request.action === APPLICATION_LIST_ACTION
              ? APPLICATION_LIST_PATH
              : request.action === DOCUMENT_GET_ACTION
                ? DOCUMENT_GET_PATH
                : request.action === DOCUMENT_LIST_ACTION
                  ? DOCUMENT_LIST_PATH
                  : request.action === LEAD_GET_ACTION
                    ? LEAD_GET_PATH
                    : request.action === FORM_LIST_ACTION
                      ? FORM_LIST_PATH
                      : request.action === FORM_GET_ACTION
                        ? FORM_GET_PATH
                        : request.action === FORM_GET_BY_COUNTRY_VISA_ACTION
                          ? FORM_GET_BY_COUNTRY_VISA_PATH
                          : request.action === COUNTRY_LIST_ACTION
                      ? COUNTRY_LIST_PATH
                      : request.action === VISA_TYPE_LIST_ACTION
                        ? VISA_TYPE_LIST_PATH
                        : request.action === VISA_REQUIREMENTS_GET_ACTION
                          ? VISA_REQUIREMENTS_GET_PATH
                          : request.action === TASK_GET_ACTION
                ? TASK_GET_PATH
                : request.action === TASK_LIST_ACTION
                  ? TASK_LIST_PATH
                  : request.action === WORKFLOW_GET_ACTION
                ? WORKFLOW_GET_PATH
                : request.action === WORKFLOW_LIST_ACTION
                  ? WORKFLOW_LIST_PATH
                  : request.action === INVOICE_GET_ACTION
              ? INVOICE_GET_PATH
              : request.action === INVOICE_LIST_ACTION
                ? INVOICE_LIST_PATH
                : VISA_RULES_GET_PATH;

    response = await fetch(`${this.baseUrl}${endpointPath}`, {
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










