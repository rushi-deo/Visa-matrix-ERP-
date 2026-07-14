import supabase from "../../config/supabase.js";
import logger from "../../core/logger.js";
import { fromSupabaseError } from "../../core/errors.js";

export const recordApplicationStatusHistory = async ({
  applicationId,
  fromStatus,
  toStatus,
  changedBy = null,
}) => {
  const { data, error } = await supabase
    .from("application_status_history")
    .insert([
      {
        application_id: applicationId,
        old_status: fromStatus,
        new_status: toStatus,
        changed_by: changedBy,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw fromSupabaseError(
      error,
      "Failed to record application status history."
    );
  }

  return data;
};

export const recordApplicationEvent = async ({
  applicationId,
  eventType,
  actorId = null,
  title,
  description = null,
}) => {
  const { data, error } = await supabase
    .from("application_timeline")
    .insert([
      {
        application_id: applicationId,
        stage: eventType,
        description: description || title,
        created_by: actorId,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw fromSupabaseError(error, "Failed to record application event.");
  }

  return data;
};

export const recordAuditLog = async ({
  actorId = null,
  action,
  entityType,
  entityId = null,
  before = null,
  after = null,
}) => {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      table_name: entityType,
      record_id: entityId,
      operation: action,
      old_data: before,
      new_data: after,
      changed_by: actorId,
    })
    .select("*")
    .single();

  if (error) {
    logger.error("Audit log insert failed", {
      action,
      entityType,
      entityId,
      error: error.message,
    });

    throw fromSupabaseError(error, "Failed to record audit log.");
  }

  return data;
};