import { hasValidSupabaseConfig, supabase } from '../config/supabaseClient.js';

const createServiceError = (message, statusCode = 500, details = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

const ensureSupabaseConfigured = () => {
  if (!hasValidSupabaseConfig || !supabase) {
    throw createServiceError(
      'Supabase is not configured. Update SUPABASE_URL and SUPABASE_ANON_KEY in .env.',
      500
    );
  }
};

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue || null;
};

const normalizeForMatch = (value) => String(value ?? '').trim().toLowerCase();

const normalizeIdentifier = (value) => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue || null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const normalizeAmount = (value, fieldName) => {
  const parsedValue = Number(String(value || '0').replace(/,/g, '').trim());

  if (Number.isFinite(parsedValue)) {
    return parsedValue;
  }

  console.warn(`[quotation.service] Unable to normalize ${fieldName}. Falling back to 0.`, {
    fieldName,
    value
  });

  return 0;
};

const extractApplicationDetails = (application) => {
  const countryId = normalizeIdentifier(application?.country_id);
  const visaTypeId = normalizeIdentifier(application?.visa_type_id);
  const countryName = normalizeText(application?.country_name);
  const visaType = normalizeText(application?.visa_type);

  if (!countryId && !countryName) {
    throw createServiceError(
      'Application country details are missing. Unable to generate quotation.',
      400,
      { applicationId: application?.id }
    );
  }

  if (!visaTypeId && !visaType) {
    throw createServiceError(
      'Application visa type details are missing. Unable to generate quotation.',
      400,
      { applicationId: application?.id }
    );
  }

  return { countryId, visaTypeId, countryName, visaType };
};

const fetchApplicationById = async (applicationId) => {
  console.log('[quotation.service] Fetching application', { applicationId });

  const { data, error } = await supabase
    .from('applications')
    .select('id, country_id, visa_type_id, country_name, visa_type')
    .eq('id', applicationId)
    .maybeSingle();

  if (error) {
    throw createServiceError('Failed to fetch application.', 500, {
      applicationId,
      supabaseError: error
    });
  }

  if (!data) {
    throw createServiceError(`Application ${applicationId} not found.`, 404, {
      applicationId
    });
  }

  console.log('[quotation.service] Application data', data);

  return data;
};

const fetchFeeRowByIds = async ({ countryId, visaTypeId }) => {
  console.log('[quotation.service] Using ID match', {
    countryId,
    visaTypeId
  });

  const { data, error } = await supabase
    .from('visa_fees_import')
    .select('*')
    .eq('country_id', countryId)
    .eq('visa_type_id', visaTypeId)
    .limit(1);

  if (error) {
    throw createServiceError('Failed to fetch visa fee data by IDs.', 500, {
      countryId,
      visaTypeId,
      supabaseError: error
    });
  }

  const feeRow = Array.isArray(data) ? data[0] ?? null : null;

  if (!feeRow) {
    return null;
  }

  console.log('[quotation.service] Fee row fetched successfully by IDs', {
    countryId,
    visaTypeId,
    govt_fee: feeRow.govt_fee,
    service_fee: feeRow.service_fee,
    consultation_fee: feeRow.consultation_fee
  });

  return feeRow;
};

const fetchFeeRowByFallback = async ({ countryName, visaType }) => {
  console.log('[quotation.service] Using fallback match', {
    countryName,
    visaType
  });

  const normalizedCountryName = normalizeForMatch(countryName);
  const normalizedVisaType = normalizeForMatch(visaType);

  if (!normalizedCountryName || !normalizedVisaType) {
    return null;
  }

  const { data, error } = await supabase
    .from('visa_fees_import')
    .select('*');

  if (error) {
    throw createServiceError('Failed to fetch visa fee data.', 500, {
      countryName,
      visaType,
      supabaseError: error
    });
  }

  const feeRows = Array.isArray(data) ? data : [];
  const feeRow =
    feeRows.find(
      (row) =>
        normalizeForMatch(row?.country_name) === normalizedCountryName &&
        normalizeForMatch(row?.visa_type) === normalizedVisaType
    ) ?? null;

  if (!feeRow) {
    return null;
  }

  console.log('[quotation.service] Fee row fetched successfully by fallback', {
    countryName,
    visaType,
    govt_fee: feeRow.govt_fee,
    service_fee: feeRow.service_fee,
    consultation_fee: feeRow.consultation_fee
  });

  return feeRow;
};

