# Staging Migration Remediation Report

**Assessment date:** 2026-11-25
**Decision:** **FAIL — do not deploy the current migration set to staging.**
**Staging project:** `rsvlxzespfidejaqisng` (user-supplied; not independently verified)
**Production project:** `hnanyyimuvdfxyjjgwbd`

## 1. Scope and safety

Reviewed the four staging-preparation documents and all 30 local SQL files: 23 backend candidates and 7 frontend historical migrations. The frontend migration README identifies the frontend files as historical and not the canonical deployment source.

This is a static repository review only. No Supabase project was linked or switched, no remote schema or migration ledger was queried, no SQL was executed, and no existing migration or configuration file was changed. The local root CLI metadata still identifies production; do not use the repository root as the Supabase CLI work directory. The staging project's actual name, schema, data state, and migration history remain unverified.

## 2. Executive findings

The current files do not form a safe, deterministic blank-project initialization sequence:

- The first backend migration refers to `public.applications` before a local migration creates it.
- The backend has five duplicate migration version prefixes; 11 backend files share those duplicate prefixes.
- `public.visa_fees_import` is read and altered, but no reviewed migration creates it.
- Several migrations create overlapping tables with incompatible shapes and then use `CREATE TABLE IF NOT EXISTS`, which does not reconcile the earlier definitions.
- The core migration disables RLS and gives `anon` and `authenticated` CRUD access to sensitive tables; it also makes `visa-documents` public and adds public object CRUD policies.
- HR historical migrations grant all authenticated users broad access to salary, payroll, workflows, and notifications, and create a public HR document bucket.
- The latest tenant migration backfills some ownership, quarantines unresolved records, enables RLS, and revokes access without installing replacement application policies.
- There is no verified staging schema or migration ledger against which to decide whether local migrations would be new, already applied, or conflicting.

**No current effectful migration is safe to deploy as-is.** Two backend form files are no-op comments and should be excluded from the deployable sequence, not mistaken for schema setup. All other backend candidates require prerequisite, schema, security, version, or data-impact review before use.

## 3. Filename and migration-version conflicts

The filenames use eight-digit day prefixes (`YYYYMMDD`), with multiple files assigned the same version. Supabase migration history identifies migrations by version, so these collisions cannot represent distinct independently tracked migrations. Do not rename or reorder applied migrations until the staging ledger is inspected.

| Backend version | Conflicting files |
|---|---|
| `20260406` | `20260406_extend_invoices_for_visa_pricing.sql`; `20260406_visa_fees_import_access.sql` |
| `20260427` | `20260427_backend_standardization_audit_state.sql`; `20260427_visa_type_requirements_select_policy.sql` |
| `20260518` | `20260518_create_profiles_table.sql`; `20260518_enterprise_rbac_admin.sql` |
| `20260908` | `20260908_audit_contract.sql`; `20260908_customer_organization_ownership.sql` |
| `20261123` | `20261123_form_configs_and_nexus_permissions.sql`; `20261123_private_document_storage.sql`; `20261123_tenant_ownership_and_rls_repair.sql` |

The frontend historical set has four files sharing `20260330`: application-code column, `created_by` column, application policies, and document read policy. Keep that entire directory excluded; do not merge it with backend history. If any historical file is ever adopted, it needs a reviewed unique version and schema reconciliation first.

## 4. Missing prerequisites and dependency order

