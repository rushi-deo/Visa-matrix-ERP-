import { describe, expect, it } from 'vitest';

import { createPluginManager } from '../src/plugins/index.js';

describe('plugins', () => {
  it('installs and enables plugins', async () => {
    const manager = createPluginManager();
    const calls: string[] = [];

    await manager.install({
      manifest: {
        name: 'sample',
        version: '1.0.0',
        type: 'tool',
        dependencies: [],
      },
      install: async () => calls.push('install'),
      enable: async () => calls.push('enable'),
      disable: async () => calls.push('disable'),
      unload: async () => calls.push('unload'),
      update: async () => calls.push('update'),
    });

    await manager.enable('sample');
    expect(calls).toContain('enable');
  });
});
