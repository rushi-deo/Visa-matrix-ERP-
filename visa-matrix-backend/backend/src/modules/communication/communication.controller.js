import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createMessageRecord,
  getMessage,
  getMessages,
  updateMessageRecord,
} from "./communication.service.js";

export const listMessagesController = asyncHandler(async (req, res) => {
  const data = await getMessages(req.query);
  return sendSuccess(res, data);
});

export const getMessageByIdController = asyncHandler(async (req, res) => {
  const data = await getMessage(req.params.id);
  return sendSuccess(res, data);
});

export const createMessageController = asyncHandler(async (req, res) => {
  const data = await createMessageRecord(req.body);
  return sendCreated(res, data, "Message created successfully.");
});

export const updateMessageController = asyncHandler(async (req, res) => {
  const data = await updateMessageRecord(req.params.id, req.body);
  return sendSuccess(res, data, {
    message: "Message updated successfully.",
  });
});