| Finding | Evidence and consequence |
|---|---|
| Applications prerequisite is reversed | [20260306_admin_dashboard.sql](visa-matrix-backend/backend/supabase/migrations/20260306_admin_dashboard.sql) runs `ALTER TABLE public.applications` and updates it. The table is first created in [20260310_auth_and_erp_repair.sql](visa-matrix-backend/backend/supabase/migrations/20260310_auth_and_erp_repair.sql). The filename order therefore fails on a blank database. The admin migration also creates `admin_users`, while the later repair migration conditionally copies from `admin_users`; simply swapping the files changes that copy's behavior. |
| Core schema depends on the repair schema | [20260311_visa_matrix_erp_core.sql](visa-matrix-backend/backend/supabase/migrations/20260311_visa_matrix_erp_core.sql) uses earlier columns such as `countries.name`, `visa_types.name`, `code`, `processing_days`, `fee`, and `description`; it adds different columns but does not establish all of those prerequisites itself. It also redefines customers, applications, documents, payments, workflows, tasks, notifications, and countries differently. |
| Import table is missing | [20260406_visa_fees_import_access.sql](visa-matrix-backend/backend/supabase/migrations/20260406_visa_fees_import_access.sql) alters and queries `public.visa_fees_import`. [20260415_relational_pricing_lookup.sql](visa-matrix-backend/backend/supabase/migrations/20260415_relational_pricing_lookup.sql) conditionally adds columns but then performs unguarded reads and writes to the same table. No reviewed backend migration creates it. Obtain its authoritative DDL or exclude these import-dependent changes and reconcile application consumers; do not invent the table. |
| Invoice extension requires base invoice table | [20260406_extend_invoices_for_visa_pricing.sql](visa-matrix-backend/backend/supabase/migrations/20260406_extend_invoices_for_visa_pricing.sql) alters `public.invoices`. The table is defined by the earlier backend repair migration; the file still needs a unique migration version. |
| Profiles are referenced before local creation | [20260515_rbac_schema.sql](visa-matrix-backend/backend/supabase/migrations/20260515_rbac_schema.sql) adds a foreign key from `user_roles.user_id` to `public.profiles(id)`. The first local profile table is in [20260518_create_profiles_table.sql](visa-matrix-backend/backend/supabase/migrations/20260518_create_profiles_table.sql). Dependency order requires profiles first, followed by RBAC, regardless of current filename dates. |
| `IF NOT EXISTS` hides schema drift instead of repairing it | The March migrations create `roles`, `permissions`, and other tables without the enterprise `organization_id`/`level` shape. The May 18 migration adds `organization_id` to profiles and seeds organization-scoped permissions but not the missing organization columns on existing roles/permissions. [20260522_enterprise_auth_system.sql](visa-matrix-backend/backend/supabase/migrations/20260522_enterprise_auth_system.sql) then declares those tables with `CREATE TABLE IF NOT EXISTS` and uses organization-scoped columns. It will not add the missing columns to existing tables. |
| Employee hierarchy references fields not guaranteed by earlier definitions | [20260524_employee_identity_hierarchy.sql](visa-matrix-backend/backend/supabase/migrations/20260524_employee_identity_hierarchy.sql) comments on `profiles.reporting_manager_id` and `profiles.metadata` and adds a foreign key on `profiles.branch_id`. Earlier `profiles` definitions do not consistently create these columns; the hierarchy migration itself only adds `employee_code`, `designation`, and `joining_date`. |
| Accounts permissions require the enterprise RBAC shape | [20260527_accounts_module_permissions.sql](visa-matrix-backend/backend/supabase/migrations/20260527_accounts_module_permissions.sql) expects `permissions.organization_id`, an organization-scoped role, and a matching uniqueness contract. These are not established by the earlier table definitions. |
| Customer trigger helper does not match local helper | [20260609_reconcile_customers_schema.sql](visa-matrix-backend/backend/supabase/migrations/20260609_reconcile_customers_schema.sql) creates a trigger using `public.update_updated_at_column()`. The reviewed backend base migrations define `public.set_updated_at()` instead; the former function is not established by this migration set. The customer migration also adds a named constraint without `IF NOT EXISTS`, drops/replaces constraints and triggers, and backfills placeholder names, so it needs functional and data review. |
| Ownership migrations depend on a trusted organization model | The September customer ownership migration uses `customers.user_id -> profiles.id -> profiles.organization_id`. The November tenant migration derives applications from customers and child records from applications. These assumptions require the actual identity and foreign-key model to be verified; the earlier single-default-organization backfill can assign all profiles to Visa Matrix and must not be treated as proof of tenant ownership. |

