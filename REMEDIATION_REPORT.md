# Visa Matrix ERP / NEXUS remediation report

**Overall status: NOT PRODUCTION READY.** Repository changes and local checks are complete for the remediated scope. Frontend lint/typecheck, dependency vulnerabilities, and unverified live Supabase schema, migration, RLS, storage, ownership, and end-to-end behavior remain release blockers. No live database or production change was made, and none of the three draft migrations was applied.

## 1. Fixed-file inventory

The following files were changed or added in this remediation. Four untracked pnpm workspace/lock files were present before work and were preserved unchanged: `visa-matrix-backend/backend/pnpm-lock.yaml`, `visa-matrix-backend/backend/pnpm-workspace.yaml`, `visa-matrix-frontend/visa-matrix-frontend/pnpm-lock.yaml`, and `visa-matrix-frontend/visa-matrix-frontend/pnpm-workspace.yaml`.

### NEXUS

- `NEXUS/platform/src/connectors/visa-matrix-backend.ts`
- `NEXUS/platform/tests/visa-matrix-backend.test.ts`
- `NEXUS/platform/vitest.config.ts`

### Backend

- `visa-matrix-backend/backend/package.json`, `package-lock.json`, `eslint.config.js`
- `visa-matrix-backend/backend/tools/build-check.js`, `tools/env-for-tests.js`
- `visa-matrix-backend/backend/test/nexus-routes.test.js`
- `visa-matrix-backend/backend/src/controllers/applicationController.js`
- `visa-matrix-backend/backend/src/core/baseRepository.js`, `core/response.js`
- `visa-matrix-backend/backend/src/middleware/authenticationMiddleware.js`, `errorHandler.js`, `nexusInternalAuth.js`, `rbac.middleware.js`
- `visa-matrix-backend/backend/src/modules/Quotation/quotation.controller.js`, `quotation.repository.js`, `quotation.service.js`
- `visa-matrix-backend/backend/src/modules/applications/application.controller.js`, `application.repository.js`, `application.service.js`
- `visa-matrix-backend/backend/src/modules/auth/auth.repository.js`
- `visa-matrix-backend/backend/src/modules/customers/customer.repository.js`, `customer.service.js`
- `visa-matrix-backend/backend/src/modules/documents/document.controller.js`, `document.repository.js`, `document.service.js`
- `visa-matrix-backend/backend/src/modules/forms/forms.repository.js`, `forms.service.js`
- `visa-matrix-backend/backend/src/modules/integrations/nexus.controller.js`, `nexus.routes.js`
- `visa-matrix-backend/backend/src/modules/invoices/invoice.controller.js`, `invoice.repository.js`, `invoice.service.js`
- `visa-matrix-backend/backend/src/modules/leads/lead.controller.js`, `lead.repository.js`, `lead.service.js`
- `visa-matrix-backend/backend/src/modules/payments/payment.controller.js`, `payment.repository.js`, `payment.service.js`
- `visa-matrix-backend/backend/src/modules/tasks/task.controller.js`, `task.repository.js`, `task.service.js`
- `visa-matrix-backend/backend/src/modules/users/user.service.js`
- `visa-matrix-backend/backend/src/modules/workflows/workflow.controller.js`, `workflow.repository.js`, `workflow.service.js`
- `visa-matrix-backend/backend/src/platform/events/event.subscriber.js`, `src/routes/validation.js`, `src/server.js`
- `visa-matrix-backend/backend/src/services/applicationService.js`, `baseService.js`, `invoice.service.js`, `payment.service.js`, `quotation.service.js`
- `visa-matrix-backend/backend/src/utils/adminSecurity.js`, `fileUpload.js`, `storage.js`, `tenantSecurity.js`, `tenantSecurity.test.js`
- `visa-matrix-backend/backend/supabase/migrations/20261123_form_configs_and_nexus_permissions.sql`
- `visa-matrix-backend/backend/supabase/migrations/20261123_private_document_storage.sql`
- `visa-matrix-backend/backend/supabase/migrations/20261123_tenant_ownership_and_rls_repair.sql`

### Frontend

- `visa-matrix-frontend/visa-matrix-frontend/package.json`, `package-lock.json`, `eslint.config.js`
- `visa-matrix-frontend/visa-matrix-frontend/config/supabaseClient.js`
- `visa-matrix-frontend/visa-matrix-frontend/src/services/formService.js`, `src/supabase.js`
- `visa-matrix-frontend/visa-matrix-frontend/supabase/migrations/README.md`

