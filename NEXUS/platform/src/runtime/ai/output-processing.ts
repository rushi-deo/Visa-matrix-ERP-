import type { AIExecutionResult } from './types.js';

export interface ResponseParser {
  parse(output: string): string;
}

export interface ResponseValidator {
  validate(output: string): boolean;
}

export interface ResponseFormatter {
  format(output: string): AIExecutionResult;
}

export interface CitationManager {
  cite(output: string): string;
}

export interface ConfidenceAggregator {
  aggregate(scores: readonly number[]): number;
}

export const createResponseParser = (): ResponseParser => ({
  parse: (output) => output,
});

export const createResponseValidator = (): ResponseValidator => ({
  validate: () => true,
});

export const createResponseFormatter = (): ResponseFormatter => ({
  format: (output) => ({ ok: true, output }),
});

export const createCitationManager = (): CitationManager => ({
  cite: (output) => output,
});

export const createConfidenceAggregator = (): ConfidenceAggregator => ({
  aggregate: (scores) => (scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0),
});
