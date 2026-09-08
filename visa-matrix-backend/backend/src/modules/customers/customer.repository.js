import { createCrudRepository } from "../../core/baseRepository.js";
import supabase from "../../config/supabase.js";
import { fromSupabaseError, NotFoundError } from "../../core/errors.js";

const customerCrudRepository = createCrudRepository({
  tableName: "customers",
  defaultOrder: "created_at",
  allowedFilters: ["status", "assigned_to", "country_id", "organization_id"],
  allowedOrderColumns: [
    "created_at",
    "updated_at",
    "full_name",
    "email",
  ],
});

export const listCustomers = (query = {}, organizationId = null) => {
  return customerCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    searchColumns: ["full_name", "email", "phone", "passport_number"],
    filters: organizationId ? { organization_id: organizationId } : {},
  });
};

const applyOrganizationFilter = (query, organizationId) => {
  return organizationId ? query.eq("organization_id", organizationId) : query;
};

export const getCustomerById = async (id, organizationId = null) => {
  let query = supabase.from("customers").select("*").eq("id", id);
  query = applyOrganizationFilter(query, organizationId);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch customer record.");
  }

  if (!data) {
    throw new NotFoundError("customers record not found.");
  }

  return data;
};

export const createCustomer = (payload) => customerCrudRepository.create(payload);

export const updateCustomer = async (id, payload, organizationId = null) => {
  let query = supabase.from("customers").update(payload).eq("id", id);
  query = applyOrganizationFilter(query, organizationId);

  const { data, error } = await query.select("*").maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to update customer record.");
  }

  if (!data) {
    throw new NotFoundError("customers record not found.");
  }

  return data;
};

export const deleteCustomer = async (id, organizationId = null) => {
  let query = supabase.from("customers").delete().eq("id", id);
  query = applyOrganizationFilter(query, organizationId);

  const { data, error } = await query.select("id").maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to delete customer record.");
  }

  if (!data) {
    throw new NotFoundError("customers record not found.");
  }

  return data;
};
