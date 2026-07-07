import { RequestValidationError } from "../../core/errors.js";
import {
  createLead,
  deleteLead,
  getLeadById,
  listLeads,
  updateLead,
} from "./lead.repository.js";

const sanitizeLeadPayload = (payload = {}) => {
  const data = {
    ...payload,
    full_name: payload.full_name?.trim(),
    email: payload.email?.trim().toLowerCase(),
    phone: payload.phone?.trim(),
  };

  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );
};

export const getAllLeads = async (query) => listLeads(query);

export const getLead = async (id) => getLeadById(id);

export const createLeadRecord = async (payload) => {
  const lead = sanitizeLeadPayload(payload);

  if (!lead.full_name) {
    throw new RequestValidationError("Lead name is required.");
  }

  return createLead(lead);
};

export const updateLeadRecord = async (id, payload) => {
  return updateLead(id, sanitizeLeadPayload(payload));
};

export const deleteLeadRecord = async (id) => deleteLead(id);