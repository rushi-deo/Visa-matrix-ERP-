import type { ServiceRegistry } from './types.js';

export const createServiceRegistry = (): ServiceRegistry => {
  const services = new Map<string, () => unknown>();

  return {
    register: (name, factory) => {
      services.set(name, factory);
    },
    resolve: <T>(name: string): T | undefined => services.get(name)?.() as T | undefined,
  };
};
