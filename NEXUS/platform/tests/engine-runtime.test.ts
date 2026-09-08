import { describe, expect, it } from 'vitest';

import { createEngineManager } from '../src/engines/core/index.js';

describe('engine runtime', () => {
  it('manages engine lifecycle', async () => {
    const manager = createEngineManager();
    expect(typeof manager.health).toBe('function');
  });
});
