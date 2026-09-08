# 07. Tool Registry

## Current State

Tool support is implemented in [platform/src/tools](../../platform/src/tools) and is organized around a registry, executor, and manager.

## Core Types

The tool subsystem defines:

- `ToolDefinition`
- `ToolContext`
- `ToolResult`
- `Tool`
- `ToolRegistry`
- `ToolManager`
- `ToolExecutor`

These are defined in [platform/src/tools/types.ts](../../platform/src/tools/types.ts).

## Current Implementation

The implementation in [platform/src/tools/manager.ts](../../platform/src/tools/manager.ts) provides:

- `createToolRegistry`
- `createToolExecutor`
- `createToolManager`

The registry stores tools by name, the executor invokes a tool’s `execute` method, and the manager validates whether a tool is registered before executing it.

## What Is Implemented Today

- A registry-based tool system exists.
- Tool discovery and validation are available.
- Tool execution is represented clearly.

## What Is Planned

- The orchestration layer does not currently use the tool manager in a meaningful execution path.
- There is no evidence of a populated tool catalog in the repository as shipped.

## Architectural Note

The tool layer is one of the more concrete subsystems in the codebase, but it remains an extensibility mechanism rather than a fully integrated execution environment.
