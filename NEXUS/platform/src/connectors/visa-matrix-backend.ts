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

const DEFAULT_TIMEOUT_MS = 5_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export type VisaMatrixBackendConnectorOptions = Readonly<{
  baseUrl: string;
  internalToken: string;
  timeoutMs?: number;
}>;

type PayloadValidator = (payload: unknown) => payload is Record<string, unknown>;
type ActionDefinition = Readonly<{ path: string; validate: PayloadValidator }>;
const actionDefinition = (action: string, path: string): ActionDefinition => ({
  path,
  validate: (payload): payload is Record<string, unknown> => validators[action]?.(payload) ?? false,
});

const invalid = (action: string): never => {
  throw new ValidationError(`Invalid ${action} request`, {
    code: `ERP_INVALID_${action.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_REQUEST`,
  });
};

const strictObject = (
  payload: unknown,
  allowed: readonly string[],
  required: readonly string[] = [],
): payload is Record<string, unknown> =>
  isRecord(payload) &&
  Object.keys(payload).every((key) => allowed.includes(key)) &&
  required.every((key) => Object.hasOwn(payload, key));

const uuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_PATTERN.test(value);
const shortText = (value: unknown, max = 200): value is string =>
  typeof value === 'string' && value.length <= max;
const optional = (payload: Record<string, unknown>, key: string, check: (value: unknown) => boolean) =>
  payload[key] === undefined || check(payload[key]);
const pagination = (payload: Record<string, unknown>) =>
  optional(payload, 'page', (value) => Number.isInteger(value) && Number(value) > 0) &&
  optional(payload, 'limit', (value) => Number.isInteger(value) && Number(value) > 0 && Number(value) <= 100) &&
  optional(payload, 'search', (value) => shortText(value));

const validators: Record<string, PayloadValidator> = {
  'customer.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['customerId'], ['customerId']) && uuid(value.customerId),
  'customer.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['page', 'limit', 'search']) && pagination(value),
  'customer.create': (value): value is Record<string, unknown> =>
    strictObject(value, ['full_name', 'email', 'phone', 'passport_number', 'nationality'], ['full_name']) &&
    typeof value.full_name === 'string' && value.full_name.trim().length >= 2 && value.full_name.length <= 120 &&
    optional(value, 'email', (item) => typeof item === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)) &&
    optional(value, 'phone', (item) => typeof item === 'string' && item.length >= 6 && item.length <= 30) &&
    optional(value, 'passport_number', (item) => typeof item === 'string' && item.length >= 3 && item.length <= 50) &&
    optional(value, 'nationality', (item) => typeof item === 'string' && item.length >= 2 && item.length <= 100),
  'application.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['applicationId'], ['applicationId']) && uuid(value.applicationId),
  'application.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['page', 'limit', 'search', 'status', 'countryId', 'visaTypeId']) &&
    pagination(value) && optional(value, 'status', (item) => shortText(item, 80)) &&
    optional(value, 'countryId', uuid) && optional(value, 'visaTypeId', uuid),
  'document.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['documentId'], ['documentId']) && uuid(value.documentId),
  'document.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['page', 'limit', 'search', 'applicationId', 'status']) &&
    pagination(value) && optional(value, 'applicationId', uuid) &&
    optional(value, 'status', (item) => shortText(item, 80)),
  'lead.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['leadId'], ['leadId']) && uuid(value.leadId),
  'lead.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['page', 'limit', 'search', 'status']) && pagination(value) &&
    optional(value, 'status', (item) => shortText(item, 80)),
  'form.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['page', 'limit', 'search', 'countryId', 'visaTypeId']) && pagination(value) &&
    optional(value, 'countryId', uuid) && optional(value, 'visaTypeId', uuid),
  'form.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['formId'], ['formId']) && uuid(value.formId),
  'form.getByCountryVisa': (value): value is Record<string, unknown> =>
    strictObject(value, ['countryId', 'visaTypeId'], ['countryId', 'visaTypeId']) &&
    uuid(value.countryId) && uuid(value.visaTypeId),
  'country.list': (value): value is Record<string, unknown> => strictObject(value, []),
  'visa-type.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['countryId'], ['countryId']) && uuid(value.countryId),
  'visa-requirements.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['countryId', 'visaTypeId'], ['countryId', 'visaTypeId']) &&
    uuid(value.countryId) && uuid(value.visaTypeId),
  'visa-rules.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['visaRuleId'], ['visaRuleId']) && uuid(value.visaRuleId),
  'task.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['taskId'], ['taskId']) && uuid(value.taskId),
  'task.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['page', 'limit', 'search', 'status', 'applicationId', 'assignedTo']) && pagination(value) &&
    optional(value, 'status', (item) => shortText(item, 80)) && optional(value, 'applicationId', uuid) &&
    optional(value, 'assignedTo', uuid),
  'workflow.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['workflowId'], ['workflowId']) && uuid(value.workflowId),
  'workflow.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['page', 'limit', 'search', 'triggerKey', 'isActive']) && pagination(value) &&
    optional(value, 'triggerKey', (item) => shortText(item, 120)) &&
    optional(value, 'isActive', (item) => typeof item === 'boolean'),
  'invoice.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['invoiceId'], ['invoiceId']) && uuid(value.invoiceId),
  'invoice.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['page', 'limit', 'search']) && pagination(value),
  'payment.get': (value): value is Record<string, unknown> =>
    strictObject(value, ['paymentId'], ['paymentId']) && uuid(value.paymentId),
  'payment.list': (value): value is Record<string, unknown> =>
    strictObject(value, ['page', 'limit', 'search', 'applicationId', 'status', 'currency']) && pagination(value) &&
    optional(value, 'applicationId', uuid) && optional(value, 'status', (item) => shortText(item, 80)) &&
    optional(value, 'currency', (item) => typeof item === 'string' && /^[A-Z]{3}$/.test(item)),
};

