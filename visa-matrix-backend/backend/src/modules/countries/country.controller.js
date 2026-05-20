import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createCountryRecord,
  deleteCountryRecord,
  getCountries,
  getCountry,
  updateCountryRecord,
} from "./country.service.js";

export const listCountriesController = asyncHandler(async (req, res) => {
  const data = await getCountries(req.query);
  return sendSuccess(res, data);
});

export const getCountryByIdController = asyncHandler(async (req, res) => {
  const data = await getCountry(req.params.id);
  return sendSuccess(res, data);
});

export const createCountryController = asyncHandler(async (req, res) => {
  const data = await createCountryRecord(req.body);
  return sendCreated(res, data, "Country created successfully.");
});

export const updateCountryController = asyncHandler(async (req, res) => {
  const data = await updateCountryRecord(req.params.id, req.body);
  return sendSuccess(res, data, {
    message: "Country updated successfully.",
  });
});

export const deleteCountryController = asyncHandler(async (req, res) => {
  const data = await deleteCountryRecord(req.params.id);
  return sendSuccess(res, data, {
    message: "Country deleted successfully.",
  });
});
