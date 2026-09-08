import type { IQuery } from '../types.js';
import type { QueryBus, QueryHandler, QueryRegistry } from './types.js';

export const createQueryRegistry = (): QueryRegistry => {
  const handlers = new Map<string, QueryHandler<IQuery, unknown>>();

  return {
    register: (name, handler) => {
      handlers.set(name, handler as QueryHandler<IQuery, unknown>);
    },
    get: (name) => handlers.get(name) as QueryHandler<IQuery, unknown> | undefined,
  };
};

export const createQueryBus = (registry: QueryRegistry = createQueryRegistry()): QueryBus => {
  return {
    execute: async <TQuery extends IQuery, TResult>(query: TQuery): Promise<TResult> => {
      const handler = registry.get(query.name) as QueryHandler<TQuery, TResult> | undefined;
      if (!handler) {
        throw new Error(`Query handler not registered: ${query.name}`);
      }

      return Promise.resolve(handler.handle(query)) as Promise<TResult>;
    },
  };
};
