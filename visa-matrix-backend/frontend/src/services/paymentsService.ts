import { requestWithFallback } from "../api/apiClient";
import type { PaymentCreatePayload } from "../types";

export async function createPayment(payload: PaymentCreatePayload) {
  const response = await requestWithFallback<Record<string, unknown>>({
    method: "POST",
    url: "/payments",
    data: payload,
  });

  return response.data;
}
