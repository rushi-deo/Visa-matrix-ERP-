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

export interface Tracing {
  startSpan(name: string, correlationId?: string): void;
}

export interface Telemetry {
  record(event: string, correlationId?: string): void;
}

export interface Diagnostics {
  capture(message: string): void;
}

export interface Profiler {
  start(name: string): void;
  stop(name: string): void;
}
