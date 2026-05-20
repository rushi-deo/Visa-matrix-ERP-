import supabase from "../config/supabase.js";

export const getFormConfig = async (req, res) => {
  const { country_id, visa_type_id } = req.query;

  if (!country_id || !visa_type_id) {
    return res.status(400).json({
      success: false,
      message: "country_id and visa_type_id required",
    });
  }

  console.log("Fetching form config for:");
  console.log("country_id:", country_id);
  console.log("visa_type_id:", visa_type_id);

  const { data, error } = await supabase
    .from("form_configs")
    .select("form_schema")
    .eq("country_id", country_id)
    .eq("visa_type_id", visa_type_id)
    .maybeSingle();

  if (error) {
    console.error("Form config DB error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Form config not found",
    });
  }

  return res.status(200).json({
    success: true,
    form: data.form_schema,
  });
};
