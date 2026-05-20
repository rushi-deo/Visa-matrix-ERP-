import { createCrudRepository } from "../../core/baseRepository.js";

const countryCrudRepository = createCrudRepository({
  tableName: "countries",
});

export const listCountries = (query = {}) => {
  return countryCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    searchColumns: ["country_name", "country_code", "region"],
  });
};

export const getCountryById = (id) => countryCrudRepository.findById(id);
export const createCountry = (payload) => countryCrudRepository.create(payload);
export const updateCountry = (id, payload) =>
  countryCrudRepository.update(id, payload);
export const deleteCountry = (id) => countryCrudRepository.remove(id);
