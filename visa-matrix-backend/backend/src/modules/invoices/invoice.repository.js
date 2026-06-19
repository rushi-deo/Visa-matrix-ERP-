import { createCrudRepository } from "../../core/baseRepository.js";

const invoiceCrudRepository = createCrudRepository({
  tableName: "invoices",
});

export const listInvoices = (query = {}) => {
  return invoiceCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    searchColumns: [
      "invoice_number",
      "invoice_code",
      "status",
    ],
  });
};

export const getInvoiceById = (id) =>
  invoiceCrudRepository.findById(id);

export const createInvoice = (payload) =>
  invoiceCrudRepository.create(payload);

export const updateInvoice = (id, payload) =>
  invoiceCrudRepository.update(id, payload);

export const deleteInvoice = (id) =>
  invoiceCrudRepository.remove(id);