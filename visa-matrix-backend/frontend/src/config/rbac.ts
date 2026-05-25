/**
 * Enterprise RBAC — single source of truth for roles, routes, and UI access (frontend).
 */

import type {
  AuthUser,
  FrontendRole,
  NavigationItem,
  Permission,
} from "../types";

export const ENTERPRISE_ROLES = [
  "Super Admin",
  "Admin",
  "HR Manager",
  "Finance Manager",
  "Visa Officer",
  "Employee",
  "Guest",
] as const satisfies readonly FrontendRole[];

export const ROLE_LEVEL: Record<FrontendRole, number> = {
  Guest: 0,
  Employee: 10,
  "Visa Officer": 20,
  "Finance Manager": 30,
  "HR Manager": 30,
  Admin: 40,
  "Super Admin": 50,
};

/** Maps backend / legacy role strings to canonical enterprise roles */
export const ROLE_ALIASES: Record<string, FrontendRole> = {
  super_admin: "Super Admin",
  "super admin": "Super Admin",
  admin: "Admin",
  hr: "HR Manager",
  "hr manager": "HR Manager",
  hr_manager: "HR Manager",
  finance: "Finance Manager",
  "finance manager": "Finance Manager",
  finance_manager: "Finance Manager",
  "visa officer": "Visa Officer",
  visa_officer: "Visa Officer",
  case_manager: "Visa Officer",
  "case manager": "Visa Officer",
  agent: "Visa Officer",
  sales: "Employee",
  manager: "Admin",
  employee: "Employee",
  customer: "Guest",
  guest: "Guest",
};

/** Legacy UI permission keys → API module:action names */
export const PERMISSION_ALIASES: Record<Permission, string[]> = {
  manage_users: [
    "manage_users",
    "settings:view",
    "settings:edit",
    "users:manage",
  ],
  manage_roles: ["manage_roles", "settings:edit", "roles:manage"],
  assign_roles: ["assign_roles", "settings:edit"],
  manage_employees: [
    "manage_employees",
    "hr:view",
    "hr:edit",
    "employees:manage",
  ],
  manage_visas: [
    "manage_visas",
    "countries:view",
    "countries:edit",
    "workflow:view",
  ],
  manage_documents: ["manage_documents", "documents:view", "documents:edit"],
  manage_payments: [
    "manage_payments",
    "payments:view",
    "payments:edit",
    "invoicing:view",
  ],
  view_reports: ["view_reports", "reports:view", "dashboard:view"],
  manage_crm: ["manage_crm", "crm:view", "crm:edit", "customers:view"],
  edit_applications: [
    "edit_applications",
    "applications:view",
    "applications:edit",
    "applications:create",
  ],
};

/** When API returns a module permission, also grant matching legacy UI keys */
export const API_TO_LEGACY: Record<string, string[]> = {
  "dashboard:view": ["dashboard:view", "view_reports"],
  "applications:view": ["applications:view", "edit_applications"],
  "hr:view": ["hr:view", "manage_employees"],
  "crm:view": ["crm:view", "manage_crm"],
  "customers:view": ["customers:view", "manage_crm"],
  "documents:view": ["documents:view", "manage_documents"],
  "payments:view": ["payments:view", "manage_payments"],
  "reports:view": ["reports:view", "view_reports"],
  "settings:view": ["settings:view", "manage_users"],
  "settings:edit": ["settings:edit", "manage_roles", "assign_roles"],
};

export function expandGrantedPermissions(permissions: string[]): string[] {
  const expanded = new Set<string>();

  for (const permission of permissions) {
    for (const entry of expandPermissionChecks(permission)) {
      expanded.add(entry);
    }

    const legacy = API_TO_LEGACY[permission];
    if (legacy) {
      for (const entry of legacy) {
        expanded.add(entry);
      }
    }
  }

  return Array.from(expanded);
}

export const ROUTE_ACCESS: Record<
  string,
  { roles?: FrontendRole[]; permissions?: string[] }
