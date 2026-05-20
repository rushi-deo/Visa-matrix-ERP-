import { asyncHandler, RequestValidationError } from "../../core/errors.js";
import { sendSuccess } from "../../core/response.js";
import {
  getCountries,
  getVisaRequirements,
  getVisaTypesByCountry,
} from "./visaCatalog.service.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const requireUuid = (value, fieldName) => {
  const uuid = String(value ?? "").trim();

  if (!UUID_PATTERN.test(uuid)) {
    throw new RequestValidationError(`${fieldName} must be a valid UUID.`);
  }

  return uuid;
};

const optionalUuid = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return requireUuid(value, fieldName);
};

export const listCountriesController = asyncHandler(async (_req, res) => {
  const data = await getCountries();
  return sendSuccess(res, data);
});

export const listVisaTypesController = asyncHandler(async (req, res) => {
  const countryId = requireUuid(req.query.country_id, "country_id");
  const data = await getVisaTypesByCountry(countryId);
  return sendSuccess(res, data);
});

export const listVisaRequirementsController = asyncHandler(async (req, res) => {
  const countryId = optionalUuid(req.query.country_id, "country_id");
  const visaTypeId = optionalUuid(req.query.visa_type_id, "visa_type_id");

  if (!countryId && !visaTypeId) {
    throw new RequestValidationError(
      "country_id or visa_type_id is required."
    );
  }

  const data = await getVisaRequirements({ countryId, visaTypeId });
  return sendSuccess(res, data);
});
