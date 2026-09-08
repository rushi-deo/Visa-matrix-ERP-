import { describe, expect, it } from 'vitest';

import { createInferencePipeline, createIntelligenceManager } from '../src/intelligence/index.js';

describe('intelligence', () => {
  it('creates the inference pipeline', () => {
    expect(createInferencePipeline().stages).toEqual([
      'reason',
      'plan',
      'execute',
      'evaluate',
      'feedback',
      'learn',
      'retry',
    ]);
  });

  it('registers intelligence engines', () => {
    const manager = createIntelligenceManager();
    const engine = { infer: async () => undefined };

    manager.register('default', engine);

    expect(manager.get('default')).toBe(engine);
  });
});
