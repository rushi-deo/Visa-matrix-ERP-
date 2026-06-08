import { getVisaTypesByCountryId } from "../services/visaTypesService.js";

export const getVisaTypesHandler = async (req, res) => {
  try {
    const countryId = req.query.country_id;
    const visaTypes = await getVisaTypesByCountryId(countryId);

    return res.status(200).json({
      success: true,
      data: visaTypes,
      count: visaTypes.length,
    });
  } catch (error) {
    console.error("Error fetching visa types:", error);

    return res.status(error.status ?? 500).json({
      success: false,
      error: "Failed to fetch visa types",
      message: error.message,
    });
  }
};
