import supabase from "../config/supabase.js";
import { fromSupabaseError, RequestValidationError } from "../core/errors.js";

export const getRules = async (country_id, visa_type_id) => {
  if (!country_id || !visa_type_id) {
    throw new RequestValidationError(
      "country_id and visa_type_id are required."
    );
  }

  const { data, error } = await supabase
    .from("visa_rules")
    .select("*")
    .eq("country_id", country_id)
    .eq("visa_type_id", visa_type_id);

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch visa rules.");
  }

  return data ?? [];
};

export default {
  getRules,
};
