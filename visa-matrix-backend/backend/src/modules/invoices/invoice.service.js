import {
  listInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "./invoice.repository.js";

export const getInvoices = async (query) =>
  listInvoices(query);

export const getInvoice = async (id) =>
  getInvoiceById(id);

export const createInvoiceRecord = async (payload) =>
  createInvoice(payload);

export const updateInvoiceRecord = async (
  id,
  payload
) => updateInvoice(id, payload);

export const deleteInvoiceRecord = async (id) =>
  deleteInvoice(id);