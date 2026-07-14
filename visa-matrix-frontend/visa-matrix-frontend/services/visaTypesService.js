import { isSupabaseConfigured, supabase } from "../config/supabaseClient.js";
import { countries as mockCountries } from "../src/data/countries.js";

const normalizeVisaType = (item = {}, fallbackName = "") => {
  const name = item.name ?? item.visa_type ?? item.type ?? fallbackName;

  return {
    id: item.id ?? item.visa_type_id ?? name,
    name,
    country_id: item.country_id ?? item.countryId ?? null,
    is_active: item.is_active ?? true,
  };
};

const getMockVisaTypes = (countryId) =>
  mockCountries
    .filter((country) => {
      const name = country.country ?? "";
      const code = name.slice(0, 2).toUpperCase();
      return countryId === name || countryId === code;
    })
    .map((country) => normalizeVisaType({}, country.visaType));

export const getVisaTypesByCountryId = async (countryId) => {
  if (!countryId) {
    const error = new Error("country_id is required");
    error.status = 400;
    throw error;
  }

  if (!isSupabaseConfigured || !supabase) {
    console.warn("[VisaTypesService] Supabase is not configured. Returning mock visa types.");
    return getMockVisaTypes(countryId);
  }

  console.info("[VisaTypesService] Fetching visa types from Supabase.", {
    countryId,
  });

  const { data, error } = await supabase
    .from("visa_types")
    .select("*")
    .eq("country_id", countryId)
    .order("name", { ascending: true });

  if (error) {
    console.error("[VisaTypesService] Supabase visa_types query failed:", error);

    const serviceError = new Error("Failed to fetch visa types from Supabase");
    serviceError.status = 500;
    throw serviceError;
  }

  return (data ?? [])
    .map((item) => normalizeVisaType(item))
    .filter((item) => item.id && item.name);
};