Other missing/live prerequisites cannot be concluded from repository files: whether staging is blank, whether its migration ledger exists, whether required legacy objects already exist, and whether the production-derived schema differs from these scripts. Those facts require a read-only staging inventory before any sequence or version changes are approved.

## 5. Duplicate and overlapping schema changes

| Database objects | Overlap and incompatibility |
|---|---|
| `roles`, `permissions`, `role_permissions`, `user_roles` | March backend roles use `code`/`name`; May enterprise roles require `organization_id`, `level`, and a different uniqueness model. The frontend variants use text IDs, global role names, and a different `role_permissions` shape. `CREATE TABLE IF NOT EXISTS` preserves whichever definition ran first. |
| `profiles` and user identity | The early profile table has a UUID `id` without an `auth.users` foreign key and only basic fields. The enterprise definition expects `id REFERENCES auth.users(id)`, required `organization_id`/email, and department, role, branch, status, and reporting fields. The latter `CREATE TABLE IF NOT EXISTS` cannot retrofit the former. Verify which application identity maps to `auth.uid()` before relying on profile ownership. |
| `countries` and `visa_types` | March backend definitions use multiple names for country and visa fields (`name`/`country_name`, `code`/`country_code`, `name`/`visa_name`, fee/processing variants). Relational pricing backfills both representations. The legacy frontend migration also updates `countries` using a `country` column that is not created in the reviewed backend sequence. |
| `applications` | Competing status columns/defaults (`status`, `application_status`), date fields, `profile_id`/`customer_id`/`user_id`, and ownership columns are added in different files. The 20260427 migration normalizes statuses; the frontend historical file adds an unscoped `organization_id`/`created_by`. |
| `customers` | March backend files create different customer shapes. The June reconciliation fills missing names with synthetic placeholders and rebuilds constraints. September ownership later relies on `user_id` linked to profiles. These transformations require one approved customer schema and tested backfill semantics. |
| `documents`, `payments`, `invoices`, `workflows`, `tasks`, `notifications` | Backend repair and core migrations use overlapping but different columns/statuses and relations. The frontend HR/workflow migrations reuse some of these table names with text IDs and different purposes. Do not replay the frontend definitions over the backend schema. |
| `audit_logs` | The March/core and May auth migrations define different audit field names and constraints. September adds both old and new names. Its organization FK uses `ON DELETE SET NULL`, which is incompatible with the May auth definition's `organization_id NOT NULL` if that definition is the one present. |
| Form definitions | `20260422_form_configs.sql` and `20260720_forms_module_upgrade.sql` are comments/no-op files referring to legacy `form_schemas`; they do not create the canonical `form_configs`. The November form migration creates `form_configs` and deliberately does not copy legacy rows. Do not create or adopt `form_schemas` as a replacement. |
| Quarantine tables | September creates `customer_ownership_quarantine`; November creates `tenant_ownership_quarantine`. The former is not explicitly protected with RLS/grants in its migration. Define a single reviewed operator-only quarantine and retention model before applying either. |

## 6. RLS, grants, and unsafe permissions

