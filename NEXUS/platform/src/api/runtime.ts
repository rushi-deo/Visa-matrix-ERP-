export type Versioning = Readonly<{
  current: string;
  supported: readonly string[];
}>;

export type RateLimitPolicy = Readonly<{
  requests: number;
  windowMs: number;
}>;

export type OpenAPIMetadata = Readonly<{
  title: string;
  version: string;
}>;

export type EndpointDefinition = Readonly<{
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
}>;

export type RequestContext = Readonly<{
  requestId?: string;
  correlationId?: string;
}>;

export type ResponseContext = Readonly<{
  requestId?: string;
  correlationId?: string;
}>;

export interface MiddlewareRegistry {
  register(name: string, middleware: unknown): void;
}

export interface RouteRegistry {
  register(endpoint: EndpointDefinition): void;
}

export interface APIHost {
  start(): Promise<void>;
  stop(): Promise<void>;
}
