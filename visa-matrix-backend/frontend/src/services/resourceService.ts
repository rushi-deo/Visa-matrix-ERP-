import { requestWithFallback } from "../api/apiClient";
import type { ResourceCollection, ResourceItem } from "../types";
import { extractCollection } from "../utils/normalizers";

export async function fetchResourceCollection<T extends ResourceItem = ResourceItem>(
  endpoint: string
): Promise<ResourceCollection<T>> {
  const response = await requestWithFallback<unknown>({
    method: "GET",
    url: endpoint,
  });

  return extractCollection<T>(response.data);
}
