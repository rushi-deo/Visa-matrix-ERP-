import supabase from "../config/supabaseClient.js";
import { buildListResponse, getPaginationOptions } from "../utils/pagination.js";
import { buildIlikeOrQuery, sanitizeSearchTerm } from "../utils/query.js";
import {
  assertRecordExists,
  createRecord,
  mapDatabaseError,
} from "./baseService.js";

const notificationSelect =
  "id, title, message, type, related_application, created_at, updated_at";

export const listNotifications = async (queryParams) => {
  const pagination = getPaginationOptions(queryParams);
  let query = supabase
    .from("notifications")
    .select(notificationSelect, { count: pagination.count })
    .order("created_at", { ascending: false });

  if (queryParams.related_application) {
    query = query.eq("related_application", queryParams.related_application);
  }

  if (queryParams.type?.trim()) {
    query = query.eq("type", queryParams.type.trim());
  }

  if (queryParams.q?.trim()) {
    const searchTerm = sanitizeSearchTerm(queryParams.q);

    if (searchTerm) {
      query = query.or(
        buildIlikeOrQuery(["title", "message", "type"], searchTerm)
      );
    }
  }

  if (pagination.enabled) {
    query = query.range(pagination.from, pagination.to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw mapDatabaseError(error, "Failed to list notifications");
  }

  return buildListResponse(data || [], pagination, count);
};

export const createNotification = async (payload) => {
  if (payload.related_application) {
    await assertRecordExists(
      "applications",
      payload.related_application,
      "Application"
    );
  }

  return createRecord("notifications", payload, {
    select: notificationSelect,
    entityLabel: "Notification",
  });
};
