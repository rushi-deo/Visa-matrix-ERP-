# 06. Knowledge

## Current State

Knowledge support is modeled in [platform/src/knowledge](../../platform/src/knowledge) and is structured as a registry of knowledge providers plus a knowledge pipeline.

## Core Types

The knowledge layer defines:

- `KnowledgeDocument`
- `KnowledgeChunk`
- `KnowledgeQuery`
- `KnowledgeProvider`
- `KnowledgeManager`
- `KnowledgePipeline`

These are defined in [platform/src/knowledge/types.ts](../../platform/src/knowledge/types.ts).

## Current Implementation

The implementation in [platform/src/knowledge/manager.ts](../../platform/src/knowledge/manager.ts) provides:

- `createKnowledgeRegistry`
- `createKnowledgeManager`
- `createKnowledgePipeline`

The knowledge pipeline exposes stages including import, validate, normalize, chunk, index, store, retrieve, version, and archive.

## What Is Implemented Today

- The knowledge subsystem has a concrete pipeline stage model.
- A manager and registry exist.
- Import and indexing entry points are defined.

## What Is Planned

- The current manager uses a default pipeline runner that returns no chunks.
- Search and retrieve operations currently return success values with empty results.
- The knowledge subsystem is not yet integrated into the orchestrator execution path.

## Architectural Note

Knowledge is represented as a first-class platform concept, but the current implementation is still mostly a schema and registry foundation rather than a populated knowledge service.
