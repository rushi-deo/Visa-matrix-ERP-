# 10. Events

## Current State

The platform includes an event subsystem in [platform/src/events](../../platform/src/events) with an event bus, middleware support, registry, and store interfaces.

## Core Types

The event model includes:

- `EventBus`
- `EventMiddleware`
- `EventRegistry`
- `EventStore`

These are defined in [platform/src/events/event-bus.ts](../../platform/src/events/event-bus.ts), [platform/src/events/middleware.ts](../../platform/src/events/middleware.ts), [platform/src/events/registry.ts](../../platform/src/events/registry.ts), and [platform/src/events/store.ts](../../platform/src/events/store.ts).

## Current Implementation

The event bus implementation in [platform/src/events/event-bus.ts](../../platform/src/events/event-bus.ts) supports:

- subscription and unsubscription
- middleware hooks
- publish and dispatch flows
- replay operations

## What Is Implemented Today

- A concrete event bus exists.
- Middleware and publish/dispatch semantics are implemented.

## What Is Planned

- The orchestrator does not yet publish lifecycle events through the event bus.
- The event subsystem is available as a general infrastructure capability, but its usage by orchestration and other runtime layers is not fully connected.

## Architectural Note

Events are a real part of the current codebase and are usable as a general event infrastructure layer.
