import type { EventMiddleware } from './event-bus.js';

export const createLoggingMiddleware = <T>(logger: { info(message: string, context?: Record<string, unknown>): void }): EventMiddleware<T> => ({
  before: (event) => logger.info('event.before', { event }),
  after: (event) => logger.info('event.after', { event }),
});

export const createValidationMiddleware = <T>(validator: (event: T) => void): EventMiddleware<T> => ({
  before: (event) => validator(event),
});

export const createTimingMiddleware = <T>(timer: { info(message: string, context?: Record<string, unknown>): void }): EventMiddleware<T> => ({
  after: (event) => timer.info('event.completed', { event, durationMs: 0 }),
});

export const createTracingMiddleware = <T>(tracer: { info(message: string, context?: Record<string, unknown>): void }): EventMiddleware<T> => ({
  before: (event) => tracer.info('event.trace.start', { event }),
});

export const createRetryHooks = <T>(
  hooks: Readonly<{
    onError?: (error: unknown, event: T) => void;
  }>,
): EventMiddleware<T> => ({
  onError: (error, event) => hooks.onError?.(error, event),
});