/** Explicitly supported ERP actions, each paired with its ERP endpoint and payload validator. */
export const VISA_MATRIX_ACTIONS: Readonly<Record<string, ActionDefinition>> = Object.freeze({
  'customer.get': actionDefinition('customer.get', '/api/integrations/nexus/customer.get'),
  'customer.list': actionDefinition('customer.list', '/api/integrations/nexus/customer.list'),
  'customer.create': actionDefinition('customer.create', '/api/integrations/nexus/customer.create'),
  'application.get': actionDefinition('application.get', '/api/integrations/nexus/application.get'),
  'application.list': actionDefinition('application.list', '/api/integrations/nexus/application.list'),
  'document.get': actionDefinition('document.get', '/api/integrations/nexus/document.get'),
  'document.list': actionDefinition('document.list', '/api/integrations/nexus/document.list'),
  'lead.get': actionDefinition('lead.get', '/api/integrations/nexus/lead.get'),
  'lead.list': actionDefinition('lead.list', '/api/integrations/nexus/lead.list'),
  'form.list': actionDefinition('form.list', '/api/integrations/nexus/form.list'),
  'form.get': actionDefinition('form.get', '/api/integrations/nexus/form.get'),
  'form.getByCountryVisa': actionDefinition('form.getByCountryVisa', '/api/integrations/nexus/form.getByCountryVisa'),
  'country.list': actionDefinition('country.list', '/api/integrations/nexus/country.list'),
  'visa-type.list': actionDefinition('visa-type.list', '/api/integrations/nexus/visa-type.list'),
  'visa-requirements.get': actionDefinition('visa-requirements.get', '/api/integrations/nexus/visa-requirements.get'),
  'visa-rules.get': actionDefinition('visa-rules.get', '/api/integrations/nexus/visa-rules.get'),
  'task.get': actionDefinition('task.get', '/api/integrations/nexus/task.get'),
  'task.list': actionDefinition('task.list', '/api/integrations/nexus/task.list'),
  'workflow.get': actionDefinition('workflow.get', '/api/integrations/nexus/workflow.get'),
  'workflow.list': actionDefinition('workflow.list', '/api/integrations/nexus/workflow.list'),
  'invoice.get': actionDefinition('invoice.get', '/api/integrations/nexus/invoice.get'),
  'invoice.list': actionDefinition('invoice.list', '/api/integrations/nexus/invoice.list'),
  'payment.get': actionDefinition('payment.get', '/api/integrations/nexus/payment.get'),
  'payment.list': actionDefinition('payment.list', '/api/integrations/nexus/payment.list'),
});

