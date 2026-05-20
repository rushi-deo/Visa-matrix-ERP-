import { emitSystemNotification } from "../notifications/notification.service.js";
import {
  createPayment,
  getPaymentById,
  listPayments,
} from "./payment.repository.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
} from "../../utils/tenantSecurity.js";

export const getPayments = async (query) => listPayments(query);
export const getPayment = async (id, authContext = {}) => {
  const payment = await getPaymentById(id);
  return assertTenantAccess(payment, authContext, "payment");
};

export const createPaymentRecord = async (payload, authContext) => {
  const nextPayload =
    payload.payment_status || payload.status
      ? payload
      : {
          ...payload,
          payment_status: "pending",
        };

  const payment = await createPayment(
    applyTenantToPayload(nextPayload, authContext)
  );

  await emitSystemNotification({
    userId: authContext.userId || null,
    applicationId: payment.application_id || payload.application_id || null,
    type: "payment_created",
    title: "Payment recorded",
    message: `Payment ${payment.id} has been recorded.`,
    channel: "in_app",
    metadata: {
      amount: payment.amount || payload.amount,
      currency: payment.currency || payload.currency,
    },
  }).catch(() => null);

  if ((payment.payment_status || payment.status) === "paid") {
    await emitSystemNotification({
      userId: authContext.userId || null,
      applicationId: payment.application_id || payload.application_id || null,
      type: "payment_confirmed",
      title: "Payment confirmed",
      message: `Payment ${payment.id} was confirmed successfully.`,
      channel: "email",
      metadata: {
        paymentId: payment.id,
      },
    }).catch(() => null);
  }

  return payment;
};
