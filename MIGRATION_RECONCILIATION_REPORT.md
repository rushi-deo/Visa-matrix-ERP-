# Database migration reconciliation report

**Status:** Repository-only reconciliation. No migration has been applied to any database.

This report was initially captured before migration edits, as required. Three forward-only draft migrations were added afterward. Their contents remain unapplied and require a live schema/history review before any use.

**Scope reviewed:** `visa-matrix-backend/backend/supabase/migrations` and `visa-matrix-frontend/visa-matrix-frontend/supabase/migrations`.

## Migration history inventory

| Directory | Files found | Status |
|---|---:|---|
| Backend | 23 total: 20 pre-existing + 3 unapplied repair drafts | Remote application status is unverified |
| Frontend | 7 | A second, overlapping history; remote application status is unverified |

The backend directory is the proposed canonical location for future migrations because the backend owns the Express/Supabase integration. The frontend migration files remain historical inputs and must not be deleted or blindly replayed.

The two histories are not a single ordered chain. The frontend contains earlier `20260318`, `20260323`, `20260325`, and `20260330` entries, while the backend contains migrations from `20260306` through `20260908`. Several frontend files define objects that also exist in the backend history.

## Applied, failed, and pending migrations

These states cannot be established from the ZIP/repository alone. The workspace has linked Supabase metadata under the root `supabase/.temp`, but the Supabase CLI is not installed. A read-only `npx supabase migration list` attempt stalled without output and was stopped. No live migration command that writes schema or data was run.

| State | Result |
|---|---|
| Applied remotely | Unknown; requires a successful read-only migration-history query |
| Failed remotely | Unknown; repository files do not record server execution failures |
| Pending remotely | Unknown; do not infer from local timestamps |
| Actual live schema | Not inspected; no remote schema dump/catalog result is available |
| Records with unresolved ownership | Count unknown; the repository includes a customer quarantine migration, but no live data query was run |

The prior root audit documents describe an alleged live customer schema. Those statements are not used as database evidence in this report.

## Dependency and schema conflicts found locally

| Area | Local evidence | Risk / follow-up |
|---|---|---|
| Roles, permissions, role_permissions | Backend migrations define UUID identifiers. Frontend `20260318_rbac_multi_org.sql` initially uses UUID identifiers, while frontend `20260323_hr_core_module.sql` and `20260325_hr_enterprise_service_layer.sql` use `text` identifiers. Backend also has multiple RBAC definitions and permission-name variants such as `workflow:view` and `workflows:view`. | Do not merge or replay both histories until the live table types, constraints, and migration ledger are captured. Route permission names must match actual seeded rows. |
| Profiles | Backend `20260518_create_profiles_table.sql` and `20260522_enterprise_auth_system.sql` define profiles at different points in the history. The authentication middleware reads `id`, `user_id`, `email`, `role`, `organization_id`, `is_active`, `status`, and `user_roles`. | Verify all expected columns and foreign keys against the live table before selecting a forward repair. |
| Customers | Backend `20260310_auth_and_erp_repair.sql` and `20260311_visa_matrix_erp_core.sql` both define customer structures. Backend `20260908_customer_organization_ownership.sql` adds nullable organization ownership and quarantines unresolved rows without inventing ownership. | Verify which definition and ownership migration ran; compare the quarantine table and unresolved-row count. |
| Applications | Local backend schema has application/customer relations. Frontend migrations add application fields and policies. No inspected backend migration establishes organization ownership for applications. | Derive ownership from the owning customer only where the relationship is present and trustworthy; leave unresolved rows inaccessible/quarantined. |
| Documents, payments, tasks, workflows, invoices | Core schema links several of these to applications, but no reviewed backend migration establishes organization ownership for all of them. The runtime repositories need explicit tenant filters. | Add ownership only from a verified parent application/customer link; do not assign old records to a default organization. |
| Leads | Backend lead repository targets `new_applications`; no reviewed migration creates that table or establishes its organization owner. | Verify the live table and schema. Records with no validated owner must remain inaccessible and be quarantined. |
| Dynamic forms | The user requirement names `form_configs` as canonical. Backend and frontend source now read/write `form_configs`; backend migrations `20260422_form_configs.sql` and `20260720_forms_module_upgrade.sql` remain historical no-op notes that call `form_schemas` canonical. | The new `20261123_form_configs_and_nexus_permissions.sql` draft creates/validates the canonical table and public published-form read policy. It does not copy `form_schemas` rows because live catalog matching and duplicates cannot be checked from the repository. Legacy rows remain preserved and need an approved, reviewed migration plan. |
| UUID versus TEXT | Backend/core RBAC IDs are UUID. Several frontend HR/enterprise tables use `text` IDs generated from UUID values. | Resolve the live FK graph and actual column types before any conversion. Converting IDs in place is not safe without data and reference analysis. |

