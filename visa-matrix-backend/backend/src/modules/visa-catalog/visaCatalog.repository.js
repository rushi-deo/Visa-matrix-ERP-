import supabase from "../../config/supabase.js";
import { fromSupabaseError } from "../../core/errors.js";

export const listCountries = async () => {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch countries.");
  }

  return data ?? [];
};

export const listVisaTypesByCountry = async (countryId) => {
  const { data, error } = await supabase
    .from("visa_types")
    .select("*")
    .eq("country_id", String(countryId))
    .order("name", { ascending: true });

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch visa types.");
  }

  return data ?? [];
};

export const listVisaRequirements = async ({ countryId, visaTypeId }) => {
  let query = supabase
    .from("visa_requirements")
    .select("*")
    .order("created_at", { ascending: true });

  if (countryId) {
    query = query.eq("country_id", String(countryId));
  }

  if (visaTypeId) {
    query = query.eq("visa_type_id", String(visaTypeId));
  }

  const { data, error } = await query;

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch visa requirements.");
  }

  return data ?? [];
};
