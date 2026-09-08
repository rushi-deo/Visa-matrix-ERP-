import { createAIRuntime } from './runtime.js';

export const createAIFactory = () => ({
  createRuntime: () => createAIRuntime(),
});
