# NEXUS AI Platform

Production-ready engineering foundation for the NEXUS AI Platform.

## Overview

This repository contains the reusable core platform SDK and event platform that future product modules will build on. It intentionally excludes business logic, AI reasoning, workflows, memory logic, knowledge graph implementation, OCR, vector search, ERP connectors, and authentication or authorization behavior.

## Core SDK

The Core Platform SDK provides the shared runtime building blocks:

- Centralized configuration loading and validation
- Structured logging primitives
- Standardized application errors
- Result wrappers for typed success and failure handling
- Dependency injection primitives
- Health service scaffolding
- Shared constants, utilities, and type helpers

## Platform Runtime

The Runtime layer provides the lifecycle and host abstraction that composes the foundation into an executable platform process:

- Application and platform runtime contracts
- Bootstrap and application host orchestration
- Lifecycle, startup, and shutdown managers
- Runtime context binding for config, logger, and container

## Kernel

The Kernel owns the top-level platform composition:

- Configuration
- Logger
- Container
- Runtime
- Modules
- Plugins
- Engines
- Events

## Module System

The module framework supports install, initialize, start, stop, and unload flows with metadata, versioning, dependencies, and capabilities.

## Engine SDK

The engine SDK provides lifecycle contracts, registry patterns, lazy resolution, and versioned engine creation.

## Plugin Framework

The plugin framework provides install, enable, disable, unload, and update flows for engine, integration, storage, transport, AI provider, and tool plugins.

## Security

Security is framework-only and provides policy, role, permission, audit, and context contracts without authentication or authorization behavior.

## Observability

Observability provides contracts for metrics, tracing, telemetry, diagnostics, and profiling with correlation-aware metadata support.

## Event Platform

The Event Platform provides framework-only event-driven abstractions:

- Event bus
- Command bus
- Query bus
- Event registry
- Event store interface
- Event middleware hooks
- Common event metadata and lifecycle types

## Knowledge Architecture

The Knowledge Platform remains interface-only and is designed for future provider-backed document workflows:

- Knowledge manager and registry contracts
- Knowledge providers, stores, retrievers, and indexers
- Knowledge documents, chunks, metadata, collections, and queries
- Knowledge pipeline stages for import, validation, normalization, chunking, indexing, storage, retrieval, versioning, and archival
- Search abstractions for keyword, semantic, and hybrid search

## Memory Architecture

The Memory Platform provides framework-only abstractions for platform memory use cases:

- Memory manager and registry contracts
- Memory providers, stores, retrievers, and compressors
- Memory records, metadata, collections, and snapshots
- Memory types for session, conversation, user, organization, knowledge, working, long-term, and temporary memory
- Memory policy abstractions for retention, expiration, compression, encryption, priority, access control, and isolation

## Brain Architecture

The Brain framework is interface-first orchestration for platform intelligence flows:

- Brain, brain manager, brain registry, brain session, brain state, and brain context contracts
- Brain pipeline, planner, executor, reasoner, and coordinator contracts
- Lifecycle support for initialize, plan, reason, execute, evaluate, learn, and complete
- Knowledge, memory, runtime, engine, plugin, and event dependencies are injected as interfaces only

## Intelligence Layer

The Intelligence layer provides framework-only intelligence contracts without any LLM provider binding:

- Intelligence manager and engine contracts
- Inference pipeline and execution/decision contexts
- Recommendation, prediction, confidence, and explainability contracts
- Planning, reasoning, decision, and evaluation engine abstractions

## AI Workforce

The AI Workforce layer provides framework-only contracts for worker and agent orchestration:

- Workforce manager, worker registry, worker context, worker profile, worker session, and worker result contracts
- Worker lifecycle support for register, initialize, assign, execute, pause, resume, complete, and terminate
- Agent manager, agent registry, agent context, agent profile, agent task, and agent response contracts
- Agent roles for single agent, multi-agent, supervisor, collaborator, reviewer, and coordinator patterns
- Task framework contracts for queueing, scheduling, dispatching, and executing tasks with policy and status modeling

## Automation Framework

Automation is interface-first and remains free of business workflow implementation:

- Automation manager and workflow registry contracts
- Workflow, workflow step, workflow context, workflow definition, workflow trigger, workflow action, workflow condition, and workflow result contracts
- Trigger support for manual, event, schedule, webhook, API, and state change activation

## Tool Framework

The Tool framework provides reusable execution contracts for platform tools:

- Tool manager, registry, context, definition, executor, result, and permission contracts
- Execution support for validation, authorization contract, retry, timeout, cancellation, and rollback contract surfaces

## Provider Framework

The Provider layer is a placeholder-only abstraction for AI model providers:

- Provider manager and registry contracts
- AI provider, model definition, capabilities, configuration, request, response, health, and metrics contracts
- Placeholder adapters for OpenAI, Anthropic, Google Gemini, Ollama, and Azure OpenAI

