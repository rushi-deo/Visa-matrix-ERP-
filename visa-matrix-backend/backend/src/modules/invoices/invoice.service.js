import {
  listInvoices,
  getInvoiceById,
  getInvoiceDetails,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "./invoice.repository.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  getTenantOrganizationScope,
} from "../../utils/tenantSecurity.js";
import { ForbiddenError } from "../../core/errors.js";
import { getApplication } from "../applications/application.service.js";
import { getCustomer } from "../customers/customer.service.js";

const assertInvoiceParentOwnership = async (invoice, authContext) => {
  assertTenantAccess(invoice, authContext, "invoice");
  let parentOrganizationId = null;
  if (invoice.application_id) {
    const application = await getApplication(invoice.application_id, authContext);
    parentOrganizationId = application.organization_id;
  }
  if (invoice.customer_id) {
    const customer = await getCustomer(invoice.customer_id, authContext);
    if (parentOrganizationId && parentOrganizationId !== customer.organization_id) {
      throw new ForbiddenError("Invoice customer and application ownership do not match.");
    }
    parentOrganizationId = customer.organization_id;
  }
  if (parentOrganizationId && parentOrganizationId !== invoice.organization_id) {
    throw new ForbiddenError("Invoice organization does not match its parent record.");
  }
  return invoice;
};

export const getInvoices = async (query = {}, authContext = {}) => {
  const result = await listInvoices(query, getTenantOrganizationScope(authContext));
  const items = await Promise.all((result.items || []).map((invoice) =>
    assertInvoiceParentOwnership(invoice, authContext),
  ));
  return { ...result, items };
};

export const getInvoice = async (id, authContext = {}) => {
  const invoice = await getInvoiceDetails(
    id,
    getTenantOrganizationScope(authContext),
  );
  return assertInvoiceParentOwnership(invoice, authContext);
};

export const createInvoiceRecord = async (payload, authContext = {}) => {
  let organizationId = payload.organization_id || payload.organizationId;
  if (payload.application_id) {
    const application = await getApplication(payload.application_id, authContext);
    organizationId = application.organization_id;
  }
  if (payload.customer_id) {
    const customer = await getCustomer(payload.customer_id, authContext);
    if (organizationId && organizationId !== customer.organization_id) {
      throw new ForbiddenError("Invoice customer belongs to another organization.");
    }
    organizationId = customer.organization_id;
  }
  return createInvoice(applyTenantToPayload({
    ...payload,
    ...(organizationId ? { organization_id: organizationId } : {}),
  }, authContext));
};

export const updateInvoiceRecord = async (id, payload, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const current = await getInvoiceById(id, organizationId);
  await assertInvoiceParentOwnership(current, authContext);
  if (payload.application_id) {
    const application = await getApplication(payload.application_id, authContext);
    if (String(application.organization_id) !== String(current.organization_id)) {
      throw new ForbiddenError("Invoice application must belong to the invoice organization.");
    }
  }
  if (payload.customer_id) {
    const customer = await getCustomer(payload.customer_id, authContext);
    if (String(customer.organization_id) !== String(current.organization_id)) {
      throw new ForbiddenError("Invoice customer must belong to the invoice organization.");
    }
  }
  return updateInvoice(id, applyTenantToPayload({
    ...payload,
    organization_id: current.organization_id,
  }, authContext), organizationId);
};

export const deleteInvoiceRecord = async (id, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const current = await getInvoiceById(id, organizationId);
  await assertInvoiceParentOwnership(current, authContext);
  return deleteInvoice(id, organizationId);
};
