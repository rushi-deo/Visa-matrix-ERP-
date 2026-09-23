import type { ConnectorManager } from '../connectors/types.js';
import type { Tool, ToolContext, ToolResult, ToolKind } from './types.js';

export const createErpTool = (
  connectorManager: ConnectorManager,
  name: string,
  action: string,
  options: Readonly<{
    kind?: ToolKind;
    requiresConfirmation?: boolean;
  }> = {},
): Tool => {
  const kind = options.kind ?? 'read';
  const requiresConfirmation =
    options.requiresConfirmation ?? kind === 'write';

  return {
    definition: {
      name,
      version: '1.0.0',
      kind,
      requiresConfirmation,
    },

    execute: async (context: ToolContext): Promise<ToolResult> => {
      if (kind === 'write' && requiresConfirmation) {
        if (context.confirmed !== true || !context.confirmationId) {
          return {
            ok: false,
            details: 'CONFIRMATION_REQUIRED',
            confirmationRequired: true,
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
