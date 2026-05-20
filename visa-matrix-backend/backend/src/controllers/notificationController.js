import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createNotification,
  listNotifications,
} from "../services/notificationService.js";
import { validateNotificationPayload } from "../validators/moduleValidators.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const data = await listNotifications(req.query);
  return sendSuccess(res, data);
});

export const createNotificationHandler = asyncHandler(async (req, res) => {
  const payload = validateNotificationPayload(req.body);
  const data = await createNotification(payload);
  return sendSuccess(res, data, 201);
});
