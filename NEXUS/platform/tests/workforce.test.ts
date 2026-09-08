import { describe, expect, it } from 'vitest';

import { createAgentManager, createWorkforceManager } from '../src/workforce/index.js';

describe('workforce', () => {
  it('registers workers in the workforce manager', () => {
    const manager = createWorkforceManager();
    const worker = {
      initialize: async () => undefined,
      assign: async () => undefined,
      execute: async () => ({ ok: true }),
      pause: async () => undefined,
      resume: async () => undefined,
      complete: async () => undefined,
      terminate: async () => undefined,
    };

    manager.register('worker-1', worker);

    expect(manager).toBeDefined();
  });

  it('registers agents in the agent manager', () => {
    const manager = createAgentManager();
    const agent = {
      initialize: async () => undefined,
      execute: async () => ({ ok: true }),
    };

    manager.register('agent-1', agent);

    expect(manager).toBeDefined();
  });

  it('rejects empty and unknown agent identifiers predictably', async () => {
    const manager = createAgentManager();

    await expect(manager.execute('   ', {} as never, {} as never)).rejects.toThrow('Agent identifier is required');
    await expect(manager.execute('missing-agent', {} as never, {} as never)).rejects.toThrow('Agent not registered: missing-agent');
  });
});
