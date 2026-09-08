import { describe, expect, it, vi } from 'vitest';

import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { KnowledgeManagerToken, RuntimeToken } from '../src/infrastructure/container/service-tokens.js';
import { createKnowledgeManager, createKnowledgePipeline, createKnowledgeRegistry } from '../src/knowledge/index.js';
import type { KnowledgeDocument, KnowledgeStore } from '../src/knowledge/types.js';
import { createRequestCoordinator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';

const document: KnowledgeDocument = {
  metadata: { id: 'doc-1', version: '1', source: 'docs', tags: ['billing'], createdAt: 'now', updatedAt: 'now' },
  title: 'Billing policy',
  content: 'Invoices are issued on the first day of each month.',
};

describe('knowledge platform', () => {
  it('registers providers in the registry', () => {
    const registry = createKnowledgeRegistry();
    const provider = {
      name: 'docs',
      register: async () => undefined,
      import: async () => [],
    };

    registry.register('docs', provider);

    expect(registry.get('docs')).toBe(provider);
  });

  it('creates the knowledge pipeline stages', () => {
    const pipeline = createKnowledgePipeline();

    expect(pipeline.stages).toEqual([
      'import',
      'validate',
      'normalize',
      'chunk',
      'index',
      'store',
      'retrieve',
      'version',
      'archive',
    ]);
  });

  it('manages imported knowledge through the manager', async () => {
    const manager = createKnowledgeManager();
    const importSpy = vi.fn(async () => [document]);

    manager.register('docs', {
      name: 'docs',
      register: async () => undefined,
      import: importSpy,
    });

    await manager.import('docs');

    expect(importSpy).toHaveBeenCalled();

    const searchResult = await manager.search({ text: 'monthly invoices' });
    expect(searchResult).toEqual({ isSuccess: true, isFailure: false, value: [document] });

    const retrieveResult = await manager.retrieve({ text: 'billing policy' });
    expect(retrieveResult).toEqual({ isSuccess: true, isFailure: false, value: [document] });
  });

  it('returns an empty result when no knowledge is imported', async () => {
    const manager = createKnowledgeManager();

    expect(await manager.search({ text: 'anything' })).toEqual({ isSuccess: true, isFailure: false, value: [] });
    expect(await manager.retrieve({ text: 'anything' })).toEqual({ isSuccess: true, isFailure: false, value: [] });
  });

  it('returns retrieval failures from the configured store', async () => {
    const store: KnowledgeStore = {
      register: async () => undefined,
      import: async () => undefined,
      retrieve: async () => {
        throw new Error('store unavailable');
      },
      update: async () => undefined,
      delete: async () => undefined,
      version: async () => [],
    };
    const manager = createKnowledgeManager(undefined, undefined, store);

    manager.register('docs', {
      name: 'docs',
      register: async () => undefined,
      import: async () => [document],
    });
    await manager.import('docs');

    const result = await manager.retrieve({ text: 'billing' });

    expect(result.isFailure).toBe(true);
    expect(result.isFailure ? result.error.message : '').toBe('store unavailable');
  });

  it('passes imported knowledge into the execution context', async () => {
    const container = createContainer();
    registerCoreServices(container);
    const runtime = { getContext: () => ({ container }) } as never;
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    const manager = container.resolve(KnowledgeManagerToken);
    manager.register('docs', {
      name: 'docs',
      register: async () => undefined,
      import: async () => [document],
    });
    await manager.import('docs');

    const context = await createRequestCoordinator(container).route({
      id: 'knowledge-request',
      source: 'api',
      payload: { question: 'When are monthly invoices issued?' },
    });
    const loaded = await createExecutionPipeline().loadKnowledge(context);

    expect(loaded.metadata?.knowledge).toEqual([document]);
  });
});
