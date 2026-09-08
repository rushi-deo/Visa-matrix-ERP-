import { describe, expect, it } from 'vitest';

import { createPluginLoader } from '../src/plugins/loader.js';

describe('plugin loader', () => {
  it('registers and validates plugins', async () => {
    const loader = createPluginLoader();
    await loader.register({
      manifest: { name: 'demo', version: '1.0.0', type: 'tool', dependencies: [] },
      install: async () => undefined,
      enable: async () => undefined,
      disable: async () => undefined,
      unload: async () => undefined,
      update: async () => undefined,
    });

    await expect(loader.validateVersion('demo', '1.0.0')).resolves.toBe(true);
  });
});
