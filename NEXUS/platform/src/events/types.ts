export type EventLifecycle = 'created' | 'queued' | 'published' | 'consumed' | 'completed' | 'failed';

export type EventMetadata = Readonly<{
  eventId: string;
  timestamp: string;
  correlationId: string;
  requestId: string;
  version: string;
  source: string;
  userId?: string;
}>;

export interface BaseEvent {
  readonly metadata: EventMetadata;
  readonly lifecycle: EventLifecycle;
}

export type IDomainEvent = BaseEvent;
export type IIntegrationEvent = BaseEvent;
export interface ICommand extends BaseEvent {
  readonly name: string;
}

export interface IQuery extends BaseEvent {
  readonly name: string;
}

export interface IHandler<T> {
  handle(input: T): Promise<void> | void;
}
export interface IPublisher<T> {
  publish(input: T): Promise<void>;
}
export interface ISubscriber<T> {
  subscribe(handler: IHandler<T>, priority?: number): void;
  unsubscribe(handler: IHandler<T>): void;
}
