# Staging Migration Plan

**Status:** BLOCKED — review and repair are prerequisites; no migration is approved for deployment.
**Canonical directory:** `visa-matrix-backend/backend/supabase/migrations`
**Staging target:** `rsvlxzespfidejaqisng` (user-supplied; not independently verified)

## Migration source and ordering

The inventory contains 30 SQL files: 23 backend candidates and 7 frontend historical files. The backend directory is the only candidate source for a future migration sequence. The frontend migration README marks its files historical; do not combine or replay them. The backend files have five repeated version prefixes. The files below are grouped chronologically; files sharing a version do not have a safe, established execution order.

| Version | Backend migration | Review finding |
|---|---|---|
| 20260306 | `20260306_admin_dashboard.sql` | Alters/updates `public.applications` before a local migration creates it; unsafe as the first migration on blank staging. |
| 20260310 | `20260310_auth_and_erp_repair.sql` | Repair/base-like DDL, but includes assumptions about existing application/auth schema. |
| 20260311 | `20260311_visa_matrix_erp_core.sql` | Disables RLS on sensitive tables; grants broad anon/authenticated DML; creates public document bucket/object policies. Security blocker. |
| 20260406 | `20260406_extend_invoices_for_visa_pricing.sql` | Extends invoice schema; same version as the next file. |
| 20260406 | `20260406_visa_fees_import_access.sql` | Disables RLS and grants anon/authenticated read on `visa_fees_import`; same version as previous file. |
| 20260415 | `20260415_relational_pricing_lookup.sql` | Adds relational pricing/lookup structures and modifies application/import relationships; requires schema and data review. |
| 20260422 | `20260422_form_configs.sql` | Legacy form-schemas reference/no-op; not the canonical `form_configs` schema. |
| 20260427 | `20260427_backend_standardization_audit_state.sql` | Adds audit/history state; includes broad authenticated read policies; same version as next file. |
| 20260427 | `20260427_visa_type_requirements_select_policy.sql` | Adds permissive visa-type read policies; same version as previous file. |
| 20260515 | `20260515_rbac_schema.sql` | References `public.profiles` before its local creation on 20260518. |
| 20260518 | `20260518_create_profiles_table.sql` | Creates an early profiles shape; same version as the enterprise RBAC migration. |
| 20260518 | `20260518_enterprise_rbac_admin.sql` | Adds organization/RBAC structures and backfills profile organization values; same version as previous file. |
| 20260522 | `20260522_enterprise_auth_system.sql` | `IF NOT EXISTS` does not reconcile earlier table definitions; expects columns/constraints not reliably created by prior migrations. |
| 20260523 | `20260523_enterprise_role_guest.sql` | Seeds a guest role; depends on the earlier RBAC schema. |
| 20260524 | `20260524_employee_identity_hierarchy.sql` | Adds hierarchy/branch structures and seeds values; depends on profiles and organization design. |
| 20260527 | `20260527_accounts_module_permissions.sql` | Adds permission data; depends on the selected RBAC schema. |
| 20260609 | `20260609_reconcile_customers_schema.sql` | Backfills customer names and replaces constraints/triggers; references `update_updated_at_column()`, whose existence is not established by the reviewed helper migrations. |
| 20260720 | `20260720_forms_module_upgrade.sql` | Legacy form-schemas reference/no-op; does not establish canonical `form_configs`. |
| 20260908 | `20260908_audit_contract.sql` | Adds audit contract fields/constraints; same version as next file and assumes organizations exist. |
| 20260908 | `20260908_customer_organization_ownership.sql` | Backfills organization ownership, quarantines unresolved rows, and adds constraints; same version as previous file. |
| 20261123 | `20261123_form_configs_and_nexus_permissions.sql` | Draft canonical `form_configs` and NEXUS permissions with schema preconditions; same version as two following files. |
| 20261123 | `20261123_private_document_storage.sql` | Makes `visa-documents` private and drops selected named policies only; other policies/access paths need review. |
| 20261123 | `20261123_tenant_ownership_and_rls_repair.sql` | Backfills ownership, enables RLS, and revokes access without replacement policies on affected tables; draft, high application-impact risk. |

### Historical frontend files (not part of the deployable sequence)

| Version | Frontend migration | Review finding |
|---|---|---|
| 20260318 | `20260318_rbac_multi_org.sql` | Overlaps backend RBAC with different table/identifier assumptions. |
| 20260323 | `20260323_hr_core_module.sql` | Creates overlapping HR/RBAC structures and a public `hr-documents` bucket. |
| 20260325 | `20260325_hr_enterprise_service_layer.sql` | Broad authenticated policies on sensitive HR/payroll/workflow tables. |
| 20260330 | `20260330_applications_application_code.sql` | Adds application code; same version as three other frontend migrations. |
| 20260330 | `20260330_applications_created_by_column.sql` | Adds a `created_by` relationship to a users table; same version as other frontend migrations. |
| 20260330 | `20260330_applications_insert_policy.sql` | Adds application policies; same version as other frontend migrations. |
| 20260330 | `20260330_documents_select_policy.sql` | Adds a broad document read policy; same version as other frontend migrations. |

## Safe execution sequence after remediation

1. **Keep the target isolated.** Use the backend directory, not the repository root, because root `.temp/project-ref` currently names production. Verify the staging project name and reference in the Supabase Dashboard before connecting.
2. **Set up the CLI locally.** Install the official Supabase CLI and authenticate through its secure interactive login. From the backend directory, run `supabase init` only after confirming `supabase/config.toml` is still absent. Do not use `--force`; retain all existing migrations.
3. **Inspect remote history read-only.** Use the explicit staging reference below. Check the CLI's printed target and stop if it does not show `rsvlxzespfidejaqisng`. Save the migration-list result without credentials or customer data. A staging schema/ledger has not yet been inspected.
4. **Reconcile the migration set.** Establish the missing baseline and dependencies, unique migration versions, canonical `form_configs`, intended ownership model, grants, RLS policies, and private storage access. Review every data backfill and rollback limitation. Do not infer remote history or rename IDs blindly.
5. **Validate locally in a disposable environment.** Replay only the reconciled backend set and run schema, authorization, tenant-isolation, and storage checks. Do not use production data.
6. **Obtain explicit staging approval.** Review the dry-run list and exact target. Only then may an authorized operator run the final push. No such approval or push is part of this preparation task.
7. **Validate staging.** Run the read-only catalog checks in `STAGING_VALIDATION.sql` against staging, then run synthetic-data application and security tests. Do not copy production data.

## Commands prepared, not executed

The commands below are for a later, authorized staging session. None were run during this preparation task. Install the CLI using the official Windows instructions first. Do not enter credentials in this document or in command-line arguments.

```powershell
Set-Location 'C:\Users\Admin\Visa Matrix ERP\visa-matrix-backend\backend'
supabase --version
supabase init
supabase login
supabase migration list --remote=rsvlxzespfidejaqisng
supabase db push --dry-run --remote=rsvlxzespfidejaqisng
```

`supabase init` is a local configuration step. The remote list and dry run require authenticated staging access; the explicit `--remote` reference is intentional and must not be changed to production. Review the CLI output's target identity. The dry run is not permission to push.

The eventual write command, **blocked and not approved**, is:

```powershell
supabase db push --remote=rsvlxzespfidejaqisng
```

Do not run it until every blocker above is resolved and the migration plan has explicit approval. Do not use `supabase migration repair`, `supabase db pull`, or a production-linked working directory as a shortcut.
