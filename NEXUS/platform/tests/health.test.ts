import { describe, expect, it } from 'vitest';

import { createHealthService } from '../src/api/health/service.js';

describe('health service', () => {
  it('returns placeholder healthy responses', () => {
    const service = createHealthService();
    expect(service.getHealth().isSuccess).toBe(true);
    expect(service.getReadiness().isSuccess).toBe(true);
    expect(service.getLiveness().isSuccess).toBe(true);
  });
});