1. **Core migration disables RLS and grants broad CRUD.** The 20260311 core migration disables RLS for `countries`, `visa_types`, `customers`, `applications`, `documents`, `payments`, `workflows`, `tasks`, and `notifications`; it grants `anon` and `authenticated` select/insert/update/delete on them and adds default privileges granting the same DML on future public tables. This is not tenant isolation.
2. **Visa-fee data is readable anonymously.** The 20260406 access migration disables RLS on `visa_fees_import` and grants `SELECT` to both `anon` and `authenticated`.
3. **Application and document policies are global.** The frontend historical application policy grants every authenticated user `SELECT ... USING (true)` on applications, and its document policy grants unrestricted `SELECT ... USING (true)`. These files must remain excluded.
4. **Historical HR policies expose/modify sensitive rows across tenants.** The frontend HR service-layer migration's `FOR ALL` policies allow any authenticated user to select/insert/update/delete rows in role permissions, salary structures, payroll logs, workflow definitions/instances, and notifications when authenticated. No organization or employee-owner check appears in those predicates.
5. **Audit/history reads are unscoped.** The backend 20260427 standardization migration grants authenticated select/insert on application history/events and creates `SELECT ... USING (true)` policies. The 20260427 visa-type/requirements migration grants anonymous/authenticated select with `USING (true)` on the legacy tables if present. The latter may be acceptable only for explicitly public reference data, after confirming the table contract.
6. **Enterprise RLS is incomplete and some predicates are too broad.** The May enterprise migration enables RLS on profiles, organizations, roles, permissions, departments, sessions, login history, and audit logs. It adds no policies for organizations, roles, permissions, or departments in the reviewed file, which can deny ordinary application access. The profile self-update policy does not restrict mutable columns; if the role has table UPDATE privileges, users may be able to change security-sensitive fields such as organization or role. The manager predicate lacks an explicit organization check. “Super Admin” predicates are not scoped to the user's organization.
7. **Tenant repair revokes access but installs no replacements.** The November tenant migration enables RLS and revokes `anon`/`authenticated` access on each detected resource table. It defines no organization-scoped `SELECT`/`INSERT`/`UPDATE`/`DELETE` policies or corresponding grants. Direct client access will be denied; do not treat this as a completed access model.
8. **No FORCE RLS or effective grant inventory is established.** The migration files do not prove the actual staging table owners, default privileges, Supabase platform grants, or whether service-role operations bypass RLS as expected. Validate effective grants and policy behavior on staging before any deployment.

## 7. Tenant ownership requirements

Before any tenant migration can be approved:

- Verify the real identity relation between `auth.users`, `profiles`, `users`, `customers`, and employees. A user/profile ID equality is an intended relationship in some files, not proof for every account.
- Establish and document one UUID organization ownership source. Do not assign records to a default organization merely to satisfy `NOT NULL`.
- Use only verified parent relations for backfills: customer to profile, application to customer, and child resource to application or customer. Preserve unresolved and conflicting records in an operator-only quarantine; do not guess an owner.
- Review the September customer check and November generic ownership checks with quarantined rows. `NOT VALID` does not mean resolved; it still affects new writes and requires a deliberate validation plan.
- Close coverage gaps before claiming tenant isolation. The November target list covers customers, applications, `new_applications`, documents, payments, invoices, quotations, tasks, and workflows, but the backend also defines `leads`, `messages`, `reports`, audit/history/event tables, notifications, roles/permissions, and other HR records. Their ownership/access model is not implemented by that migration.
- Check child-to-parent ownership mismatches for every relationship and deny access until repaired. Make read/write policies enforce both the caller's organization membership and each record's parent ownership.
- Define separate minimum access for service-role backend jobs, NEXUS connector actions, and direct authenticated clients. Test anonymous, customer, employee, manager, admin, and cross-organization paths with synthetic data.

## 8. Storage and document access requirements

- The 20260306 and 20260310 migrations create `visa-documents` as public; the 20260311 core migration can set it public on conflict and creates public select/insert/update/delete policies on `storage.objects`.
- The frontend historical HR migration creates a public `hr-documents` bucket. Exclude it and treat any existing bucket as sensitive until reviewed.
- The November private-storage draft sets `visa-documents.public = false` and drops four exact legacy policy names, but it does not add owner-scoped Storage policies. It cannot prove there are no other public policies or public buckets in staging.
- Before making the bucket private, verify the application download path uses authorized backend checks and short-lived signed URLs (or another approved authenticated storage policy). Verify object ownership against the application/customer organization, plus upload MIME/size constraints, path conventions, expiry, and delete authorization.
- Confirm bucket and object policy state after deployment using staging catalog/API checks. Never test with real passports or identity/financial files.

