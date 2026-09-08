export type ModelCapabilities = Readonly<{
  streaming: boolean;
  vision: boolean;
  tools: boolean;
  structuredOutput: boolean;
}>;

export type ModelDefinition = Readonly<{
  name: string;
  version: string;
  capabilities: ModelCapabilities;
}>;

export type ProviderConfiguration = Readonly<{
  providerName: string;
  environment: 'development' | 'testing' | 'staging' | 'production';
}>;

export type ProviderRequest = Readonly<{
  providerName?: string;
  model: ModelDefinition;
  input: string;
}>;

export type ProviderResponse = Readonly<{
  ok: boolean;
  output?: string;
}>;

export type ProviderHealth = Readonly<{
  ok: boolean;
}>;

export type ProviderMetrics = Readonly<{
  requests: number;
  errors: number;
}>;

export interface AIProvider {
  readonly name: string;
  readonly configuration: ProviderConfiguration;
  request(input: ProviderRequest): Promise<ProviderResponse>;
  health(): Promise<ProviderHealth>;
  metrics(): Promise<ProviderMetrics>;
}

export interface ProviderRegistry {
  register(name: string, provider: AIProvider): void;
  get(name: string): AIProvider | undefined;
  list(): readonly AIProvider[];
}

export interface ProviderManager {
  register(name: string, provider: AIProvider): void;
  get(name: string): AIProvider | undefined;
  select(request: ProviderRequest): AIProvider;
  execute(request: ProviderRequest): Promise<ProviderResponse>;
}

export interface LoadBalancingStrategy {
  choose(providers: readonly AIProvider[]): AIProvider;
}

export interface ProviderSelectionStrategy {
  select(providers: readonly AIProvider[], request: ProviderRequest): AIProvider;
}
