import type { PlatformConfig } from '../config/types.js';
import type { PlatformRuntime } from '../runtime/types.js';
import type { Container } from '../shared/di.js';
import type { Logger } from '../shared/logger.js';
import { createModuleRegistry } from './module-registry.js';
import { createServiceRegistry } from './service-registry.js';
import type { Kernel } from './types.js';

export const createKernel = (input: {
  config: PlatformConfig;
  logger: Logger;
  container: Container;
  runtime: PlatformRuntime;
}): Kernel => ({
  config: input.config,
  logger: input.logger,
  container: input.container,
  runtime: input.runtime,
  modules: createModuleRegistry(),
  services: createServiceRegistry(),
  start: async () => input.runtime.start(),
  stop: async () => input.runtime.stop(),
});
