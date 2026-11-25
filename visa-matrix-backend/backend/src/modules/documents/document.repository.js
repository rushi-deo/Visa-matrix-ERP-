import { createCrudRepository } from "../../core/baseRepository.js";
import supabase from "../../config/supabase.js";
import { fromSupabaseError, NotFoundError } from "../../core/errors.js";

const documentCrudRepository = createCrudRepository({
  tableName: "documents",
  allowedFilters: ["organization_id", "application_id", "status", "verification_status"],
});

export const listDocuments = (query = {}, organizationId = null) => {
  return documentCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      application_id: query.applicationId || query.application_id,
      status: query.status,
      organization_id: organizationId,
    },
    notNullFilters: organizationId ? [] : ["organization_id"],
    searchTerm: query.search,
    searchColumns: ["file_name", "document_type", "status"],
  });
};

export const getDocumentById = async (id, organizationId = null) => {
  let request = supabase.from("documents").select("*").eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch document record.");
  if (!data) throw new NotFoundError("Document record not found.");
  return data;
};
export const createDocument = (payload) => documentCrudRepository.create(payload);
export const updateDocument = async (id, payload, organizationId = null) => {
  let request = supabase.from("documents").update(payload).eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("*").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to update document record.");
  if (!data) throw new NotFoundError("Document record not found.");
  return data;
};
export const deleteDocument = async (id, organizationId = null) => {
  let request = supabase.from("documents").delete().eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("id").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to delete document record.");
  if (!data) throw new NotFoundError("Document record not found.");
  return data;
};
