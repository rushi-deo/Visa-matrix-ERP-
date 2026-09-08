import type { ICommand } from '../types.js';
import type { CommandBus, CommandHandler, CommandRegistry } from './types.js';

export const createCommandRegistry = (): CommandRegistry => {
  const handlers = new Map<string, CommandHandler<ICommand, unknown>>();

  return {
    register: (name, handler) => {
      handlers.set(name, handler as CommandHandler<ICommand, unknown>);
    },
    get: (name) => handlers.get(name) as CommandHandler<ICommand, unknown> | undefined,
  };
};

export const createCommandBus = (registry: CommandRegistry = createCommandRegistry()): CommandBus => {
  return {
    execute: async <TCommand extends ICommand, TResult>(command: TCommand): Promise<TResult> => {
      const handler = registry.get(command.name) as CommandHandler<TCommand, TResult> | undefined;
      if (!handler) {
        throw new Error(`Command handler not registered: ${command.name}`);
      }

      return Promise.resolve(handler.handle(command)) as Promise<TResult>;
    },
  };
};
