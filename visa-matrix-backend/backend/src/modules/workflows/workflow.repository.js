import supabase from "../../config/supabase.js";
import { createCrudRepository } from "../../core/baseRepository.js";
import { fromSupabaseError } from "../../core/errors.js";

const workflowCrudRepository = createCrudRepository({
  tableName: "workflows",
});

export const listWorkflows = (query = {}) => {
  return workflowCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      trigger_key: query.triggerKey,
      is_active: query.isActive,
    },
    searchTerm: query.search,
    searchColumns: ["name", "trigger_key", "description"],
  });
};

export const getWorkflowById = (id) => workflowCrudRepository.findById(id);
export const createWorkflow = (payload) => workflowCrudRepository.create(payload);
export const updateWorkflow = (id, payload) =>
  workflowCrudRepository.update(id, payload);
export const deleteWorkflow = (id) => workflowCrudRepository.remove(id);

export const listWorkflowStepsByTrigger = async (triggerKey) => {
  const { data, error } = await supabase
    .from("workflow_steps")
    .select("*")
    .eq("trigger_key", triggerKey)
    .order("step_order", { ascending: true });

  if (error) {
    if (/column/i.test(error.message || "")) {
      return [];
    }

    throw fromSupabaseError(error, "Failed to fetch workflow steps.");
  }

  return data || [];
};
