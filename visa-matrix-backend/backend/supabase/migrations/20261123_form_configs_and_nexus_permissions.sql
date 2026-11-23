-- Forward-only repair for the canonical dynamic form table and Nexus read
-- permissions. This migration is a draft until the live schema is inspected.
-- It deliberately does not copy legacy form_schemas rows: catalog-name
-- matching must be reviewed against the live country/visa catalogs first.

BEGIN;

DO $$
DECLARE
  country_id_type text;
  visa_type_id_type text;
BEGIN
  IF to_regclass('public.countries') IS NULL OR to_regclass('public.visa_types') IS NULL THEN
    RAISE EXCEPTION 'Cannot create form_configs before countries and visa_types are present.';
  END IF;

  SELECT data_type INTO country_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'id';
  SELECT data_type INTO visa_type_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'visa_types' AND column_name = 'id';

  IF country_id_type <> 'uuid' OR visa_type_id_type <> 'uuid' THEN
    RAISE EXCEPTION 'Cannot create form_configs: country and visa type IDs must be UUIDs.';
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.form_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES public.countries(id) ON DELETE RESTRICT,
  visa_type_id uuid NOT NULL REFERENCES public.visa_types(id) ON DELETE RESTRICT,
  name text NOT NULL,
  form_schema jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT form_configs_country_visa_version_unique UNIQUE (country_id, visa_type_id, version)
);

DO $$
DECLARE
  required_column text;
BEGIN
  FOREACH required_column IN ARRAY ARRAY[
    'id', 'country_id', 'visa_type_id', 'name', 'form_schema',
    'version', 'status', 'created_at', 'updated_at'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'form_configs'
        AND column_name = required_column
    ) THEN
      RAISE EXCEPTION 'Existing public.form_configs is missing required column %; reconcile it before applying this migration.', required_column;
    END IF;
  END LOOP;
END;
$$;

CREATE INDEX IF NOT EXISTS form_configs_country_visa_status_idx
  ON public.form_configs (country_id, visa_type_id, status, version DESC);

ALTER TABLE public.form_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS form_configs_published_read ON public.form_configs;
CREATE POLICY form_configs_published_read
  ON public.form_configs
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.form_configs FROM anon, authenticated;
GRANT SELECT ON public.form_configs TO anon, authenticated;

DO $$
DECLARE
  has_org_column boolean;
BEGIN
  IF to_regclass('public.permissions') IS NULL
     OR to_regclass('public.roles') IS NULL
     OR to_regclass('public.role_permissions') IS NULL THEN
    RAISE EXCEPTION 'Nexus permission repair requires permissions, roles, and role_permissions tables.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'permissions'
      AND column_name = 'organization_id'
  ) INTO has_org_column;

  IF has_org_column THEN
    IF to_regclass('public.organizations') IS NULL
       OR NOT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'roles'
           AND column_name = 'organization_id'
       ) THEN
      RAISE EXCEPTION 'Organization-scoped permission repair requires organizations and roles.organization_id.';
    END IF;

    EXECUTE $seed$
      INSERT INTO public.permissions (organization_id, name, description, module, action)
      SELECT org.id, permission.name, permission.description, permission.module, 'view'
      FROM public.organizations AS org
      CROSS JOIN (VALUES
        ('leads:view', 'View leads', 'leads'),
        ('visa_types:view', 'View visa types', 'visa_types'),
        ('visa_requirements:view', 'View visa requirements', 'visa_requirements'),
        ('forms:view', 'View published forms', 'forms')
      ) AS permission(name, description, module)
      ON CONFLICT DO NOTHING
    $seed$;

    EXECUTE $assign$
      INSERT INTO public.role_permissions (role_id, permission_id)
      SELECT role_row.id, permission_row.id
      FROM public.roles AS role_row
      JOIN public.permissions AS permission_row
        ON permission_row.organization_id = role_row.organization_id
      WHERE lower(role_row.name) IN ('admin', 'super admin', 'superadmin')
         OR (lower(role_row.name) = 'visa officer'
             AND permission_row.name IN ('leads:view', 'visa_types:view', 'visa_requirements:view', 'forms:view'))
      ON CONFLICT DO NOTHING
    $assign$;
  ELSE
    EXECUTE $seed$
      INSERT INTO public.permissions (name, description, module, action)
      VALUES
        ('leads:view', 'View leads', 'leads', 'view'),
        ('visa_types:view', 'View visa types', 'visa_types', 'view'),
        ('visa_requirements:view', 'View visa requirements', 'visa_requirements', 'view'),
        ('forms:view', 'View published forms', 'forms', 'view')
      ON CONFLICT DO NOTHING
    $seed$;

    EXECUTE $assign$
      INSERT INTO public.role_permissions (role_id, permission_id)
      SELECT role_row.id, permission_row.id
      FROM public.roles AS role_row
      CROSS JOIN public.permissions AS permission_row
      WHERE lower(role_row.name) IN ('admin', 'super admin', 'superadmin')
         OR (lower(role_row.name) = 'visa officer'
             AND permission_row.name IN ('leads:view', 'visa_types:view', 'visa_requirements:view', 'forms:view'))
      ON CONFLICT DO NOTHING
    $assign$;
  END IF;
END;
$$;

COMMIT;
