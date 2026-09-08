import { createPlatformConfig } from '../config/service.js';
import { createVisaMatrixBackendConnector } from '../connectors/visa-matrix-backend.js';
import { createContainer } from '../infrastructure/container/container.js';
import { registerCoreServices } from '../infrastructure/container/registrations.js';
import { ConnectorManagerToken, ProviderManagerToken, RuntimeToken } from '../infrastructure/container/service-tokens.js';
import { createAnthropicProvider, createOpenAIProvider } from '../providers/adapters.js';
import { createLoggerFactory } from '../shared/logger.js';
import { createPlatformRuntime } from './runtime.js';
import type { Bootstrap } from './types.js';

export const createBootstrap = (): Bootstrap => ({
  bootstrap: async () =>
    (() => {
      const container = createContainer();
      registerCoreServices(container);
      const config = createPlatformConfig();
      const runtime = createPlatformRuntime({
        config,
        logger: createLoggerFactory('json'),
        container,
      });

      // register runtime instance so other services can resolve it
      container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

      if (config.visaMatrixErpBaseUrl && config.nexusInternalToken) {
        const connectorManager = container.resolve(ConnectorManagerToken);
        connectorManager.register(
          'visa-matrix-backend',
          createVisaMatrixBackendConnector(
            { name: 'visa-matrix-backend', environment: config.nodeEnv },
            {
              baseUrl: config.visaMatrixErpBaseUrl,
              internalToken: config.nexusInternalToken,
              ...(config.visaMatrixErpTimeoutMs
                ? { timeoutMs: config.visaMatrixErpTimeoutMs }
                : {}),
            },
          ),
        );
      }

      if (config.openaiApiKey) {
        const providerManager = container.resolve(ProviderManagerToken);
        providerManager.register('openai', createOpenAIProvider(
          { providerName: 'openai', environment: config.nodeEnv },
          {
            apiKey: config.openaiApiKey,
            ...(config.openaiModel ? { model: config.openaiModel } : {}),
            ...(config.openaiOrganization ? { organization: config.openaiOrganization } : {}),
            ...(config.openaiProject ? { project: config.openaiProject } : {}),
          },
        ));
      }

      if (config.anthropicApiKey) {
        const providerManager = container.resolve(ProviderManagerToken);
        providerManager.register('anthropic', createAnthropicProvider(
          { providerName: 'anthropic', environment: config.nodeEnv },
          {
            apiKey: config.anthropicApiKey,
            ...(config.anthropicModel ? { model: config.anthropicModel } : {}),
          },
        ));
      }

      return runtime;
    })(),
});
