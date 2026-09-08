import type { AIExecutionContext } from './types.js';

export interface ContextWindow {
  size: number;
}

export interface ContextCompressor {
  compress(context: AIExecutionContext, window: ContextWindow): AIExecutionContext;
}

export interface ContextValidator {
  validate(context: AIExecutionContext): boolean;
}

export interface ContextAssembler {
  assemble(context: AIExecutionContext): AIExecutionContext;
}

export interface ContextBuilder {
  build(context: AIExecutionContext): AIExecutionContext;
}

export const createContextBuilder = (): ContextBuilder => ({
  build: (context) => context,
});

export const createContextAssembler = (): ContextAssembler => ({
  assemble: (context) => context,
});

export const createContextValidator = (): ContextValidator => ({
  validate: () => true,
});

export const createContextCompressor = (): ContextCompressor => ({
  compress: (context) => context,
});