> = {
  "/dashboard": { roles: ENTERPRISE_ROLES.filter((r) => r !== "Guest") },
  "/applications": {
    roles: [
      "Super Admin",
      "Admin",
      "HR Manager",
      "Visa Officer",
      "Finance Manager",
      "Employee",
    ],
    permissions: ["applications:view", "edit_applications"],
  },
  "/hr": {
    roles: ["Super Admin", "Admin", "HR Manager"],
    permissions: ["hr:view"],
  },
  "/hr/employees": {
    roles: ["Super Admin", "Admin", "HR Manager"],
    permissions: ["hr:edit", "manage_employees"],
  },
  "/leads": {
    roles: [
      "Super Admin",
      "Admin",
      "HR Manager",
      "Visa Officer",
      "Finance Manager",
    ],
    permissions: ["crm:view", "manage_crm"],
  },
  "/customers": {
    roles: [
      "Super Admin",
      "Admin",
      "HR Manager",
      "Visa Officer",
      "Finance Manager",
    ],
    permissions: ["customers:view", "manage_crm"],
  },
  "/documents": {
    roles: [
      "Super Admin",
      "Admin",
      "HR Manager",
      "Visa Officer",
      "Finance Manager",
    ],
    permissions: ["documents:view", "manage_documents"],
  },
  "/payments": {
    roles: ["Super Admin", "Admin", "Finance Manager"],
    permissions: ["payments:view", "manage_payments"],
  },
  "/accounts": {
    roles: ["Super Admin", "Admin", "Finance Manager"],
    permissions: [
      "payments:view",
      "manage_payments",
      "reports:view",
      "view_reports",
    ],
  },
  "/analytics": {
    roles: ["Super Admin", "Admin", "Finance Manager"],
    permissions: ["reports:view", "view_reports"],
  },
  "/reports": {
    roles: ["Super Admin", "Admin", "Finance Manager"],
    permissions: ["reports:view", "view_reports"],
  },
  "/admin": {
    roles: ["Super Admin", "Admin"],
    permissions: ["settings:view", "manage_users"],
  },
};

export function normalizeEnterpriseRole(role?: string | null): FrontendRole {
  const trimmed = String(role || "").trim();
  if (!trimmed) {
    return "Employee";
  }

  if ((ENTERPRISE_ROLES as readonly string[]).includes(trimmed)) {
    return trimmed as FrontendRole;
  }

  const key = trimmed.toLowerCase();
  return (
    ROLE_ALIASES[key] || ROLE_ALIASES[key.replace(/\s+/g, "_")] || "Employee"
  );
}

export function isSuperAdmin(role?: FrontendRole | string | null): boolean {
  return normalizeEnterpriseRole(role) === "Super Admin";
}

export function isGuest(role?: FrontendRole | string | null): boolean {
  return normalizeEnterpriseRole(role) === "Guest";
}

export function expandPermissionChecks(
  permission: Permission | string,
): string[] {
  const value = String(permission);
  const legacy = PERMISSION_ALIASES[value as Permission];
  return legacy ? [...legacy, value] : [value];
}

export function hasRoleAccess(
  userRole: FrontendRole | string | undefined,
  allowedRoles?: FrontendRole[],
): boolean {
  if (!allowedRoles?.length) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  const canonical = normalizeEnterpriseRole(userRole);

  if (isGuest(canonical)) {
    return false;
  }

  if (isSuperAdmin(canonical)) {
    return true;
  }

  return allowedRoles.some(
    (allowed) => normalizeEnterpriseRole(allowed) === canonical,
  );
}

export function hasPermissionAccess(
  user: Pick<AuthUser, "role" | "permissions"> | null,
  permission: Permission | Permission[] | string,
): boolean {
  if (!user) {
    return false;
  }

  if (isSuperAdmin(user.role)) {
    return true;
  }

  const required = Array.isArray(permission) ? permission : [permission];
  const expanded = required.flatMap((entry) => expandPermissionChecks(entry));
  const granted = new Set(user.permissions.map(String));

  if (granted.has("*")) {
    return true;
  }

  return expanded.some((entry) => granted.has(entry));
}

export function canAccessNavItem(
  user: AuthUser | null,
  item: NavigationItem,
): boolean {
  if (!user || isGuest(user.role)) {
    return false;
  }

  if (!hasRoleAccess(user.role, item.roles)) {
    return false;
  }

  if (
    item.requiredPermission &&
    !hasPermissionAccess(user, item.requiredPermission)
  ) {
    return false;
  }

  return true;
}

export function canAccessRoute(
  user: AuthUser | null,
  pathname: string,
): boolean {
  if (!user || isGuest(user.role)) {
    return false;
  }

  const basePath = Object.keys(ROUTE_ACCESS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!basePath) {
    return true;
  }

  const rule = ROUTE_ACCESS[basePath];
  const roleOk = hasRoleAccess(user.role, rule.roles);
  const permOk = rule.permissions
    ? hasPermissionAccess(user, rule.permissions)
    : true;

  return roleOk && permOk;
}

export function isAuthenticatedUser(
  user: AuthUser | null,
  token: string | null,
) {
  return Boolean(token && user && !isGuest(user.role));
}
