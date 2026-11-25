import { createCrudRepository } from "../../core/baseRepository.js";
import supabase from "../../config/supabase.js";
import { fromSupabaseError, NotFoundError } from "../../core/errors.js";
const invoiceCrudRepository = createCrudRepository({
  tableName: "invoices",
  allowedFilters: ["organization_id"],
});

export const listInvoices = (query = {}, organizationId = null) => {
  return invoiceCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    filters: { organization_id: organizationId },
    notNullFilters: organizationId ? [] : ["organization_id"],
    searchColumns: [
      "invoice_number",
      "invoice_code",
      "status",
    ],
  });
};

export const getInvoiceById = async (id, organizationId = null) => {
  let request = supabase.from("invoices").select("*").eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch invoice record.");
  if (!data) throw new NotFoundError("Invoice record not found.");
  return data;
};

export const createInvoice = (payload) =>
  invoiceCrudRepository.create(payload);

export const updateInvoice = async (id, payload, organizationId = null) => {
  let request = supabase.from("invoices").update(payload).eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("*").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to update invoice record.");
  if (!data) throw new NotFoundError("Invoice record not found.");
  return data;
};

export const deleteInvoice = async (id, organizationId = null) => {
  let request = supabase.from("invoices").delete().eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("id").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to delete invoice record.");
  if (!data) throw new NotFoundError("Invoice record not found.");
  return data;
};
export const getInvoiceDetails = async (id, organizationId = null) => {
  let request = supabase
    .from("invoices")
   .select(`
  *,
  customers(*),
  applications(*),
  invoice_items(*),
  payments(*)
`)
    .eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.maybeSingle();

  if (error) throw fromSupabaseError(error, "Failed to fetch invoice details.");
  if (!data) throw new NotFoundError("Invoice record not found.");

  return data;
};
