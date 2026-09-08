import { failure, success } from '../shared/result.js';
import type {
  KnowledgeChunk,
  KnowledgeDocument,
  KnowledgeManager,
  KnowledgePipeline,
  KnowledgeProvider,
  KnowledgeQuery,
  KnowledgeRegistry,
  KnowledgeResult,
  KnowledgeStore,
} from './types.js';

export const createKnowledgeRegistry = (): KnowledgeRegistry => {
  const providers = new Map<string, KnowledgeProvider>();

  return {
    register: (name, provider) => {
      providers.set(name, provider);
    },
    get: (name) => providers.get(name),
  };
};

export interface KnowledgePipelineRunner {
  run(document: KnowledgeDocument): Promise<readonly KnowledgeChunk[]>;
}

const createInMemoryKnowledgeStore = (): KnowledgeStore => {
  const documents = new Map<string, KnowledgeDocument>();

  return {
    register: async () => undefined,
    import: async (_collection, importedDocuments) => {
      for (const document of importedDocuments) {
        documents.set(document.metadata.id, document);
      }
    },
    retrieve: async (id) => documents.get(id),
    update: async (document) => {
      documents.set(document.metadata.id, document);
    },
    delete: async (id) => {
      documents.delete(id);
    },
    version: async (documentId) => {
      const document = documents.get(documentId);
      return document ? [document] : [];
    },
  };
};

const queryTerms = (text: string): readonly string[] =>
  [...new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? [])];

const scoreDocument = (document: KnowledgeDocument, terms: readonly string[]): number => {
  const searchableText = [
    document.title,
    document.content,
    ...document.metadata.tags,
    document.metadata.source ?? '',
  ].join(' ').toLowerCase();

  return terms.reduce((score, term) => score + (searchableText.includes(term) ? 1 : 0), 0);
};

export const createKnowledgePipeline = (): KnowledgePipeline => ({
  stages: ['import', 'validate', 'normalize', 'chunk', 'index', 'store', 'retrieve', 'version', 'archive'],
});

export const createKnowledgeManager = (
  registry: KnowledgeRegistry = createKnowledgeRegistry(),
  pipeline: KnowledgePipelineRunner = {
    run: async () => [],
  },
  store: KnowledgeStore = createInMemoryKnowledgeStore(),
): KnowledgeManager => {
  const documents = new Map<string, KnowledgeDocument>();
  const search = async (query: KnowledgeQuery): Promise<KnowledgeResult<readonly KnowledgeDocument[]>> => {
    try {
      const terms = queryTerms(query.text);
      if (terms.length === 0) {
        return success([]);
      }

      const offset = Math.max(query.offset ?? 0, 0);
      const limit = Math.max(query.limit ?? documents.size, 0);
      const matches = [...documents.values()]
        .map((document) => ({ document, score: scoreDocument(document, terms) }))
        .filter(({ score }) => score > 0)
        .sort((left, right) => right.score - left.score || left.document.metadata.id.localeCompare(right.document.metadata.id))
        .slice(offset, offset + limit)
        .map(({ document }) => document);

      return success(matches);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  };

  return {
    register: (name, provider) => {
      registry.register(name, provider);
    },
    import: async (sourceName) => {
      const provider = registry.get(sourceName);
      if (!provider) {
        throw new Error(`Knowledge provider not registered: ${sourceName}`);
      }

      const importedDocuments = await provider.import({ name: sourceName, import: async () => [] });
      await store.import({ name: sourceName, version: '1', documents: importedDocuments }, importedDocuments);
      for (const document of importedDocuments) {
        documents.set(document.metadata.id, document);
      }
      return importedDocuments;
    },
    index: async (document) => pipeline.run(document),
    search,
    retrieve: async (query: KnowledgeQuery): Promise<KnowledgeResult<readonly KnowledgeDocument[]>> => {
      const searchResult = await search(query);
      if (searchResult.isFailure) {
        return searchResult;
      }

      try {
        const retrieved = [] as KnowledgeDocument[];
        for (const document of searchResult.value) {
          const storedDocument = await store.retrieve(document.metadata.id);
          if (!storedDocument) {
            return failure(new Error(`Knowledge document not found: ${document.metadata.id}`));
          }
          retrieved.push(storedDocument);
        }
        return success(retrieved);
      } catch (error) {
        return failure(error instanceof Error ? error : new Error(String(error)));
      }
    },
    update: async (document) => {
      await store.update(document);
      documents.set(document.metadata.id, document);
    },
    delete: async (id) => {
      await store.delete(id);
      documents.delete(id);
    },
    version: async (documentId) => store.version(documentId),
  };
};
