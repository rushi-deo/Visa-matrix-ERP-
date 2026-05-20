import { createCrudRepository } from "../../core/baseRepository.js";

const visaRuleCrudRepository = createCrudRepository({
  tableName: "visa_requirements",
});

export const listVisaRules = (query = {}) => {
  return visaRuleCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      country_id: query.countryId,
      visa_type_id: query.visaTypeId,
    },
    searchTerm: query.search,
    searchColumns: ["title", "description"],
  });
};

export const getVisaRuleById = (id) => visaRuleCrudRepository.findById(id);
export const createVisaRule = (payload) => visaRuleCrudRepository.create(payload);
export const updateVisaRule = (id, payload) =>
  visaRuleCrudRepository.update(id, payload);
export const deleteVisaRule = (id) => visaRuleCrudRepository.remove(id);
