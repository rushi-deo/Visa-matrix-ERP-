import {
  createRecord,
  deleteRecord,
  fetchRecordById,
  listRecords,
  updateRecord,
} from "./baseService.js";

export const listCustomers = async (queryParams) => {
  return listRecords("customers", queryParams, {
    select: "*",
    entityLabel: "Customers",
  });
};

export const getCustomerById = async (id) => {
  return fetchRecordById("customers", id, {
    select: "*",
    entityLabel: "Customer",
  });
};

export const createCustomer = async (payload) => {
  return createRecord("customers", payload, {
    select: "*",
    entityLabel: "Customer",
  });
};

export const updateCustomer = async (id, payload) => {
  return updateRecord("customers", id, payload, {
    select: "*",
    entityLabel: "Customer",
  });
};

export const deleteCustomer = async (id) => {
  const deletedCustomer = await deleteRecord("customers", id, {
    select: "id",
    entityLabel: "Customer",
  });

  return {
    id: deletedCustomer.id,
  };
};
