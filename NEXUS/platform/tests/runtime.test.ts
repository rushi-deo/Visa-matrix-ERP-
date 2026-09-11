import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/index.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { createBootstrap, createPlatformRuntime } from '../src/runtime/index.js';
import { createLoggerFactory } from '../src/shared/logger.js';

describe('runtime', () => {
  it('progresses through lifecycle stages', async () => {
    const runtime = createPlatformRuntime({
      config: createPlatformConfig(),
      logger: createLoggerFactory('json'),
      container: createContainer(),
    });

    await runtime.start();
    expect(runtime.getStage()).toBe('started');
    await runtime.ready();
    expect(runtime.getStage()).toBe('ready');
  });

  it('bootstraps a runtime instance', async () => {
    const runtime = await createBootstrap().bootstrap();
    expect(runtime.getContext().config.port).toBeTypeOf('number');
    expect(runtime.getStage()).toBe('ready');
  });
});
