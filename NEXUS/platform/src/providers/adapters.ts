import { type AnthropicAuthentication, type AnthropicClient,createAnthropicProviderRuntime } from './anthropic.js';
import { createOpenAIProviderRuntime, type OpenAIAuthentication } from './openai.js';
import type { AIProvider, ProviderConfiguration, ProviderHealth, ProviderMetrics, ProviderRequest, ProviderResponse } from './types.js';

const createPlaceholderProvider = (name: string, configuration: ProviderConfiguration): AIProvider => ({
  name,
  configuration,
  request: async (_input: ProviderRequest): Promise<ProviderResponse> => ({ ok: true }),
  health: async (): Promise<ProviderHealth> => ({ ok: true }),
  metrics: async (): Promise<ProviderMetrics> => ({ requests: 0, errors: 0 }),
});

export const createOpenAIProvider = (
  configuration: ProviderConfiguration,
  auth: OpenAIAuthentication = { apiKey: '' },
  fetchImpl: typeof fetch = fetch,
): AIProvider => createOpenAIProviderRuntime(configuration, auth, fetchImpl).provider;

export const createAnthropicProvider = (
  configuration: ProviderConfiguration,
  auth: AnthropicAuthentication = { apiKey: '' },
  client?: AnthropicClient,
): AIProvider => createAnthropicProviderRuntime(configuration, auth, client).provider;

export const createGoogleGeminiProvider = (configuration: ProviderConfiguration): AIProvider =>
  createPlaceholderProvider('google-gemini', configuration);

export const createOllamaProvider = (configuration: ProviderConfiguration): AIProvider =>
  createPlaceholderProvider('ollama', configuration);

export const createAzureOpenAIProvider = (configuration: ProviderConfiguration): AIProvider =>
  createPlaceholderProvider('azure-openai', configuration);
