import { describe, expect, it } from 'vitest';

import { createMetrics } from '../src/observability/index.js';

describe('metrics', () => {
  it('creates metric primitives', () => {
    const metrics = createMetrics();
    expect(metrics.counter('x').increment).toBeTypeOf('function');
  });
});
