import { describe, expect, it } from 'vitest';

import { createToolManager } from '../src/tools/index.js';

describe('tools', () => {
  it('registers and executes tools', async () => {
    const manager = createToolManager();

    manager.register({
      definition: { name: 'tool-1', version: '1.0.0' },
      execute: async () => ({ ok: true }),
    });

    await expect(manager.execute('tool-1', {})).resolves.toEqual({ ok: true });
  });

  it('rejects empty and unknown tool identifiers predictably', async () => {
    const manager = createToolManager();

    await expect(manager.execute('   ', {})).rejects.toThrow('Tool identifier is required');
    await expect(manager.execute('missing-tool', {})).rejects.toThrow('Tool not registered: missing-tool');
  });
});
