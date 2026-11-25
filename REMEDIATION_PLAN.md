# Remediation Plan

| Priority | Work | Status | Verification / exit criteria | Staging required |
|---|---|---|---|---|
| P0 | Resolve the NEXUS critical/high dependency advisories. | DONE LOCALLY | Baseline 67 advisories resolved; full and production audits report zero. Frozen install, lint, typecheck, 199 tests, and build pass on Node 24. | No database staging action; run the existing CI workflow before release. |
| P0 | Confirm private `visa-documents` bucket and object policies. | BLOCKED | Direct unauthenticated object reads fail; authorized short-lived signed URL works; unauthorized tenant fails. | Yes |
| P0 | Reconcile the live database schema, grants, RLS, policies, views, and `SECURITY DEFINER` functions. | BLOCKED | `STAGING_VALIDATION.sql` results reviewed; every sensitive table has a verified owner model and role-specific tests. | Yes |
| P0 | Prove tenant isolation across API and NEXUS actions. | BLOCKED | Synthetic org A/B users cannot list, read, update, delete, or sign links for the other organization. | Yes |
| P1 | Validate the fail-closed JWT/profile changes against actual profile and role schema. | LOCAL FIX, STAGING NOT RUN | Valid active users authenticate; missing/inactive/suspended/deleted users are rejected; DB/profile lookup failures do not authorize. | Yes |
| P1 | Review all routes, controllers, services, and repositories for RBAC, validation, audit, and tenant predicates. | PARTIAL | Produce a route-to-permission/resource matrix and tests for all mutating/sensitive endpoints. | Yes for live behavior |
| P1 | Validate file content and malware scanning. | PARTIAL | Signature checks for accepted formats; documented scanning/quarantine and failure behavior; upload size aligned with deployment configuration. | Yes |
| P1 | Run ERP business workflows with synthetic staging data. | BLOCKED | CRM, applications/forms, documents, payments, and HR pass documented E2E journeys with negative access tests. | Yes |
| P1 | Validate backup restoration and rollback procedures. | BLOCKED | Restore database and private document objects into an isolated environment; record recovery time and integrity checks. | Yes |
| P1 | Repair/define the NEXUS production image and runtime. | OPEN | Image builds, starts on Node 24, serves a healthcheck, and passes connector integration tests. | Deployment environment |
| P2 | Establish CI for backend and frontend and enforce all quality/security gates. | OPEN | CI runs current lint/build/type/test/audit commands and blocks on failures. | No |
| P2 | Optimize the frontend production bundle. | OPEN | Identify largest chunks and reduce initial JS payload; no unreviewed feature changes. | No |
| P2 | Decide on distributed rate limiting and browser session hardening. | OPEN | Deployment topology and threat model documented; config tested. | Deployment environment |

## Safe local remediation completed

- JWT HS256 algorithm allowlist; fail-closed profile lookup; removed role/permission/organization claim fallback; disabled suspended/deleted accounts.
- Removed service-role fallback from the user-scoped Supabase client helper.
- Restricted document upload MIME/extension pairs to the existing UI contract and preserved document metadata when Storage deletion fails.
- Corrected NEXUS lint scope for archived snapshots and active lint violations.
- Updated NEXUS direct dependencies and patched transitive resolutions in the lockfile; added scoped pnpm overrides for vulnerable transitive packages. Full and production audits are clean.
- Added focused tests for the changed behavior.

## Database migration gate

Do not apply existing candidate migrations or create replacement ownership policies until the staging catalog and ownership map are available. The file `STAGING_DATABASE_MIGRATIONS.sql` intentionally raises an exception and makes no schema changes; it is a guard, not an apply-ready migration.
