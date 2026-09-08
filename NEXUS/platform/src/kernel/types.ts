import type { PlatformConfig } from '../config/types.js';
import type { PlatformRuntime } from '../runtime/types.js';
import type { Container } from '../shared/di.js';
import type { Logger } from '../shared/logger.js';

export interface ModuleLoader {
  load(): Promise<void>;
}

export interface ModuleRegistry {
  register(name: string, module: KernelModule): void;
  get(name: string): KernelModule | undefined;
}

export interface ServiceRegistry {
  register(name: string, factory: () => unknown): void;
  resolve<T>(name: string): T | undefined;
}

export type KernelModule = Readonly<{
  name: string;
  version: string;
}>;

export interface PlatformHost {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface Kernel {
  readonly config: PlatformConfig;
  readonly logger: Logger;
  readonly container: Container;
  readonly runtime: PlatformRuntime;
  readonly modules: ModuleRegistry;
  readonly services: ServiceRegistry;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface KernelBuilder {
  withConfig(config: PlatformConfig): KernelBuilder;
  withLogger(logger: Logger): KernelBuilder;
  withContainer(container: Container): KernelBuilder;
  withRuntime(runtime: PlatformRuntime): KernelBuilder;
  build(): Kernel;
}
