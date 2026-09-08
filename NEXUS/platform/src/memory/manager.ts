import type {
  MemoryContext,
  MemoryManager,
  MemoryProvider,
  MemoryRecord,
  MemoryRegistry,
  MemorySnapshot,
} from './types.js';

export const createMemoryRegistry = (): MemoryRegistry => {
  const providers = new Map<string, MemoryProvider>();

  return {
    register: (name, provider) => {
      providers.set(name, provider);
    },
    get: (name) => providers.get(name),
  };
};

export const createMemoryManager = (registry: MemoryRegistry = createMemoryRegistry()): MemoryManager => ({
  register: (name, provider) => {
    registry.register(name, provider);
  },
  store: async (record: MemoryRecord, context: MemoryContext) => {
    const provider = registry.get(context.collection ?? record.metadata.id);
    if (provider) {
      await provider.store(record, context);
    }
  },
  recall: async (context: MemoryContext) => {
    const provider = registry.get(context.collection ?? context.type);
    return provider ? provider.recall(context) : [];
  },
  search: async (_query: string, _context: MemoryContext) => [],
  archive: async (_recordId: string) => undefined,
  summarize: async (_context: MemoryContext) => '',
  forget: async (_recordId: string) => undefined,
  expire: async (_recordId: string) => undefined,
  restore: async (_snapshot: MemorySnapshot) => undefined,
  version: async (_recordId: string) => [],
});
