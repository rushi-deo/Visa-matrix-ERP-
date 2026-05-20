import {
  createCountry,
  deleteCountry,
  getCountryById,
  listCountries,
  updateCountry,
} from "./country.repository.js";

export const getCountries = async (query) => listCountries(query);
export const getCountry = async (id) => getCountryById(id);
export const createCountryRecord = async (payload) => createCountry(payload);
export const updateCountryRecord = async (id, payload) =>
  updateCountry(id, payload);
export const deleteCountryRecord = async (id) => deleteCountry(id);