### Reports

- `MIGRATION_RECONCILIATION_REPORT.md`
- `REMEDIATION_REPORT.md`

## 2. Before-and-after defect register

| Area | Before | After in this workspace | Remaining boundary |
|---|---|---|---|
| NEXUS actions | Catch-all payload validation and unknown-action fallback to `visa-rules.get`; missing customer/lead list and payment actions | Explicit 24-action registry, individual strict validators, UUID checks, no fallback; added customer.list, lead.list, payment.get/list | NEXUS calls to a live ERP were not exercised |
| Connector transport | Error/data handling could assume a particular response data shape | Requires a valid success envelope and request/correlation IDs; accepts object or array `data`; safe 404 text | Live error behavior not exercised |
| ERP integration | Missing/miswired service imports/routes, task get/list, payment schemas, form route chain issue | Uses canonical service modules; adds customer.list, task.get/list, strict payment schemas; corrects form route and auth chains | Permission rows are only reconciled in an unapplied draft migration |
| Integration contracts | Task/workflow response IDs inconsistent; error messages could expose implementation details | Success envelopes include `success`, `data`, `requestId`, `correlationId`; safe generic errors | Not all application controllers outside NEXUS were exercised end to end |
| Tenant access | Missing organization/resource owner could fail open | Tenant helper denies missing context/owner and cross-org access; normalizes admin roles; services/repositories scope lists and check individual/parent ownership | Runtime database enforcement and historical unresolved-owner counts are unverified |
| Documents | Public URL path and public bucket/policies in local historical migrations | Signed URL creation follows document, parent application, and tenant checks; draft turns bucket private and removes four known public policies | The draft is unapplied; extra live policies and actual bucket state are unknown |
| Dynamic forms | Source paths conflicted with required canonical table | Backend and frontend now use `form_configs`; unpublished forms withheld from NEXUS | Legacy data in `form_schemas` is preserved; live schema/data reconciliation is pending |
| `/api/validate` | Mounted without adequate protection | Development-only route, authenticated and permission checked, strict UUID/object validation | Production deployment configuration still needs review |
| Build/lint scripts | Placeholder or absent checks | Backend syntax build/lint and frontend lint/typecheck/test scripts added | Frontend lint/typecheck currently fail on legacy project diagnostics |

## 3. Connector action mapping

All connector requests are POSTed to `/api/integrations/nexus/<action>`.

| Action | ERP endpoint | Required identifier/filter validation |
|---|---|---|
| `customer.get` | `/api/integrations/nexus/customer.get` | `customerId` UUID |
| `customer.list` | `/api/integrations/nexus/customer.list` | Optional positive page, bounded limit, search |
| `customer.create` | `/api/integrations/nexus/customer.create` | Strict customer fields; name required; email validated |
| `application.get` / `application.list` | Matching action endpoint | `applicationId` UUID; list filters validate country/visa UUIDs |
| `document.get` / `document.list` | Matching action endpoint | `documentId`, optional `applicationId` UUID; bounded filters |
| `lead.get` / `lead.list` | Matching action endpoint | `leadId` UUID; bounded list filters |
| `form.get` / `form.list` / `form.getByCountryVisa` | Matching action endpoint | UUID form/country/visa IDs; bounded list filters |
| `country.list` | `/api/integrations/nexus/country.list` | Empty strict payload |
| `visa-type.list` | `/api/integrations/nexus/visa-type.list` | `countryId` UUID |
| `visa-requirements.get` | `/api/integrations/nexus/visa-requirements.get` | `countryId`, `visaTypeId` UUIDs |
| `visa-rules.get` | `/api/integrations/nexus/visa-rules.get` | `visaRuleId` UUID |
| `task.get` / `task.list` | Matching action endpoint | `taskId`, optional application/assignee UUIDs; bounded filters |
| `workflow.get` / `workflow.list` | Matching action endpoint | `workflowId`; bounded filters and boolean `isActive` |
| `invoice.get` / `invoice.list` | Matching action endpoint | `invoiceId` UUID; bounded list filters |
| `payment.get` / `payment.list` | Matching action endpoint | `paymentId`, optional application UUID, three-letter currency and bounded filters |

Unknown actions are rejected. Every action has a strict action-specific payload validator. Internal service authentication, bearer-token propagation, and request/correlation ID forwarding remain required.

