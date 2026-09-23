import type { ConnectorManager } from '../connectors/types.js';
import type { ConfirmationManager } from '../security/confirmation/manager.js';
import type { Tool, ToolContext, ToolResult, ToolKind } from './types.js';

export const createErpTool = (
  connectorManager: ConnectorManager,
  name: string,
  action: string,
  options: Readonly<{
    kind?: ToolKind;
    requiresConfirmation?: boolean;
    confirmationManager?: ConfirmationManager;
  }> = {},
): Tool => {
  const kind = options.kind ?? 'read';
  const requiresConfirmation =
    options.requiresConfirmation ?? kind === 'write';
  const confirmationManager = options.confirmationManager;

  return {
    definition: {
      name,
      version: '1.0.0',
      kind,
      requiresConfirmation,
    },

    execute: async (context: ToolContext): Promise<ToolResult> => {
      if (kind === 'write' && requiresConfirmation) {
        if (!confirmationManager) {
          return {
            ok: false,
            details: 'CONFIRMATION_MANAGER_NOT_CONFIGURED',
          };
        }

        if (context.confirmed !== true || !context.confirmationId) {
          const confirmationId = confirmationManager.create(
            action,
            context.payload,
          );

          return {
            ok: false,
            details: 'CONFIRMATION_REQUIRED',
            confirmationRequired: true,
            confirmationId,
          };
        }

        const valid = confirmationManager.consume(
          context.confirmationId,
          action,
          context.payload,
        );

        if (!valid) {
          return {
            ok: false,
            details: 'INVALID_OR_EXPIRED_CONFIRMATION',
          };
        }
      }

      const connector = connectorManager.get('visa-matrix-backend');

      if (!connector) {
        return {
          ok: false,
          details: 'Visa Matrix ERP connector is not registered',
        };
      }

      const response = await connector.request(
        {
          action,
          ...(context.payload ? { payload: context.payload } : {}),
        },
        {
          ...(context.requestId ? { requestId: context.requestId } : {}),
          ...(context.correlationId
            ? { correlationId: context.correlationId }
            : {}),
          ...(context.authorization?.startsWith('Bearer ')
            ? { authorization: context.authorization }
            : {}),
        },
      );

      return {
        ok: response.ok,
        ...(response.payload ? { payload: response.payload } : {}),
        ...(response.payload
          ? { details: JSON.stringify(response.payload) }
          : {}),
      };
    },
  };
};

