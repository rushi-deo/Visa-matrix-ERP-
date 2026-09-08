import { describe, expect, it } from 'vitest';

import { createBrainManager, createBrainPipeline } from '../src/brain/index.js';

describe('brain', () => {
  it('creates the brain pipeline stages', () => {
    expect(createBrainPipeline().stages).toEqual([
      'initialize',
      'plan',
      'reason',
      'execute',
      'evaluate',
      'learn',
      'complete',
    ]);
  });

  it('registers brains in the manager', () => {
    const manager = createBrainManager();
    const brain = {
      initialize: async () => undefined,
      plan: async () => ({ id: 'plan-1', tasks: [], actions: [] }),
      reason: async () => ({ value: 'ok' }),
      execute: async () => ({ ok: true }),
      evaluate: async () => ({ status: 'pending' as const }),
      learn: async () => undefined,
      complete: async () => undefined,
    };

    manager.register('default', brain);

    expect(manager.get('default')).toBe(brain);
  });
});
