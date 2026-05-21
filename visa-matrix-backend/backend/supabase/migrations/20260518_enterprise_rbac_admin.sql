-- Enterprise RBAC admin support
-- Adds organizations, user status, organization ownership, and standard ERP
-- permissions used by the dynamic admin settings panel.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.ensure_updated_at_trigger('set_organizations_updated_at', 'public.organizations');

insert into public.organizations (name, slug)
values ('Visa Matrix', 'visa-matrix')
on conflict (name) do nothing;

alter table public.profiles add column if not exists organization_id uuid;
alter table public.profiles add column if not exists is_active boolean not null default true;
alter table public.profiles add column if not exists status text not null default 'active';

select public.add_constraint_if_absent(
  'profiles_organization_fk',
  'alter table public.profiles add constraint profiles_organization_fk foreign key (organization_id) references public.organizations(id) on delete set null'
);

update public.profiles
set organization_id = coalesce(
  organization_id,
  (select id from public.organizations where slug = 'visa-matrix' limit 1)
)
where organization_id is null;

insert into public.permissions (name, description, module, action)
values
  ('dashboard:view', 'View dashboard', 'dashboard', 'view'),
  ('customers:view', 'View customers', 'customers', 'view'),
  ('customers:create', 'Create customers', 'customers', 'create'),
  ('customers:edit', 'Edit customers', 'customers', 'edit'),
  ('customers:delete', 'Delete customers', 'customers', 'delete'),
  ('customers:approve', 'Approve customer changes', 'customers', 'approve'),
  ('countries:view', 'View countries and visa rules', 'countries', 'view'),
  ('countries:create', 'Create countries and visa rules', 'countries', 'create'),
  ('countries:edit', 'Edit countries and visa rules', 'countries', 'edit'),
  ('countries:delete', 'Delete countries and visa rules', 'countries', 'delete'),
  ('countries:approve', 'Approve country and visa rule changes', 'countries', 'approve'),
  ('invoicing:view', 'View invoices and billing', 'invoicing', 'view'),
  ('invoicing:create', 'Create invoices and billing records', 'invoicing', 'create'),
  ('invoicing:edit', 'Edit invoices and billing records', 'invoicing', 'edit'),
  ('invoicing:delete', 'Delete invoices and billing records', 'invoicing', 'delete'),
  ('invoicing:approve', 'Approve invoices and billing records', 'invoicing', 'approve'),
  ('hr:view', 'View HR workspace', 'hr', 'view'),
  ('hr:create', 'Create HR records', 'hr', 'create'),
  ('hr:edit', 'Edit HR records', 'hr', 'edit'),
  ('hr:delete', 'Delete HR records', 'hr', 'delete'),
  ('hr:approve', 'Approve HR workflows', 'hr', 'approve'),
  ('notifications:view', 'View notifications and communications', 'notifications', 'view'),
  ('notifications:create', 'Create notifications and communications', 'notifications', 'create'),
  ('notifications:edit', 'Edit notifications and communications', 'notifications', 'edit'),
  ('notifications:delete', 'Delete notifications and communications', 'notifications', 'delete'),
  ('notifications:approve', 'Approve notifications and communications', 'notifications', 'approve'),
  ('audit_logs:view', 'View audit logs', 'audit_logs', 'view'),
  ('reports:view', 'View reports', 'reports', 'view'),
  ('reports:create', 'Create reports', 'reports', 'create'),
  ('reports:edit', 'Edit reports', 'reports', 'edit'),
  ('reports:delete', 'Delete reports', 'reports', 'delete'),
  ('reports:approve', 'Approve reports', 'reports', 'approve'),
  ('settings:view', 'View admin settings', 'settings', 'view'),
  ('settings:create', 'Create admin settings records', 'settings', 'create'),
  ('settings:edit', 'Edit roles and permissions', 'settings', 'edit'),
  ('settings:delete', 'Delete admin settings records', 'settings', 'delete'),
  ('settings:approve', 'Approve admin settings changes', 'settings', 'approve'),
  ('visa_questions:view', 'View visa question flows', 'visa_questions', 'view'),
  ('visa_questions:create', 'Create visa question flows', 'visa_questions', 'create'),
  ('visa_questions:edit', 'Edit visa question flows', 'visa_questions', 'edit'),
  ('visa_questions:delete', 'Delete visa question flows', 'visa_questions', 'delete'),
  ('visa_questions:approve', 'Approve visa question flows', 'visa_questions', 'approve'),
  ('tasks:view', 'View tasks', 'tasks', 'view'),
  ('tasks:create', 'Create tasks', 'tasks', 'create'),
  ('tasks:edit', 'Edit tasks', 'tasks', 'edit'),
  ('tasks:delete', 'Delete tasks', 'tasks', 'delete'),
  ('tasks:approve', 'Approve tasks', 'tasks', 'approve'),
  ('workflow:view', 'View workflow automation', 'workflow', 'view'),
  ('workflow:create', 'Create workflow automation', 'workflow', 'create'),
  ('workflow:edit', 'Edit workflow automation', 'workflow', 'edit'),
  ('workflow:delete', 'Delete workflow automation', 'workflow', 'delete'),
  ('workflow:approve', 'Approve workflow automation', 'workflow', 'approve')
on conflict (name) do update
set
  description = excluded.description,
  module = excluded.module,
  action = excluded.action;

-- Keep legacy and enterprise module names in sync where the product UI uses
-- grouped labels.
insert into public.permissions (name, description, module, action)
select replace(name, 'invoicing:', 'invoices:'), description, 'invoices', action
from public.permissions
where module = 'invoicing'
on conflict (name) do nothing;

insert into public.permissions (name, description, module, action)
select replace(name, 'notifications:', 'communications:'), description, 'communications', action
from public.permissions
where module = 'notifications'
on conflict (name) do nothing;

-- Seed admin-like roles with full settings access when present.
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where lower(roles.name) in ('admin', 'super admin', 'super_admin')
on conflict (role_id, permission_id) do nothing;
