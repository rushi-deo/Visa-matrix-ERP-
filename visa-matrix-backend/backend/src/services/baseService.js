import supabase from "../config/supabaseClient.js";
import {
  AppError,
  NotFoundError,
  ConflictError,
  RequestValidationError,
} from "../core/errors.js";
import { buildListResponse, getPaginationOptions } from "../utils/pagination.js";

export const mapDatabaseError = (error, fallbackMessage) => {
  if (error.code === "23503") {
    return new RequestValidationError("Referenced record does not exist.");
  }

  if (error.code === "23505") {
    return new ConflictError(
  "A record with the same unique value already exists."
);
  }

  return new AppError(fallbackMessage, 500, {
  code: error.code,
  message: error.message,
  details: error.details,
  hint: error.hint,
});
};

export const fetchRecordById = async (
  table,
  id,
  { select = "*", entityLabel = "Record" } = {}
) => {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw mapDatabaseError(error, `Failed to fetch ${entityLabel.toLowerCase()}`);
  }

  if (!data) {
    throw new NotFoundError(`${entityLabel} not found.`);
  }

  return data;
};

export const assertRecordExists = async (table, id, entityLabel) => {
  await fetchRecordById(table, id, {
    select: "id",
    entityLabel,
  });
};

export const createRecord = async (
  table,
  payload,
  { select = "*", entityLabel = "Record" } = {}
) => {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select(select)
    .single();

  if (error) {
    throw mapDatabaseError(error, `Failed to create ${entityLabel.toLowerCase()}`);
  }

  return data;
};

export const listRecords = async (
  table,
  queryParams,
  { select = "*", entityLabel = "Records" } = {}
) => {
  const pagination = getPaginationOptions(queryParams);
  let query = supabase.from(table).select(select, { count: pagination.count });

  if (pagination.enabled) {
    query = query.range(pagination.from, pagination.to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw mapDatabaseError(error, `Failed to list ${entityLabel.toLowerCase()}`);
  }

  return buildListResponse(data || [], pagination, count);
};

export const updateRecord = async (
  table,
  id,
  payload,
  { select = "*", entityLabel = "Record" } = {}
) => {
  if (!payload || Object.keys(payload).length === 0) {
    throw new ApiError(400, `At least one field is required to update ${entityLabel.toLowerCase()}.`);
  }

  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq("id", id)
    .select(select)
    .maybeSingle();

  if (error) {
    throw mapDatabaseError(error, `Failed to update ${entityLabel.toLowerCase()}`);
  }

  if (!data) {
    throw new ApiError(404, `${entityLabel} not found.`);
  }

  return data;
};

export const deleteRecord = async (
  table,
  id,
  { select = "id", entityLabel = "Record" } = {}
) => {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .select(select)
    .maybeSingle();

  if (error) {
    throw mapDatabaseError(error, `Failed to delete ${entityLabel.toLowerCase()}`);
  }

  if (!data) {
    throw new ApiError(404, `${entityLabel} not found.`);
  }

  return data;
};
