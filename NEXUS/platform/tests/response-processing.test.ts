import { describe, expect, it } from 'vitest';

import { createCitationManager,createConfidenceAggregator, createResponseFormatter, createResponseParser, createResponseValidator } from '../src/runtime/ai/index.js';

describe('response processing', () => {
  it('parses, validates, formats and aggregates responses', () => {
    expect(createResponseParser().parse('ok')).toBe('ok');
    expect(createResponseValidator().validate('ok')).toBe(true);
    expect(createResponseFormatter().format('ok')).toEqual({ ok: true, output: 'ok' });
    expect(createCitationManager().cite('ok')).toBe('ok');
    expect(createConfidenceAggregator().aggregate([0.5, 1])).toBe(0.75);
  });
});
