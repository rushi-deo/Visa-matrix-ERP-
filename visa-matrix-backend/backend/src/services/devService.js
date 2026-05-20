import supabase from "../config/supabaseClient.js";
import { mapDatabaseError } from "./baseService.js";

export const testDatabaseConnection = async () => {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .limit(5);

  if (error) {
    throw mapDatabaseError(error, "Failed to query countries for dev test");
  }

  return data || [];
};
