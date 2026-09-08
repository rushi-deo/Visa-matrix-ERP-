import type { PlatformConfig } from '../config/types.js';
import type { PlatformRuntime } from '../runtime/types.js';
import type { Container } from '../shared/di.js';
import type { Logger } from '../shared/logger.js';
import { createKernel } from './kernel.js';
import type { Kernel, KernelBuilder } from './types.js';

export const createKernelBuilder = (): KernelBuilder => {
  let config: PlatformConfig | undefined;
  let logger: Logger | undefined;
  let container: Container | undefined;
  let runtime: PlatformRuntime | undefined;

  const builder: KernelBuilder = {
    withConfig: (next) => {
      config = next;
      return builder;
    },
    withLogger: (next) => {
      logger = next;
      return builder;
    },
    withContainer: (next) => {
      container = next;
      return builder;
    },
    withRuntime: (next) => {
      runtime = next;
      return builder;
    },
    build: (): Kernel => {
      if (!config || !logger || !container || !runtime) {
        throw new Error('Kernel requires config, logger, container, and runtime');
      }

      return createKernel({ config, logger, container, runtime });
    },
  };

  return builder;
};
