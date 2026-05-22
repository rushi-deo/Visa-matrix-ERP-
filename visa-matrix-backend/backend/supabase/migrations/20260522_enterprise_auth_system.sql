-- Enterprise Authentication & Access Control System
-- Complete overhaul of RBAC with employee management, sessions, departments, and audit logging

-- ============================================================================
-- 1. ORGANIZATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- ============================================================================
-- 2. DEPARTMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT departments_org_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS departments_org_name_idx ON public.departments (organization_id, name);

-- ============================================================================
-- 3. ROLES (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0, -- 0=employee, 1=manager, 2=director, 3=admin, 4=super_admin
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT roles_org_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CHECK (status IN ('active', 'inactive')),
  CHECK (level BETWEEN 0 AND 4)
);

CREATE UNIQUE INDEX IF NOT EXISTS roles_org_name_idx ON public.roles (organization_id, name);

-- ============================================================================
-- 4. PERMISSIONS (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT permissions_org_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  UNIQUE (module, action, organization_id),
  CHECK (status IN ('active', 'inactive'))
);

-- ============================================================================
-- 5. ROLE_PERMISSIONS (Junction Table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT role_permissions_role_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE,
  CONSTRAINT role_permissions_permission_fk FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE,
  UNIQUE (role_id, permission_id)
);

