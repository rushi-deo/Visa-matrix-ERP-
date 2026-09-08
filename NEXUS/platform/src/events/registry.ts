export interface EventRegistry<T> {
  register(name: string, event: T): void;
  get(name: string): T | undefined;
}
