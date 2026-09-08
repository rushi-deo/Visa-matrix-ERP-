import type { ICommand } from '../types.js';

export interface CommandBus {
  execute<TCommand extends ICommand, TResult>(command: TCommand): Promise<TResult>;
}

export interface CommandHandler<TCommand extends ICommand, TResult> {
  handle(input: TCommand): Promise<TResult> | TResult;
}

export interface CommandRegistry {
  register<TCommand extends ICommand, TResult>(
    name: string,
    handler: CommandHandler<TCommand, TResult>,
  ): void;
  get(name: string): CommandHandler<ICommand, unknown> | undefined;
}
