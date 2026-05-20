import { createCrudRepository } from "../../core/baseRepository.js";

const communicationCrudRepository = createCrudRepository({
  tableName: "messages",
});

export const listMessages = (query = {}) => {
  return communicationCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      application_id: query.applicationId,
      customer_id: query.customerId,
      channel: query.channel,
      status: query.status,
    },
    searchTerm: query.search,
    searchColumns: ["subject", "content", "body"],
  });
};

export const getMessageById = (id) => communicationCrudRepository.findById(id);
export const createMessage = (payload) => communicationCrudRepository.create(payload);
export const updateMessage = (id, payload) =>
  communicationCrudRepository.update(id, payload);