## RLS and grants evidence matrix

This matrix describes only SQL present in the local migration files. It does not assert current live policy state.

| Table / surface | Local migration evidence | Local finding |
|---|---|---|
| `customers`, `applications`, `documents`, `payments`, `workflows`, `tasks`, `notifications` | Backend `20260311_visa_matrix_erp_core.sql` grants `SELECT, INSERT, UPDATE, DELETE` to both `anon` and `authenticated`; it also contains a broad grant over tables. | Critical excessive grants; no corresponding RLS enablement for these tables was found in the same core migration. |
| `documents` | Frontend `20260330_documents_select_policy.sql` enables RLS and adds an “allow read documents” policy. | Policy body must be reviewed for public/unscoped access; no tenant expression is established by the filename alone. |
| `applications` | Frontend `20260330_applications_insert_policy.sql` adds authenticated select/insert policies. | Policies need tenant predicates and update/delete coverage review. |
| `countries` | Frontend `20260318_rbac_multi_org.sql` enables RLS and adds a read-active policy. | Reference data is lower sensitivity; verify grants and policy roles remotely. |
| `profiles`, `organizations`, `roles`, `permissions`, `departments`, `sessions`, `login_history`, `audit_logs` | Backend `20260522_enterprise_auth_system.sql` enables RLS for these tables and defines policies. | Local policy coverage exists, but live policy state and tenant predicates remain unverified. |
| `visa_type`, `requirements` | Backend `20260427_visa_type_requirements_select_policy.sql` enables RLS and grants anonymous/authenticated select with `USING (true)`. | Public read access is explicitly configured locally; verify whether intended and whether table names match the live schema. |
| `visa-documents` bucket | Backend `20260311_visa_matrix_erp_core.sql` creates the bucket as public and creates unrestricted select/insert/update/delete storage policies. | Critical public-storage exposure in the local migration history; repair requires a forward-only migration and private signed-URL flow. |
| Tenant business tables | Backend `20260311_visa_matrix_erp_core.sql` grants broad `anon` and `authenticated` DML. The new draft adds organization columns, trusted-parent backfills, quarantine records, `NOT VALID` future-owner constraints, RLS enablement, and revokes direct anon/authenticated privileges. | Draft only; API service role remains the access path and must continue enforcing tenant and permission checks. No existing owner is invented. |
| Document storage | The new `20261123_private_document_storage.sql` draft flips the bucket private and removes the four known unrestricted public policies. | Draft only; inspect any additional live storage policies before considering it. |

## Safe next actions

1. Obtain a successful read-only remote migration history and schema catalog snapshot.
2. Compare the snapshot to both migration directories and count unresolved ownership by table.
3. Keep backend migrations as the only forward path after recording the existing remote ledger; retain frontend files for audit until contents and deployment history have been reconciled.
4. Review the three `20261123_*` draft migrations against the captured live schema, policy list, and ownership counts; edit only forward from the actual live state.
5. Apply no migration to production from this workspace.