-- ============================================================================
-- 6. PROFILES (Employee Profiles - Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  department_id UUID,
  branch_id UUID,
  reporting_manager_id UUID,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, suspended, inactive, deleted
  role_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  locked_until TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  password_expires_at TIMESTAMPTZ,
  force_password_change BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  metadata JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT profiles_org_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CONSTRAINT profiles_department_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL,
  CONSTRAINT profiles_role_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL,
  CONSTRAINT profiles_reporting_manager_fk FOREIGN KEY (reporting_manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CHECK (status IN ('pending', 'active', 'suspended', 'inactive', 'deleted'))
);

CREATE INDEX IF NOT EXISTS profiles_org_idx ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS profiles_department_idx ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- ============================================================================
-- 7. USER_ROLES (Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT user_roles_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_role_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE,
  UNIQUE (user_id, role_id)
);

-- ============================================================================
-- 8. EMPLOYEE_PERMISSIONS (Direct Permissions for Employees)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.employee_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  granted_by UUID,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT employee_permissions_employee_fk FOREIGN KEY (employee_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT employee_permissions_permission_fk FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE,
  UNIQUE (employee_id, permission_id)
);

-- ============================================================================
-- 9. SESSIONS (Active Session Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS sessions_user_active_idx ON public.sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON public.sessions(expires_at);

-- ============================================================================
-- 10. LOGIN_HISTORY (Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  login_status TEXT NOT NULL DEFAULT 'success', -- success, failed, locked, disabled
  reason TEXT,
  browser TEXT,
  os TEXT,
  device_type TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT login_history_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS login_history_user_idx ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS login_history_created_idx ON public.login_history(created_at DESC);

-- ============================================================================
-- 11. AUDIT_LOGS (System Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT audit_logs_org_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CONSTRAINT audit_logs_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_org_idx ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON public.audit_logs(resource_type, resource_id);

-- ============================================================================
-- 12. PASSWORD_RESET_TOKENS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT password_reset_tokens_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_idx ON public.password_reset_tokens(expires_at);

-- ============================================================================
-- 13. INSERT DEFAULT ORGANIZATION
-- ============================================================================
INSERT INTO public.organizations (name, slug)
VALUES ('Visa Matrix', 'visa-matrix')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 14. INSERT DEFAULT ROLES
-- ============================================================================
INSERT INTO public.roles (organization_id, name, description, level)
SELECT org.id, role.name, role.description, role.level
FROM public.organizations org
CROSS JOIN (
  VALUES
    ('Super Admin', 'Full system access and control', 4),
    ('Admin', 'Administrative access', 3),
    ('HR Manager', 'HR module management', 2),
    ('Visa Officer', 'Visa application processing', 2),
    ('Finance Manager', 'Finance module management', 2),
    ('Branch Manager', 'Branch operations management', 2),
    ('Employee', 'Standard employee access', 0)
) AS role(name, description, level)
WHERE org.slug = 'visa-matrix'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 15. INSERT DEFAULT PERMISSIONS
-- ============================================================================
INSERT INTO public.permissions (organization_id, name, description, module, action)
SELECT org.id, perm.name, perm.description, perm.module, perm.action
FROM public.organizations org
CROSS JOIN (
  VALUES
    -- Dashboard
    ('dashboard:view', 'View dashboard', 'dashboard', 'view'),
    
    -- HR Module
    ('hr:view', 'View HR module', 'hr', 'view'),
    ('hr:create', 'Create HR records', 'hr', 'create'),
    ('hr:edit', 'Edit HR records', 'hr', 'edit'),
    ('hr:delete', 'Delete HR records', 'hr', 'delete'),
    ('hr:approve', 'Approve HR workflows', 'hr', 'approve'),
    ('hr:export', 'Export HR data', 'hr', 'export'),
    
    -- CRM Module
    ('crm:view', 'View CRM module', 'crm', 'view'),
    ('crm:create', 'Create CRM records', 'crm', 'create'),
    ('crm:edit', 'Edit CRM records', 'crm', 'edit'),
    ('crm:delete', 'Delete CRM records', 'crm', 'delete'),
    ('crm:approve', 'Approve CRM workflows', 'crm', 'approve'),
    ('crm:export', 'Export CRM data', 'crm', 'export'),
    
    -- Visa Applications
    ('applications:view', 'View visa applications', 'applications', 'view'),
    ('applications:create', 'Create visa applications', 'applications', 'create'),
    ('applications:edit', 'Edit visa applications', 'applications', 'edit'),
    ('applications:delete', 'Delete visa applications', 'applications', 'delete'),
    ('applications:approve', 'Approve visa applications', 'applications', 'approve'),
    ('applications:export', 'Export visa applications', 'applications', 'export'),
    
    -- Payments
    ('payments:view', 'View payments', 'payments', 'view'),
    ('payments:create', 'Create payments', 'payments', 'create'),
    ('payments:edit', 'Edit payments', 'payments', 'edit'),
    ('payments:delete', 'Delete payments', 'payments', 'delete'),
    ('payments:approve', 'Approve payments', 'payments', 'approve'),
    ('payments:export', 'Export payments', 'payments', 'export'),
    
    -- Countries
    ('countries:view', 'View countries', 'countries', 'view'),
    ('countries:create', 'Create countries', 'countries', 'create'),
    ('countries:edit', 'Edit countries', 'countries', 'edit'),
    ('countries:delete', 'Delete countries', 'countries', 'delete'),
    ('countries:approve', 'Approve countries', 'countries', 'approve'),
    
    -- Reports
    ('reports:view', 'View reports', 'reports', 'view'),
    ('reports:create', 'Create reports', 'reports', 'create'),
    ('reports:edit', 'Edit reports', 'reports', 'edit'),
    ('reports:delete', 'Delete reports', 'reports', 'delete'),
    ('reports:export', 'Export reports', 'reports', 'export'),
    
    -- Workflow
    ('workflow:view', 'View workflows', 'workflow', 'view'),
    ('workflow:create', 'Create workflows', 'workflow', 'create'),
    ('workflow:edit', 'Edit workflows', 'workflow', 'edit'),
    ('workflow:delete', 'Delete workflows', 'workflow', 'delete'),
    
    -- Documents
    ('documents:view', 'View documents', 'documents', 'view'),
    ('documents:upload', 'Upload documents', 'documents', 'upload'),
    ('documents:delete', 'Delete documents', 'documents', 'delete'),
    ('documents:verify', 'Verify documents', 'documents', 'verify'),
    
    -- Notifications
    ('notifications:view', 'View notifications', 'notifications', 'view'),
    ('notifications:create', 'Create notifications', 'notifications', 'create'),
    ('notifications:send', 'Send notifications', 'notifications', 'send'),
    
    -- Settings
    ('settings:view', 'View settings', 'settings', 'view'),
    ('settings:edit', 'Edit settings', 'settings', 'edit'),
    ('settings:manage_users', 'Manage users', 'settings', 'manage_users'),
    ('settings:manage_roles', 'Manage roles', 'settings', 'manage_roles'),
    ('settings:manage_permissions', 'Manage permissions', 'settings', 'manage_permissions'),
    
    -- Audit
    ('audit_logs:view', 'View audit logs', 'audit_logs', 'view')
) AS perm(name, description, module, action)
WHERE org.slug = 'visa-matrix'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 16. ASSIGN PERMISSIONS TO ROLES
-- ============================================================================
-- Super Admin gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.organizations org ON r.organization_id = org.id
CROSS JOIN public.permissions p
WHERE org.slug = 'visa-matrix'
AND r.name = 'Super Admin'
AND p.organization_id = org.id
ON CONFLICT DO NOTHING;

-- Admin gets most permissions except audit
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.organizations org ON r.organization_id = org.id
CROSS JOIN public.permissions p
WHERE org.slug = 'visa-matrix'
AND r.name = 'Admin'
AND p.organization_id = org.id
AND p.action != 'delete' -- Admins can't delete (need Super Admin)
ON CONFLICT DO NOTHING;

-- HR Manager gets HR permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.organizations org ON r.organization_id = org.id
CROSS JOIN public.permissions p
WHERE org.slug = 'visa-matrix'
AND r.name = 'HR Manager'
AND p.organization_id = org.id
AND p.module = 'hr'
ON CONFLICT DO NOTHING;

-- Add dashboard view to all roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.organizations org ON r.organization_id = org.id
CROSS JOIN public.permissions p
WHERE org.slug = 'visa-matrix'
AND p.organization_id = org.id
AND p.name = 'dashboard:view'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 17. ENABLE UPDATED_AT TRIGGERS
-- ============================================================================
SELECT public.ensure_updated_at_trigger('set_organizations_updated_at', 'public.organizations');
SELECT public.ensure_updated_at_trigger('set_departments_updated_at', 'public.departments');
SELECT public.ensure_updated_at_trigger('set_roles_updated_at', 'public.roles');
SELECT public.ensure_updated_at_trigger('set_permissions_updated_at', 'public.permissions');
SELECT public.ensure_updated_at_trigger('set_profiles_updated_at', 'public.profiles');
SELECT public.ensure_updated_at_trigger('set_user_roles_updated_at', 'public.user_roles');

-- ============================================================================
-- 18. POLICIES - ENABLE RLS
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 19. RLS POLICIES FOR PROFILES
-- ============================================================================
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Super Admin can read all profiles
CREATE POLICY "Super Admin can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'Super Admin'
    )
  );

-- Super Admin can update all profiles
CREATE POLICY "Super Admin can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'Super Admin'
    )
  );

-- Managers can read subordinates
CREATE POLICY "Managers can read subordinates" ON public.profiles
  FOR SELECT USING (
    reporting_manager_id = auth.uid()
  );

-- ============================================================================
-- 20. RLS POLICIES FOR SESSIONS
-- ============================================================================
-- Users can read own sessions
CREATE POLICY "Users can read own sessions" ON public.sessions
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- 21. RLS POLICIES FOR LOGIN_HISTORY
-- ============================================================================
-- Users can read own login history
CREATE POLICY "Users can read own login history" ON public.login_history
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- 22. RLS POLICIES FOR AUDIT_LOGS
-- ============================================================================
-- Super Admin can read all audit logs
CREATE POLICY "Super Admin can read audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'Super Admin'
    )
  );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
