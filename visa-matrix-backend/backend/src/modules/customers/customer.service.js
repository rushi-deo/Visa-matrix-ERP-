import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "./customer.repository.js";
import { ForbiddenError, RequestValidationError } from "../../core/errors.js";
import { normalizeRoleCode } from "../../config/rbac.js";
import { applyTenantToPayload, assertTenantAccess } from "../../utils/tenantSecurity.js";

const TENANT_WIDE_ROLE_CODES = new Set(["admin", "super_admin"]);

export const getCustomerTenantContext = (authContext = {}) => {
  const organizationId =
    authContext.organization_id ||
    authContext.organizationId ||
    authContext.user?.organization_id ||
    authContext.user?.organizationId ||
    null;
  const role = normalizeRoleCode(
    authContext.role ||
      authContext.roleCode ||
      authContext.user?.role ||
      authContext.user?.roleCode,
  );

  if (TENANT_WIDE_ROLE_CODES.has(role)) {
    return { organizationId: null };
  }

  if (!organizationId) {
    throw new ForbiddenError("Customer organization context is required.");
  }

  return { organizationId };
};

export const sanitizeCustomerPayload = (payload = {}) => {
  const sanitizedPayload = { ...payload };
  delete sanitizedPayload.organization_id;
  delete sanitizedPayload.organizationId;

  const data = {
    ...sanitizedPayload,
    full_name: payload.full_name?.trim(),
    email: payload.email?.trim().toLowerCase(),
    phone: payload.phone?.trim(),
    passport_number: payload.passport_number?.trim().toUpperCase(),
  };

  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
};
export const getCustomers = async (query, authContext) => {
  const { organizationId } = getCustomerTenantContext(authContext);
  return listCustomers(query, organizationId);
};
export const getCustomer = async (id, authContext) => {
  const { organizationId } = getCustomerTenantContext(authContext);
  return assertTenantAccess(
    await getCustomerById(id, organizationId),
    authContext,
    "customer",
  );
};
export const createCustomerRecord = async (payload, authContext = {}) => {

  const customer = sanitizeCustomerPayload(payload);
  if (!customer.full_name) {
    throw new RequestValidationError("Customer name is required.");
  }

  return createCustomer(applyTenantToPayload(customer, authContext));
};
export const updateCustomerRecord = async (id, payload, authContext) => {
  const { organizationId } = getCustomerTenantContext(authContext);
  const currentCustomer = await getCustomerById(id, organizationId);
  assertTenantAccess(currentCustomer, authContext, "customer");
  return updateCustomer(
    id,
    applyTenantToPayload({
      ...sanitizeCustomerPayload(payload),
      organization_id: currentCustomer.organization_id,
    }, authContext),
    organizationId,
  );
};
export const deleteCustomerRecord = async (id, authContext) => {
  const { organizationId } = getCustomerTenantContext(authContext);
  const currentCustomer = await getCustomerById(id, organizationId);
  assertTenantAccess(currentCustomer, authContext, "customer");
  return deleteCustomer(id, organizationId);
};