## 9. Migration disposition

**Safe as-is:** none of the effectful migrations. “Modify” means the SQL needs a reviewed correction before deployment; “conditional” means prerequisites and target schema must be verified. No file was modified during this review.

| Migration | Disposition | Required action |
|---|---|---|
| [20260306_admin_dashboard.sql](visa-matrix-backend/backend/supabase/migrations/20260306_admin_dashboard.sql) | Modify/reorder | Run only after the canonical applications table exists; reconcile its `admin_users` creation/data-copy timing and protect that table. |
| [20260310_auth_and_erp_repair.sql](visa-matrix-backend/backend/supabase/migrations/20260310_auth_and_erp_repair.sql) | Modify/reconcile | Candidate source for base structures, not an approved baseline. Reconcile identity, table shapes, and duplicate core definitions; review the migration copying `admin_users.password_hash` into `users.password` and the profile-to-customer data copy. |
| [20260311_visa_matrix_erp_core.sql](visa-matrix-backend/backend/supabase/migrations/20260311_visa_matrix_erp_core.sql) | Modify or exclude | Do not apply with RLS disabled, broad anon/authenticated DML, broad default privileges, or public object CRUD. Reconcile its schema with the approved base. |
| [20260406_extend_invoices_for_visa_pricing.sql](visa-matrix-backend/backend/supabase/migrations/20260406_extend_invoices_for_visa_pricing.sql) | Conditional | Keep only after canonical `invoices` exists; assign a unique version and validate required invoice columns. |
| [20260406_visa_fees_import_access.sql](visa-matrix-backend/backend/supabase/migrations/20260406_visa_fees_import_access.sql) | Modify/block | No local DDL creates `visa_fees_import`; do not grant anonymous read or disable RLS. Obtain authoritative table definition and required backend access first. |
| [20260415_relational_pricing_lookup.sql](visa-matrix-backend/backend/supabase/migrations/20260415_relational_pricing_lookup.sql) | Modify/block | Depends on the missing import table and existing lookup schema. Review its row backfills and MD5-derived `country_code` values; do not assume those are real country codes. |
| [20260422_form_configs.sql](visa-matrix-backend/backend/supabase/migrations/20260422_form_configs.sql) | Exclude | No-op referring to legacy `form_schemas`; does not create canonical `form_configs`. |
| [20260427_backend_standardization_audit_state.sql](visa-matrix-backend/backend/supabase/migrations/20260427_backend_standardization_audit_state.sql) | Modify | Keep only after dependencies exist; replace global history/event read policies with approved access, and validate direct authenticated inserts/audit authority. Resolve duplicate version. |
| [20260427_visa_type_requirements_select_policy.sql](visa-matrix-backend/backend/supabase/migrations/20260427_visa_type_requirements_select_policy.sql) | Exclude unless justified; then modify | Targets legacy singular `visa_type`/`requirements`; only retain if those are verified public reference tables and anonymous reads are explicitly approved. |
| [20260515_rbac_schema.sql](visa-matrix-backend/backend/supabase/migrations/20260515_rbac_schema.sql) | Modify/reorder | Profiles must exist first; reconcile global and organization-scoped role/permission schemas and prevent privilege assignment from relying on inconsistent role names. |
| [20260518_create_profiles_table.sql](visa-matrix-backend/backend/supabase/migrations/20260518_create_profiles_table.sql) | Modify/reconcile | Establish the verified `auth.users` relationship and one final profile shape before dependent RBAC/hierarchy migrations. |
| [20260518_enterprise_rbac_admin.sql](visa-matrix-backend/backend/supabase/migrations/20260518_enterprise_rbac_admin.sql) | Modify | Verify the single-organization profile backfill is intended; reconcile organization columns/uniqueness and avoid treating the seed organization as inferred ownership. |
| [20260522_enterprise_auth_system.sql](visa-matrix-backend/backend/supabase/migrations/20260522_enterprise_auth_system.sql) | Modify substantially | Reconcile existing tables instead of relying on `IF NOT EXISTS`; add organization-scoped least-privilege policies, protect profile security fields, scope manager/admin predicates, and repair missing policies. |
| [20260523_enterprise_role_guest.sql](visa-matrix-backend/backend/supabase/migrations/20260523_enterprise_role_guest.sql) | Conditional | Apply only after the final roles table has the expected organization/name/level fields and the role seed is approved. |
| [20260524_employee_identity_hierarchy.sql](visa-matrix-backend/backend/supabase/migrations/20260524_employee_identity_hierarchy.sql) | Modify | Add/verify all referenced profile columns before comments/FKs; verify branch IDs and organization assignment. |
| [20260527_accounts_module_permissions.sql](visa-matrix-backend/backend/supabase/migrations/20260527_accounts_module_permissions.sql) | Conditional/modify | Apply only after organization-scoped permissions/roles and unique constraints are reconciled. |
| [20260609_reconcile_customers_schema.sql](visa-matrix-backend/backend/supabase/migrations/20260609_reconcile_customers_schema.sql) | Modify | Resolve the missing trigger helper; make constraint creation safely repeatable; approve placeholder name backfill and foreign-key behavior. |
| [20260720_forms_module_upgrade.sql](visa-matrix-backend/backend/supabase/migrations/20260720_forms_module_upgrade.sql) | Exclude | No-op referring to legacy `form_schemas`; not canonical form setup. |
| [20260908_audit_contract.sql](visa-matrix-backend/backend/supabase/migrations/20260908_audit_contract.sql) | Conditional/modify | Requires organizations and audit logs. Reconcile field names and `ON DELETE SET NULL` with `organization_id` nullability; assign unique version. |
| [20260908_customer_organization_ownership.sql](visa-matrix-backend/backend/supabase/migrations/20260908_customer_organization_ownership.sql) | Modify/conditional | Requires verified profile ownership. Protect its quarantine table, inspect unresolved rows, and do not validate the required-organization constraint until all rows have legitimate owners. |
| [20261123_form_configs_and_nexus_permissions.sql](visa-matrix-backend/backend/supabase/migrations/20261123_form_configs_and_nexus_permissions.sql) | Conditional/modify | Verify catalog ID types and existing table shape/constraints, public visibility of published forms, RBAC schema, and NEXUS authorization behavior. |
| [20261123_private_document_storage.sql](visa-matrix-backend/backend/supabase/migrations/20261123_private_document_storage.sql) | Modify/conditional | Verify all existing Storage policies and establish the authorized document path before private-bucket rollout; dropping only four names is insufficient proof. |
| [20261123_tenant_ownership_and_rls_repair.sql](visa-matrix-backend/backend/supabase/migrations/20261123_tenant_ownership_and_rls_repair.sql) | Modify substantially | Complete table coverage and ownership checks, install least-privilege replacement policies/grants, and validate quarantine/backfills before enabling RLS and revoking access. |
| [20260318_rbac_multi_org.sql](visa-matrix-frontend/visa-matrix-frontend/supabase/migrations/20260318_rbac_multi_org.sql) | Exclude | Historical frontend migration; overlapping RBAC schema and country policy. |
| [20260323_hr_core_module.sql](visa-matrix-frontend/visa-matrix-frontend/supabase/migrations/20260323_hr_core_module.sql) | Exclude | Historical frontend migration; text IDs and public HR document bucket conflict with backend model. |
| [20260325_hr_enterprise_service_layer.sql](visa-matrix-frontend/visa-matrix-frontend/supabase/migrations/20260325_hr_enterprise_service_layer.sql) | Exclude | Historical frontend migration; broad authenticated access to sensitive HR/payroll records. |
| [20260330_applications_application_code.sql](visa-matrix-frontend/visa-matrix-frontend/supabase/migrations/20260330_applications_application_code.sql) | Exclude | Historical; shares a version with three other frontend migrations. |
| [20260330_applications_created_by_column.sql](visa-matrix-frontend/visa-matrix-frontend/supabase/migrations/20260330_applications_created_by_column.sql) | Exclude | Historical; overlapping application ownership and duplicate version. |
| [20260330_applications_insert_policy.sql](visa-matrix-frontend/visa-matrix-frontend/supabase/migrations/20260330_applications_insert_policy.sql) | Exclude | Historical; authenticated application read is global (`USING (true)`). |
| [20260330_documents_select_policy.sql](visa-matrix-frontend/visa-matrix-frontend/supabase/migrations/20260330_documents_select_policy.sql) | Exclude | Historical; authenticated document read is global (`USING (true)`). |

