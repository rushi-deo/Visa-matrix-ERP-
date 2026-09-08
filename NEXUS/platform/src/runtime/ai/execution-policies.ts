export interface RetryPolicy {
  retries: number;
}

export interface TimeoutPolicy {
  timeoutMs: number;
}

export interface CancellationPolicy {
  cancel(): void;
}

export interface ExecutionFallbackPolicy {
  fallback(): void;
}

export interface StreamingContract {
  stream(): AsyncIterable<string>;
}
