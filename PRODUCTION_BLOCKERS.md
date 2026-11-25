# Production Blockers

**Release state: BLOCKED**

## Critical blockers

1. **RLS/grants and tenant boundaries:** No staging catalog output proves the actual table ownership model, current grants/policies, or cross-organization isolation. The supplied audit reports RLS disabled on 48/68 tables and unrestricted policies.
2. **Document privacy:** The supplied audit reports the `visa-documents` bucket is public and no object policies were returned. No staging negative access test has been run.

## High-priority release blockers

4. **Auth schema validation:** Local migrations and the backend access-profile query have schema differences. The new fail-closed behavior must be tested against the actual staging profile/role schema before deployment.
5. **Business workflows:** No end-to-end CRM, visa application/forms, document, payment, HR, or NEXUS workflow suite ran against synthetic staging data.
6. **Backup restore:** No database/storage restore test is recorded.
7. **Deployment validation:** No production provider/URLs were identified. Backend/frontend deploy configuration and health/rollback tests are absent. NEXUS production container behavior is unverified.
8. **NEXUS production image:** Node 24.11.1 local checks and dependency audits now pass, but production-container startup and health behavior have not been verified.

## Required next actions

1. Execute `STAGING_VALIDATION.sql` against a staging-only `STAGING_DATABASE_URL`; do not share credentials or query output containing customer data.
2. Review the catalog results with the database owner; map ownership from existing foreign keys and data; reconcile the migration history.
3. Produce a reviewed, additive staging migration with preconditions, validation, rollback, and impact analysis; obtain explicit staging approval before execution.
4. Test bucket privacy, signed URL authorization, and upload restrictions with synthetic files and org A/B users.
5. Run the existing NEXUS CI workflow and verify production-container startup/health; only local Node 24 validation has been run.
6. Run synthetic ERP E2E workflows and a backup restore in staging.
7. Validate health checks, monitoring, deployment, and rollback for the actual host before any production release.

## Completed local NEXUS dependency remediation

- Baseline full audit: 1 critical, 25 high, 36 moderate, and 5 low; final full and production audits both report zero.
- Node 24.11.1 / pnpm 11.17.0: frozen install, lint, typecheck, 60 test files / 199 tests, and build all pass.
- This closes the dependency-audit and local target-runtime blockers only. It does not validate deployment, connector authorization, database access, or tenant isolation.

No production database changes or deployments were performed.
