# Staging Database Readiness

**Assessment date:** 2026-11-25
**Result:** FAIL — the local migration set is not safe to deploy to a blank staging project.

## Project identity and safety

| Environment | Project name | Reference | Verification |
|---|---|---|---|
| Staging | Visa Matrix Staging | `rsvlxzespfidejaqisng` | Supplied by the user; not independently queried |
| Production | Visa Matrix ERP | `hnanyyimuvdfxyjjgwbd` | Supplied by the user and matches local `supabase/.temp/project-ref` |

No Supabase CLI executable is installed or available on PATH. Staging is not the current local link: root CLI metadata identifies production. No remote project was queried or changed. No environment file values or credentials were read. Do not run Supabase commands from the repository root.

The root `supabase/.temp` directory is tracked and contains CLI-generated project metadata. Its pooler and linked-project files were not opened or copied. Keep this metadata out of deployment preparation and review repository secret hygiene separately.

## Repository findings

- There are 23 backend migration candidates in `visa-matrix-backend/backend/supabase/migrations`.
- There are 7 frontend migrations in `visa-matrix-frontend/visa-matrix-frontend/supabase/migrations`. The frontend migration README explicitly identifies them as historical inputs and says not to apply them independently. They are excluded from the canonical deployment set.
- No `supabase/config.toml` exists at the root or in either application directory. The root `supabase` directory only contains tracked `.temp` metadata.
- The backend package exposes application start, build, lint, test, and seed scripts, but no Supabase CLI or database migration script.
- The remote migration ledger and staging schema were not inspected. The local repository has no authoritative record of which migrations are applied remotely.

## Why deployment is blocked

1. The first backend migration, `20260306_admin_dashboard.sql`, alters and updates `public.applications`, but the local sequence does not create that table until `20260310_auth_and_erp_repair.sql`. It cannot initialize a blank database as ordered.
2. `20260515_rbac_schema.sql` references `public.profiles` before the local sequence creates it in `20260518_create_profiles_table.sql`.
3. `20260522_enterprise_auth_system.sql` uses `CREATE TABLE IF NOT EXISTS` for tables whose earlier definitions have different columns and constraints. It then expects organization-scoped columns such as `roles.organization_id` and `permissions.organization_id`; prior migrations do not reliably add them. This is a likely migration failure, not a safe baseline.
4. The backend set has five duplicate migration version prefixes: `20260406`, `20260427`, `20260518`, `20260908`, and `20261123`. Supabase uses migration versions as unique history keys. These files need a reviewed, unique ordering before CLI deployment; renaming them without reconciling history could replay or skip migrations.
5. Security-incompatible legacy SQL exists: the core migration disables RLS on customer/application/document/payment tables, grants broad `anon`/`authenticated` DML, and creates public storage-object CRUD policies. Other migrations grant broad authenticated access to HR/payroll tables and use unrestricted `USING (true)` policies.
6. The latest tenant-repair draft enables RLS and revokes `anon`/`authenticated` access on resource tables but does not create replacement access policies. It can block application access and must not be applied without an approved access model and staging tests.
7. Some migrations mutate existing rows, replace constraints/triggers, and assume tables or helper functions not created in the migration that uses them. They are not a validated clean-install sequence.

## Security and schema posture

- Schema and foreign-key relationships listed in the migration files are local intended definitions only; actual staging tables, constraints, grants, policies, functions, and migration history remain unverified.
- `visa-documents` is initially created or updated as public. A later draft makes it private and removes only four specifically named public policies; any other policies and the required authorized access path remain unverified.
- The historical frontend migration set also creates a public `hr-documents` bucket and uses text identifiers for overlapping tables where backend migrations use UUIDs. Do not combine or replay it.
- Two form migration files are intentional no-ops that describe legacy `form_schemas`; the canonical table is `form_configs`. The later backend draft creates `form_configs` but has not been validated against staging.
- `STAGING_VALIDATION.sql` is a read-only catalog inspection script and was not run. `STAGING_DATABASE_MIGRATIONS.sql` is an intentional exception-raising hold file, not an apply-ready migration.

## Application configuration boundary

Backend staging configuration uses `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY` among its environment variables. The service-role key belongs only in the backend staging secret store. Frontend configuration uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; only the public anon key may be exposed to the browser. Do not copy production values or customer data to staging.

## Required manual prerequisites

1. Install the official Supabase CLI and authenticate through its secure login flow; do not put access tokens or database passwords in source files or command history.
2. Initialize CLI configuration from the backend directory only, preserving its existing migrations. Never use the root production-linked CLI directory.
3. Inspect the staging project and migration ledger using the explicit staging reference.
4. Reconcile the missing baseline and duplicate migration versions; review all RLS, grants, storage, and data transformations with the database owner.
5. Run the reviewed sequence against a disposable local database and obtain explicit approval before any staging write.

No production connection, SQL execution, migration, or deployment was performed.
