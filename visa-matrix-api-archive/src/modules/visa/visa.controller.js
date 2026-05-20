import visaService from './visa.service.js';

const createBadRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const parsePositiveInteger = (value, fieldName) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw createBadRequestError(`${fieldName} must be a positive integer.`);
  }

  return parsedValue;
};

const parseUuid = (value, fieldName) => {
  const parsedValue = String(value ?? '').trim();
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(parsedValue)) {
    throw createBadRequestError(`${fieldName} must be a valid UUID.`);
  }

  return parsedValue;
};

const validateCountryPayload = (body) => {
  const name = body?.name?.trim();
  const code = body?.code?.trim()?.toUpperCase();

  if (!name) {
    throw createBadRequestError('name is required.');
  }

  if (!code) {
    throw createBadRequestError('code is required.');
  }

  return { name, code };
};

const validateVisaTypePayload = (body) => {
  const countryId = parsePositiveInteger(body?.country_id, 'country_id');
  const name = body?.name?.trim();
  const description = typeof body?.description === 'string' ? body.description.trim() : null;

  if (!name) {
    throw createBadRequestError('name is required.');
  }

  return {
    country_id: countryId,
    name,
    description: description || null
  };
};

const validateRequirementPayload = (body) => {
  const visaTypeId = parsePositiveInteger(body?.visa_type_id, 'visa_type_id');
  const title = body?.title?.trim();
  const description = typeof body?.description === 'string' ? body.description.trim() : null;
  const isMandatory = body?.is_mandatory;

  if (!title) {
    throw createBadRequestError('title is required.');
  }

  if (typeof isMandatory !== 'boolean') {
    throw createBadRequestError('is_mandatory must be a boolean.');
  }

  return {
    visa_type_id: visaTypeId,
    title,
    description: description || null,
    is_mandatory: isMandatory
  };
};

const getCountries = async (_req, res, next) => {
  try {
    const countries = await visaService.getCountries();

    return res.status(200).json({
      success: true,
      data: countries
    });
  } catch (error) {
    return next(error);
  }
};

const createCountry = async (req, res, next) => {
  try {
    const payload = validateCountryPayload(req.body);
    const country = await visaService.createCountry(payload);

    return res.status(201).json({
      success: true,
      data: country
    });
  } catch (error) {
    return next(error);
  }
};

const getVisaTypes = async (req, res, next) => {
  try {
    const countryId = parseUuid(req.query.country_id, 'country_id');

    console.log('📥 Incoming request country_id:', countryId);

    const visaTypes = await visaService.getVisaTypes(countryId);

    console.log('📤 Sending response:', visaTypes);

    return res.status(200).json(visaTypes);
  } catch (error) {
    console.error('❌ Backend error:', error);
    return next(error);
  }
};

const createVisaType = async (req, res, next) => {
  try {
    const payload = validateVisaTypePayload(req.body);
    const visaType = await visaService.createVisaType(payload);

    return res.status(201).json({
      success: true,
      data: visaType
    });
  } catch (error) {
    return next(error);
  }
};

const getRequirements = async (req, res, next) => {
  try {
    const visaTypeId =
      req.query.visa_type_id !== undefined
        ? parsePositiveInteger(req.query.visa_type_id, 'visa_type_id')
        : undefined;

    const requirements = await visaService.getRequirements(visaTypeId);

    return res.status(200).json({
      success: true,
      data: requirements
    });
  } catch (error) {
    return next(error);
  }
};

const createRequirement = async (req, res, next) => {
  try {
    const payload = validateRequirementPayload(req.body);
    const requirement = await visaService.createRequirement(payload);

    return res.status(201).json({
      success: true,
      data: requirement
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getCountries,
  createCountry,
  getVisaTypes,
  createVisaType,
  getRequirements,
  createRequirement
};
