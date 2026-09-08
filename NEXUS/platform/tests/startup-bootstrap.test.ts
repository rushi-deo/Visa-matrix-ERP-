import { describe, expect, it } from 'vitest';

import { createStartupBootstrap } from '../src/deployment/bootstrap.js';

describe('startup bootstrap', () => {
  it('creates a startup bootstrap contract', async () => {
    const bootstrap = createStartupBootstrap({
      modules: {},
      providers: { register: () => undefined, get: () => undefined },
      connectors: { register: () => undefined, get: () => undefined },
      tools: { register: () => undefined, execute: async () => ({ ok: true }) },
      workers: {
        register: () => undefined,
        initialize: async () => undefined,
        assign: async () => undefined,
        execute: async () => ({ ok: true }),
        pause: async () => undefined,
        resume: async () => undefined,
        complete: async () => undefined,
        terminate: async () => undefined,
      },
      engines: { register: () => undefined, get: () => undefined },
      plugins: { register: () => undefined, get: () => undefined },
    });

    await expect(bootstrap.registerModules()).resolves.toBeUndefined();
  });
});
