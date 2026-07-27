import { getFormByCountryAndVisaType } from "../modules/forms/forms.repository.js";

export const getFormConfig = async (req, res) => {
  const { country_id, visa_type_id } = req.query;

  if (!country_id || !visa_type_id) {
    return res.status(400).json({
      success: false,
      message: "country_id and visa_type_id required",
    });
  }

  const form = await getFormByCountryAndVisaType(country_id, visa_type_id);
  if (!form) {
    return res.status(404).json({
      success: false,
      message: "Form config not found",
    });
  }

  return res.status(200).json({
    success: true,
    form: form.form_schema,
  });
};
