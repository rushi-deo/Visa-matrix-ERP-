-- Add Guest role to enterprise role catalog (read-only / pre-auth users)
INSERT INTO public.roles (organization_id, name, description, level)
SELECT org.id, 'Guest', 'Limited public access; cannot use employee portal', 0
FROM public.organizations org
WHERE org.slug = 'visa-matrix'
  AND NOT EXISTS (
    SELECT 1
    FROM public.roles existing
    WHERE existing.organization_id = org.id
      AND existing.name = 'Guest'
  );
