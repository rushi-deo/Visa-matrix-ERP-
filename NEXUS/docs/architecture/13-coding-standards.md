# 13. Coding Standards

## Source of Truth

This document is based on the repository’s current TypeScript code and package configuration in [platform/package.json](../../platform/package.json) and [platform/tsconfig.json](../../platform/tsconfig.json).

## Implemented Standards Visible in the Repository

### TypeScript usage

- The codebase uses TypeScript throughout the platform package.
- Strict mode is enabled in [platform/tsconfig.json](../../platform/tsconfig.json).
- `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `isolatedModules` are enabled.

### Module style

- The project uses ES module syntax (`"type": "module"` in [platform/package.json](../../platform/package.json)).
- Source files consistently use `.js` specifiers in imports, which is typical for TypeScript ESM source in this codebase.

### Tooling

The package configuration includes standard tooling for linting, formatting, and testing:

- ESLint
- Prettier
- Vitest
- TypeScript compiler

## Partially Implemented

- The repository shows strong typing and configuration conventions, but the codebase still contains many stubbed implementations and placeholder return values.
- The tooling is present, but the documentation and code conventions are not yet fully enforced through a broader engineering policy.

## Planned

- A formal coding standards document covering contribution expectations, naming conventions, module boundaries, and review requirements is not yet present beyond the repository’s tooling configuration.

## Summary

The current codebase already reflects a modern TypeScript-oriented baseline, but it is still evolving from a scaffolded platform foundation into a fully implemented runtime.
