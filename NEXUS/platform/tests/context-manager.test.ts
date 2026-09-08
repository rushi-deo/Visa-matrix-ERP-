import { describe, expect, it } from 'vitest';

import { createContextAssembler, createContextBuilder, createContextCompressor, createContextValidator } from '../src/runtime/ai/index.js';

describe('context manager', () => {
  it('assembles and validates contexts', () => {
    const builder = createContextBuilder();
    const assembler = createContextAssembler();
    const validator = createContextValidator();
    const compressor = createContextCompressor();
    const context = { prompt: { sessionId: 's', variables: [] } } as never;

    expect(validator.validate(context)).toBe(true);
    expect(builder.build(context)).toBe(context);
    expect(assembler.assemble(context)).toBe(context);
    expect(compressor.compress(context, { size: 10 })).toBe(context);
  });
});
