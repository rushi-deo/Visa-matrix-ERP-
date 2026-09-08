import type { PlatformConfig } from '../config/types.js';
import type { Container } from '../shared/di.js';
import type { Logger } from '../shared/logger.js';

export type RuntimeStage =
  | 'initialized'
  | 'configured'
  | 'built'
  | 'started'
  | 'ready'
  | 'stopped'
  | 'restarted'
  | 'shutdown';

export type RuntimeContext = Readonly<{
  config: PlatformConfig;
  logger: Logger;
  container: Container;
}>;

export interface Application {
  initialize(): Promise<void>;
  configure(): Promise<void>;
  build(): Promise<void>;
  start(): Promise<void>;
  ready(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface PlatformRuntime extends Application {
  getStage(): RuntimeStage;
  getContext(): RuntimeContext;
}

export interface Bootstrap {
  bootstrap(): Promise<PlatformRuntime>;
}

export interface LifecycleManager {
  initialize(): Promise<void>;
  configure(): Promise<void>;
  build(): Promise<void>;
  start(): Promise<void>;
  ready(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface StartupManager {
  start(): Promise<void>;
}

export interface ShutdownManager {
  stop(): Promise<void>;
}

export interface ApplicationHost {
  run(): Promise<void>;
  stop(): Promise<void>;
}
