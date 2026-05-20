import {
  createMessage,
  getMessageById,
  listMessages,
  updateMessage,
} from "./communication.repository.js";

export const getMessages = async (query) => listMessages(query);
export const getMessage = async (id) => getMessageById(id);
export const createMessageRecord = async (payload) => {
  return createMessage({
    status: payload.status || "queued",
    ...payload,
  });
};
export const updateMessageRecord = async (id, payload) =>
  updateMessage(id, payload);
