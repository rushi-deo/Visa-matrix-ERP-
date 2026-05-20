import supabase from "../config/supabaseClient.js";
import { buildListResponse, getPaginationOptions } from "../utils/pagination.js";
import { buildIlikeOrQuery, sanitizeSearchTerm } from "../utils/query.js";
import {
  assertRecordExists,
  createRecord,
  deleteRecord,
  mapDatabaseError,
  updateRecord,
} from "./baseService.js";

const taskSelect =
  "id, application_id, task_title, task_description, assigned_to, due_date, status, created_at, updated_at";

export const listTasks = async (queryParams) => {
  const pagination = getPaginationOptions(queryParams);
  let query = supabase
    .from("tasks")
    .select(taskSelect, { count: pagination.count })
    .order("created_at", { ascending: false });

  if (queryParams.application_id) {
    query = query.eq("application_id", queryParams.application_id);
  }

  if (queryParams.status?.trim()) {
    query = query.eq("status", queryParams.status.trim());
  }

  if (queryParams.assigned_to?.trim()) {
    query = query.ilike("assigned_to", `%${queryParams.assigned_to.trim()}%`);
  }

  if (queryParams.q?.trim()) {
    const searchTerm = sanitizeSearchTerm(queryParams.q);

    if (searchTerm) {
      query = query.or(
        buildIlikeOrQuery(["task_title", "task_description"], searchTerm)
      );
    }
  }

  if (pagination.enabled) {
    query = query.range(pagination.from, pagination.to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw mapDatabaseError(error, "Failed to list tasks");
  }

  return buildListResponse(data || [], pagination, count);
};

export const createTask = async (payload) => {
  await assertRecordExists("applications", payload.application_id, "Application");

  return createRecord("tasks", payload, {
    select: taskSelect,
    entityLabel: "Task",
  });
};

export const updateTask = async (id, payload) => {
  if (payload.application_id) {
    await assertRecordExists("applications", payload.application_id, "Application");
  }

  return updateRecord("tasks", id, payload, {
    select: taskSelect,
    entityLabel: "Task",
  });
};

export const deleteTask = async (id) => {
  const deletedTask = await deleteRecord("tasks", id, {
    select: "id",
    entityLabel: "Task",
  });

  return {
    id: deletedTask.id,
  };
};
