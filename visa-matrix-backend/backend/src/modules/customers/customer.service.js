import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "./customer.repository.js";

export const getCustomers = async (query) => listCustomers(query);
export const getCustomer = async (id) => getCustomerById(id);
export const createCustomerRecord = async (payload) => createCustomer(payload);
export const updateCustomerRecord = async (id, payload) =>
  updateCustomer(id, payload);
export const deleteCustomerRecord = async (id) => deleteCustomer(id);
