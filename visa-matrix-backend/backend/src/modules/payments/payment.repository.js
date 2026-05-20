import { createCrudRepository } from "../../core/baseRepository.js";

const paymentCrudRepository = createCrudRepository({
  tableName: "payments",
});

export const listPayments = (query = {}) => {
  return paymentCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      application_id: query.applicationId,
      payment_status: query.status,
      status: query.status,
      currency: query.currency,
    },
    searchTerm: query.search,
    searchColumns: ["invoice_number", "payment_method", "provider_ref"],
  });
};

export const getPaymentById = (id) => paymentCrudRepository.findById(id);
export const createPayment = (payload) => paymentCrudRepository.create(payload);
