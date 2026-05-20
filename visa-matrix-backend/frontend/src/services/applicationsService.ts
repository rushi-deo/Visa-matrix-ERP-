import { requestWithFallback } from "../api/apiClient";
import type { ApplicationCreatePayload } from "../types";

export async function createApplication(payload: ApplicationCreatePayload) {
  const response = await requestWithFallback<Record<string, unknown>>({
    method: "POST",
    url: "/application",
    data: payload,
  });

  return response.data;
}
