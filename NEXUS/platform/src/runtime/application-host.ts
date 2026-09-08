import type { ApplicationHost, PlatformRuntime } from './types.js';

export const createApplicationHost = (runtime: PlatformRuntime): ApplicationHost => ({
  run: async () => {
    await runtime.initialize();
    await runtime.configure();
    await runtime.build();
    await runtime.start();
    await runtime.ready();
  },
  stop: async () => {
    await runtime.stop();
    await runtime.shutdown();
  },
});
