import type { IHandler, IPublisher, ISubscriber } from './types.js';

export interface EventMiddleware<T> {
  before?(event: T): Promise<void> | void;
  after?(event: T): Promise<void> | void;
  onError?(error: unknown, event: T): Promise<void> | void;
}

export type EventPriority = number;
export type DeadLetterQueue<T> = Readonly<{
  enqueue(event: T, error: unknown): Promise<void>;
}>;

export interface EventBus<T> extends IPublisher<T>, ISubscriber<T> {
  dispatch(event: T): Promise<void>;
  use(middleware: EventMiddleware<T>): void;
  replay(events: readonly T[]): Promise<void>;
}

export const createEventBus = <T>(): EventBus<T> => {
  const handlers: Array<Readonly<{ handler: IHandler<T>; priority: number }>> = [];
  const middlewares: EventMiddleware<T>[] = [];

  return {
    use: (middleware) => {
      middlewares.push(middleware);
    },
    subscribe: (handler, priority = 0) => {
      handlers.push({ handler, priority });
      handlers.sort((a, b) => b.priority - a.priority);
    },
    unsubscribe: (handler) => {
      const index = handlers.findIndex((entry) => entry.handler === handler);
      if (index >= 0) {
        handlers.splice(index, 1);
      }
    },
    publish: async (event) => {
      for (const middleware of middlewares) {
        await middleware.before?.(event);
      }

      for (const entry of handlers) {
        try {
          await entry.handler.handle(event);
        } catch (error) {
          for (const middleware of middlewares) {
            await middleware.onError?.(error, event);
          }
          throw error;
        }
      }

      for (const middleware of middlewares) {
        await middleware.after?.(event);
      }
    },
    dispatch: async (event) => {
      await Promise.all(handlers.map((entry) => entry.handler.handle(event)));
    },
    replay: async (events: readonly T[]) => {
      for (const event of events) {
        await Promise.resolve(event);
        await Promise.all(handlers.map((entry) => entry.handler.handle(event)));
      }
    },
  };
};
