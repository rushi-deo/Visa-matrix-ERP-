import { createCrudRepository } from "../../core/baseRepository.js";

const notificationCrudRepository = createCrudRepository({
  tableName: "notifications",
});

export const listNotifications = (query = {}) => {
  return notificationCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      user_id: query.userId,
      application_id: query.applicationId,
      status: query.status,
      channel: query.channel,
      type: query.type,
    },
    searchTerm: query.search,
    searchColumns: ["title", "message", "type"],
  });
};

export const getNotificationById = (id) => notificationCrudRepository.findById(id);
export const createNotification = (payload) =>
  notificationCrudRepository.create(payload);
export const updateNotification = (id, payload) =>
  notificationCrudRepository.update(id, payload);
export const deleteNotification = (id) => notificationCrudRepository.remove(id);
