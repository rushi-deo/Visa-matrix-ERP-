import { ConfigurationError } from '../shared/errors.js';
import type { ConfigSource, PlatformConfig, RuntimeMode } from './types.js';

const allowedModes = new Set<RuntimeMode>(['development', 'testing', 'production']);

const parseTimeout = (value: string): number => {
  const timeout = Number(value);
  if (!Number.isInteger(timeout) || timeout < 100 || timeout > 30_000) {
    throw new ConfigurationError('Invalid VISA_MATRIX_ERP_TIMEOUT_MS value', {
      code: 'CONFIG_INVALID_ERP_TIMEOUT',
    });
  }

  return timeout;
};

const normalizeMode = (value: string): RuntimeMode => {
  if (value === 'test') {
    return 'testing';
  }

  return value as RuntimeMode;
};

export const validateConfig = (source: ConfigSource): PlatformConfig => {
  const nodeEnv = normalizeMode(source.NODE_ENV ?? 'development');
  if (!allowedModes.has(nodeEnv)) {
    throw new ConfigurationError(`Invalid NODE_ENV value: ${source.NODE_ENV ?? ''}`, {
      code: 'CONFIG_INVALID_NODE_ENV',
    });
  }

  const port = Number(source.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    throw new ConfigurationError(`Invalid PORT value: ${source.PORT ?? ''}`, {
      code: 'CONFIG_INVALID_PORT',
    });
  }

  return {
    nodeEnv,
    port,
    logLevel: source.LOG_LEVEL ?? 'info',
    ...(source.OPENAI_API_KEY ? { openaiApiKey: source.OPENAI_API_KEY } : {}),
    ...(source.OPENAI_MODEL ? { openaiModel: source.OPENAI_MODEL } : {}),
    ...(source.OPENAI_ORGANIZATION ? { openaiOrganization: source.OPENAI_ORGANIZATION } : {}),
    ...(source.OPENAI_PROJECT ? { openaiProject: source.OPENAI_PROJECT } : {}),
    ...(source.ANTHROPIC_API_KEY ? { anthropicApiKey: source.ANTHROPIC_API_KEY } : {}),
    ...(source.ANTHROPIC_MODEL ? { anthropicModel: source.ANTHROPIC_MODEL } : {}),
    ...(source.VISA_MATRIX_ERP_BASE_URL
      ? { visaMatrixErpBaseUrl: source.VISA_MATRIX_ERP_BASE_URL }
      : {}),
    ...(source.VISA_MATRIX_ERP_TIMEOUT_MS
      ? { visaMatrixErpTimeoutMs: parseTimeout(source.VISA_MATRIX_ERP_TIMEOUT_MS) }
      : {}),
    ...(source.NEXUS_INTERNAL_TOKEN ? { nexusInternalToken: source.NEXUS_INTERNAL_TOKEN } : {}),
  };
};