## 4. API route and permission matrix

Every route below applies internal NEXUS service authentication, bearer-user authentication, request validation, and the listed permission gate.

| ERP action(s) | Permission |
|---|---|
| `customer.get`, `customer.list` | `customers:view` |
| `customer.create` | `customers:create` |
| `application.get`, `application.list` | `applications:view` |
| `document.get`, `document.list` | `documents:view` |
| `lead.get`, `lead.list` | `leads:view` |
| `country.list` | `countries:view` |
| `visa-type.list` | `visa_types:view` |
| `visa-requirements.get` | `visa_requirements:view` |
| `visa-rules.get` | `visa_rules:view` |
| `form.get`, `form.list`, `form.getByCountryVisa` | `forms:view` |
| `invoice.get`, `invoice.list` | `invoicing:view` |
| `payment.get`, `payment.list` | `payments:view` |
| `task.get`, `task.list` | `tasks:view` |
| `workflow.get`, `workflow.list` | `workflow:view` |

Locally referenced permission names are seeded by the unapplied form/permission draft where missing. The actual live permission rows and role assignments cannot be asserted until the live database is inspected.

## 5. Tenant-isolation test results

`tenantSecurity.test.js`: **7 passed, 0 failed**. Covered matching tenant access, missing user organization, missing resource owner, cross-organization denial, server-derived ownership, forged-tenant rejection, and normalized admin role behavior. `nexus-routes.test.js`: **3 passed, 0 failed** for internal-auth rejection, bearer-auth requirement, and auth/permission middleware on all 24 routes. Backend suite total: **16 passed, 0 failed**.

Application, customer, document, lead, payment, invoice, quotation, task, and workflow service/repository paths were updated to scope list queries and validate individual/parent ownership. Child records use parent application ownership checks where applicable. This is code-level evidence only: no live database was available to prove actual cross-organization queries or count inaccessible legacy records. Missing/unresolved ownership fails closed; no historical ownership was invented.

## 6. Database migration reconciliation

See [MIGRATION_RECONCILIATION_REPORT.md](MIGRATION_RECONCILIATION_REPORT.md) for directory comparison, local dependencies, schema conflicts, RLS evidence, and safe next steps.

Summary: backend has 20 pre-existing migrations plus 3 new unapplied drafts; frontend has 7 overlapping historical migration files. Remote applied/failed/pending status, live schema, actual policies/grants/storage, and unresolved ownership counts are **unknown**. Supabase CLI was unavailable; a read-only `npx supabase migration list` attempt stalled and was canceled. No migration command that writes schema/data was run. Backend is the proposed sole forward migration directory; frontend SQL remains preserved for reconciliation.

The drafts address canonical `form_configs` and missing view permissions, private document storage, and tenant ownership/RLS. They deliberately avoid assigning default ownership. They are not approved for application: compare each against a successful live schema/ledger/policy snapshot first.

## 7. RLS coverage matrix

This is local migration-file evidence only, not a statement about live Supabase.

| Table/surface | Local migration evidence | Status / risk |
|---|---|---|
| `customers`, `applications`, `documents`, `payments`, `workflows`, `tasks`, `notifications` | Core migration grants broad DML to `anon` and `authenticated`; same migration has no RLS enablement for these tables | Critical historical exposure; tenant draft enables RLS and revokes direct grants, but is unapplied |
| `invoices`, `quotations`, `new_applications` (leads) | Local schema/ownership evidence is incomplete; lead source table creation is not established in reviewed backend migrations | Live table and policy state unknown; tenant draft only operates if tables exist |
| `profiles`, `organizations`, `roles`, `permissions`, `departments`, `sessions`, `login_history`, `audit_logs` | Enterprise auth migration enables RLS and defines policies | Local policy coverage exists; live predicates/grants unverified |
| `countries` | RLS and active-reference read policy in local migration | Verify live roles/grants and actual policy |
| `visa_type`, `requirements` | RLS and `USING (true)` select policy for anon/authenticated | Public read exists locally; verify intended exposure and live names |
| `documents` frontend policy | Local frontend migration enables RLS and adds a read policy | Policy body/tenant predicate needs live review; directory is historical |
| `applications` frontend policies | Local select/insert policies | Tenant predicates and update/delete coverage need review |
| `form_configs` | New draft enables RLS, allows published-form select, revokes direct writes | Draft only; schema and policy not applied |
| `tenant_ownership_quarantine` | Tenant draft enables RLS and revokes anon/authenticated privileges | Draft only; live owner counts unavailable |
| `visa-documents` storage | Historical migration creates public bucket with unrestricted CRUD policies | Critical local exposure; private bucket repair draft removes four known policy names only; inspect all live policies first |

