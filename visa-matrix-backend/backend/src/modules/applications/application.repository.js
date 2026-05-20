import { createCrudRepository } from "../../core/baseRepository.js";

const applicationCrudRepository = createCrudRepository({
  tableName: "applications",
});

export const listApplications = (query = {}) => {
  return applicationCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      customer_id: query.customerId,
      country_id: query.countryId,
      status: query.status,
      application_status: query.applicationStatus,
      assigned_to: query.assignedTo,
    },
    searchTerm: query.search,
    searchColumns: ["reference_no", "status", "application_status", "notes"],
  });
};

export const getApplicationById = (id) => applicationCrudRepository.findById(id);
export const createApplication = (payload) =>
  applicationCrudRepository.create(payload);
export const updateApplication = (id, payload) =>
  applicationCrudRepository.update(id, payload);
export const deleteApplication = (id) => applicationCrudRepository.remove(id);
export const deleteApplicationById = (id) => applicationCrudRepository.remove(id);
