# 04. Agent System

## Current State

The repository contains agent abstractions in [platform/src/agent](../../platform/src/agent) and a separate workforce model in [platform/src/workforce](../../platform/src/workforce).

## Agent Module

The agent subsystem currently exposes:

- `Agent` interface
- `AgentManager`
- `AgentRegistry`
- `AgentRuntime`
- `AgentContext`
- `AgentTask`
- `AgentResult`

These are defined in [platform/src/agent/types.ts](../../platform/src/agent/types.ts) and implemented in [platform/src/agent/manager.ts](../../platform/src/agent/manager.ts).

## Current Behavior

The current implementation provides registry-based agent registration and execution:

- `createAgentRegistry` stores agents by name.
- `createAgentManager` registers and executes named agents.
- `createAgentRuntime` adapts the manager result into a simplified runtime result.

The manager checks that an agent is registered before execution and throws an error if not.

## What Is Implemented Today

- Registry-based agent registration exists.
- Agent execution and runtime adaptation are defined.
- Agent tasks and results are typed.

## What Is Planned

- The implementation does not yet show a concrete production agent runtime with real policies or behavior.
- The agent module is currently a generic orchestration surface rather than a populated domain-specific agent system.

## Relationship to Workforce

The workforce subsystem in [platform/src/workforce/types.ts](../../platform/src/workforce/types.ts) defines broader worker and agent concepts, including worker sessions, assignments, execution plans, and task states. That subsystem is more expansive in type shape than the current agent manager implementation.
