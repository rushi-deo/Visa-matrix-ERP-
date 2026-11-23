import supabase from "../../config/supabase.js";
import { createCrudRepository } from "../../core/baseRepository.js";
import { fromSupabaseError, NotFoundError } from "../../core/errors.js";

const quotationCrudRepository = createCrudRepository({
  tableName: "quotations",
  allowedFilters: ["organization_id"],
});

export const listQuotations = (query = {}, organizationId = null) => {
  return quotationCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    filters: { organization_id: organizationId },
    notNullFilters: organizationId ? [] : ["organization_id"],
    searchColumns: [
      "country_name",
      "visa_type",
      "status",
    ],
  });
};

export const getQuotationById = async (id, organizationId = null) => {
  let request = supabase.from("quotations").select("*").eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch quotation record.");
  if (!data) throw new NotFoundError("Quotation record not found.");
  return data;
};

export const createQuotation = (payload) =>
  quotationCrudRepository.create(payload);

export const updateQuotation = async (id, payload, organizationId = null) => {
  let request = supabase.from("quotations").update(payload).eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("*").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to update quotation record.");
  if (!data) throw new NotFoundError("Quotation record not found.");
  return data;
};

export const deleteQuotation = async (id, organizationId = null) => {
  let request = supabase.from("quotations").delete().eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("id").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to delete quotation record.");
  if (!data) throw new NotFoundError("Quotation record not found.");
  return data;
};
