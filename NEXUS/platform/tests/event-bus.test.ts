import { describe, expect, it, vi } from 'vitest';

import { createEventBus } from '../src/events/event-bus.js';

describe('event bus', () => {
  it('publishes and replays events', async () => {
    const bus = createEventBus<{ id: string }>();
    const handler = vi.fn(async () => undefined);
    bus.subscribe({ handle: handler }, 10);

    await bus.publish({ id: '1' });
    await bus.replay([{ id: '2' }]);

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
