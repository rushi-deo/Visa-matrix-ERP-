import type { PlatformConfig } from '../config/types.js';
import type { Container } from '../shared/di.js';
import type { Logger } from '../shared/logger.js';
import type { PlatformRuntime, RuntimeContext, RuntimeStage } from './types.js';

const createContext = (config: PlatformConfig, logger: Logger, container: Container): RuntimeContext => ({
  config,
  logger,
  container,
});

export const createPlatformRuntime = (input: {
  config: PlatformConfig;
  logger: Logger;
  container: Container;
}): PlatformRuntime => {
  let stage: RuntimeStage = 'initialized';
  const context = createContext(input.config, input.logger, input.container);

  const transition = (next: RuntimeStage): void => {
    stage = next;
  };

  return {
    getStage: () => stage,
    getContext: () => context,
    initialize: async () => transition('initialized'),
    configure: async () => transition('configured'),
    build: async () => transition('built'),
    start: async () => transition('started'),
    ready: async () => transition('ready'),
    stop: async () => transition('stopped'),
    restart: async () => transition('restarted'),
    shutdown: async () => transition('shutdown'),
  };
};
