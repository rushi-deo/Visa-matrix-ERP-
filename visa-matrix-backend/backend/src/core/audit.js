import supabase from "../config/supabase.js";
import { fromSupabaseError } from "./errors.js";

const SENSITIVE_KEY_PATTERN =
  /token|secret|password|authorization|credential|api[_-]?key|refresh/i;

const isUuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const redactAuditValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(redactAuditValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key)
          ? "[REDACTED]"
          : redactAuditValue(nestedValue),
      ]),
    );
  }

  if (typeof value === "string") {
    return value.length > 2000 ? `${value.slice(0, 2000)}...` : value;
  }

  return value ?? null;
};

const getActor = (context = {}) => {
  const user = context.user || {};
  const service = context.internalService || {};

  if (service.authenticated) {
    return {
      actorType: user.userId ? "user_and_service" : "service",
      actorId: user.userId || null,
      serviceName: service.name || null,
      email: user.email || null,
    };
  }

  return {
    actorType: user.userId ? "user" : "system",
    actorId: user.userId || null,
    serviceName: null,
    email: user.email || null,
  };
};

export const recordAuditEvent = async ({
  action,
  resourceType,
  resourceId = null,
  organizationId = null,
  requestId = null,
  correlationId = null,
  context = {},
  before = null,
  after = null,
  metadata = {},
  status = "completed",
  errorMessage = null,
  ipAddress = null,
  userAgent = null,
}) => {
  const actor = getActor(context);
  const safeMetadata = redactAuditValue({
    ...metadata,
    actorType: actor.actorType,
    serviceName: actor.serviceName,
  });
  const safeErrorMessage = errorMessage
    ? redactAuditValue(String(errorMessage))
    : null;

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      action,
      actor_id: actor.actorId,
      actor_type: actor.actorType,
      after: redactAuditValue(after),
      before: redactAuditValue(before),
      correlation_id: correlationId,
      details: safeMetadata,
      email: actor.email,
      entity_id: isUuid(resourceId) ? resourceId : null,
      entity_type: resourceType,
      error_message: safeErrorMessage,
      ip_address: ipAddress,
      new_values: redactAuditValue(after),
      old_values: redactAuditValue(before),
      organization_id: organizationId,
      request_id: requestId,
      resource_id: resourceId,
      resource_type: resourceType,
      service_name: actor.serviceName,
      status,
      user_agent: userAgent,
    })
    .select("*")
    .single();

  if (error) {
    throw fromSupabaseError(error, "Failed to record audit event.");
  }

  return data;
};

export const createAuditContext = (req) => ({
  internalService: req.internalService,
  user: req.user,
});
