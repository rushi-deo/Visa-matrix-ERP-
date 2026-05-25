-- Employee identity & reporting hierarchy (non-destructive extension of profiles)

-- Branches (referenced by profiles.branch_id)
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT branches_org_fk FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS branches_org_name_idx
  ON public.branches (organization_id, name);

SELECT public.ensure_updated_at_trigger('set_branches_updated_at', 'public.branches');

-- Employee identity fields on profiles (reuse existing columns where present)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employee_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS joining_date DATE;

COMMENT ON COLUMN public.profiles.employee_code IS 'Human-readable employee ID (e.g. VM-2026-0042)';
COMMENT ON COLUMN public.profiles.designation IS 'Job title / designation';
COMMENT ON COLUMN public.profiles.joining_date IS 'Employment start date';
COMMENT ON COLUMN public.profiles.reporting_manager_id IS 'Self-referencing manager for approval chains';
COMMENT ON COLUMN public.profiles.metadata IS 'Extensible JSON for workflows (leave, approvals, escalation)';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_org_employee_code_idx
  ON public.profiles (organization_id, employee_code)
  WHERE employee_code IS NOT NULL;

SELECT public.add_constraint_if_absent(
  'profiles_branch_fk',
  'ALTER TABLE public.profiles ADD CONSTRAINT profiles_branch_fk
     FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL'
);

-- Seed default branches for Visa Matrix org
INSERT INTO public.branches (organization_id, name, code)
SELECT org.id, branch.name, branch.code
FROM public.organizations org
CROSS JOIN (
  VALUES
    ('Head Office', 'HQ'),
    ('Dubai Branch', 'DXB'),
    ('Riyadh Branch', 'RUH')
) AS branch(name, code)
WHERE org.slug = 'visa-matrix'
ON CONFLICT DO NOTHING;
