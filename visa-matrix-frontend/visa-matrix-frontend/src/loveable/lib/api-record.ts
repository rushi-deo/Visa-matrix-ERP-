export type ApiRecord = Record<string, unknown>;

export function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asApiRecord(value: unknown): ApiRecord | null {
  return isApiRecord(value) ? value : null;
}

export function asApiRecords(value: unknown): ApiRecord[] {
  return Array.isArray(value) ? value.filter(isApiRecord) : [];
}

export function readApiValue(
  source: ApiRecord | null | undefined,
  keys: readonly string[],
): unknown {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

export function readApiString(
  source: ApiRecord | null | undefined,
  keys: readonly string[],
): string | null {
  const value = readApiValue(source, keys);
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  const record = asApiRecord(error);
  return typeof record?.message === "string" ? record.message : fallback;
}
