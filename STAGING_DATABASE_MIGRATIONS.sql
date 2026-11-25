-- VISA MATRIX ERP STAGING MIGRATION GATE
-- Status: BLOCKED; this is intentionally not an apply-ready schema migration.
--
-- Purpose:
--   Prevent unverified RLS/ownership/storage changes from being treated as an
--   approved migration.
-- Affected tables:
--   None in this file. Existing candidate migrations reference form_configs,
--   role_permissions, customers, applications, new_applications, documents,
--   payments, invoices, quotations, tasks, workflows, organizations, and
--   storage.objects; their exact live applicability is unverified.
-- Required access model:
--   Organization-scoped access derived from verified relationships and the
--   existing RBAC model. No owner column or relationship is assumed here.
-- Preconditions:
--   1. Execute STAGING_VALIDATION.sql against staging only.
--   2. Reconcile all columns, foreign keys, grants, policies, functions,
--      views, storage settings, and migration history with a database owner.
--   3. Confirm access requirements and synthetic cross-tenant test cases.
--   4. Review the exact migration and obtain explicit staging approval.
-- Implementation:
--   No DDL/DML is generated until the preconditions above are satisfied.
-- Validation:
--   Run STAGING_VALIDATION.sql, then the approved migration's own assertions
--   and negative access tests using synthetic users and documents.
-- Rollback:
--   No schema changes are made by this gate. The approved migration must
--   define its own rollback strategy before it can replace this gate.
-- Expected application impact:
--   None; this guard deliberately fails rather than silently succeeding.
--
-- Existing candidates are not included or executed:
--   visa-matrix-backend/backend/supabase/migrations/
--     20261123_form_configs_and_nexus_permissions.sql
--     20261123_private_document_storage.sql
--     20261123_tenant_ownership_and_rls_repair.sql
--
-- Do not remove this guard or apply existing candidates to production.

DO $$
BEGIN
  RAISE EXCEPTION
    'BLOCKED: No staging migration is approved. Run STAGING_VALIDATION.sql and reconcile schema/ownership first.';
END;
$$;
