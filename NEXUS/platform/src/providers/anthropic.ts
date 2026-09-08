import Anthropic from '@anthropic-ai/sdk';

import type { AIProvider, ProviderConfiguration, ProviderHealth, ProviderMetrics, ProviderRequest, ProviderResponse } from './types.js';

export type AnthropicAuthentication = Readonly<{
  apiKey: string;
  model?: string;
}>;

export type AnthropicClient = Readonly<{
  messages: Readonly<{
    create(params: { model: string; max_tokens: number; messages: readonly { role: 'user'; content: string }[] }): Promise<unknown>;
  }>;
}>;

export interface AnthropicProviderRuntime {
  provider: AIProvider;
}

const extractText = (response: unknown): string => {
  if (!response || typeof response !== 'object' || !('content' in response)) return '';
  const content = (response as { content: unknown }).content;
  if (!Array.isArray(content)) return '';
  return content.flatMap((block) => {
    if (block && typeof block === 'object' && 'text' in block && typeof block.text === 'string') return [block.text];
    return [];
  }).join('');
};

export const createAnthropicProviderRuntime = (
  configuration: ProviderConfiguration,
  auth: AnthropicAuthentication,
  client: AnthropicClient = new Anthropic({ apiKey: auth.apiKey }) as unknown as AnthropicClient,
): AnthropicProviderRuntime => {
  let requestCount = 0;
  let errorCount = 0;

  const request = async (input: ProviderRequest): Promise<ProviderResponse> => {
    requestCount += 1;
    try {
      const response = await client.messages.create({
        model: auth.model ?? 'claude-3-5-sonnet-latest',
        max_tokens: 4096,
        messages: [{ role: 'user', content: input.input }],
      });
      const output = extractText(response);
      if (!output) throw new Error('Anthropic response contained no usable output');
      return { ok: true, output };
    } catch (error) {
      errorCount += 1;
      throw error;
    }
  };

  return {
    provider: {
      name: 'anthropic',
      configuration,
      request,
      health: async (): Promise<ProviderHealth> => ({ ok: Boolean(auth.apiKey) }),
      metrics: async (): Promise<ProviderMetrics> => ({ requests: requestCount, errors: errorCount }),
    },
  };
};
