import { createCrudRepository } from "../../core/baseRepository.js";

const documentCrudRepository = createCrudRepository({
  tableName: "documents",
});

export const listDocuments = (query = {}) => {
  return documentCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      application_id: query.applicationId,
      customer_id: query.customerId,
      status: query.status,
    },
    searchTerm: query.search,
    searchColumns: ["file_name", "document_type", "status"],
  });
};

export const getDocumentById = (id) => documentCrudRepository.findById(id);
export const createDocument = (payload) => documentCrudRepository.create(payload);
export const updateDocument = (id, payload) =>
  documentCrudRepository.update(id, payload);
export const deleteDocument = (id) => documentCrudRepository.remove(id);
