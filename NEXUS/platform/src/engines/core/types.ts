import type { Container } from '../../shared/di.js';

export type EngineResult<T> = Readonly<{
  ok: boolean;
  value?: T;
  error?: Error;
}>;

export interface EngineContext {
  readonly name: string;
  readonly version: string;
  readonly container: Container;
}

export interface Engine {
  initialize(): Promise<void>;
  start(): Promise<void>;
  execute(): Promise<EngineResult<unknown>>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  dispose(): Promise<void>;
  health(): Promise<EngineResult<unknown>>;
}

export interface EngineFactory {
  create(context: EngineContext): Engine;
}

export interface EngineRegistry {
  register(name: string, factory: EngineFactory): void;
  get(name: string): EngineFactory | undefined;
}

export interface EngineManager {
  initialize(name: string, context: EngineContext): Promise<void>;
  start(name: string, context: EngineContext): Promise<void>;
  execute(name: string, context: EngineContext): Promise<EngineResult<unknown>>;
  pause(name: string, context: EngineContext): Promise<void>;
  resume(name: string, context: EngineContext): Promise<void>;
  stop(name: string, context: EngineContext): Promise<void>;
  dispose(name: string, context: EngineContext): Promise<void>;
  health(name: string, context: EngineContext): Promise<EngineResult<unknown>>;
}
