# 11. Security

## Current State

Security concepts are modeled in [platform/src/security](../../platform/src/security) through policy, roles, permissions, audit, and evaluation abstractions.

## Core Types

The security subsystem defines:

- `Permission`
- `Role`
- `Policy`
- `SecurityContext`
- `AuditContext`
- `PolicyEngine`
- `SecurityManager`

These are defined in [platform/src/security/types.ts](../../platform/src/security/types.ts).

## Current Implementation

The implementation in [platform/src/security/manager.ts](../../platform/src/security/manager.ts) provides:

- `createPolicyEngine`
- `createSecurityManager`

The policy engine evaluates whether a security context has the required roles or permissions for a given policy.

## What Is Implemented Today

- Policy evaluation is implemented.
- Security manager and audit hooks are defined.

## What Is Planned

- Auditing is currently a no-op placeholder.
- Security enforcement is not yet integrated into orchestration or request execution.

## Architectural Note

Security is represented as an architectural layer, but it is not yet deeply wired into runtime behavior.
