import {
  createVisaRule,
  deleteVisaRule,
  getVisaRuleById,
  listVisaRules,
  updateVisaRule,
} from "./visaRule.repository.js";

export const getVisaRules = async (query) => listVisaRules(query);
export const getVisaRule = async (id) => getVisaRuleById(id);
export const createVisaRuleRecord = async (payload) => createVisaRule(payload);
export const updateVisaRuleRecord = async (id, payload) =>
  updateVisaRule(id, payload);
export const deleteVisaRuleRecord = async (id) => deleteVisaRule(id);
