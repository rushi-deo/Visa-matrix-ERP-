import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "./customer.repository.js";
import { RequestValidationError } from "../../core/errors.js";
const sanitizeCustomerPayload = (payload = {}) => {
  const data = {
    ...payload,
    full_name: payload.full_name?.trim(),
    email: payload.email?.trim().toLowerCase(),
    phone: payload.phone?.trim(),
    passport_number: payload.passport_number?.trim().toUpperCase(),
  };

  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
};
export const getCustomers = async (query) => listCustomers(query);
export const getCustomer = async (id) => getCustomerById(id);
export const createCustomerRecord = async (payload) => {

  const customer = sanitizeCustomerPayload(payload);

  if (!customer.full_name) {
    throw new RequestValidationError("Customer name is required.");
  }

  return createCustomer(customer);
};
export const updateCustomerRecord = async (id, payload) => {
  return updateCustomer(id, sanitizeCustomerPayload(payload));
};
export const deleteCustomerRecord = async (id) => deleteCustomer(id);
