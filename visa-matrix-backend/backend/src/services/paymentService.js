import {
  createRecord,
  deleteRecord,
  fetchRecordById,
  listRecords,
  updateRecord,
} from "./baseService.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
} from "../utils/tenantSecurity.js";

export const listPayments = async (queryParams) => {
  return listRecords("payments", queryParams, {
    select: "*",
    entityLabel: "Payments",
  });
};

export const getPaymentById = async (id, authContext = {}) => {
  const payment = await fetchRecordById("payments", id, {
    select: "*",
    entityLabel: "Payment",
  });

  return assertTenantAccess(payment, authContext, "payment");
};

export const createPayment = async (payload, authContext = {}) => {
  return createRecord("payments", applyTenantToPayload(payload, authContext), {
    select: "*",
    entityLabel: "Payment",
  });
};

export const updatePayment = async (id, payload, authContext = {}) => {
  const payment = await getPaymentById(id, authContext);
  assertTenantAccess(payment, authContext, "payment");

  return updateRecord("payments", id, applyTenantToPayload(payload, authContext), {
    select: "*",
    entityLabel: "Payment",
  });
};

export const deletePayment = async (id, authContext = {}) => {
  const payment = await getPaymentById(id, authContext);
  assertTenantAccess(payment, authContext, "payment");

  const deletedPayment = await deleteRecord("payments", id, {
    select: "id",
    entityLabel: "Payment",
  });

  return {
    id: deletedPayment.id,
  };
};
