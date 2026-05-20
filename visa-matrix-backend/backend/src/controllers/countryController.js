import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createCountry,
  deleteCountry,
  getCountryById,
  listCountries,
  updateCountry,
} from "../services/countryService.js";
import {
  validatePayloadBody,
  validateResourceId,
} from "../validators/requestValidators.js";

export const getCountries = asyncHandler(async (req, res) => {
  const data = await listCountries(req.query);
  return sendSuccess(res, data);
});

export const createCountryHandler = asyncHandler(async (req, res) => {
  const payload = validatePayloadBody(req.body);
  const data = await createCountry(payload);
  return sendSuccess(res, data, 201);
});

export const getCountryByIdHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await getCountryById(id);
  return sendSuccess(res, data);
});

export const updateCountryHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const payload = validatePayloadBody(req.body);
  const data = await updateCountry(id, payload);
  return sendSuccess(res, data);
});

export const deleteCountryHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await deleteCountry(id);
  return sendSuccess(res, data);
});
