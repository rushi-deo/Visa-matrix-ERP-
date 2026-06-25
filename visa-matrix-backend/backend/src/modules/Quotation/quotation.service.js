import {
  listQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "./quotation.repository.js";

export const getQuotations = async (query) =>
  listQuotations(query);

export const getQuotation = async (id) =>
  getQuotationById(id);

export const createQuotationRecord = async (payload) =>
  createQuotation(payload);

export const updateQuotationRecord = async (
  id,
  payload
) =>
  updateQuotation(id, payload);

export const deleteQuotationRecord = async (id) =>
  deleteQuotation(id);