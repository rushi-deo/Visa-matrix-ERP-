-- Read-only Supabase catalog validation.
-- Run against STAGING only. This file contains SELECT statements only.
BEGIN TRANSACTION READ ONLY;

-- 1. Public tables, owners, RLS flags, and effective role privileges.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  pg_get_userbyid(c.relowner) AS table_owner,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
  has_table_privilege('anon', c.oid, 'INSERT') AS anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE') AS anon_update,
  has_table_privilege('anon', c.oid, 'DELETE') AS anon_delete,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select,
  has_table_privilege('authenticated', c.oid, 'INSERT') AS authenticated_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE') AS authenticated_update,
  has_table_privilege('authenticated', c.oid, 'DELETE') AS authenticated_delete,
  has_table_privilege('service_role', c.oid, 'SELECT') AS service_role_select,
  has_table_privilege('service_role', c.oid, 'INSERT') AS service_role_insert,
  has_table_privilege('service_role', c.oid, 'UPDATE') AS service_role_update,
  has_table_privilege('service_role', c.oid, 'DELETE') AS service_role_delete
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
ORDER BY c.relname;

-- 2. Public table columns, including candidate ownership fields.
SELECT
  table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Keys, foreign keys, uniqueness, and check constraints.
SELECT
  n.nspname AS schema_name,
  t.relname AS table_name,
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  con.convalidated AS is_validated,
  pg_get_constraintdef(con.oid, true) AS definition
FROM pg_catalog.pg_constraint AS con
JOIN pg_catalog.pg_class AS t ON t.oid = con.conrelid
JOIN pg_catalog.pg_namespace AS n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
ORDER BY t.relname, con.conname;

-- 4. RLS policies and their effective predicates.
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check
FROM pg_catalog.pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;

-- 5. Schema privileges and explicit table grants.
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema IN ('public', 'storage')
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_schema, table_name, grantee, privilege_type;

SELECT
  role_name,
  has_schema_privilege(role_name, 'public', 'USAGE') AS public_schema_usage,
  has_schema_privilege(role_name, 'public', 'CREATE') AS public_schema_create,
  has_schema_privilege(role_name, 'storage', 'USAGE') AS storage_schema_usage
FROM (VALUES ('anon'), ('authenticated'), ('service_role')) AS roles(role_name);

-- 6. Ownership/tenant-related columns and relationships for review.
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN (
    'organization_id', 'tenant_id', 'customer_id', 'application_id',
    'user_id', 'auth_user_id', 'created_by', 'owner_id'
  )
ORDER BY table_name, column_name;

-- 7. Storage bucket visibility and upload restrictions.
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY id;

-- 8. Views and view security options. Review definitions for sensitive fields.
SELECT
  n.nspname AS schema_name,
  c.relname AS view_name,
  c.reloptions AS view_options,
  pg_get_userbyid(c.relowner) AS view_owner,
  pg_get_viewdef(c.oid, true) AS view_definition
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('v', 'm')
ORDER BY c.relname;

-- 9. SECURITY DEFINER functions, search_path settings, and execution grants.
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS identity_arguments,
  pg_get_userbyid(p.proowner) AS function_owner,
  p.proconfig AS function_settings,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_execute,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_catalog.pg_proc AS p
JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'storage')
  AND p.prosecdef
ORDER BY n.nspname, p.proname;

-- 10. Indexes and whether constraints are validated.
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_catalog.pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 11. Migration/version tracking candidates. Confirm the authoritative tracker.
SELECT
  n.nspname AS schema_name,
  c.relname AS object_name,
  c.relkind AS object_kind
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
WHERE c.relname ~* '(migration|schema_version|version_history)'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, c.relname;

-- 12. Verify the deployed get_user_role definition without assuming its
--     employee/auth user relationship.
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS identity_arguments,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_catalog.pg_proc AS p
JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'get_user_role'
ORDER BY p.proname;

COMMIT;
