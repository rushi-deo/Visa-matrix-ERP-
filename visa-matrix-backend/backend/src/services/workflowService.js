import supabase from "../config/supabaseClient.js";
import { buildListResponse, getPaginationOptions } from "../utils/pagination.js";
import {
  assertRecordExists,
  createRecord,
  mapDatabaseError,
  updateRecord,
} from "./baseService.js";

const workflowSelect =
  "id, application_id, stage, notes, created_at, updated_at";

export const listWorkflows = async (queryParams) => {
  const pagination = getPaginationOptions(queryParams);
  let query = supabase
    .from("workflows")
    .select(workflowSelect, { count: pagination.count })
    .not("application_id", "is", null)
    .order("created_at", { ascending: false });

  if (queryParams.application_id) {
    query = query.eq("application_id", queryParams.application_id);
  }

  if (queryParams.stage?.trim()) {
    query = query.eq("stage", queryParams.stage.trim());
  }

  if (pagination.enabled) {
    query = query.range(pagination.from, pagination.to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw mapDatabaseError(error, "Failed to list workflows");
  }

  return buildListResponse(data || [], pagination, count);
};

export const createWorkflow = async (payload) => {
  await assertRecordExists("applications", payload.application_id, "Application");

  return createRecord("workflows", payload, {
    select: workflowSelect,
    entityLabel: "Workflow",
  });
};

export const updateWorkflow = async (id, payload) => {
  if (payload.application_id) {
    await assertRecordExists("applications", payload.application_id, "Application");
  }

  return updateRecord("workflows", id, payload, {
    select: workflowSelect,
    entityLabel: "Workflow",
  });
};
