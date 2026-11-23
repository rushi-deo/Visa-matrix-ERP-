import supabase from "../../config/supabase.js";
import { createCrudRepository } from "../../core/baseRepository.js";
import { fromSupabaseError } from "../../core/errors.js";
import { NotFoundError } from "../../core/errors.js";

const workflowCrudRepository = createCrudRepository({
  tableName: "workflows",
  allowedFilters: ["organization_id", "trigger_key", "is_active"],
});

export const listWorkflows = (query = {}, organizationId = null) => {
  return workflowCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      trigger_key: query.triggerKey,
      is_active: query.isActive,
      organization_id: organizationId,
    },
    notNullFilters: organizationId ? [] : ["organization_id"],
    searchTerm: query.search,
    searchColumns: ["name", "trigger_key", "description"],
  });
};

export const getWorkflowById = async (id, organizationId = null) => {
  let request = supabase.from("workflows").select("*").eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch workflow record.");
  if (!data) throw new NotFoundError("Workflow record not found.");
  return data;
};
export const createWorkflow = (payload) => workflowCrudRepository.create(payload);
export const updateWorkflow = async (id, payload, organizationId = null) => {
  let request = supabase.from("workflows").update(payload).eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("*").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to update workflow record.");
  if (!data) throw new NotFoundError("Workflow record not found.");
  return data;
};
export const deleteWorkflow = async (id, organizationId = null) => {
  let request = supabase.from("workflows").delete().eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("id").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to delete workflow record.");
  if (!data) throw new NotFoundError("Workflow record not found.");
  return data;
};

export const listWorkflowStepsByTrigger = async (triggerKey, organizationId = null) => {
  let request = supabase
    .from("workflow_steps")
    .select("*")
    .eq("trigger_key", triggerKey)
    .order("step_order", { ascending: true });
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request;

  if (error) {
    if (/column/i.test(error.message || "")) {
      return [];
    }

    throw fromSupabaseError(error, "Failed to fetch workflow steps.");
  }

  return data || [];
};
