import { afterEach, describe, expect, it } from 'vitest';

import { ProviderManagerToken } from '../src/infrastructure/container/service-tokens.js';
import type { AnthropicClient } from '../src/providers/anthropic.js';
import {
  createAnthropicProvider,
  createAzureOpenAIProvider,
  createGoogleGeminiProvider,
  createOllamaProvider,
  createOpenAIProvider,
  createProviderManager,
} from '../src/providers/index.js';
import { createBootstrap } from '../src/runtime/bootstrap.js';

const originalEnv = process.env;

afterEach(() => {
  process.env = originalEnv;
});

describe('providers', () => {
  it('registers provider adapters', async () => {
    const manager = createProviderManager();
    const provider = createOpenAIProvider({
      providerName: 'openai',
      environment: 'development',
    }, { apiKey: 'test-key' });

    manager.register('openai', provider);

    expect(manager.get('openai')).toBe(provider);
    await expect(provider.health()).resolves.toEqual({ ok: true });
  });

  it('creates supported provider adapters', () => {
    expect(createAnthropicProvider({ providerName: 'anthropic', environment: 'testing' }, { apiKey: 'test-key' }).name).toBe('anthropic');
    expect(createGoogleGeminiProvider({ providerName: 'gemini', environment: 'staging' }).name).toBe('google-gemini');
    expect(createOllamaProvider({ providerName: 'ollama', environment: 'production' }).name).toBe('ollama');
    expect(createAzureOpenAIProvider({ providerName: 'azure', environment: 'development' }).name).toBe('azure-openai');
  });

  it('maps Anthropic Messages API requests and responses', async () => {
    let request: Record<string, unknown> | undefined;
    const client: AnthropicClient = {
      messages: {
        create: async (params) => {
          request = params as unknown as Record<string, unknown>;
          return { content: [{ type: 'text', text: 'Claude result' }] };
        },
      },
    };
    const provider = createAnthropicProvider(
      { providerName: 'anthropic', environment: 'testing' },
      { apiKey: 'test-key', model: 'claude-test' },
      client,
    );

    await expect(provider.request({ model: { name: 'anthropic', version: '1.0', capabilities: { streaming: false, vision: false, tools: false, structuredOutput: false } }, input: 'hello Claude' })).resolves.toEqual({ ok: true, output: 'Claude result' });
    expect(request).toEqual({ model: 'claude-test', max_tokens: 4096, messages: [{ role: 'user', content: 'hello Claude' }] });
  });

  it('surfaces Anthropic errors through the provider contract', async () => {
    const provider = createAnthropicProvider(
      { providerName: 'anthropic', environment: 'testing' },
      { apiKey: 'test-key' },
      { messages: { create: async () => { throw new Error('Claude unavailable'); } } },
    );

    await expect(provider.request({ model: { name: 'anthropic', version: '1.0', capabilities: { streaming: false, vision: false, tools: false, structuredOutput: false } }, input: 'hello Claude' })).rejects.toThrow('Claude unavailable');
  });

  it('selects explicit providers when OpenAI and Anthropic coexist', () => {
    const manager = createProviderManager();
    const openai = createOpenAIProvider({ providerName: 'openai', environment: 'testing' }, { apiKey: 'openai-key' });
    const anthropic = createAnthropicProvider({ providerName: 'anthropic', environment: 'testing' }, { apiKey: 'anthropic-key' });
    manager.register('openai', openai);
    manager.register('anthropic', anthropic);

    expect(manager.select({ providerName: 'anthropic', model: { name: 'anthropic', version: '1.0', capabilities: { streaming: false, vision: false, tools: false, structuredOutput: false } }, input: '{}' })).toBe(anthropic);
    expect(manager.select({ providerName: 'openai', model: { name: 'openai', version: '1.0', capabilities: { streaming: false, vision: false, tools: false, structuredOutput: false } }, input: '{}' })).toBe(openai);
    expect(() => manager.select({ providerName: 'missing', model: { name: 'missing', version: '1.0', capabilities: { streaming: false, vision: false, tools: false, structuredOutput: false } }, input: '{}' })).toThrow('Unknown provider: missing');
  });

  it('maps structured Responses API output to the provider response contract', async () => {
    let requestBody: Record<string, unknown> | undefined;
    const provider = createOpenAIProvider(
      { providerName: 'openai', environment: 'testing' },
      { apiKey: 'test-key', model: 'gpt-test' },
      async (_url, init) => {
        requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return new Response(JSON.stringify({
          output: [{ type: 'message', content: [{ type: 'output_text', text: '{"id":"plan","steps":["agent-1"]}' }] }],
        }), { status: 200 });
      },
    );

    const response = await provider.request({
      model: { name: 'brain-planner', version: '1.0', capabilities: { streaming: false, vision: false, tools: false, structuredOutput: true } },
      input: 'plan this request',
    });

    expect(requestBody).toMatchObject({ model: 'gpt-test', input: 'plan this request' });
    expect(response).toEqual({ ok: true, output: '{"id":"plan","steps":["agent-1"]}' });
  });

  it('registers OpenAI during bootstrap only when configured', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'testing', OPENAI_API_KEY: 'test-key' };
    const configuredRuntime = await createBootstrap().bootstrap();
    const configuredManager = configuredRuntime.getContext().container.resolve(ProviderManagerToken);
    expect(configuredManager.get('openai')).toBeDefined();

    process.env = { ...originalEnv, NODE_ENV: 'testing' };
    const unconfiguredRuntime = await createBootstrap().bootstrap();
    const unconfiguredManager = unconfiguredRuntime.getContext().container.resolve(ProviderManagerToken);
    expect(unconfiguredManager.get('openai')).toBeUndefined();
    expect(() => unconfiguredManager.select({
      model: { name: 'brain-planner', version: '1.0', capabilities: { streaming: false, vision: false, tools: false, structuredOutput: true } },
      input: '{}',
    })).toThrow('No provider available');
  });

  it('registers Anthropic only when configured', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'testing', ANTHROPIC_API_KEY: 'test-key', ANTHROPIC_MODEL: 'claude-test' };
    const configuredRuntime = await createBootstrap().bootstrap();
    const configuredManager = configuredRuntime.getContext().container.resolve(ProviderManagerToken);
    expect(configuredManager.get('anthropic')).toBeDefined();

    process.env = { ...originalEnv, NODE_ENV: 'testing' };
    const unconfiguredRuntime = await createBootstrap().bootstrap();
    expect(unconfiguredRuntime.getContext().container.resolve(ProviderManagerToken).get('anthropic')).toBeUndefined();
  });
});
