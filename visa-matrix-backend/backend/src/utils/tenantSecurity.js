import { ForbiddenError } from "../core/errors.js";
import { normalizeRoleCode } from "../config/rbac.js";

const ADMIN_TENANT_ROLES = new Set(["admin", "super_admin"]);

export const getAuthRole = (authContext = {}) =>
  authContext.role ||
  authContext.roleCode ||
  authContext.user?.role ||
  authContext.user?.roleCode ||
  null;

export const getAuthOrganizationId = (authContext = {}) =>
  authContext.organization_id ||
  authContext.organizationId ||
  authContext.user?.organization_id ||
  authContext.user?.organizationId ||
  null;

export const canBypassTenantCheck = (authContext = {}) =>
  ADMIN_TENANT_ROLES.has(normalizeRoleCode(getAuthRole(authContext)));

export const getTenantOrganizationScope = (authContext = {}) => {
  const organizationId = getAuthOrganizationId(authContext);
  if (!organizationId && !canBypassTenantCheck(authContext)) {
    throw new ForbiddenError("User organization context is required.");
  }
  return organizationId || null;
};

const getResourceOrganizationId = (resource) =>
  resource?.organization_id || resource?.organizationId || null;

export const assertTenantAccess = (
  resource,
  authContext = {},
  resourceLabel = "resource",
) => {
  if (!resource) {
    throw new ForbiddenError(`Access to this ${resourceLabel} is not permitted.`);
  }

  const resourceOrganizationId = getResourceOrganizationId(resource);
  if (!resourceOrganizationId) {
    throw new ForbiddenError(`${resourceLabel} organization ownership is required.`);
  }

  if (canBypassTenantCheck(authContext)) return resource;

  const authOrganizationId = getAuthOrganizationId(authContext);
  if (!authOrganizationId) {
    throw new ForbiddenError("User organization context is required.");
  }

  if (String(resourceOrganizationId) !== String(authOrganizationId)) {
    throw new ForbiddenError(`You do not have access to this ${resourceLabel}.`);
  }

  return resource;
};

export const applyTenantToPayload = (payload = {}, authContext = {}) => {
  const nextPayload = { ...payload };
  const authOrganizationId = getAuthOrganizationId(authContext);
  const payloadOrganizationId =
    nextPayload.organization_id || nextPayload.organizationId || null;

  if (canBypassTenantCheck(authContext)) {
    const organizationId = payloadOrganizationId || authOrganizationId;
    if (!organizationId) {
      throw new ForbiddenError("Organization ownership is required for new records.");
    }
    nextPayload.organization_id = organizationId;
    delete nextPayload.organizationId;
    return nextPayload;
  }

  if (!authOrganizationId) {
    throw new ForbiddenError("User organization context is required.");
  }

  if (
    payloadOrganizationId &&
    String(payloadOrganizationId) !== String(authOrganizationId)
  ) {
    throw new ForbiddenError("Cannot create or modify cross-organization data.");
  }

  nextPayload.organization_id = authOrganizationId;
  delete nextPayload.organizationId;
  return nextPayload;
};
