import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/service.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { RuntimeToken } from '../src/infrastructure/container/service-tokens.js';
import { createOrchestrator, createRequestCoordinator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';
import { createPlatformRuntime } from '../src/runtime/runtime.js';
import { createLoggerFactory } from '../src/shared/logger.js';

describe('PASS8 security & observability', () => {
  it('rejects unauthorized execution safely', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    const orchestrator = createOrchestrator(createExecutionPipeline());
    const router = createRequestCoordinator(container);
    const ctx = await router.route({ id: 'req-pass8-1', source: 'api' });
    const secureContext = {
      ...ctx,
      metadata: {
        ...(ctx.metadata ?? {}),
        authorization: {
          roles: [],
          permissions: [],
        },
      },
      user: { id: 'user-1', roles: ['guest'], permissions: ['execution.read'] },
    };

    const result = await orchestrator.execute(secureContext);

    expect(result.ok).toBe(false);
    expect(result.details).toBe('unauthorized');
  });
});
