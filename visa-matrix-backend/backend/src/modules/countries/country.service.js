import {
  createCountry,
  deleteCountry,
  getCountryById,
  listActiveCountries,
  listCountries,
  updateCountry,
} from "./country.repository.js";

export const getCountries = async (query) => {
  const hasQueryParams = query && Object.keys(query).length > 0;
  if (hasQueryParams) {
    return listCountries(query);
  }

  return listActiveCountries();
};
export const getCountry = async (id) => getCountryById(id);
export const createCountryRecord = async (payload) => createCountry(payload);
export const updateCountryRecord = async (id, payload) =>
  updateCountry(id, payload);
export const deleteCountryRecord = async (id) => deleteCountry(id);
