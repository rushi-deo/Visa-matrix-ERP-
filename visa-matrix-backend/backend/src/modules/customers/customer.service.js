import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "./customer.repository.js";
import { ForbiddenError, RequestValidationError } from "../../core/errors.js";
import { normalizeRoleCode } from "../../config/rbac.js";

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
  return getCustomerById(id, organizationId);
};
export const createCustomerRecord = async (payload, authContext = {}) => {

  const customer = sanitizeCustomerPayload(payload);
  const organizationId = authContext.organization_id;

  if (!customer.full_name) {
    throw new RequestValidationError("Customer name is required.");
  }

  if (!organizationId) {
    throw new RequestValidationError(
      "Customer organization ownership is required.",
    );
  }

  customer.organization_id = organizationId;

  return createCustomer(customer);
};
export const updateCustomerRecord = async (id, payload, authContext) => {
  const { organizationId } = getCustomerTenantContext(authContext);
  return updateCustomer(id, sanitizeCustomerPayload(payload), organizationId);
};
export const deleteCustomerRecord = async (id, authContext) => {
  const { organizationId } = getCustomerTenantContext(authContext);
  return deleteCustomer(id, organizationId);
};
