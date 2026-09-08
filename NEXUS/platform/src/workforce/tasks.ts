import type { Task, TaskDispatcher, TaskEngine, TaskExecutor, TaskManager, TaskPolicy, TaskQueue, TaskScheduler } from './types.js';

export const createTaskManager = (): TaskManager => ({
  register: (_task) => undefined,
  list: () => [],
});

export const createTaskQueue = (): TaskQueue => ({
  enqueue: (_task) => undefined,
  dequeue: () => undefined,
});

export const createTaskScheduler = (): TaskScheduler => ({
  schedule: (_task) => undefined,
});

export const createTaskDispatcher = (): TaskDispatcher => ({
  dispatch: async (task: Task) => ({ ok: true, status: task.status }),
});

export const createTaskExecutor = (): TaskExecutor => ({
  execute: async (task: Task) => ({ ok: true, status: task.status }),
});

export const createTaskEngine = (): TaskEngine => {
  const queue = createTaskQueue();
  const scheduler = createTaskScheduler();
  const dispatcher = createTaskDispatcher();
  const executor = createTaskExecutor();

  return { queue, scheduler, dispatcher, executor };
};

export const defaultTaskPolicy: TaskPolicy = {
  validationRequired: true,
  authorizationRequired: true,
  retryEnabled: true,
  rollbackEnabled: false,
};
