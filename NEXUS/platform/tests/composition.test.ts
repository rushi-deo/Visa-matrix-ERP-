import { describe, expect, it } from 'vitest';

import { createPlatformComposer } from '../src/composition/index.js';

describe('composition', () => {
  it('creates platform composers', () => {
    const composer = createPlatformComposer({
      api: { start: async () => undefined, stop: async () => undefined },
      routes: { register: () => undefined },
      middleware: { register: () => undefined },
      brain: { register: () => undefined, get: () => undefined },
      memory: {
        register: () => undefined,
        store: async () => undefined,
        recall: async () => [],
        search: async () => [],
        archive: async () => undefined,
        summarize: async () => '',
        forget: async () => undefined,
        expire: async () => undefined,
        restore: async () => undefined,
        version: async () => [],
      },
      knowledge: {
        register: () => undefined,
        import: async () => [],
        index: async () => [],
        search: async () => ({ ok: true, value: [] }),
        retrieve: async () => ({ ok: true, value: [] }),
        update: async () => undefined,
        delete: async () => undefined,
        version: async () => [],
      },
      workforce: {
        register: () => undefined,
        initialize: async () => undefined,
        assign: async () => undefined,
        execute: async () => ({ ok: true }),
        pause: async () => undefined,
        resume: async () => undefined,
        complete: async () => undefined,
        terminate: async () => undefined,
      },
      automation: { register: () => undefined, run: async () => ({ ok: true }) },
      tools: { register: () => undefined, execute: async () => ({ ok: true }) },
      engines: { register: () => undefined, get: () => undefined },
      providers: { register: () => undefined, get: () => undefined },
      connectors: { register: () => undefined, get: () => undefined },
      plugins: { register: () => undefined, get: () => undefined },
      deployment: { name: 'dev', environment: 'development' },
    });

    expect(composer.service.compose).toBeTypeOf('function');
  });
});
