import type { Kernel,PlatformHost } from './types.js';

export const createPlatformHost = (kernel: Kernel): PlatformHost => ({
  start: async () => {
    await kernel.start();
  },
  stop: async () => {
    await kernel.stop();
  },
});
