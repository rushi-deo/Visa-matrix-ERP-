import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createNotificationRecord,
  deleteNotificationRecord,
  getNotification,
  getNotifications,
  markNotificationRead,
} from "./notification.service.js";

export const listNotificationsController = asyncHandler(async (req, res) => {
  const data = await getNotifications(req.query);
  return sendSuccess(res, data);
});

export const getNotificationByIdController = asyncHandler(async (req, res) => {
  const data = await getNotification(req.params.id);
  return sendSuccess(res, data);
});

export const createNotificationController = asyncHandler(async (req, res) => {
  const data = await createNotificationRecord(req.body);
  return sendCreated(res, data, "Notification created successfully.");
});

export const markNotificationReadController = asyncHandler(async (req, res) => {
  const data = await markNotificationRead(req.params.id);
  return sendSuccess(res, data, {
    message: "Notification marked as read.",
  });
});

export const deleteNotificationController = asyncHandler(async (req, res) => {
  const data = await deleteNotificationRecord(req.params.id);
  return sendSuccess(res, data, {
    message: "Notification deleted successfully.",
  });
});
