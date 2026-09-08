import { describe, expect, it } from 'vitest';

import { createProviderManager, createProviderRegistry } from '../src/providers/index.js';
import { createModelRouter } from '../src/runtime/ai/model-router.js';

describe('model router', () => {
  it('selects a provider by routing policy', async () => {
    const registry = createProviderRegistry();
    const manager = createProviderManager(registry);

    manager.register('openai', {
      name: 'openai',
      configuration: { providerName: 'openai', environment: 'development' },
      request: async () => ({ ok: true }),
      health: async () => ({ ok: true }),
      metrics: async () => ({ requests: 0, errors: 0 }),
    });

    const router = createModelRouter(manager, { priority: ['openai'] });
    const provider = await router.resolve({
      model: { name: 'openai', version: '1', capabilities: { streaming: false, vision: false, tools: false, structuredOutput: false } },
      input: 'hello',
    });

    expect(provider.name).toBe('openai');
  });
});
