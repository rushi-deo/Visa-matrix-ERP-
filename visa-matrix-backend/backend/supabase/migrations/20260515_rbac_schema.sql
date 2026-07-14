-- RBAC Schema for Visa Matrix ERP
-- Creates permissions, user_roles, and role_permissions tables
-- Supports dynamic permission-based access control

-- Create permissions table if not exists
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  module text not null,
  action text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists permissions_module_action_idx on public.permissions (module, action);
select public.ensure_updated_at_trigger('set_permissions_updated_at', 'public.permissions');

-- Insert default permissions for all modules
insert into public.permissions (name, description, module, action)
values
  -- Applications
  ('applications:view', 'View applications', 'applications', 'view'),
  ('applications:create', 'Create applications', 'applications', 'create'),
  ('applications:edit', 'Edit applications', 'applications', 'edit'),
  ('applications:delete', 'Delete applications', 'applications', 'delete'),
  ('applications:review', 'Review applications', 'applications', 'review'),
  
  -- Users
  ('users:view', 'View users', 'users', 'view'),
  ('users:create', 'Create users', 'users', 'create'),
  ('users:edit', 'Edit users', 'users', 'edit'),
  ('users:delete', 'Delete users', 'users', 'delete'),
  ('users:manage_roles', 'Manage user roles', 'users', 'manage_roles'),
  
  -- Invoices
  ('invoices:view', 'View invoices', 'invoices', 'view'),
  ('invoices:create', 'Create invoices', 'invoices', 'create'),
  ('invoices:edit', 'Edit invoices', 'invoices', 'edit'),
  ('invoices:delete', 'Delete invoices', 'invoices', 'delete'),
  ('invoices:approve', 'Approve invoices', 'invoices', 'approve'),
  
  -- Payments
  ('payments:view', 'View payments', 'payments', 'view'),
  ('payments:create', 'Create payments', 'payments', 'create'),
  ('payments:approve', 'Approve payments', 'payments', 'approve'),
  ('payments:reject', 'Reject payments', 'payments', 'reject'),
  
  -- Documents
  ('documents:upload', 'Upload documents', 'documents', 'upload'),
  ('documents:view', 'View documents', 'documents', 'view'),
  ('documents:delete', 'Delete documents', 'documents', 'delete'),
  ('documents:verify', 'Verify documents', 'documents', 'verify'),
  
  -- Reports
  ('reports:view', 'View reports', 'reports', 'view'),
  ('reports:export', 'Export reports', 'reports', 'export'),
  ('reports:create', 'Create reports', 'reports', 'create'),
  
  -- Communications
  ('communications:send', 'Send communications', 'communications', 'send'),
  ('communications:view', 'View communications', 'communications', 'view'),
  ('communications:reply', 'Reply to communications', 'communications', 'reply'),
  
  -- Visa Rules
  ('visa_rules:view', 'View visa rules', 'visa_rules', 'view'),
  ('visa_rules:create', 'Create visa rules', 'visa_rules', 'create'),
  ('visa_rules:edit', 'Edit visa rules', 'visa_rules', 'edit'),
  ('visa_rules:delete', 'Delete visa rules', 'visa_rules', 'delete'),
  
  -- Workflows
  ('workflows:view', 'View workflows', 'workflows', 'view'),
  ('workflows:create', 'Create workflows', 'workflows', 'create'),
  ('workflows:edit', 'Edit workflows', 'workflows', 'edit'),
  ('workflows:execute', 'Execute workflows', 'workflows', 'execute')
on conflict (name) do nothing;

-- Create user_roles table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role_id uuid not null,
  assigned_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists user_roles_user_role_idx on public.user_roles (user_id, role_id);
select public.add_constraint_if_absent(
  'user_roles_user_fk',
  'alter table public.user_roles add constraint user_roles_user_fk foreign key (user_id) references public.profiles(id) on delete cascade'
);
select public.add_constraint_if_absent(
  'user_roles_role_fk',
  'alter table public.user_roles add constraint user_roles_role_fk foreign key (role_id) references public.roles(id) on delete cascade'
);
select public.ensure_updated_at_trigger('set_user_roles_updated_at', 'public.user_roles');

-- Create role_permissions junction table
create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null,
  permission_id uuid not null,
  assigned_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists role_permissions_role_permission_idx on public.role_permissions (role_id, permission_id);
select public.add_constraint_if_absent(
  'role_permissions_role_fk',
  'alter table public.role_permissions add constraint role_permissions_role_fk foreign key (role_id) references public.roles(id) on delete cascade'
);
select public.add_constraint_if_absent(
  'role_permissions_permission_fk',
  'alter table public.role_permissions add constraint role_permissions_permission_fk foreign key (permission_id) references public.permissions(id) on delete cascade'
);
select public.ensure_updated_at_trigger('set_role_permissions_updated_at', 'public.role_permissions');

-- Assign default permissions to existing roles
-- Admin: all permissions except super-admin-only ones
do $$
declare
  admin_role_id uuid;
  manager_role_id uuid;
  agent_role_id uuid;
  customer_role_id uuid;
  perm_id uuid;
begin
  -- Get role IDs
  select id into admin_role_id from public.roles where lower(name) = 'admin';
  select id into manager_role_id from public.roles where lower(name) = 'manager';
  select id into agent_role_id from public.roles where lower(name) = 'agent';
  select id into customer_role_id from public.roles where lower(name) = 'customer';

  -- Admin gets most permissions (not user:delete for safety)
  if admin_role_id is not null then
    for perm_id in select id from public.permissions
      where name not in ('users:delete', 'invoices:delete', 'documents:delete')
    loop
      insert into public.role_permissions (role_id, permission_id)
      values (admin_role_id, perm_id)
      on conflict (role_id, permission_id) do nothing;
    end loop;
  end if;

  -- Manager gets reports, communications, and view permissions
  if manager_role_id is not null then
    for perm_id in select id from public.permissions
      where module in ('reports', 'communications') or action = 'view'
    loop
      insert into public.role_permissions (role_id, permission_id)
      values (manager_role_id, perm_id)
      on conflict (role_id, permission_id) do nothing;
    end loop;
  end if;

  -- Agent gets applications, documents, and visa_rules view
  if agent_role_id is not null then
    for perm_id in select id from public.permissions
      where module in ('applications', 'documents', 'communications')
        or (module = 'visa_rules' and action = 'view')
    loop
      insert into public.role_permissions (role_id, permission_id)
      values (agent_role_id, perm_id)
      on conflict (role_id, permission_id) do nothing;
    end loop;
  end if;

  -- Customer gets minimal permissions
  if customer_role_id is not null then
    for perm_id in select id from public.permissions
      where module = 'applications' or module = 'documents' or module = 'communications'
    loop
      insert into public.role_permissions (role_id, permission_id)
      values (customer_role_id, perm_id)
      on conflict (role_id, permission_id) do nothing;
    end loop;
  end if;
end $$;

-- Grant read permissions to public
revoke all on public.permissions from public;
revoke all on public.user_roles from public;
revoke all on public.role_permissions from public;
grant select on public.permissions to postgres, authenticated;
grant all on public.user_roles to postgres;
grant select on public.user_roles to authenticated;
grant all on public.role_permissions to postgres;
grant select on public.role_permissions to authenticated;
