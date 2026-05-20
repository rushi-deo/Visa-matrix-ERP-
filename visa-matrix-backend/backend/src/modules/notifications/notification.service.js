import { enqueueEmailJob } from "../../jobs/emailJob.js";
import { enqueueNotificationJob } from "../../jobs/notificationJob.js";
import {
  createNotification,
  deleteNotification,
  getNotificationById,
  listNotifications,
  updateNotification,
} from "./notification.repository.js";

export const getNotifications = async (query) => listNotifications(query);
export const getNotification = async (id) => getNotificationById(id);

export const createNotificationRecord = async (payload) => {
  const nextPayload = {
    status: payload.status || "queued",
    channel: payload.channel || "in_app",
    ...payload,
  };

  const notification = await createNotification(nextPayload);

  await enqueueNotificationJob({
    notificationId: notification.id,
    channel: notification.channel || nextPayload.channel,
  });

  if ((notification.channel || nextPayload.channel) === "email") {
    await enqueueEmailJob({
      notificationId: notification.id,
      subject: notification.title || nextPayload.title,
      message: notification.message || nextPayload.message,
      recipientEmail:
        notification.recipient_email || nextPayload.recipient_email || null,
    });
  }

  return notification;
};

export const markNotificationRead = async (id) => {
  return updateNotification(id, {
    status: "read",
    read_at: new Date().toISOString(),
  });
};

export const deleteNotificationRecord = async (id) => deleteNotification(id);

export const emitSystemNotification = async ({
  userId = null,
  applicationId = null,
  type,
  title,
  message,
  channel = "in_app",
  metadata = {},
}) => {
  return createNotificationRecord({
    user_id: userId,
    application_id: applicationId,
    type,
    title,
    message,
    channel,
    metadata,
  });
};
