import { describe, expect, it } from 'vitest';

import { createSecurityManager } from '../src/security/index.js';

describe('security', () => {
  it('evaluates policies with framework-only logic', () => {
    const manager = createSecurityManager();

    expect(
      manager.evaluate(
        { roles: ['admin'], permissions: ['platform.read'] },
        {
          name: 'platform-policy',
          roles: [
            { name: 'admin', permissions: [{ name: 'platform.read' }] },
          ],
        },
      ),
    ).toBe(true);
  });
});
