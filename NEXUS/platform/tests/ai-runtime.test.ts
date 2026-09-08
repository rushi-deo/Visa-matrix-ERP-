import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/index.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { createAIExecutionManager,createAIRuntime } from '../src/runtime/ai/index.js';
import { createLoggerFactory } from '../src/shared/logger.js';

describe('ai runtime', () => {
  it('executes an AI request', async () => {
    const runtime = createAIRuntime();
    const result = await runtime.execute({
      runtime: {
        config: createPlatformConfig(),
        logger: createLoggerFactory('json'),
        container: createContainer(),
      },
      brain: {
        knowledge: undefined as never,
        memory: undefined as never,
        runtime: undefined as never,
        engines: undefined as never,
        plugins: undefined as never,
        events: undefined as never,
        session: { id: 'session-1', createdAt: '', updatedAt: '' },
      },
      knowledge: undefined as never,
      memory: undefined as never,
      prompt: { sessionId: 'session-1', variables: [] },
      provider: { register: () => undefined, get: () => undefined, select: () => { throw new Error('not used'); } },
    });

    expect(result.ok).toBe(true);
    await expect(createAIExecutionManager().history('session-1')).resolves.toEqual({ sessionId: 'session-1', results: [] });
  });
});
