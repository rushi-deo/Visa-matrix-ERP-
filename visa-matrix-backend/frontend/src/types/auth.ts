import type { LucideIcon } from "lucide-react";

export type FrontendRole =
  | "Super Admin"
  | "Admin"
  | "HR"
  | "Finance"
  | "Sales"
  | "Case Manager"
  | "Employee";

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
  permissions: Permission[];
  rawRole: string;
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
    permissions?: Permission[];
  };
  user?: {
    id: string;
    name?: string;
    full_name?: string;
    email: string;
    role: string;
    permissions?: Permission[];
  };
};

export type NavigationItem = {
  label: string;
  icon: LucideIcon;
  to: string;
  roles: FrontendRole[];
  requiredPermission?: Permission;
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
