import type { IQuery } from '../types.js';

export interface QueryBus {
  execute<TQuery extends IQuery, TResult>(query: TQuery): Promise<TResult>;
}

export interface QueryHandler<TQuery extends IQuery, TResult> {
  handle(input: TQuery): Promise<TResult> | TResult;
}

export interface QueryRegistry {
  register<TQuery extends IQuery, TResult>(name: string, handler: QueryHandler<TQuery, TResult>): void;
  get(name: string): QueryHandler<IQuery, unknown> | undefined;
}
