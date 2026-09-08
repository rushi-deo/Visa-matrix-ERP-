import { describe, expect, it } from 'vitest';

import {
  createTaskDispatcher,
  createTaskExecutor,
  createTaskManager,
  createTaskQueue,
  createTaskScheduler,
  defaultTaskPolicy,
} from '../src/workforce/index.js';

describe('task framework', () => {
  it('exposes task lifecycle utilities', async () => {
    const task = { id: 'task-1', name: 'demo', priority: 'high' as const, status: 'queued' as const };

    expect(defaultTaskPolicy.validationRequired).toBe(true);
    expect(createTaskManager().register).toBeTypeOf('function');
    expect(createTaskQueue().enqueue).toBeTypeOf('function');
    expect(createTaskScheduler().schedule).toBeTypeOf('function');
    await expect(createTaskDispatcher().dispatch(task)).resolves.toEqual({ ok: true, status: 'queued' });
    await expect(createTaskExecutor().execute(task)).resolves.toEqual({ ok: true, status: 'queued' });
  });
});
