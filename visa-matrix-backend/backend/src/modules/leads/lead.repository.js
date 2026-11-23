import supabase from "../../config/supabase.js";
import { createCrudRepository } from "../../core/baseRepository.js";
import { fromSupabaseError, NotFoundError } from "../../core/errors.js";

const leadCrudRepository = createCrudRepository({
  tableName: "new_applications",
  allowedFilters: ["organization_id", "status"],
});

export const listLeads = (query = {}, organizationId = null) => {
  return leadCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    filters: {
      organization_id: organizationId,
      status: query.status,
    },
    notNullFilters: organizationId ? [] : ["organization_id"],
    searchColumns: [
      "customer_name",
      "email",
      "phone",
      "passport_number",
      "destination_country",
    ],
  });
};

export const getLeadById = async (id, organizationId = null) => {
  let request = supabase.from("new_applications").select("*").eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch lead record.");
  if (!data) throw new NotFoundError("Lead record not found.");
  return data;
};

export const createLead = (payload) =>
  leadCrudRepository.create(payload);

export const updateLead = async (id, payload, organizationId = null) => {
  let request = supabase.from("new_applications").update(payload).eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("*").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to update lead record.");
  if (!data) throw new NotFoundError("Lead record not found.");
  return data;
};

export const deleteLead = async (id, organizationId = null) => {
  let request = supabase.from("new_applications").delete().eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("id").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to delete lead record.");
  if (!data) throw new NotFoundError("Lead record not found.");
  return data;
};
