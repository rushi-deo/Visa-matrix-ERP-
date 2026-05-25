import type { LucideIcon } from "lucide-react";

/** Canonical enterprise roles (aligned with Supabase `roles` seed data) */
export type FrontendRole =
  | "Super Admin"
  | "Admin"
  | "HR Manager"
  | "Finance Manager"
  | "Visa Officer"
  | "Employee"
  | "Guest";

export type Permission =
  | "manage_users"
  | "manage_roles"
  | "assign_roles"
  | "manage_employees"
  | "manage_visas"
  | "manage_documents"
  | "manage_payments"
  | "view_reports"
  | "manage_crm"
  | "edit_applications";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: FrontendRole;
  /** Backend RBAC names (e.g. users:view) and legacy Permission keys */
  permissions: string[];
  rawRole: string;
  status?: string;
  forcePasswordChange?: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  role: FrontendRole;
};

export type LoginResponse = {
  token: string;
  admin?: {
    id: string;
    name?: string;
    full_name?: string;
    email: string;
    role: string;
    permissions?: string[];
  };
  user?: {
    id: string;
    name?: string;
    full_name?: string;
    email: string;
    role: string;
    permissions?: string[];
    status?: string;
    force_password_change?: boolean;
  };
  session?: {
    providerToken?: string | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    expiresAt?: number | null;
  };
};

export type NavigationSubItem = {
  label: string;
  to: string;
  roles: FrontendRole[];
  requiredPermission?: Permission | string;
};

export type NavigationItem = {
  label: string;
  icon: LucideIcon;
  to: string;
  roles: FrontendRole[];
  requiredPermission?: Permission | string;
  children?: NavigationSubItem[];
};

export type Role = {
  id: string;
  name: FrontendRole;
  description?: string;
  permissionCount?: number;
};

export type PermissionDef = {
  id: string;
  name: Permission;
  description?: string;
};
