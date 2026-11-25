import { emitSystemNotification } from "../notifications/notification.service.js";
import { getApplication } from "../applications/application.service.js";
import {
  createPayment,
  getPaymentById,
  listPayments,
} from "./payment.repository.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  getTenantOrganizationScope,
} from "../../utils/tenantSecurity.js";
import { ForbiddenError } from "../../core/errors.js";

const assertPaymentApplicationOwnership = async (payment, authContext) => {
  assertTenantAccess(payment, authContext, "payment");
  if (!payment.application_id) {
    throw new ForbiddenError("Payment application ownership is required.");
  }
  const application = await getApplication(payment.application_id, authContext);
  if (String(application.organization_id) !== String(payment.organization_id)) {
    throw new ForbiddenError("Payment organization does not match its application.");
  }
  return payment;
};

export const getPayments = async (query = {}, authContext = {}) => {
  const result = await listPayments(query, getTenantOrganizationScope(authContext));
  const items = await Promise.all((result.items || []).map((payment) =>
    assertPaymentApplicationOwnership(payment, authContext),
  ));
  return { ...result, items };
};
export const getPayment = async (id, authContext = {}) => {
  const payment = await getPaymentById(
    id,
    getTenantOrganizationScope(authContext),
  );
  return assertPaymentApplicationOwnership(payment, authContext);
};

export const createPaymentRecord = async (payload, authContext = {}) => {
  const nextPayload =
    payload.payment_status || payload.status
      ? payload
      : {
          ...payload,
          payment_status: "pending",
        };

  const application = await getApplication(payload.application_id, authContext);
  const payment = await createPayment(applyTenantToPayload({
    ...nextPayload,
    organization_id: application.organization_id,
  }, authContext));

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