## 10. Recommended dependency order for a future staging release

This is a **conditional remediation order**, not an executable approval for the current files. Before assigning migration versions, inspect staging's current schema and migration ledger read-only. Preserve existing applied version identities; use new unique versions only for reviewed new/rewritten migrations.

1. **Confirm target baseline and ledger.** Verify staging identity, actual schema, data state, extensions, and migration history. If it is not blank or history disagrees with local files, stop and reconcile before continuing.
2. **Create one authoritative backend base.** Reconcile the table definitions and helpers in `20260310_auth_and_erp_repair.sql` and `20260311_visa_matrix_erp_core.sql`; establish the approved users/auth/profile relation and required application/customer/document/payment tables. Remove the unsafe grants, RLS disablement, and public storage policies. Do not apply both original files unchanged. Remove or defer the `admin_users` data-copy block unless that table has been created and the credential-handling flow is explicitly approved.
3. **Apply admin/application reference additions after the base.** Rework `20260306_admin_dashboard.sql` so the applications table exists before its alterations. Decide whether to retain `admin_users`; do not copy password hashes into a broadly accessible application table. Assign its new version after the base and keep any required data synchronization as a separately reviewed operation.
4. **Resolve pricing/import dependency.** First obtain authoritative DDL for `visa_fees_import` and decide whether the table is needed. If retained: establish it, apply the invoice extension after the canonical invoice table, then apply a secured (not anonymous) import-access migration, then the relational pricing/backfill migration. If no authoritative import schema exists, exclude both import-dependent migrations and update dependent functionality rather than inventing a table.
5. **Apply backend application history/audit additions.** After base/application tables and user relationships exist, apply the reconciled `20260427_backend_standardization_audit_state.sql` with organization/record-scoped policies and verified insert authority. Exclude the legacy visa-type policy unless its public catalog scope is explicitly confirmed and rewritten.
6. **Create profiles before RBAC.** Reconcile and apply `20260518_create_profiles_table.sql` first; then `20260515_rbac_schema.sql`; then `20260518_enterprise_rbac_admin.sql`; then the reconciled `20260522_enterprise_auth_system.sql`. These files must be made schema-compatible as a unit before they are versioned.
7. **Apply dependent role and employee seeds.** After the final enterprise RBAC model is established, apply `20260523_enterprise_role_guest.sql`, `20260524_employee_identity_hierarchy.sql`, and `20260527_accounts_module_permissions.sql` in that order, after repairing missing columns and validating all role/organization associations.
8. **Reconcile customers.** Apply the repaired `20260609_reconcile_customers_schema.sql` only after the customer base and correct trigger helper exist, and after the placeholder-name and constraint changes have an approved data plan.
9. **Apply audit and ownership changes.** After organization/profile/customer schema is stable, apply `20260908_audit_contract.sql` followed by `20260908_customer_organization_ownership.sql`, with corrected FK nullability, operator-only quarantine access, and verified backfill results.
10. **Create canonical dynamic forms.** Apply the reviewed `20261123_form_configs_and_nexus_permissions.sql` after UUID country/visa catalogs and the final RBAC tables exist. Do not apply the two form no-op files or replay frontend migrations.
11. **Enforce tenant access.** Apply a completed ownership/RLS migration only after parent ownership is reconciled and every covered table has tested least-privilege policies and grants. The current tenant-repair file is incomplete and must not be run as written.
12. **Make document storage private before any synthetic document upload.** After verifying backend authorization, signed-URL behavior, and document ownership checks, make the bucket private and remove all public access paths. The current private-storage file needs full policy inspection and a compatible approved access design.
13. **Run post-migration checks.** Verify schema, grants, policies, storage, and migration history; then run synthetic-data authorization, cross-tenant, document, and business-workflow tests before staging is used by application test environments.

