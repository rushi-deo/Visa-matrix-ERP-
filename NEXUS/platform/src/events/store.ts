export interface EventStore<TEvent> {
  append(event: TEvent): Promise<void>;
  load(streamId: string): Promise<readonly TEvent[]>;
  replay(streamId: string, handler: (event: TEvent) => Promise<void> | void): Promise<void>;
}
