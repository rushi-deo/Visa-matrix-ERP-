-- Draft, forward-only tenant ownership repair. It derives ownership only from
-- trusted customer/profile or application parent links; unresolved and
-- conflicting historical rows are recorded without assigning an owner.
-- Inspect the live schema and migration history before applying.

BEGIN;

CREATE TABLE IF NOT EXISTS public.tenant_ownership_quarantine (
  resource_table text NOT NULL,
  resource_id text NOT NULL,
  reason text NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (resource_table, resource_id)
);
ALTER TABLE public.tenant_ownership_quarantine ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tenant_ownership_quarantine FROM anon, authenticated;

DO $$
DECLARE
  target_table text;
  existing_org_type text;
  resource_table text;
  id_type text;
BEGIN
  IF to_regclass('public.organizations') IS NULL THEN
    RAISE EXCEPTION 'Tenant repair requires public.organizations.';
  END IF;

  SELECT data_type INTO existing_org_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'id';
  IF existing_org_type <> 'uuid' THEN
    RAISE EXCEPTION 'Tenant repair requires UUID organization IDs.';
  END IF;

  FOREACH target_table IN ARRAY ARRAY[
    'customers', 'applications', 'new_applications', 'documents', 'payments',
    'invoices', 'quotations', 'tasks', 'workflows'
  ] LOOP
    IF to_regclass(format('public.%I', target_table)) IS NOT NULL THEN
      SELECT data_type INTO existing_org_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = target_table
        AND column_name = 'organization_id';

      IF existing_org_type IS NOT NULL AND existing_org_type <> 'uuid' THEN
        RAISE EXCEPTION 'public.% organization_id is %, expected UUID; reconcile before applying.', target_table, existing_org_type;
      END IF;

      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS organization_id uuid', target_table);
    END IF;
  END LOOP;

  -- Customers: only profile-linked organization membership is trusted.
  IF to_regclass('public.customers') IS NOT NULL
     AND to_regclass('public.profiles') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='customers' AND column_name='user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='organization_id') THEN
    EXECUTE 'UPDATE public.customers c SET organization_id = p.organization_id FROM public.profiles p WHERE c.organization_id IS NULL AND c.user_id = p.id AND p.organization_id IS NOT NULL';
  END IF;

  -- Applications: ownership follows the linked customer only.
  IF to_regclass('public.applications') IS NOT NULL
     AND to_regclass('public.customers') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='applications' AND column_name='customer_id') THEN
    EXECUTE 'UPDATE public.applications a SET organization_id = c.organization_id FROM public.customers c WHERE a.organization_id IS NULL AND a.customer_id = c.id AND c.organization_id IS NOT NULL';
  END IF;

  -- Child records inherit ownership only from their linked application.
  FOREACH target_table IN ARRAY ARRAY['documents', 'payments', 'tasks', 'workflows', 'invoices', 'quotations'] LOOP
    IF to_regclass(format('public.%I', target_table)) IS NOT NULL
       AND to_regclass('public.applications') IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=target_table AND column_name='application_id') THEN
      EXECUTE format(
        'UPDATE public.%I child SET organization_id = app.organization_id FROM public.applications app WHERE child.organization_id IS NULL AND child.application_id = app.id AND app.organization_id IS NOT NULL',
        target_table
      );
    END IF;
  END LOOP;

  -- Customer-linked invoices/quotations can be resolved when there is no app
  -- link. Unlinked records remain unowned and are quarantined below.
  FOREACH target_table IN ARRAY ARRAY['invoices', 'quotations'] LOOP
    IF to_regclass(format('public.%I', target_table)) IS NOT NULL
       AND to_regclass('public.customers') IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=target_table AND column_name='customer_id') THEN
      EXECUTE format(
        'UPDATE public.%I child SET organization_id = customer.organization_id FROM public.customers customer WHERE child.organization_id IS NULL AND child.customer_id = customer.id AND customer.organization_id IS NOT NULL',
        target_table
      );
    END IF;
  END LOOP;

  -- The legacy lead source has no reliable ownership contract. Use a linked
  -- customer only where that explicit relationship exists; otherwise leave it
  -- unresolved and quarantine it.
  IF to_regclass('public.new_applications') IS NOT NULL
     AND to_regclass('public.customers') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='new_applications' AND column_name='customer_id') THEN
    EXECUTE 'UPDATE public.new_applications lead SET organization_id = customer.organization_id FROM public.customers customer WHERE lead.organization_id IS NULL AND lead.customer_id = customer.id AND customer.organization_id IS NOT NULL';
  END IF;

  FOREACH resource_table IN ARRAY ARRAY[
    'customers', 'applications', 'new_applications', 'documents', 'payments',
    'invoices', 'quotations', 'tasks', 'workflows'
  ] LOOP
    IF to_regclass(format('public.%I', resource_table)) IS NOT NULL THEN
      SELECT data_type INTO id_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = resource_table AND column_name = 'id';
      IF id_type IS NULL THEN
        RAISE EXCEPTION 'public.% has no id column; cannot quarantine safely.', resource_table;
      END IF;

      EXECUTE format(
        'INSERT INTO public.tenant_ownership_quarantine(resource_table, resource_id, reason) SELECT %L, id::text, ''Organization ownership could not be resolved from a trusted parent.'' FROM public.%I WHERE organization_id IS NULL ON CONFLICT (resource_table, resource_id) DO UPDATE SET reason = EXCLUDED.reason, detected_at = timezone(''utc'', now())',
        resource_table, resource_table
      );

      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema='public' AND table_name=resource_table
          AND constraint_name=resource_table || '_organization_fk'
      ) IS FALSE THEN
        EXECUTE format(
          'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (organization_id) REFERENCES public.organizations(id) NOT VALID',
          resource_table, resource_table || '_organization_fk'
        );
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema='public' AND table_name=resource_table
          AND constraint_name=resource_table || '_organization_required'
      ) THEN
        EXECUTE format(
          'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (organization_id IS NOT NULL) NOT VALID',
          resource_table, resource_table || '_organization_required'
        );
      END IF;

      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (organization_id)', resource_table || '_organization_id_idx', resource_table);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', resource_table);
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', resource_table);
    END IF;
  END LOOP;

  -- Quarantine records whose explicit parent link disagrees with their
  -- organization_id. Keep their current value for audit; API parent checks
  -- deny access until an operator reviews the relationship.
  FOREACH target_table IN ARRAY ARRAY['documents', 'payments', 'tasks', 'workflows', 'invoices', 'quotations'] LOOP
    IF to_regclass(format('public.%I', target_table)) IS NOT NULL
       AND to_regclass('public.applications') IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=target_table AND column_name='application_id') THEN
      EXECUTE format(
        'INSERT INTO public.tenant_ownership_quarantine(resource_table, resource_id, reason) SELECT %L, child.id::text, ''Record organization differs from linked application organization.'' FROM public.%I child JOIN public.applications app ON child.application_id = app.id WHERE child.organization_id IS NOT NULL AND app.organization_id IS NOT NULL AND child.organization_id <> app.organization_id ON CONFLICT (resource_table, resource_id) DO UPDATE SET reason = EXCLUDED.reason, detected_at = timezone(''utc'', now())',
        target_table, target_table
      );
    END IF;
  END LOOP;

  FOREACH target_table IN ARRAY ARRAY['invoices', 'quotations'] LOOP
    IF to_regclass(format('public.%I', target_table)) IS NOT NULL
       AND to_regclass('public.customers') IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=target_table AND column_name='customer_id') THEN
      EXECUTE format(
        'INSERT INTO public.tenant_ownership_quarantine(resource_table, resource_id, reason) SELECT %L, child.id::text, ''Record organization differs from linked customer organization.'' FROM public.%I child JOIN public.customers customer ON child.customer_id = customer.id WHERE child.organization_id IS NOT NULL AND customer.organization_id IS NOT NULL AND child.organization_id <> customer.organization_id ON CONFLICT (resource_table, resource_id) DO UPDATE SET reason = EXCLUDED.reason, detected_at = timezone(''utc'', now())',
        target_table, target_table
      );
    END IF;
  END LOOP;
END;
$$;

COMMIT;
