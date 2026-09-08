# 05. Memory

## Current State

Memory support is modeled in [platform/src/memory](../../platform/src/memory) and is defined through provider-oriented interfaces and a memory manager.

## Core Types

The memory subsystem exposes:

- `MemoryProvider`
- `MemoryStore`
- `MemoryManager`
- `MemoryRecord`
- `MemoryContext`
- `MemorySnapshot`

These are defined in [platform/src/memory/types.ts](../../platform/src/memory/types.ts).

## Current Implementation

The implementation in [platform/src/memory/manager.ts](../../platform/src/memory/manager.ts) provides:

- `createMemoryRegistry`
- `createMemoryManager`

The manager registers providers and routes store/recall operations to the registered provider when available.

## What Is Implemented Today

- A registry-based memory provider model exists.
- Store and recall operations are defined.
- The manager exposes the main memory lifecycle operations in the interface.

## What Is Planned

- Many operations such as search, archive, summarize, forget, expire, restore, and version are currently stubbed or return empty results.
- The subsystem is not yet connected to orchestrator execution in a meaningful way.

## Architectural Note

Memory is part of the intended platform architecture, but the current implementation is a foundational layer rather than a fully working memory service.
