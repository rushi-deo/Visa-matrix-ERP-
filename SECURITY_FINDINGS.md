# Security Findings

**Assessment date:** 2026-11-24  
**Scope:** Local code and migration review plus the database audit findings supplied with the request. Findings about live state are not independently revalidated.

## Critical

### C-01: NEXUS dependency advisory set — resolved locally

- **Baseline evidence:** Full `pnpm audit` reported 1 critical, 25 high, 36 moderate, and 5 low findings (67 total). The production audit reported 1 critical, 13 high, 27 moderate, and 4 low (45 total).
- **Final evidence:** On Node 24.11.1 with pnpm 11.17.0, both full and production audits exit 0 with zero advisories. Lint, typecheck, all 199 tests, build, and frozen-lockfile installation pass.
- **Status:** RESOLVED LOCALLY; the updated dependency graph has not been deployed or tested in a live staging integration environment.
- **Direct vulnerable dependencies:** `zod` (production) and `vitest` (development). Other affected packages below were transitive.

| Affected package | Baseline locked version → patched floor | Final locked version | Dependency path / class | Baseline advisory IDs |
|---|---|---|---|---|
| `proxy-addr` | 2.0.7 → 2.0.8 | 2.0.8 | Transitive via Express | 1241210 |
| `@modelcontextprotocol/sdk` | 1.29.0 → 1.32.0 | 1.32.0 | Transitive via `@openai/agents` → `@openai/agents-core` | 1241339, 1242628, 1242649, 1242667, 1243488, 1244498 |
| `fast-uri` | 3.1.4 → 3.1.9 | 3.1.9 | Transitive via MCP SDK / AJV | 1130720, 1158521, 1158524, 1158527, 1158530, 1239943, 1240091, 1243098, 1243101, 1243104, 1243107 |
| `hono` | 4.12.32 → 4.13.16 | 4.13.16 | Transitive via MCP SDK | 1130733, 1138771, 1138772, 1138773, 1193729, 1193730, 1193731, 1240640, 1242595, 1246368, 1246369, 1246370, 1246373, 1246374 |
| `@hono/node-server` | 1.19.17 → 2.1.3 | 2.1.6 | Transitive via MCP SDK; SDK range permits `^1.19.9` or `^2.0.5` | 1243661, 1246357 |
| `brace-expansion` | 1.1.16 → 1.1.21; 5.0.8 → 5.0.12 | 1.1.21; 5.0.12 | Transitive via ESLint and TypeScript-ESLint minimatch | 1130588, 1130734, 1130737, 1240100, 1240103, 1240104, 1240107, 1240108, 1240111 |
| `js-yaml` | 4.3.0 → 4.3.2 | 4.3.2 | Transitive via ESLint | 1138115, 1193727 |
| `minimatch` | 10.2.5 → 11.0.1 | 11.0.9 | Transitive via TypeScript-ESLint; parent updated within its v8 range | 1244623 |
| `qs` | 6.15.3 → 6.16.1 | 6.16.1 | Transitive via Express 4/5 | 1158506, 1158507, 1243687 |
| `body-parser` | 1.20.6 → 1.20.9; 2.3.0 → 2.4.0 | 1.20.9; 2.4.0 | Transitive via Express 4/5 | 1243073, 1243074 |
| `ip-address` | 10.3.1 → 10.7.4 | 10.7.4 | Transitive via `express-rate-limit` / MCP SDK | 1239948, 1239949, 1240097, 1240098, 1242883 |
| `source-map-js` | 1.2.1 → 1.2.2 | 1.2.2 | Transitive via Vitest/Vite/PostCSS | 1241209 |
| `nanoid` | 3.3.16 → 3.3.18 | 3.3.18 | Transitive via Vitest/Vite/PostCSS | 1139427 |
| `vitest` | 4.1.10 → 4.1.12 | 4.1.12 | Direct development dependency | 1193683 |
| `@vitest/mocker` | 4.1.10 → 4.1.12 | 4.1.12 | Transitive via Vitest | 1193684, 1242767 |
| `vite` | 8.1.5 → 8.1.6 | 8.1.6 | Transitive via Vitest | 1242624, 1242653, 1242660, 1242726, 1242732 |
| `zod` | 4.4.3 → 4.6.6 | 4.6.7 | Direct production dependency | 1243066 |

Two additional moderate advisories (1246356 and 1246358) were returned for the intermediate `@hono/node-server` 2.1.3 version. The final pinned 2.1.6 release is beyond their patched floor, and both final audits report zero findings.

Compatibility choices: the direct `@openai/agents` dependency remains at 0.13.5 because the next available line is 0.22.0 and would cross its current semver range. The MCP SDK was updated within its 1.x line. `@hono/node-server` 2.1.6 is explicitly allowed by the selected MCP SDK dependency range and requires Node >=20. `qs` 6.16.1 was selected with a scoped workspace override because Express 4's current tilde range does not admit the patched minor version; the existing Express 4 API was retained and the full suite passed.

## High

### H-01: Reported public visa-document bucket is not proven private

