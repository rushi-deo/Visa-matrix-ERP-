import { describe, expect, it } from 'vitest';

import type { MemoryPolicies } from '../src/memory/index.js';

describe('memory policies', () => {
  it('describes retention and access control policies', () => {
    const policies: MemoryPolicies = {
      retention: { maxAgeDays: 30 },
      expiration: { ttlDays: 7 },
      compression: { enabled: true },
      encryption: { enabled: false },
      priority: { level: 1 },
      accessControl: { roles: ['platform'] },
      isolation: { scope: 'tenant' },
    };

    expect(policies.retention.maxAgeDays).toBe(30);
  });
});
