import { describe, expect, it } from 'vitest';

import type { Metrics } from '../src/observability/index.js';

describe('observability', () => {
  it('exposes metrics contracts', () => {
    const metrics: Metrics = {
      counter: () => ({ increment: () => undefined }),
      timer: () => ({ start: () => undefined, stop: () => undefined }),
      histogram: () => ({ observe: () => undefined }),
    };

    expect(metrics.counter('requests').increment).toBeTypeOf('function');
  });
});