- **Evidence:** Supplied audit reports `visa-documents` as public and no `storage.objects` policies returned.
- **Impact:** Public-bucket objects can be directly retrievable without the application's signed-link authorization, depending on object paths and actual bucket state. Visa documents can contain identity data.
- **Status:** OPEN; exposure was not reproduced against staging or production.
- **Required action:** Confirm the bucket and object policy state in staging; prove direct unauthenticated reads fail and authorized short-lived signed URLs work. Keep production unchanged until approved.

### H-02: RLS and grants leave potential direct database exposure

- **Evidence:** Supplied audit reports 48 of 68 public tables without RLS, zero FORCE RLS tables, existing unrestricted policies, and anonymous database privileges.
- **Impact:** A missed API authorization path or direct PostgREST access can expose or mutate cross-organization records if grants/policies permit it.
- **Status:** OPEN; no live table/grant/policy output was obtained.
- **Required action:** Map table ownership from actual foreign keys and data, review effective anon/authenticated grants, and validate least-privilege policies using synthetic staging tenants. Do not blanket-enable RLS or revoke privileges.

### H-03: Service-role repositories bypass RLS; tenant authorization depends on application code

- **Evidence:** Backend repositories use the server Supabase service-role client; the tenant helper and selected services scope by organization. The service role bypasses ordinary RLS enforcement.
- **Impact:** Any missed tenant predicate or authorization check can cross organization boundaries.
- **Status:** OPEN; all route/repository call paths and staging isolation have not been exhaustively proven.
- **Required action:** Complete a resource-by-resource authorization map and staging tests for admin, manager, employee, customer, anonymous, and cross-organization access.

### H-04: NEXUS production transport accepts HTTP

- **Evidence:** NEXUS connector configuration accepts both `http:` and `https:` URLs without a production-only HTTPS requirement; the shared internal token is sent in a request header.
- **Impact:** A production configuration using HTTP can expose the connector token and user bearer token in transit.
- **Status:** OPEN; deployed URL/proxy configuration is unknown.
- **Required action:** Configure HTTPS end-to-end and enforce TLS at deployment or in production connector validation after confirming internal-network requirements.

### H-05: JWT authorization could fall back to stale token claims when profile checks fail (fixed locally)

- **Evidence:** Prior local middleware continued after a profile query error or missing profile and used token role, permissions, and organization claims. It also did not block suspended/deleted status values.
- **Impact:** A still-valid token could retain access when the backing profile/role could not be verified or was no longer present.
- **Status:** FIXED LOCALLY; focused tests pass. Staging schema and account-state behavior remain unverified.
- **Required action:** Validate profile/role column compatibility and revocation behavior in staging before deploying this fail-closed change.

## Medium

### M-01: Upload MIME metadata is not content inspection

- **Evidence:** The backend now checks extension/MIME pairs and size, but does not sniff file signatures, scan for malware, or inspect DOCX archive contents.
- **Impact:** A crafted file can claim an allowed MIME type; the allowlist alone is not malware/content validation.
- **Status:** PARTIALLY MITIGATED locally.
- **Required action:** Add content-signature validation and an approved malware-scanning/quarantine process before production document intake.

### M-02: NEXUS audit writes are swallowed in some sensitive controller paths

- **Evidence:** Several NEXUS integration controller audit calls catch and discard audit write failures.
- **Impact:** Sensitive reads or writes may complete without a durable audit record.
- **Status:** OPEN; audit table availability and operational requirements are unverified.
- **Required action:** Define the required fail-closed/fail-open policy per action and alert on audit persistence failure.

### M-03: Multi-instance rate limiting is not shown to be shared

- **Evidence:** Backend uses `express-rate-limit` defaults; Redis configuration exists, but a shared limiter store is not established by the reviewed setup.
- **Impact:** Limits may be per-process and less effective behind multiple instances.
- **Status:** OPEN; deployment topology is unknown.
- **Required action:** Confirm topology and configure a shared store if the backend is horizontally scaled.

### M-04: Frontend auth state uses local storage and local permission fallbacks

- **Evidence:** The frontend stores the API token in local storage and uses role/permission fallbacks for UI rendering.
- **Impact:** XSS can read the stored token; UI checks are not a security boundary.
- **Status:** Backend authorization remains authoritative, but browser session design is not independently verified.
- **Required action:** Keep server authorization mandatory, review CSP/XSS controls, and decide whether an HttpOnly-cookie session migration is in scope.

### M-05: NEXUS production container target is unverified

- **Evidence:** The production Docker stage copies `dist` and `package.json` but not production dependencies. Its command is `node dist/index.js`; the entry module exports the platform surface rather than an evident long-running HTTP server. No production healthcheck is defined.
- **Impact:** The image may fail on missing modules or exit without serving traffic.
- **Status:** OPEN; image was not built or run.
- **Required action:** Define the intended NEXUS runtime/server entrypoint, install only required production dependencies, and validate container startup/health before deployment.

## Scope limitations

- **Non-vulnerability maintenance note:** `pnpm install` reported `eslint@9.39.5` as no longer supported. It has no finding in the final audits; an ESLint 10 major upgrade was not attempted as part of this advisory remediation and should be assessed separately.
- The 68-table, 59-policy, public-bucket, function, view, and privilege counts above are user-supplied audit results, not a current database scan.
- The six reported `SECURITY DEFINER` functions and two public views were not independently inspected in the live database.
- No production or staging credentials were read, printed, or used.
