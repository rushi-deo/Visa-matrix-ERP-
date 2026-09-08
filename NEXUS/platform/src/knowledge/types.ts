import type { Result } from '../shared/result.js';

export type KnowledgeVersion = string;

export type KnowledgeMetadata = Readonly<{
  id: string;
  version: KnowledgeVersion;
  source?: string;
  tags: readonly string[];
  createdAt: string;
  updatedAt: string;
}>;

export type KnowledgeDocument = Readonly<{
  metadata: KnowledgeMetadata;
  title: string;
  content: string;
}>;

export type KnowledgeChunk = Readonly<{
  id: string;
  documentId: string;
  index: number;
  content: string;
  metadata: KnowledgeMetadata;
}>;

export type KnowledgeCollection = Readonly<{
  name: string;
  version: KnowledgeVersion;
  documents: readonly KnowledgeDocument[];
}>;

export type KnowledgeQuery = Readonly<{
  text: string;
  collection?: string;
  limit?: number;
  offset?: number;
}>;

export type KnowledgeResult<T> = Result<T>;

export interface KnowledgeSource {
  readonly name: string;
  import(): Promise<readonly KnowledgeDocument[]>;
}

export interface KnowledgeProvider {
  readonly name: string;
  register(source: KnowledgeSource): Promise<void>;
  import(source: KnowledgeSource): Promise<readonly KnowledgeDocument[]>;
}

export interface KnowledgeStore {
  register(collection: KnowledgeCollection): Promise<void>;
  import(collection: KnowledgeCollection, documents: readonly KnowledgeDocument[]): Promise<void>;
  retrieve(id: string): Promise<KnowledgeDocument | undefined>;
  update(document: KnowledgeDocument): Promise<void>;
  delete(id: string): Promise<void>;
  version(documentId: string): Promise<readonly KnowledgeDocument[]>;
}

export interface KnowledgeIndexer {
  index(document: KnowledgeDocument): Promise<readonly KnowledgeChunk[]>;
}

export interface KnowledgeRetriever {
  retrieve(query: KnowledgeQuery): Promise<KnowledgeResult<readonly KnowledgeDocument[]>>;
}

export type PipelineStage =
  | 'import'
  | 'validate'
  | 'normalize'
  | 'chunk'
  | 'index'
  | 'store'
  | 'retrieve'
  | 'version'
  | 'archive';

export interface KnowledgePipeline {
  readonly stages: readonly PipelineStage[];
}

export interface KnowledgeRegistry {
  register(name: string, provider: KnowledgeProvider): void;
  get(name: string): KnowledgeProvider | undefined;
}

export interface KnowledgeManager {
  register(name: string, provider: KnowledgeProvider): void;
  import(sourceName: string): Promise<readonly KnowledgeDocument[]>;
  index(document: KnowledgeDocument): Promise<readonly KnowledgeChunk[]>;
  search(query: KnowledgeQuery): Promise<KnowledgeResult<readonly KnowledgeDocument[]>>;
  retrieve(query: KnowledgeQuery): Promise<KnowledgeResult<readonly KnowledgeDocument[]>>;
  update(document: KnowledgeDocument): Promise<void>;
  delete(id: string): Promise<void>;
  version(documentId: string): Promise<readonly KnowledgeDocument[]>;
}
