# 01. System Overview

## Purpose

This document describes the current NEXUS platform architecture as it exists in the repository today. It is based on the concrete modules exported by [platform/src/index.ts](../../platform/src/index.ts) and the supporting submodules under [platform/src](../../platform/src).

## Current Scope

The repository contains a platform-oriented architecture with the following major areas:

- Runtime and lifecycle management
- Kernel and module hosting
- Orchestration and request handling
- Agent, brain, and workforce abstractions
- Memory, knowledge, tool, and workflow concepts
- Events, security, plugins, and providers
- API and deployment-oriented infrastructure

## High-level Structure

The platform is organized around a central runtime and a set of domain modules:

- [platform/src/runtime](../../platform/src/runtime) defines runtime lifecycle types and the platform runtime implementation.
- [platform/src/kernel](../../platform/src/kernel) provides a kernel host with module and service registries.
- [platform/src/orchestration](../../platform/src/orchestration) contains the current orchestrator scaffolding.
- [platform/src/agent](../../platform/src/agent), [platform/src/brain](../../platform/src/brain), and [platform/src/workforce](../../platform/src/workforce) define agent and worker abstractions.
- [platform/src/memory](../../platform/src/memory), [platform/src/knowledge](../../platform/src/knowledge), and [platform/src/tools](../../platform/src/tools) define supporting execution subsystems.
- [platform/src/events](../../platform/src/events), [platform/src/security](../../platform/src/security), and [platform/src/plugins](../../platform/src/plugins) provide cross-cutting infrastructure.

## Current Architecture Characteristics

### Implemented Today

- A typed runtime lifecycle exists with stages such as initialized, configured, built, started, ready, stopped, restarted, and shutdown.
- A kernel container exists with configuration, logger, container, runtime, modules, and services.
- Orchestration entry points exist for request routing and pipeline stages.
- Agent, memory, knowledge, tool, workflow, event, security, and plugin abstractions are defined.
- Registry-based patterns are used throughout the codebase for managers and providers.

### Planned

- Full end-to-end request execution is not yet wired through the platform.
- Many managers expose stubbed or no-op behavior rather than runtime execution.
- Several subsystems are present as contracts and registries, but their full operational behavior remains to be implemented.

## Architectural Style

The existing codebase favors:

- Interface-driven design
- Registry and manager abstractions
- Explicit type definitions for domain entities
- Modular separation by subsystem

It does not yet appear to be a fully connected runtime in the sense of executing real requests end to end. The current implementation is best understood as a structured foundation with many placeholders.
