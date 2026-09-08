import { describe, expect, it, vi } from 'vitest';

import { createMemoryManager, createMemoryRegistry } from '../src/memory/index.js';

describe('memory platform', () => {
  it('registers providers in the registry', () => {
    const registry = createMemoryRegistry();
    const provider = {
      name: 'session',
      store: async () => undefined,
      recall: async () => [],
    };

    registry.register('session', provider);

    expect(registry.get('session')).toBe(provider);
  });

  it('stores and recalls records through the manager', async () => {
    const manager = createMemoryManager();
    const storeSpy = vi.fn(async () => undefined);
    const recallSpy = vi.fn(async () => []);

    manager.register('session', {
      name: 'session',
      store: storeSpy,
      recall: recallSpy,
    });

    const record = {
      metadata: {
        id: 'memory-1',
        version: '1',
        type: 'session',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
      },
      content: 'hello',
    } as const;

    await manager.store(record, { type: 'session', collection: 'session' });
    await manager.recall({ type: 'session', collection: 'session' });

    expect(storeSpy).toHaveBeenCalled();
    expect(recallSpy).toHaveBeenCalled();
  });
});
