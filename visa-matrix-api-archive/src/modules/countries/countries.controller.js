import countriesService from './countries.service.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createBadRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const getCountries = async (_req, res, next) => {
  try {
    const countries = await countriesService.getAllCountries();

    return res.status(200).json({
      success: true,
      data: countries
    });
  } catch (error) {
    return next(error);
  }
};

const getCountryQuestions = async (req, res, next) => {
  try {
    const { countryId } = req.params;

    if (!UUID_PATTERN.test(countryId)) {
      throw createBadRequestError('countryId must be a valid UUID.');
    }

    const result = await countriesService.getQuestionsByCountryId(countryId);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export default {
  getCountries,
  getCountryQuestions
};
