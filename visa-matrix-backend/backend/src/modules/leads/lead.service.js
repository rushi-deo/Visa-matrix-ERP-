import {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} from "./lead.repository.js";

export const getAllLeads = async (query) =>
  listLeads(query);

export const getLead = async (id) =>
  getLeadById(id);

export const createLeadRecord = async (payload) =>
  createLead(payload);

export const updateLeadRecord = async (id, payload) =>
  updateLead(id, payload);

export const deleteLeadRecord = async (id) =>
  deleteLead(id);