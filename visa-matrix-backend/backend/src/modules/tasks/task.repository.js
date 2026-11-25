import { createCrudRepository } from "../../core/baseRepository.js";
import supabase from "../../config/supabase.js";
import { fromSupabaseError, NotFoundError } from "../../core/errors.js";

const taskCrudRepository = createCrudRepository({
  tableName: "tasks",
  allowedFilters: ["organization_id", "application_id", "assigned_to", "status"],
});

export const listTasks = (query = {}, organizationId = null) => {
  return taskCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      application_id: query.applicationId || query.application_id,
      assigned_to: query.assignedTo,
      status: query.status,
      organization_id: organizationId,
    },
    notNullFilters: organizationId ? [] : ["organization_id"],
    searchTerm: query.search,
    searchColumns: ["title", "task_title", "description", "task_description"],
  });
};

export const getTaskById = async (id, organizationId = null) => {
  let request = supabase.from("tasks").select("*").eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch task record.");
  if (!data) throw new NotFoundError("Task record not found.");
  return data;
};
export const createTask = (payload) => taskCrudRepository.create(payload);
export const updateTask = async (id, payload, organizationId = null) => {
  let request = supabase.from("tasks").update(payload).eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("*").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to update task record.");
  if (!data) throw new NotFoundError("Task record not found.");
  return data;
};
export const deleteTask = async (id, organizationId = null) => {
  let request = supabase.from("tasks").delete().eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.select("id").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to delete task record.");
  if (!data) throw new NotFoundError("Task record not found.");
  return data;
};
