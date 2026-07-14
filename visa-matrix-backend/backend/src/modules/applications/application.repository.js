import { createCrudRepository } from "../../core/baseRepository.js";

const applicationCrudRepository = createCrudRepository({
  tableName: "applications",
  defaultOrder: "created_at",
  allowedFilters: ["customer_id", "country_id", "status", "application_status"],
  allowedOrderColumns: [
    "created_at",
    "updated_at",
    "customer_id",
    "country_id",
    "status",
    "application_status",
    "reference_no",
    "submission_date",
    "embassy_date",
    "decision_date",
  ],
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
