# 03. Orchestrator

## Current Implementation

The orchestrator implementation lives in [platform/src/orchestration](../../platform/src/orchestration) and currently provides a minimal coordinator layer.

## Core Types

The orchestration types are defined in [platform/src/orchestration/types.ts](../../platform/src/orchestration/types.ts). They include:

- `ExecutionRequest`
- `ExecutionContext`
- `ExecutionPlan`
- `ExecutionResult`
- `ExecutionState`
- `Orchestrator`
- `RequestCoordinator`
- `PipelineCoordinator`
- `WorkflowCoordinator`
- `AgentCoordinator`
- `ToolCoordinator`

## Runtime Entry Points

The current orchestrator factories are implemented in [platform/src/orchestration/manager.ts](../../platform/src/orchestration/manager.ts):

- `createRequestCoordinator`
- `createPipelineCoordinator`
- `createExecutionCoordinator`
- `createOrchestrator`
- `createWorkflowCoordinator`
- `createAgentCoordinator`
- `createToolCoordinator`

## Current Behavior

The `createOrchestrator` implementation performs the following sequence:

1. Validate the context
2. Create a plan
3. Execute the plan
4. Observe the result
5. Complete the result

All of these steps currently return simple success values or empty state objects.

## What Is Implemented Today

- The orchestrator API exists.
- The execution flow is structured.
- The interfaces for request, pipeline, workflow, agent, and tool coordination are present.

## What Is Planned

- The orchestrator does not yet coordinate with real agent, tool, memory, knowledge, or workflow implementations.
- Failure handling is not connected to the `recover` stage.
- Event publication, logging, and metrics are not wired into orchestration.

## Architectural Note

The orchestrator should be understood as an architectural seam and scaffold, not as a full runtime execution engine in the current repository state.
