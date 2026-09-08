import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/index.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { createKernel } from '../src/kernel/index.js';
import { createPlatformRuntime } from '../src/runtime/index.js';
import { createLoggerFactory } from '../src/shared/logger.js';

describe('kernel', () => {
  it('builds a kernel with runtime dependencies', async () => {
    const kernel = createKernel({
      config: createPlatformConfig(),
      logger: createLoggerFactory('json'),
      container: createContainer(),
      runtime: createPlatformRuntime({
        config: createPlatformConfig(),
        logger: createLoggerFactory('json'),
        container: createContainer(),
      }),
    });

    await expect(kernel.start()).resolves.toBeUndefined();
  });
});
