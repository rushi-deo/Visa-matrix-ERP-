# Test Results

**Run date:** 2026-11-24  
**Environment:** Windows; NEXUS validation used Node 24.11.1 and pnpm 11.17.0. The backend and frontend results below are from their prior local runs.

## Local command results

| Repository | Command(s) | Result | Notes |
|---|---|---|---|
| Backend | `npm run lint` | PASS | No lint errors. |
| Backend | `npm run build` | PASS | Custom syntax check reported 240 JavaScript files; this is not a transpile/bundle step. |
| Backend | `npm test` | PASS | 22 tests passed, including fail-closed auth, upload allowlist, service-role fallback prevention, tenant helper, document storage failure, and NEXUS route tests. |
| Frontend | `npm run lint` | PASS | No lint errors. |
| Frontend | `npm run typecheck` | PASS | `tsc --noEmit`. |
| Frontend | `npm run build` | PASS with warning | 2,876 modules; JS chunk 1,500.69 kB minified / 437.08 kB gzip, above Vite's 500 kB warning threshold. |
| Frontend | `npm test` | PASS | 4 tests passed. Test output warned that Supabase public env was missing (expected for local tests). |
| NEXUS | `pnpm lint` | PASS | Run on Node 24 after dependency updates; archived `.nexus-integration-work` snapshots remain excluded. |
| NEXUS | `pnpm typecheck` | PASS | Both configured TypeScript projects passed on Node 24. |
| NEXUS | `pnpm test` | PASS | 60 test files, 199 tests passed on Node 24. |
| NEXUS | `pnpm build` | PASS | TypeScript build completed on Node 24. |

NEXUS has no separate integration-test script. `pnpm test` ran all 60 Vitest files, including the mocked connector pipeline integration cases in `tests/integration-execution.test.ts`; no live connector, database, or external-service integration environment was exercised.

## Dependency audits

| Repository | Command | Result |
|---|---|---|
| Backend | `npm audit --json` | PASS; 0 reported vulnerabilities. |
| Frontend | `npm audit --json` | PASS; 0 reported vulnerabilities. |
| NEXUS | `pnpm audit --json` | PASS; 0 critical, high, moderate, or low advisories after remediation. |
| NEXUS | `pnpm audit --prod --json` | PASS; 0 critical, high, moderate, or low advisories after remediation. |

### NEXUS dependency remediation

- Initial full audit: 1 critical, 25 high, 36 moderate, 5 low (67 total).
- Initial production audit: 1 critical, 13 high, 27 moderate, 4 low (45 total).
- Final full and production audits: 0 in every severity; all 67 initial advisory findings are resolved in the lockfile.
- During remediation, two additional moderate `@hono/node-server` advisories (1246356, 1246358) were reported against the intermediate 2.1.3 resolution. The final resolution is 2.1.6; both final audits are clean.
- Direct dependency ranges were updated for `zod` (4.4.3 → 4.6.7), `vitest` (4.1.10 → 4.1.12), `@vitest/coverage-v8` (4.1.10 → 4.1.12), and `typescript-eslint` (resolved 8.65.0 → 8.73.0; manifest range `^8.39.0` → `^8.73.0`).
- Patched transitive resolutions include `@modelcontextprotocol/sdk` 1.29.0 → 1.32.0, `@hono/node-server` 1.19.17 → 2.1.6, `body-parser` 1.20.6/2.3.0 → 1.20.9/2.4.0, `brace-expansion` 1.1.16/5.0.8 → 1.1.21/5.0.12, `fast-uri` 3.1.4 → 3.1.9, `hono` 4.12.32 → 4.13.16, `ip-address` 10.3.1 → 10.7.4, `js-yaml` 4.3.0 → 4.3.2, `minimatch` 10.2.5 → 11.0.9, `nanoid` 3.3.16 → 3.3.18, `proxy-addr` 2.0.7 → 2.0.8, `qs` 6.15.3 → 6.16.1, `source-map-js` 1.2.1 → 1.2.2, and `vite` 8.1.5 → 8.1.6.
- Commands executed on Node 24: `pnpm install --no-frozen-lockfile`, `pnpm install --frozen-lockfile`, both audit commands above, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. All final commands passed.
- Non-vulnerability maintenance note: install warned that `eslint@9.39.5` is no longer supported. It has no finding in the final audits; an ESLint 10 major upgrade was not part of this advisory remediation and should be assessed separately.

## Release gate count

The percentage uses 24 release gates, not weighted severity:

1. Backend lint - PASS
2. Backend syntax/build check - PASS
3. Backend tests - PASS
4. Frontend lint - PASS
5. Frontend typecheck - PASS
6. Frontend production build - PASS (with chunk warning)
7. Frontend tests - PASS
8. NEXUS lint - PASS
9. NEXUS typecheck - PASS
10. NEXUS tests - PASS
11. NEXUS build - PASS
12. Backend dependency audit - PASS
13. Frontend dependency audit - PASS
14. NEXUS dependency audit - PASS
15. NEXUS checks on Node 24 - PASS
16. Actual API RBAC tests for all user classes - NOT TESTED
17. Cross-organization isolation on staging - NOT TESTED
18. Database ownership/RLS policy validation - BLOCKED
19. Anon/authenticated grants and view/function security review - BLOCKED
20. Private Storage and signed-link enforcement on staging - BLOCKED
21. Full document upload/download/delete workflow - NOT TESTED
22. CRM/application/forms/payment/HR E2E workflows - NOT TESTED
23. Backup restoration - NOT TESTED
24. Deployment health and rollback validation - NOT TESTED

**Score: 15 / 24 gates passed (62.5%); 9 blocked or not tested.** This is a local verification score, not a production-readiness declaration.

## Not executed

- No live production or staging database query.
- No migration execution.
- No live API, tenant-isolation, or browser E2E test.
- No standalone NEXUS integration-test script or live connector integration run.
- No document content scan or malware scan.
- No payment provider exercise.
- No backup restore, deployment, or production health check.
