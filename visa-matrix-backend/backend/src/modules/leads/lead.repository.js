import { createCrudRepository } from "../../core/baseRepository.js";

const leadCrudRepository = createCrudRepository({
  tableName: "new_applications",
});

export const listLeads = (query = {}) => {
  return leadCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    searchColumns: [
      "customer_name",
      "email",
      "phone",
      "passport_number",
      "destination_country",
    ],
  });
};

export const getLeadById = (id) =>
  leadCrudRepository.findById(id);

export const createLead = (payload) =>
  leadCrudRepository.create(payload);

export const updateLead = (id, payload) =>
  leadCrudRepository.update(id, payload);

export const deleteLead = (id) =>
  leadCrudRepository.remove(id);