export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};

export function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return (
    payload !== null &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  );
}

export function unwrapApiData<T>(payload: unknown): T {
  if (isApiEnvelope<T>(payload)) {
    return payload.data;
  }

  return payload as T;
}
