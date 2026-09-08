export type MemoryType =
  | 'session'
  | 'conversation'
  | 'user'
  | 'organization'
  | 'knowledge'
  | 'working'
  | 'long-term'
  | 'temporary';

export type MemoryMetadata = Readonly<{
  id: string;
  version: string;
  type: MemoryType;
  createdAt: string;
  updatedAt: string;
  tags: readonly string[];
}>;

export type MemoryRecord = Readonly<{
  metadata: MemoryMetadata;
  content: string;
}>;

export type MemoryCollection = Readonly<{
  name: string;
  version: string;
  records: readonly MemoryRecord[];
}>;

export type MemorySnapshot = Readonly<{
  collection: string;
  version: string;
  records: readonly MemoryRecord[];
}>;

export type MemoryContext = Readonly<{
  subjectId?: string;
  type: MemoryType;
  collection?: string;
}>;

export interface MemoryProvider {
  readonly name: string;
  store(record: MemoryRecord, context: MemoryContext): Promise<void>;
  recall(context: MemoryContext): Promise<readonly MemoryRecord[]>;
}

export interface MemoryStore {
  store(record: MemoryRecord, context: MemoryContext): Promise<void>;
  recall(context: MemoryContext): Promise<readonly MemoryRecord[]>;
  search(query: string, context: MemoryContext): Promise<readonly MemoryRecord[]>;
  archive(recordId: string): Promise<void>;
  summarize(context: MemoryContext): Promise<string>;
  forget(recordId: string): Promise<void>;
  expire(recordId: string): Promise<void>;
  restore(snapshot: MemorySnapshot): Promise<void>;
  version(recordId: string): Promise<readonly MemoryRecord[]>;
}

export interface MemoryRetriever {
  retrieve(context: MemoryContext): Promise<readonly MemoryRecord[]>;
}

export interface MemoryCompressor {
  compress(record: MemoryRecord): Promise<MemoryRecord>;
}

export interface MemoryRegistry {
  register(name: string, provider: MemoryProvider): void;
  get(name: string): MemoryProvider | undefined;
}

export interface MemoryManager {
  register(name: string, provider: MemoryProvider): void;
  store(record: MemoryRecord, context: MemoryContext): Promise<void>;
  recall(context: MemoryContext): Promise<readonly MemoryRecord[]>;
  search(query: string, context: MemoryContext): Promise<readonly MemoryRecord[]>;
  archive(recordId: string): Promise<void>;
  summarize(context: MemoryContext): Promise<string>;
  forget(recordId: string): Promise<void>;
  expire(recordId: string): Promise<void>;
  restore(snapshot: MemorySnapshot): Promise<void>;
  version(recordId: string): Promise<readonly MemoryRecord[]>;
}
