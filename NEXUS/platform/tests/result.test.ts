import { describe, expect, it } from 'vitest';

import { failure, flatMapResult, mapResult, matchResult, success } from '../src/shared/result.js';

describe('result', () => {
  it('supports success and failure wrappers', () => {
    expect(success(1)).toEqual({ isSuccess: true, isFailure: false, value: 1 });
    expect(failure(new Error('boom')).isFailure).toBe(true);
  });

  it('maps and flatMaps results', () => {
    const mapped = mapResult(success(2), (value) => value * 2);
    const chained = flatMapResult(mapped, (value) => success(value + 1));

    expect(chained).toEqual({ isSuccess: true, isFailure: false, value: 5 });
  });

  it('matches result branches', () => {
    expect(matchResult(success('ok'), {
      success: (value) => value.toUpperCase(),
      failure: () => 'nope',
    })).toBe('OK');
  });
});
