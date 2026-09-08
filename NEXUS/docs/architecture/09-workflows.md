# 09. Workflows

## Current State

Workflow concepts exist in [platform/src/automation](../../platform/src/automation) and are referenced by the orchestration layer, but the repository does not currently show a full workflow engine implementation.

## Core Types

The workflow model defines:

- `WorkflowDefinition`
- `WorkflowStep`
- `WorkflowContext`
- `WorkflowResult`
- `WorkflowTrigger`
- `WorkflowAction`
- `WorkflowCondition`
- `Workflow`
- `WorkflowRegistry`
- `WorkflowEngine`
- `AutomationManager`

These are defined in [platform/src/automation/types.ts](../../platform/src/automation/types.ts).

## Current Implementation

The current repository does not expose a concrete workflow implementation module under [platform/src/workflow](../../platform/src/workflow); the directory currently contains only an empty export file.

## What Is Implemented Today

- Workflow types and triggers are defined.
- The orchestration layer includes workflow coordination interfaces.

## What Is Planned

- No concrete workflow engine or execution implementation is currently present.
- Workflow execution is not connected to the orchestrator or runtime in the repository as shipped.

## Architectural Note

Workflows are part of the intended architecture, but their runtime behavior remains planned rather than implemented.
