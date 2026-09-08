export type MessageTemplate = Readonly<{
  name: string;
  body: string;
}>;

export type DeliveryResult = Readonly<{
  ok: boolean;
  details?: string;
}>;

export interface EmailProvider {
  send(template: MessageTemplate): Promise<DeliveryResult>;
}

export interface SMSProvider {
  send(template: MessageTemplate): Promise<DeliveryResult>;
}

export interface PushProvider {
  send(template: MessageTemplate): Promise<DeliveryResult>;
}

export interface WebhookProvider {
  send(template: MessageTemplate): Promise<DeliveryResult>;
}

export interface NotificationManager {
  send(template: MessageTemplate): Promise<DeliveryResult>;
}
