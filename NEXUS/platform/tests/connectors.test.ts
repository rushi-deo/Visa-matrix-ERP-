import { describe, expect, it } from 'vitest';

import { createConnectorManager } from '../src/connectors/index.js';

describe('connectors', () => {
  it('registers connectors', () => {
    const manager = createConnectorManager();
    const connector = {
      name: 'rest',
      configuration: { name: 'rest', environment: 'development' as const },
      connect: async () => undefined,
      request: async () => ({ ok: true }),
      health: async () => ({ ok: true }),
    };

    manager.register('rest', connector);

    expect(manager.get('rest')).toBe(connector);
  });
});
