import {
  listQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "./quotation.repository.js";
import supabase from "../../config/supabase.js";
import { createInvoiceRecord } from "../invoices/invoice.service.js";
import { getApplication } from "../applications/application.service.js";
import { getCustomer } from "../customers/customer.service.js";
import { ForbiddenError } from "../../core/errors.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  getTenantOrganizationScope,
} from "../../utils/tenantSecurity.js";

const assertQuotationParentOwnership = async (quotation, authContext) => {
  assertTenantAccess(quotation, authContext, "quotation");
  let parentOrganizationId = null;
  if (quotation.application_id) {
    const application = await getApplication(quotation.application_id, authContext);
    parentOrganizationId = application.organization_id;
  }
  if (quotation.customer_id) {
    const customer = await getCustomer(quotation.customer_id, authContext);
    if (parentOrganizationId && parentOrganizationId !== customer.organization_id) {
      throw new ForbiddenError("Quotation customer and application ownership do not match.");
    }
    parentOrganizationId = customer.organization_id;
  }
  if (parentOrganizationId && parentOrganizationId !== quotation.organization_id) {
    throw new ForbiddenError("Quotation organization does not match its parent record.");
  }
  return quotation;
};

export const getQuotations = async (query = {}, authContext = {}) => {
  const result = await listQuotations(query, getTenantOrganizationScope(authContext));
  const items = await Promise.all((result.items || []).map((quotation) =>
    assertQuotationParentOwnership(quotation, authContext),
  ));
  return { ...result, items };
};

export const getQuotation = async (id, authContext = {}) => {
  const quotation = await getQuotationById(id, getTenantOrganizationScope(authContext));
  return assertQuotationParentOwnership(quotation, authContext);
};

export const createQuotationRecord = async (payload, authContext = {}) => {
  let organizationId = payload.organization_id || payload.organizationId;
  if (payload.application_id) {
    const application = await getApplication(payload.application_id, authContext);
    organizationId = application.organization_id;
  }
  if (payload.customer_id) {
    const customer = await getCustomer(payload.customer_id, authContext);
    if (organizationId && organizationId !== customer.organization_id) {
      throw new ForbiddenError("Quotation customer belongs to another organization.");
    }
    organizationId = customer.organization_id;
  }
  return createQuotation(applyTenantToPayload({
    ...payload,
    ...(organizationId ? { organization_id: organizationId } : {}),
  }, authContext));
}

export const updateQuotationRecord = async (
  id,
  payload,
  authContext = {},
) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const current = await getQuotationById(id, organizationId);
  await assertQuotationParentOwnership(current, authContext);
  if (payload.application_id) {
    const application = await getApplication(payload.application_id, authContext);
    if (String(application.organization_id) !== String(current.organization_id)) {
      throw new ForbiddenError("Quotation application must belong to the quotation organization.");
    }
  }
  if (payload.customer_id) {
    const customer = await getCustomer(payload.customer_id, authContext);
    if (String(customer.organization_id) !== String(current.organization_id)) {
      throw new ForbiddenError("Quotation customer must belong to the quotation organization.");
    }
  }
  return updateQuotation(id, applyTenantToPayload({
    ...payload,
    organization_id: current.organization_id,
  }, authContext), organizationId);
};

export const deleteQuotationRecord = async (id, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const current = await getQuotationById(id, organizationId);
  await assertQuotationParentOwnership(current, authContext);
  return deleteQuotation(id, organizationId);
};
export const generateInvoiceFromQuotation = async (quotationId, authContext = {}) => {
  // 1. Fetch quotation
 let request = supabase
  .from("quotations")
  .select("*")
  .eq("id", quotationId);
 const organizationId = getTenantOrganizationScope(authContext);
 request = organizationId
   ? request.eq("organization_id", organizationId)
   : request.not("organization_id", "is", null);
 const { data: quotation, error: quotationError } = await request.maybeSingle();

if (quotationError) {
  throw quotationError;
}

if (!quotation) {
  throw new Error("Quotation not found");
}

  if (!quotation) {
    throw new Error("Quotation not found");
  }
  assertTenantAccess(quotation, authContext, "quotation");

  // 2. Fetch quotation items
  const { data: quotationItems, error: quotationItemsError } =
    await supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", quotationId);

  if (quotationItemsError) {
    throw quotationItemsError;
  }

  // 3. Create invoice
  console.log("Quotation fetched:", quotation);

console.log("Creating invoice with:", {
  customer_id: quotation.customer_id,
  subtotal: quotation.subtotal,
  tax_amount: quotation.gst_amount,
  total_amount: quotation.grand_total,
  status: "unpaid",
});
  const invoice = await createInvoiceRecord({
  application_id: quotation.application_id,
  organization_id: quotation.organization_id,
  customer_id: quotation.customer_id,
  subtotal: quotation.subtotal,
  tax_amount: quotation.gst_amount,
  total_amount: quotation.grand_total,
  status: "unpaid",
}, authContext);

  // 4. Copy quotation items into invoice_items
  const invoiceItems = quotationItems.map((item) => ({
    invoice_id: invoice.id,
    service_id: item.service_id,
    label: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    gst_percentage: item.gst_percentage,
    amount: item.line_total,
  }));

  const { error: invoiceItemsError } = await supabase
    .from("invoice_items")
    .insert(invoiceItems);

  if (invoiceItemsError) {
    throw invoiceItemsError;
  }

  return invoice;
};
