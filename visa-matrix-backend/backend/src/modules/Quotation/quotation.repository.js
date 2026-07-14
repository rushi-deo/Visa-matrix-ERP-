import { createCrudRepository } from "../../core/baseRepository.js";

const quotationCrudRepository = createCrudRepository({
  tableName: "quotations",
});

export const listQuotations = (query = {}) => {
  return quotationCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    searchColumns: [
      "country_name",
      "visa_type",
      "status",
    ],
  });
};

export const getQuotationById = (id) =>
  quotationCrudRepository.findById(id);

export const createQuotation = (payload) =>
  quotationCrudRepository.create(payload);

export const updateQuotation = (id, payload) =>
  quotationCrudRepository.update(id, payload);

export const deleteQuotation = (id) =>
  quotationCrudRepository.remove(id);