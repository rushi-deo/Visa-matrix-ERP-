import type { KnowledgeDocument, KnowledgeQuery } from './types.js';

export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

export type SearchFilter = Readonly<{
  field: string;
  value: string;
}>;

export type SearchPagination = Readonly<{
  limit: number;
  offset: number;
}>;

export type SearchScore = Readonly<{
  value: number;
}>;

export type SearchRanking = Readonly<{
  score: SearchScore;
  rank: number;
}>;

export interface SearchRequest {
  readonly mode: SearchMode;
  readonly query: KnowledgeQuery;
  readonly filters?: readonly SearchFilter[];
  readonly pagination?: SearchPagination;
}

export interface SearchResult<T> {
  readonly items: readonly T[];
  readonly ranking: readonly SearchRanking[];
}

export interface SearchFramework {
  search(request: SearchRequest): Promise<SearchResult<KnowledgeDocument>>;
}
