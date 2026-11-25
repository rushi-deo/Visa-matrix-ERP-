# Staging Validation Checklist

**Status:** BLOCKED / NOT TESTED — no staging connection or migration was attempted.
**Target reference:** `rsvlxzespfidejaqisng` (user-supplied; verify project name and reference in Dashboard)

## Before any staging connection

- [ ] Confirm the Dashboard shows project name **Visa Matrix Staging** and reference `rsvlxzespfidejaqisng`.
- [ ] Confirm the production project reference is `hnanyyimuvdfxyjjgwbd`; do not connect to it.
- [ ] Install the official Supabase CLI and authenticate securely. Do not share access tokens or database passwords.
- [ ] Work from `visa-matrix-backend\backend`, not the repository root. The root `supabase\.temp\project-ref` currently points to production.
- [ ] Initialize the backend CLI config without `--force`, preserving all migration files.
- [ ] Use the explicit `--remote=rsvlxzespfidejaqisng` flag for every remote CLI command. Confirm the printed target before continuing.
- [ ] Use staging-only backend secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`) and frontend public settings (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Never put a service-role key in the frontend.
- [ ] Ensure test data is synthetic. Do not clone or import production customer, passport, identity, or financial data.
- [ ] Resolve the missing migration prerequisites, duplicate version IDs, schema conflicts, broad policies, and incomplete tenant repair before any deploy dry run.

## Migration and schema checks

- [ ] Record the read-only result of `supabase migration list --remote=rsvlxzespfidejaqisng`.
- [ ] Confirm whether staging is actually blank and whether `supabase_migrations.schema_migrations` exists; do not assume either.
- [ ] Confirm backend migration versions are unique and the reviewed order replays from a blank database.
- [ ] Confirm the frontend migrations remain excluded.
- [ ] Replay the reconciled backend sequence against a disposable local database and resolve all SQL errors before staging.
- [ ] Run `supabase db push --dry-run --remote=rsvlxzespfidejaqisng`; compare the exact planned migrations and target before considering a write.
- [ ] Obtain explicit human approval before any staging write. The final `db push` has not been run or approved.

## Post-migration staging checks (not yet run)

- [ ] Run `STAGING_VALIDATION.sql` from the Supabase Dashboard SQL Editor with the staging project visibly selected. The script starts a read-only transaction; do not run it against production.
- [ ] Verify expected tables, columns, foreign keys, indexes, constraints, functions, triggers, views, grants, migration ledger, and storage buckets/policies against the approved design.
- [ ] Confirm RLS is enabled where required and test anonymous, authenticated, employee, manager, admin, and customer access boundaries.
- [ ] Confirm organization/tenant isolation with synthetic records; verify cross-organization reads and writes are rejected.
- [ ] Confirm no unrestricted `USING (true)` / `WITH CHECK (true)` policies remain on sensitive tables unless an explicitly reviewed public use case requires them.
- [ ] Confirm `visa-documents` is private and document download/upload/delete routes enforce ownership and organization authorization. Verify signed access expires and cannot be generated for unauthorized documents.
- [ ] Test Supabase Auth, backend JWT/RBAC, and the NEXUS connector against staging only.
- [ ] Run the backend, frontend, and NEXUS test suites plus end-to-end synthetic CRM, application, document, payment, and HR workflows.
- [ ] Capture sanitized results, failures, and target identity; do not record secrets or personal data.

## Current evidence

| Check | Result |
|---|---|
| Staging reference received | PASS — supplied as `rsvlxzespfidejaqisng`; remote identity not independently confirmed |
| Production reference known | PASS — `hnanyyimuvdfxyjjgwbd` |
| Local CLI available | FAIL — Supabase CLI not installed/on PATH |
| Local CLI config | FAIL — no `supabase/config.toml` in root or application directories |
| Current root CLI metadata | FAIL for staging isolation — local reference is production |
| Remote migration history/schema | NOT TESTED — no authenticated remote access |
| Clean blank-database replay | FAIL — local migration order has missing prerequisites and duplicate versions |
| RLS/storage validation | NOT TESTED remotely; local migrations contain known blockers |
| Staging deploy/dry run | NOT TESTED — deliberately not executed |
| Production changes | NONE |
