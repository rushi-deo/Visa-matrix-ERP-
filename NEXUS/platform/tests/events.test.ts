import { describe, expect, it, vi } from 'vitest';

import { createCommandBus, createCommandRegistry } from '../src/events/commands/index.js';
import { createEventBus } from '../src/events/event-bus.js';
import { createQueryBus, createQueryRegistry } from '../src/events/queries/index.js';
import { success } from '../src/shared/result.js';

describe('event platform', () => {
  it('publishes events to subscribers', async () => {
    const bus = createEventBus<{ value: string }>();
    const handler = vi.fn();

    bus.subscribe({ handle: handler });

    await bus.publish({ value: 'event' });

    expect(handler).toHaveBeenCalledWith({ value: 'event' });
  });

  it('dispatches commands through the registry', async () => {
    const registry = createCommandRegistry();
    const bus = createCommandBus(registry);

    registry.register('demo', {
      handle: async () => success('done'),
    });

    await expect(
      bus.execute({
        name: 'demo',
        metadata: {
          eventId: '1',
          timestamp: new Date().toISOString(),
          correlationId: 'corr',
          requestId: 'req',
          version: '1',
          source: 'tests',
        },
        lifecycle: 'created',
      }),
    ).resolves.toEqual(success('done'));
  });

  it('dispatches queries through the registry', async () => {
    const registry = createQueryRegistry();
    const bus = createQueryBus(registry);

    registry.register('lookup', {
      handle: async () => success({ found: true }),
    });

    await expect(
      bus.execute({
        name: 'lookup',
        metadata: {
          eventId: '1',
          timestamp: new Date().toISOString(),
          correlationId: 'corr',
          requestId: 'req',
          version: '1',
          source: 'tests',
        },
        lifecycle: 'created',
      }),
    ).resolves.toEqual(success({ found: true }));
  });
});