const fetchFeeRow = async ({ countryId, visaTypeId, countryName, visaType }) => {
  let feeRow = null;

  if (countryId && visaTypeId) {
    feeRow = await fetchFeeRowByIds({ countryId, visaTypeId });

    if (!feeRow) {
      console.warn('[quotation.service] No fee row found by IDs. Falling back to text match.', {
        countryId,
        visaTypeId,
        countryName,
        visaType
      });
    }
  } else {
    console.log('[quotation.service] Using fallback match', {
      countryId,
      visaTypeId,
      countryName,
      visaType
    });
  }

  if (!feeRow && countryName && visaType) {
    feeRow = await fetchFeeRowByFallback({ countryName, visaType });
  }

  if (!feeRow) {
    throw createServiceError('Visa fee not found', 404, {
      countryId,
      visaTypeId,
      countryName,
      visaType
    });
  }

  console.log('[quotation.service] Matched fee row', feeRow);

  return feeRow;
};

const isMissingQuotationIdColumnError = (error) => {
  const text = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ');
  return /country_id|visa_type_id/i.test(text);
};

const executeQuotationInsert = async (payload) => {
  return supabase.from('quotations').insert([payload]).select().single();
};

const insertQuotation = async (payload) => {
  let { data, error } = await executeQuotationInsert(payload);

  if (error && isMissingQuotationIdColumnError(error)) {
    console.warn(
      '[quotation.service] quotations table is missing country_id or visa_type_id. Falling back to legacy insert payload.',
      { supabaseError: error }
    );

    const legacyPayload = {
      application_id: payload.application_id,
      country_name: payload.country_name,
      visa_type: payload.visa_type,
      govt_fee: payload.govt_fee,
      service_fee: payload.service_fee,
      consultation_fee: payload.consultation_fee,
      total_amount: payload.total_amount,
      status: payload.status
    };

    ({ data, error } = await executeQuotationInsert(legacyPayload));
  }

  if (error) {
    throw createServiceError('Failed to insert quotation.', 500, {
      payload,
      supabaseError: error
    });
  }

  return data;
};

const createQuotationFromApplication = async (applicationId) => {
  ensureSupabaseConfigured();

  try {
    const application = await fetchApplicationById(applicationId);
    const { countryId, visaTypeId, countryName, visaType } =
      extractApplicationDetails(application);
    const feeRow = await fetchFeeRow({ countryId, visaTypeId, countryName, visaType });

    const govtFee = normalizeAmount(feeRow.govt_fee, 'govt_fee');
    const serviceFee = normalizeAmount(feeRow.service_fee, 'service_fee');
    const consultationFee = normalizeAmount(feeRow.consultation_fee, 'consultation_fee');
    const totalAmount = govtFee + serviceFee + consultationFee;
    const resolvedCountryName = countryName ?? normalizeText(feeRow.country_name);
    const resolvedVisaType = visaType ?? normalizeText(feeRow.visa_type);

    console.log('[quotation.service] Calculation result', {
      applicationId,
      countryId,
      visaTypeId,
      govtFee,
      serviceFee,
      consultationFee,
      totalAmount
    });

    const quotationPayload = {
      application_id: application.id,
      country_id: countryId,
      visa_type_id: visaTypeId,
      country_name: resolvedCountryName,
      visa_type: resolvedVisaType,
      govt_fee: govtFee,
      service_fee: serviceFee,
      consultation_fee: consultationFee,
      total_amount: totalAmount,
      status: 'generated'
    };

    const quotation = await insertQuotation(quotationPayload);

    console.log('[quotation.service] Quotation generated successfully', {
      quotationId: quotation?.id,
      applicationId
    });

    return quotation;
  } catch (error) {
    console.error('[quotation.service] Failed to create quotation', {
      applicationId,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    });

    throw error.statusCode
      ? error
      : createServiceError('Unexpected error while generating quotation.', 500, {
          applicationId,
          originalError: error
        });
  }
};

export default {
  createQuotationFromApplication
};
