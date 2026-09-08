import { describe, expect, it } from 'vitest';

import { createOkResult } from '../src/shared/result.js';

describe('foundation primitives', () => {
  it('creates a successful result wrapper', () => {
    expect(createOkResult('ready')).toEqual({
      isSuccess: true,
      isFailure: false,
      value: 'ready',
    });
  });
});
