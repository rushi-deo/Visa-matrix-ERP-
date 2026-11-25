# Rollback Plan

**Status:** Prepared locally; not exercised against staging or production.

## Application rollback

1. Stop promotion if any CI, health, authorization, tenant, document, payment, or audit gate fails.
2. Retain the last known-good backend, frontend, and NEXUS artifacts with immutable version identifiers supplied by the actual hosting provider. No provider or version is assumed here.
3. Roll back each application independently to its last known-good artifact using the provider's documented procedure.
4. Verify health endpoints, login, role checks, tenant boundaries, document signed URLs, and read-only payment visibility using synthetic accounts.
5. Keep writes disabled or route traffic to a safe maintenance response if records may have been partially written. Do not silently retry non-idempotent payment or document operations.
6. Record request/correlation IDs and the change window; do not include tokens or document data in incident logs.

## Database rollback

- `STAGING_DATABASE_MIGRATIONS.sql` makes no schema changes and raises an exception intentionally; rollback is not applicable.
- Existing candidate SQL files were not executed. They are not approved rollback scripts.
- Before any future schema migration, require a reviewed forward/rollback pair, precondition and postcondition queries, synthetic-data tests, and an approved staging restore point.
- Prefer a tested forward repair for data migrations. Do not drop columns, policies, or tables on production as an improvised rollback.
- Never restore a production backup over a live database without an incident commander, verified restore plan, and explicit approval.

## Storage rollback

- Do not revert the document bucket to public as a rollback.
- If a private-bucket migration is approved, verify signed URL and ownership access before rollout and retain the prior storage configuration as documented provider state, not as public-access policy.
- Restore only the affected synthetic staging objects during rehearsal. Production object restoration requires explicit authorization and audit.

## Recovery evidence required before release

- Database restore log and integrity checks.
- Private document object restore test.
- Application artifact identifiers and provider rollback procedure.
- Observed recovery time and responsible operator.
- Smoke tests for authentication, tenant isolation, storage, and payments.
