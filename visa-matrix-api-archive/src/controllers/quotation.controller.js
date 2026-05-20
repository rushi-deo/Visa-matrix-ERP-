import quotationService from '../services/quotation.service.js';

const createBadRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const parseApplicationId = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw createBadRequestError('applicationId must be a positive integer.');
  }

  return parsedValue;
};

const createQuotation = async (req, res, next) => {
  try {
    const applicationId = parseApplicationId(
      req.body?.applicationId ?? req.body?.application_id
    );
    const quotation = await quotationService.createQuotationFromApplication(applicationId);

    return res.status(201).json({
      success: true,
      message: 'Quotation generated successfully.',
      data: quotation
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  createQuotation
};
