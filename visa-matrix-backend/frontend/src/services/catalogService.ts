import { requestWithFallback } from "../api/apiClient";
import type { CountryRecord, VisaTypeRecord } from "../types";

export async function fetchCountries() {
  const response = await requestWithFallback<{
    success?: boolean;
    data?: CountryRecord[];
  }>({
    method: "GET",
    url: "/countries",
  });

  return response.data.data || [];
}

export async function fetchVisaTypes() {
  const response = await requestWithFallback<{
    success?: boolean;
    data?: VisaTypeRecord[];
  }>({
    method: "GET",
    url: "/visa-types",
  });

  return response.data.data || [];
}
