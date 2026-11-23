import { createCrudRepository } from "../../core/baseRepository.js";
import supabase from "../../config/supabase.js";
import { fromSupabaseError, NotFoundError } from "../../core/errors.js";

const paymentCrudRepository = createCrudRepository({
  tableName: "payments",
  allowedFilters: ["organization_id", "application_id", "payment_status", "currency"],
});

export const listPayments = (query = {}, organizationId = null) => {
  return paymentCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      application_id: query.applicationId,
      payment_status: query.status,
      currency: query.currency,
      organization_id: organizationId,
    },
    notNullFilters: organizationId ? [] : ["organization_id"],
    searchTerm: query.search,
    searchColumns: ["invoice_number", "payment_method", "provider_ref"],
  });
};

export const getPaymentById = async (id, organizationId = null) => {
  let request = supabase.from("payments").select("*").eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch payment record.");
  if (!data) throw new NotFoundError("Payment record not found.");
  return data;
};
export const createPayment = (payload) => paymentCrudRepository.create(payload);
