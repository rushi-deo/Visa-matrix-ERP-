import { createCrudRepository } from "../../core/baseRepository.js";

const customerCrudRepository = createCrudRepository({
  tableName: "customers",
  defaultOrder: "created_at",
  allowedFilters: ["status", "assigned_to", "country_id"],
  allowedOrderColumns: [
    "created_at",
    "updated_at",
    "full_name",
    "email",
  ],
});

export const listCustomers = (query = {}) => {
  return customerCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    searchColumns: ["full_name", "email", "phone", "passport_number"],
  });
};

export const getCustomerById = (id) => customerCrudRepository.findById(id);
export const createCustomer = (payload) => customerCrudRepository.create(payload);
export const updateCustomer = (id, payload) =>
  customerCrudRepository.update(id, payload);
export const deleteCustomer = (id) => customerCrudRepository.remove(id);
