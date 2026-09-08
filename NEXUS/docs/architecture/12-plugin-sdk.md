# 12. Plugin SDK

## Current State

Plugin support is defined in [platform/src/plugins](../../platform/src/plugins) and follows a manager-registry pattern.

## Core Types

The plugin subsystem defines:

- `PluginManifest`
- `PluginType`
- `Plugin`
- `PluginRegistry`
- `PluginManager`

These are defined in [platform/src/plugins/types.ts](../../platform/src/plugins/types.ts) and [platform/src/plugins/manager.ts](../../platform/src/plugins/manager.ts).

## Current Implementation

The plugin manager implementation in [platform/src/plugins/manager.ts](../../platform/src/plugins/manager.ts) supports:

- install
- enable
- disable
- unload
- update

The manager resolves plugins from a registry and invokes the plugin lifecycle methods.

## What Is Implemented Today

- A plugin lifecycle model exists.
- Plugin installation and management are implemented as a registry-based abstraction.

## What Is Planned

- The plugin system is not yet demonstrated as a runtime-loaded extension framework in the repository.
- Concrete plugin implementations are not included in the current source tree.

## Architectural Note

The plugin SDK is represented as a real extension mechanism in the codebase, but its broader ecosystem integration remains planned.
