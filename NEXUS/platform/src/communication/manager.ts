import type { DeliveryResult, MessageTemplate, NotificationManager } from './types.js';

export const createNotificationManager = (): NotificationManager => ({
  send: async (_template: MessageTemplate): Promise<DeliveryResult> => ({ ok: true }),
});
