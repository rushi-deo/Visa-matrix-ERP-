export type ConnectorConfiguration = Readonly<{
  name: string;
  environment: 'development' | 'testing' | 'staging' | 'production';
}>;

export type ConnectorRequest = Readonly<{
  action: string;
  payload?: Record<string, unknown>;
}>;

export type ConnectorResponse = Readonly<{
  ok: boolean;
  payload?: Record<string, unknown>;
}>;

export type ConnectorHealth = Readonly<{
  ok: boolean;
}>;

export type ConnectorContext = Readonly<{
  correlationId?: string;
  requestId?: string;
}>;

export interface Connector {
  readonly name: string;
  readonly configuration: ConnectorConfiguration;
  connect(context: ConnectorContext): Promise<void>;
  request(request: ConnectorRequest, context: ConnectorContext): Promise<ConnectorResponse>;
  health(): Promise<ConnectorHealth>;
}

export interface ConnectorFactory {
  create(configuration: ConnectorConfiguration): Connector;
}

export interface ConnectorRegistry {
  register(name: string, connector: Connector): void;
  get(name: string): Connector | undefined;
}

export interface ConnectorManager {
  register(name: string, connector: Connector): void;
  get(name: string): Connector | undefined;
  connect(name: string, context: ConnectorContext): Promise<void>;
  disconnect(name: string): Promise<void>;
  health(name: string): Promise<ConnectorHealth>;
  reconnect(name: string, context: ConnectorContext): Promise<void>;
}

export type ConnectorCategory =
  | 'database'
  | 'rest-api'
  | 'graphql'
  | 'webhook'
  | 'filesystem'
  | 'object-storage'
  | 'email'
  | 'queue'
  | 'cache';
