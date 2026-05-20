import { ForbiddenError } from "../core/errors.js";

const ADMIN_TENANT_ROLES = new Set(["admin", "super_admin"]);

export const getAuthRole = (authContext = {}) => {
  return authContext.role || authContext.user?.role || null;
};

export const getAuthOrganizationId = (authContext = {}) => {
  return (
    authContext.organization_id ||
    authContext.organizationId ||
    authContext.user?.organization_id ||
    authContext.user?.organizationId ||
    null
  );
};

export const canBypassTenantCheck = (authContext = {}) => {
  const role = getAuthRole(authContext);
  return ADMIN_TENANT_ROLES.has(role);
};

export const assertTenantAccess = (
  resource,
  authContext = {},
  resourceLabel = "resource"
) => {
  if (!resource || canBypassTenantCheck(authContext)) {
    return resource;
  }

  const resourceOrganizationId =
    resource.organization_id || resource.organizationId || null;
  const authOrganizationId = getAuthOrganizationId(authContext);

  if (!resourceOrganizationId || !authOrganizationId) {
    return resource;
  }

  if (String(resourceOrganizationId) !== String(authOrganizationId)) {
    throw new ForbiddenError(`You do not have access to this ${resourceLabel}.`);
  }

  return resource;
};

export const applyTenantToPayload = (payload = {}, authContext = {}) => {
  const authOrganizationId = getAuthOrganizationId(authContext);

  if (!authOrganizationId || canBypassTenantCheck(authContext)) {
    return payload;
  }

  const payloadOrganizationId = payload.organization_id || payload.organizationId;

  if (
    payloadOrganizationId &&
    String(payloadOrganizationId) !== String(authOrganizationId)
  ) {
    throw new ForbiddenError("Cannot create or modify cross-organization data.");
  }

  return payload;
};
