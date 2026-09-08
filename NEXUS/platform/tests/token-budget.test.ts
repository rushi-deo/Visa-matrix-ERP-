import { describe, expect, it } from 'vitest';

import { createTokenCounter } from '../src/runtime/ai/index.js';

describe('token budget', () => {
  it('counts tokens', () => {
    expect(createTokenCounter().count('hello world')).toBe(2);
  });
});

