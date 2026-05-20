import supabase from "../config/supabase.js";
import logger from "../core/logger.js";
import {
  AppError,
  NotFoundError,
  RequestValidationError,
  fromSupabaseError,
} from "../core/errors.js";

const normalizeTextValue = (value) => String(value ?? "").trim();
const normalizeLookupValue = (value) => normalizeTextValue(value).toLowerCase();

const toNumberValue = (value) => {
  const numericValue = Number(String(value || "0").replace(/,/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const fetchApplicationRecord = async (applicationId) => {
  const { data, error } = await supabase
    .from("applications")
    .select("*, countries(name), visa_types(name)")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch application for quotation.");
  }

  if (!data) {
    throw new NotFoundError("Application not found.");
  }

  return data;
};

const resolveApplicationPricingFields = (application) => {
  const countryName =
    application?.country_name ??
    application?.destination_country ??
    application?.countries?.name ??
    "";
  const visaType = application?.visa_type ?? "";
  const resolvedVisaType = visaType || application?.visa_types?.name || "";

  if (!normalizeTextValue(countryName)) {
    throw new RequestValidationError(
      "Application country_name is missing. Unable to generate quotation."
    );
  }

  if (!normalizeTextValue(resolvedVisaType)) {
    throw new RequestValidationError(
      "Application visa_type is missing. Unable to generate quotation."
    );
  }

  return {
    countryName: normalizeTextValue(countryName),
    visaType: normalizeTextValue(resolvedVisaType),
  };
};

const fetchVisaFeeRows = async () => {
  const { data, error } = await supabase.from("visa_fees_import").select("*");

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch visa fee import data.");
  }

  return Array.isArray(data) ? data : [];
};

const findMatchingVisaFee = (rows, cleanedCountryName, cleanedVisaType) => {
  const matchedRow =
    rows.find((row) => {
      const rowCountryName = normalizeLookupValue(row?.country_name);
      const rowVisaType = normalizeLookupValue(row?.visa_type);

      return rowCountryName === cleanedCountryName && rowVisaType === cleanedVisaType;
    }) ?? null;

  if (!matchedRow) {
    console.log("NO MATCH FOUND", {
      country_name: cleanedCountryName,
      visa_type: cleanedVisaType,
    });
    logger.warn("NO MATCH FOUND", {
      country_name: cleanedCountryName,
      visa_type: cleanedVisaType,
    });
    throw new NotFoundError("Visa fee not found");
  }

  console.log("MATCH FOUND:", {
    id: matchedRow.id ?? null,
    country_name: matchedRow.country_name ?? null,
    visa_type: matchedRow.visa_type ?? null,
  });
  logger.info("MATCH FOUND", {
    id: matchedRow.id ?? null,
    country_name: matchedRow.country_name ?? null,
    visa_type: matchedRow.visa_type ?? null,
  });

  return matchedRow;
};

const insertQuotationRecord = async (payload) => {
  const { data, error } = await supabase
    .from("quotations")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw fromSupabaseError(error, "Failed to create quotation.");
  }

  return data;
};

export const generateQuotation = async (applicationId) => {
  if (!normalizeTextValue(applicationId)) {
    throw new RequestValidationError("applicationId is required.");
  }

  const application = await fetchApplicationRecord(applicationId);
  const { countryName, visaType } = resolveApplicationPricingFields(application);
  const cleanedCountryName = normalizeLookupValue(countryName);
  const cleanedVisaType = normalizeLookupValue(visaType);

  console.log("CLEAN INPUT:", {
    country_name: cleanedCountryName,
    visa_type: cleanedVisaType,
  });
  logger.info("CLEAN INPUT", {
    country_name: cleanedCountryName,
    visa_type: cleanedVisaType,
    application_id: applicationId,
  });

  const visaFeeRows = await fetchVisaFeeRows();
  const matchedRow = findMatchingVisaFee(
    visaFeeRows,
    cleanedCountryName,
    cleanedVisaType
  );

  const govtFee = toNumberValue(matchedRow.govt_fee);
  const serviceFee = toNumberValue(matchedRow.service_fee);
  const consultationFee = toNumberValue(matchedRow.consultation_fee);
  const totalAmount = govtFee + serviceFee + consultationFee;

  logger.info("Quotation calculation completed", {
    application_id: applicationId,
    govt_fee: govtFee,
    service_fee: serviceFee,
    consultation_fee: consultationFee,
    total_amount: totalAmount,
  });

  try {
    return await insertQuotationRecord({
      application_id: application.id,
      country_name: countryName,
      visa_type: visaType,
      govt_fee: govtFee,
      service_fee: serviceFee,
      consultation_fee: consultationFee,
      total_amount: totalAmount,
      status: "generated",
    });
  } catch (error) {
    logger.error("Failed to insert quotation", {
      application_id: applicationId,
      error: error.message,
      details: error.details ?? null,
    });
    throw error instanceof AppError
      ? error
      : new AppError("Failed to create quotation.", 500);
  }
};

export default {
  generateQuotation,
};