## 8. Build, lint, test, and dependency audit results

| Project/check | Exact result |
|---|---|
| NEXUS tests | **Passed:** 60 test files, 199 tests; Node 24.22.3 and pnpm 11.17.0 |
| NEXUS typecheck | **Passed:** production and test TypeScript configurations |
| Backend tests | **Passed:** 16 tests, 0 failed |
| Backend build check | **Passed:** syntax checked 239 JavaScript files |
| Backend lint | **Passed:** ESLint, zero warnings allowed |
| Frontend tests | **Passed:** 3 tests, 0 failed; existing Node ESM/Supabase-env warnings remain |
| Frontend build | **Passed:** Vite transformed 2,924 modules; emitted large-chunk warning (main chunk about 1.47 MB / 428 kB gzip) and stale browserslist/sourcemap warnings |
| Frontend lint | **Failed:** 199 errors, 10 warnings. The lint command includes JS/JSX/TS/TSX. |
| Frontend typecheck | **Failed:** 47 TypeScript diagnostics, including missing modules/assets and existing route/component typing errors |
| Backend production dependency audit | **Failed:** `npm audit --omit=dev` found 17 vulnerabilities: 5 moderate, 10 high, 2 critical |
| Frontend production dependency audit | **Failed:** `npm audit --omit=dev` found 10 vulnerabilities: 2 moderate, 7 high, 1 critical |
| `git diff --check` | **Passed:** no whitespace errors; Git printed line-ending conversion warnings for modified files |

## 9. Outstanding risks

1. **Live database remains unverified.** Migration ledger, schema, types, data ownership, RLS, grants, and storage policies could differ from repository history.
2. **Draft migrations are not deployment-ready.** They need review against a live read-only catalog/ledger and ownership counts before approval; none has been applied.
3. **Frontend checks fail.** Resolve 199 ESLint errors/10 warnings and 47 TypeScript diagnostics before release.
4. **Runtime dependency audit has high and critical findings** in both backend and frontend lockfiles. Review advisories and upgrade paths, then rerun audits.
5. **End-to-end workflow is not verified.** Employee login through customer/lead/application/forms/upload/document verification/invoice/payment/task/workflow/notifications/audit/NEXUS has not been run against an authorized staging environment. Successful and unauthorized live cases are both outstanding.
6. **Storage changes require live policy inventory.** The draft removes four known legacy public policies; additional live policies or alternate bucket names may exist.
7. **Historical ownership remains unknown.** Records that cannot be proven from trusted parents must remain quarantined/inaccessible until an audited, approved resolution process exists.
8. **Frontend build has a large JavaScript chunk.** It is a performance warning rather than a build failure, but should be profiled before production.

## 10. Production-readiness checklist

- [x] Preserve the existing React/Vite/Tailwind, Express/Node, Supabase, and NEXUS architecture.
- [x] Keep `form_configs` as the canonical form table in application source.
- [x] Require NEXUS internal token and bearer authentication with permission checks.
- [x] Fail closed in code for missing tenant context/ownership and cross-organization access.
- [x] Add automated tenant helper and route-auth tests.
- [x] Build/test NEXUS and backend; build/test frontend.
- [x] Keep proposed SQL as unapplied forward-only drafts; make no live database or production changes.
- [ ] Obtain a successful read-only migration history and live schema/RLS/storage catalog snapshot.
- [ ] Reconcile local migrations, actual applied state, permission rows, and unresolved ownership counts.
- [ ] Review and approve draft migrations against that snapshot; run only in a controlled non-production environment first.
- [ ] Resolve frontend lint and TypeScript failures.
- [ ] Remediate high/critical production dependency advisories.
- [ ] Run route/auth/tenant tests against a controlled Supabase-backed staging environment.
- [ ] Complete the full business workflow and unauthorized-case verification in staging.
- [ ] Confirm private storage and signed URL access through the owning application and organization.

Production readiness remains **blocked** until the unchecked security, live-schema, dependency, and end-to-end items are resolved and verified. No production deployment or migration is recommended from this workspace state.
