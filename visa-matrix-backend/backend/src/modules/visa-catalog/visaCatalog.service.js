import {
  listCountries,
  listVisaRequirements,
  listVisaTypesByCountry,
} from "./visaCatalog.repository.js";

export const getCountries = () => listCountries();
export const getVisaTypesByCountry = (countryId) =>
  listVisaTypesByCountry(countryId);
export const getVisaRequirements = ({ countryId, visaTypeId }) =>
  listVisaRequirements({ countryId, visaTypeId });
