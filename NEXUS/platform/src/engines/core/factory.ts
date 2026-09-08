import type { Engine, EngineContext, EngineFactory } from './types.js';

export const createEngineFactory = (builder: (context: EngineContext) => Engine): EngineFactory => ({
  create: builder,
});
