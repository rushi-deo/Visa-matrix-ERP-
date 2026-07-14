-- Add Accounts module permissions and grant them to Super Admin
DO $$
DECLARE
  target_org_id uuid;
BEGIN
  SELECT id INTO target_org_id
  FROM public.organizations
  WHERE slug = 'visa-matrix';

  IF target_org_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.permissions (organization_id, name, description, module, action)
  VALUES
    (target_org_id, 'accounts:view', 'View accounts module', 'accounts', 'view'),
    (target_org_id, 'accounts:create', 'Create accounts records', 'accounts', 'create'),
    (target_org_id, 'accounts:edit', 'Edit accounts records', 'accounts', 'edit'),
    (target_org_id, 'accounts:delete', 'Delete accounts records', 'accounts', 'delete')
  ON CONFLICT (organization_id, name) DO NOTHING;

  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM public.roles r
  JOIN public.permissions p
    ON p.organization_id = target_org_id
  WHERE r.organization_id = target_org_id
    AND r.name = 'Super Admin'
    AND p.name IN (
      'accounts:view',
      'accounts:create',
      'accounts:edit',
      'accounts:delete'
    )
  ON CONFLICT DO NOTHING;
END $$;
