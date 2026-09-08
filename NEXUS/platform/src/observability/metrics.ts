export type Counter = Readonly<{
  increment(value?: number): void;
}>;

export type Timer = Readonly<{
  start(): void;
  stop(): void;
}>;

export type Histogram = Readonly<{
  observe(value: number): void;
}>;

export interface Metrics {
  counter(name: string): Counter;
  timer(name: string): Timer;
  histogram(name: string): Histogram;
}

export interface ExecutionMetrics {
  attempts: number;
  durationMs: number;
}

export interface MemoryMetrics {
  records: number;
}

export interface PluginMetrics {
  enabled: number;
}

export interface WorkflowMetrics {
  executions: number;
}

export const createMetrics = (): Metrics => ({
  counter: () => ({ increment: () => undefined }),
  timer: () => ({ start: () => undefined, stop: () => undefined }),
  histogram: () => ({ observe: () => undefined }),
});
