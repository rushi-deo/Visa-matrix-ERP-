import supabase from "../../config/supabase.js";
import { fromSupabaseError } from "../../core/errors.js";

export const fetchApplicationsForReport = async () => {
  const { data, error } = await supabase.from("applications").select("*");

  if (error) {
    throw fromSupabaseError(error, "Failed to load applications report.");
  }

  return data || [];
};

export const fetchPaymentsForReport = async () => {
  const { data, error } = await supabase.from("payments").select("*");

  if (error) {
    throw fromSupabaseError(error, "Failed to load payments report.");
  }

  return data || [];
};

export const fetchUsersForReport = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("role", ["agent", "case_manager"]);

  if (error) {
    throw fromSupabaseError(error, "Failed to load user report.");
  }

  return data || [];
};

export const fetchTasksForReport = async () => {
  const { data, error } = await supabase.from("tasks").select("*");

  if (error) {
    throw fromSupabaseError(error, "Failed to load tasks report.");
  }

  return data || [];
};