## Connector Framework

The Connector layer provides integration contracts for external systems without any concrete transport logic:

- Connector, registry, manager, context, configuration, request, response, health, and factory contracts
- Connector categories for database, REST API, GraphQL, webhook, filesystem, object storage, email, queue, and cache

## SDK Architecture

The SDK layer exposes framework-facing contract surfaces for platform consumers:

- Platform SDK
- Client SDK
- Plugin SDK
- Engine SDK
- Knowledge SDK
- Memory SDK
- Brain SDK
- Automation SDK

## Deployment Architecture

The deployment layer provides environment and readiness contract surfaces only:

- Deployment profiles
- Environment profiles
- Health, readiness, and liveness checks
- Feature flag contracts
- Support for development, testing, staging, and production environments

## Platform Composition

The composition layer wires framework managers together through dependency injection:

- Platform composer
- Service composer
- Module composer
- Engine composer
- Provider composer
- Connector composer
- Workflow composer

## Execution Lifecycle

The orchestration layer provides the runtime execution flow:

- Request routing
- Validation
- Planning
- Execution
- Observation
- Completion
- Recovery

## Request Flow

Requests are modeled as internal, external, scheduled, event, or API requests and are routed into the orchestration pipeline through typed execution contexts.

## Startup Sequence

Startup composition is intended to register platform modules, providers, connectors, tools, workers, engines, and plugins before the runtime enters steady state.

## Pipeline Flow

Brain and Intelligence are designed to compose as a staged pipeline:

- Reason
- Plan
- Execute
- Evaluate
- Feedback
- Learn
- Retry

## Execution Flow

The AI runtime executes through a framework-only pipeline:

- Request
- Prompt build
- Model selection
- Execution
- Post-processing
- Memory update
- Knowledge update
- Response

## Prompt Architecture

The prompt engine supports:

- Variables
- Templates
- Composition
- Inheritance
- Validation
- Versioning

## Context Assembly

Context assembly merges runtime, knowledge, memory, session, user, and organization inputs through builder, assembler, window, compressor, and validator contracts.

## Model Routing

Model routing is provider-independent and supports:

- Capability matching
- Cost policies
- Latency policies
- Health policies
- Fallback policies
- Provider resolution

## Architecture

- Node.js 24 LTS
- TypeScript in strict mode with NodeNext semantics
- ES Modules throughout
- Express for future HTTP composition
- Vitest for unit testing
- ESLint flat config and Prettier
- Husky and lint-staged for commit safety
- Docker and GitHub Actions for repeatable delivery

## Folder Responsibilities

- `src/config`: environment loading, validation, and config service
- `src/shared`: cross-cutting platform primitives
- `src/infrastructure`: dependency injection container primitives
- `src/api`: HTTP health surface and future API composition
- `src/events`: event, command, query, middleware, and store abstractions
- `src/runtime`: runtime lifecycle and application host contracts
- `src/kernel`: platform kernel composition contracts
- `src/modules`: reusable module framework contracts
- `src/engines/core`: engine SDK contracts
- `src/plugins`: plugin framework contracts
- `src/security`: security framework contracts
- `src/observability`: observability contracts
- `src/knowledge`: knowledge platform contracts
- `src/memory`: memory platform contracts
- `src/brain`: brain orchestration contracts
- `src/intelligence`: intelligence layer contracts
- `src/workforce`: AI workforce, agent, and task contracts
- `src/automation`: automation and workflow contracts
- `src/tools`: tool framework contracts
- `src/providers`: provider framework contracts
- `src/connectors`: connector framework contracts
- `src/storage`: storage abstraction contracts
- `src/communication`: communication contract layer
- `src/sdk`: SDK contract layer
- `src/deployment`: deployment contract layer
- `src/composition`: platform composition contracts
- `src/orchestration`: execution orchestration contracts
- `src/prompt`: prompt engine contracts
- `src/runtime/ai`: AI runtime contracts
- `src/auth`: boundary placeholder only
- `src/engines`: boundary placeholder only
- `src/workflow`: boundary placeholder only
- `src/integrations`: boundary placeholder only

## Requirements

- Node.js 24 LTS
- pnpm 11.x

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Testing

```bash
pnpm test
pnpm coverage
```

## Build

```bash
pnpm build
```

## Usage Examples

```ts
import { createConfigService, createHealthService, success } from '@nexus/platform';

const config = createConfigService().getConfig();
const health = createHealthService().getHealth();

const response = success({ config, health });
```

## Contributing

- Keep changes within the existing structure.
- Preserve the platform-only scope.
- Add unit tests for all new framework behavior.
- Run lint, typecheck, tests, and build before opening a PR.

## Roadmap

- Add runtime bootstrap entrypoints
- Add observability adapters
- Add declarative service registration helpers
- Add transport adapters for HTTP and messaging
- Add deployment manifests
