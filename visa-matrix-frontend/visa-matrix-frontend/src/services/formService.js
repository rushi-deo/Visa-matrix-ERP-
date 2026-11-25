import { supabase } from "../supabase";

export async function getFormSchema(country, visaType) {
  if (!supabase) {
    console.error("Supabase client is not configured.");
    return null;
  }

  const { data, error } = await supabase
    .from("form_configs")
    .select("form_schema")
    .eq("country_id", country)
    .eq("visa_type_id", visaType)
    .eq("status", "published")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching form schema:", error);
    return null;
  }

  return data?.form_schema ?? null;
}
