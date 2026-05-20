import supabase from "../../config/supabase.js";
import logger from "../../core/logger.js";
import { fromSupabaseError } from "../../core/errors.js";

export const recordApplicationStatusHistory = async ({
  applicationId,
  fromStatus,
  toStatus,
  changedBy = null,
  reason = null,
  metadata = {},
}) => {
  const { data, error } = await supabase
    .from("application_status_history")
    .insert({
      application_id: applicationId,
      from_status: fromStatus,
      to_status: toStatus,
      changed_by: changedBy,
      reason,
      metadata,
    })
    .select("*")
    .single();

  if (error) {
    throw fromSupabaseError(error, "Failed to record application status history.");
  }

  return data;
};

export const recordApplicationEvent = async ({
  applicationId,
  eventType,
  actorId = null,
  title,
  description = null,
  metadata = {},
}) => {
  const { data, error } = await supabase
    .from("application_events")
    .insert({
      application_id: applicationId,
      event_type: eventType,
      actor_id: actorId,
      title,
      description,
      metadata,
    })
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
  requestId = null,
  ipAddress = null,
  userAgent = null,
  before = null,
  after = null,
  metadata = {},
}) => {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      request_id: requestId,
      ip_address: ipAddress,
      user_agent: userAgent,
      before,
      after,
      metadata,
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
