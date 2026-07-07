import { RequestValidationError } from "../../core/errors.js";
import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createCustomerRecord,
  deleteCustomerRecord,
  getCustomer,
  getCustomers,
  updateCustomerRecord,
} from "./customer.service.js";

export const listCustomersController = asyncHandler(async (req, res) => {
  const data = await getCustomers(req.query);
  return sendSuccess(res, data);
});

export const getCustomerByIdController = asyncHandler(async (req, res) => {
  const data = await getCustomer(req.params.id);
  return sendSuccess(res, data);
});

export const createCustomerController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
  throw new RequestValidationError("Request body cannot be empty.");
}

const data = await createCustomerRecord(req.body);
  return sendCreated(res, data, "Customer created successfully.");
});

export const updateCustomerController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
  throw new RequestValidationError("Request body cannot be empty.");
}

const data = await updateCustomerRecord(req.params.id, req.body);
  return sendSuccess(res, data, {
    message: "Customer updated successfully.",
  });
});

export const deleteCustomerController = asyncHandler(async (req, res) => {
  const data = await deleteCustomerRecord(req.params.id);
  return sendSuccess(res, data, {
    message: "Customer deleted successfully.",
  });
});