The ordering above deliberately differs from the current filename chronology. The original 8-digit versions must not be blindly renamed: first compare them to the staging migration ledger, then choose unique reviewed version IDs. The two no-op form files and all seven frontend historical migrations remain excluded.

## 11. Backup and rollback requirements

Before a future approved staging write:

- Verify a staging-only recovery point is available, its retention window, and the documented restore process.
- Test restoration on a disposable project or equivalent environment; a backup that has never been restored is not a verified rollback.
- Record a sanitized pre-change schema/migration-history snapshot and the approved dry-run output.
- Use synthetic data only. Do not copy production data or documents.
- Determine whether the migration runner wraps each file in a transaction. The SQL files do not consistently contain explicit transaction boundaries; do not assume the whole migration batch is atomic.

On failure, stop subsequent writes, capture the failing migration/version and sanitized error, and inspect staging history/schema without repair commands. Do not automatically retry, edit the migration ledger, disable RLS, or restore public storage access. Use a reviewed forward correction or an explicitly approved restore of the staging-only recovery point. The ownership backfills, quarantine records, customer placeholder names, grants, and storage visibility changes have no generic safe down migration.

## 12. Final pre-deployment checklist

- [ ] Confirm project name and reference in the Supabase Dashboard; staging must be `rsvlxzespfidejaqisng`, never production `hnanyyimuvdfxyjjgwbd`.
- [ ] Review staging schema, data state, and migration ledger; do not assume the project is blank.
- [ ] Confirm backend is the sole canonical migration source; frontend historical migrations are excluded.
- [ ] Resolve all backend version collisions without changing IDs already present in staging history.
- [ ] Validate a complete replay from a disposable clean database using the reconciled backend set.
- [ ] Resolve the missing `visa_fees_import` DDL or exclude its dependent migrations.
- [ ] Confirm one canonical schema for all overlapping tables and verify auth/profile/customer identity relations.
- [ ] Approve the tenant ownership matrix and backfill/quarantine results; do not infer ownership.
- [ ] Enable RLS only with tested policies and least-privilege grants; verify no broad access remains on sensitive data.
- [ ] Verify `visa-documents` and HR storage are private and authorized document upload/download/delete paths work.
- [ ] Confirm all SQL data transformations, unique constraints, helper functions, and rollback limitations are reviewed.
- [ ] Verify staging-only secrets/configuration and synthetic-only test data; do not expose service-role keys to the frontend.
- [ ] Verify a staging backup and successful restore test; capture sanitized pre-deploy evidence.
- [ ] Inspect and approve a dry run explicitly targeted at staging; stop if the CLI reports any other project.
- [ ] Obtain explicit deployment approval, then run automated authorization, tenant-isolation, storage, and workflow tests.

## Final decision and single next action

**FAIL — the migration set is not safe to deploy to staging.** There is no safe as-is order, the current security grants/policies are unacceptable for sensitive ERP data, schema dependencies conflict, and staging's actual schema/history are unknown.

**Single next action:** obtain a read-only staging schema and migration-ledger inventory, verified against project reference `rsvlxzespfidejaqisng`, and have the database owner approve the canonical schema/ownership model from that evidence. Until that is available, do not rename migrations, execute SQL, or run a staging push.
