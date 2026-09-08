import { describe, expect, it } from 'vitest';

import { createHealthDashboard } from '../src/orchestration/health.js';

describe('health system', () => {
  it('aggregates runtime health', () => {
    expect(createHealthDashboard().overall.ok).toBe(true);
  });
});
