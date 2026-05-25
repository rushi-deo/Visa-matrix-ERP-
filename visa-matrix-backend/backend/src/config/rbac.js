/**
 * Enterprise RBAC — single source of truth for roles and permission checks (backend).
 */

export const ENTERPRISE_ROLES = Object.freeze([
  "Super Admin",
  "Admin",
  "HR Manager",
  "Finance Manager",
  "Visa Officer",
  "Employee",
  "Guest",
]);

/** Higher level = broader access within the org */
export const ROLE_LEVEL = Object.freeze({
  Guest: 0,
  Employee: 10,
  "Visa Officer": 20,
  "Finance Manager": 30,
  "HR Manager": 30,
  Admin: 40,
  "Super Admin": 50,
});

const ROLE_ALIAS_TO_CANONICAL = Object.freeze({
  super_admin: "Super Admin",
  "super admin": "Super Admin",
  superadmin: "Super Admin",
  admin: "Admin",
  administrator: "Admin",
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
});

export const normalizeEnterpriseRole = (role = "") => {
  const trimmed = String(role || "").trim();
  if (!trimmed) {
    return "Employee";
  }

  if (ENTERPRISE_ROLES.includes(trimmed)) {
    return trimmed;
  }

  const aliasKey = trimmed.toLowerCase().replace(/\s+/g, " ");
  const underscored = aliasKey.replace(/\s+/g, "_");

  return (
    ROLE_ALIAS_TO_CANONICAL[trimmed] ||
    ROLE_ALIAS_TO_CANONICAL[aliasKey] ||
    ROLE_ALIAS_TO_CANONICAL[underscored] ||
    "Employee"
  );
};

export const normalizeRoleCode = (role = "") =>
  normalizeEnterpriseRole(role).toLowerCase().replace(/\s+/g, "_");

export const isSuperAdminRole = (role) =>
  normalizeRoleCode(role) === "super_admin";

export const isGuestRole = (role) => normalizeRoleCode(role) === "guest";

export const roleLevel = (role) => ROLE_LEVEL[normalizeEnterpriseRole(role)] ?? 0;

export const hasRoleAccess = (userRole, allowedRoles = []) => {
  if (!allowedRoles.length) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  const canonical = normalizeEnterpriseRole(userRole);

  if (isGuestRole(canonical)) {
    return false;
  }

  if (isSuperAdminRole(canonical)) {
    return true;
  }

  return allowedRoles.some(
    (allowed) => normalizeEnterpriseRole(allowed) === canonical,
  );
};

export const hasPermissionAccess = (userRole, permissions = [], userPermissions = []) => {
  if (isSuperAdminRole(userRole)) {
    return true;
  }

  if (!permissions.length) {
    return true;
  }

  const granted = new Set(
    (userPermissions || []).map((permission) => String(permission)),
  );

  if (granted.has("*")) {
    return true;
  }

  return permissions.some((required) => granted.has(String(required)));
};