const parseTimeout = (value: number | undefined): number => {
  const timeoutMs = value ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 30_000) {
    throw new ConfigurationError('Invalid ERP connector timeout', { code: 'ERP_CONNECTOR_INVALID_TIMEOUT' });
  }
  return timeoutMs;
};

const validateConfiguration = (options: VisaMatrixBackendConnectorOptions): number => {
  if (!options.baseUrl.trim()) {
    throw new ConfigurationError('ERP connector base URL is required', { code: 'ERP_CONNECTOR_MISSING_BASE_URL' });
  }
  if (!options.internalToken.trim()) {
    throw new ConfigurationError('ERP connector internal token is required', { code: 'ERP_CONNECTOR_MISSING_TOKEN' });
  }
  return parseTimeout(options.timeoutMs);
};

const createUpstreamError = (status: number): IntegrationError => {
  if (status === 401) return new IntegrationError('ERP authentication failed', { code: 'ERP_AUTHENTICATION_FAILED', status, metadata: { upstreamStatus: status } });
  if (status === 403) return new IntegrationError('ERP authorization failed', { code: 'ERP_AUTHORIZATION_FAILED', status, metadata: { upstreamStatus: status } });
  if (status === 404) return new IntegrationError('ERP resource not found', { code: 'ERP_RESOURCE_NOT_FOUND', status, metadata: { upstreamStatus: status } });
  if (status === 408 || status === 504) return new IntegrationError('ERP request timed out', { code: 'ERP_REQUEST_TIMEOUT', status: 504, metadata: { upstreamStatus: status } });
  return new IntegrationError('ERP request failed', { code: status >= 500 ? 'ERP_UPSTREAM_FAILURE' : 'ERP_REQUEST_REJECTED', status: status >= 500 ? 502 : status, metadata: { upstreamStatus: status } });
};

export class VisaMatrixBackendConnector implements Connector {
  public readonly name: string;
  public readonly configuration: ConnectorConfiguration;
  private readonly baseUrl: string;
  private readonly internalToken: string;
  private readonly timeoutMs: number;
  private connected = false;

  public constructor(configuration: ConnectorConfiguration, options: VisaMatrixBackendConnectorOptions) {
    this.name = configuration.name;
    this.configuration = configuration;
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.internalToken = options.internalToken;
    this.timeoutMs = validateConfiguration(options);
  }

  public async connect(_context: ConnectorContext): Promise<void> {
    this.connected = true;
  }

  public async request(request: ConnectorRequest, context: ConnectorContext): Promise<ConnectorResponse> {
    const definition = VISA_MATRIX_ACTIONS[request.action];
    if (!definition) {
      throw new ValidationError('Unsupported ERP connector action', { code: 'ERP_UNSUPPORTED_ACTION' });
    }
    if (!definition.validate(request.payload ?? {})) invalid(request.action);

    const requestId = context.requestId ?? randomUUID();
    const correlationId = context.correlationId ?? requestId;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Nexus-Internal-Token': this.internalToken,
      'X-Request-ID': requestId,
      'X-Correlation-ID': correlationId,
    };
    if (context.authorization?.startsWith('Bearer ')) headers.Authorization = context.authorization;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${definition.path}`, {
        method: 'POST', headers, body: JSON.stringify(request.payload ?? {}), signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new IntegrationError('ERP request timed out', { code: 'ERP_REQUEST_TIMEOUT', status: 504, cause: error });
      }
      throw new IntegrationError('ERP service unavailable', { code: 'ERP_UNAVAILABLE', status: 502, cause: error });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) throw createUpstreamError(response.status);
    let body: unknown;
    try {
      body = await response.json();
    } catch (error) {
      throw new IntegrationError('Invalid ERP response', { code: 'ERP_INVALID_RESPONSE', status: 502, cause: error });
    }
    if (!isRecord(body) || body.success !== true || (!isRecord(body.data) && !Array.isArray(body.data)) ||
      typeof body.requestId !== 'string' || !body.requestId ||
      typeof body.correlationId !== 'string' || !body.correlationId) {
      throw new IntegrationError('Invalid ERP response', { code: 'ERP_INVALID_RESPONSE', status: 502 });
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
): VisaMatrixBackendConnector => new VisaMatrixBackendConnector(configuration, options);
