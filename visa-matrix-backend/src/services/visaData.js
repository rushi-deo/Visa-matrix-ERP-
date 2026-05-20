const API_BASE_URL = "http://localhost:5000/api";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeUuid = (value, fieldName) => {
  const uuid = String(value ?? "").trim();

  if (!UUID_PATTERN.test(uuid)) {
    throw new Error(`${fieldName} must be a valid UUID string`);
  }

  return uuid;
};

const normalizeVisaType = (visaType) => ({
  ...visaType,
  visa_type:
    visaType.visa_type ||
    visaType.visa_name ||
    visaType.name ||
    visaType.title ||
    "Visa Type",
  fee_amount: visaType.fee_amount ?? visaType.fee ?? visaType.visa_fee ?? 0,
  processing_days:
    visaType.processing_days ?? visaType.processing_time ?? visaType.duration ?? "N/A",
});

export const fetchVisaTypesByCountry = async (countryId) => {
  const countryUuid = normalizeUuid(countryId, "country_id");

  console.log("API CALL STARTED", countryUuid);

  try {
    const response = await fetch(
      `${API_BASE_URL}/visa-types?country_id=${encodeURIComponent(countryUuid)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch visa types");
    }

    console.log("API RESPONSE", data);

    const visaTypes = Array.isArray(data) ? data : data?.data ?? [];
    return visaTypes.map(normalizeVisaType);
  } catch (error) {
    console.error("API ERROR", error);
    throw error;
  }
};

export const fetchVisaTypeById = async ({ countryId, visaTypeId }) => {
  const countryUuid = normalizeUuid(countryId, "country_id");
  const visaTypeUuid = normalizeUuid(visaTypeId, "visa_type_id");
  const visaTypes = await fetchVisaTypesByCountry(countryUuid);

  return visaTypes.find((visaType) => visaType.id === visaTypeUuid) ?? null;
};

export const fetchRequirementsByVisaTypeId = async (visaTypeId) => {
  const visaTypeUuid = normalizeUuid(visaTypeId, "visa_type_id");

  console.log("[visa_requirements] API call started:", visaTypeUuid);

  try {
    const response = await fetch(
      `${API_BASE_URL}/visa-requirements?visa_type_id=${encodeURIComponent(visaTypeUuid)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch visa requirements");
    }

    console.log("[visa_requirements] API response:", data);

    return Array.isArray(data) ? data : data?.data ?? [];
  } catch (error) {
    console.error("[visa_requirements] API error:", error);
    throw error;
  }
};

export const fetchVisaTypeAndRequirements = async ({ countryId, visaTypeId }) => {
  const [visaType, requirements] = await Promise.all([
    fetchVisaTypeById({ countryId, visaTypeId }),
    fetchRequirementsByVisaTypeId(visaTypeId),
  ]);

  return {
    visaType,
    requirements,
  };
};
