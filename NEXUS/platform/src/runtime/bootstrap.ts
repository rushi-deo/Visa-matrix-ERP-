import { createPlatformConfig } from '../config/service.js';
import { createVisaMatrixBackendConnector } from '../connectors/visa-matrix-backend.js';
import { createContainer } from '../infrastructure/container/container.js';
import { registerCoreServices } from '../infrastructure/container/registrations.js';
import { ConnectorManagerToken, ProviderManagerToken, RuntimeToken, ToolManagerToken } from '../infrastructure/container/service-tokens.js';
import { createAnthropicProvider, createOpenAIProvider } from '../providers/adapters.js';
import { createLoggerFactory } from '../shared/logger.js';
import { createErpTool } from '../tools/erp-tool.js';
import { createConfirmationManager } from '../security/confirmation/manager.js';
import { createPlatformRuntime } from './runtime.js';
import type { Bootstrap } from './types.js';

export const createBootstrap = (): Bootstrap => ({
  bootstrap: async () => {
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

      const toolManager = container.resolve(ToolManagerToken);
      const erpConnectorManager = container.resolve(ConnectorManagerToken);

      if (erpConnectorManager.get('visa-matrix-backend')) {
        const confirmationManager = createConfirmationManager();

        const erpTools = [
          'customer.get',
          'application.get',
          'application.list',
          'document.get',
          'document.list',
          'lead.get',
          'lead.list',
          'country.list',
          'visa-type.list',
          'visa-requirements.get',
          'visa-rules.get',
          'form.list',
          'form.get',
          'form.getByCountryVisa',
          'invoice.get',
          'invoice.list',
          'payment.get',
          'payment.list',
          'task.get',
          'task.list',
          'workflow.get',
          'workflow.list',
        ];

        for (const action of erpTools) {
          toolManager.register(createErpTool(erpConnectorManager, action, action));
        }

        toolManager.register(
          createErpTool(
            erpConnectorManager,
            'customer.create',
            'customer.create',
            {
              kind: 'write',
              requiresConfirmation: true,
              confirmationManager,
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

      await runtime.initialize();
      await runtime.configure();
      await runtime.build();
      await runtime.start();

      const connectorManager = container.resolve(ConnectorManagerToken);
      const erpConnector = connectorManager.get('visa-matrix-backend');
      if (erpConnector) {
        await connectorManager.connect('visa-matrix-backend', {
          requestId: 'nexus-bootstrap',
          correlationId: 'nexus-bootstrap',
        });
        const health = await connectorManager.health('visa-matrix-backend');
        if (!health.ok) {
          throw new Error('Visa Matrix ERP connector is not ready');
        }
      }

      await runtime.ready();
      return runtime;
    },
});



