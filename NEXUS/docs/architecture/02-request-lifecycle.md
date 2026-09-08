# 02. Request Lifecycle

## Current State

The repository contains an orchestrator request lifecycle model, but the current implementation is a lightweight scaffold rather than a fully executed request pipeline.

## Lifecycle Shape in Code

The orchestration layer defines a request flow in [platform/src/orchestration/pipeline.ts](../../platform/src/orchestration/pipeline.ts) and [platform/src/orchestration/manager.ts](../../platform/src/orchestration/manager.ts):

1. Validate
2. Plan
3. Execute
4. Observe
5. Complete

The orchestrator executes these stages in order via the `execute` method.

## Request Context

Requests are represented by the `ExecutionRequest` type in [platform/src/orchestration/types.ts](../../platform/src/orchestration/types.ts). The corresponding execution context is also defined there and carries:

- request
- runtime
- brain
- memory
- knowledge
- worker
- workflow
- tools

## What Is Implemented Today

- A request routing function exists.
- A pipeline contract exists for the major lifecycle stages.
- The orchestrator calls each stage in sequence.

## What Is Planned

- The request router currently creates an empty context with placeholder values rather than resolving real runtime dependencies.
- The lifecycle stages return simple success values and do not perform real work.
- There is no recovery path invoked on failure.
- There is no integration with real agents, tools, memory, knowledge, workflows, or event publication at this stage.

## Practical Interpretation

At present, the request lifecycle should be read as a documented execution model and a scaffold for future implementation, not as a fully operational runtime path.
