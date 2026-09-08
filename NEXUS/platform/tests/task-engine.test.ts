import { describe, expect, it } from 'vitest';

import { createTaskEngine } from '../src/workforce/tasks.js';

describe('task engine', () => {
  it('exposes task engine components', () => {
    const engine = createTaskEngine();
    expect(engine.queue.dequeue).toBeTypeOf('function');
  });
});
