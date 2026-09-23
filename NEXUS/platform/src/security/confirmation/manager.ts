import { createHash, randomUUID } from 'node:crypto';

export type ConfirmationRecord = Readonly<{
  id: string;
  action: string;
  payloadFingerprint: string;
  createdAt: number;
  expiresAt: number;
}>;

export interface ConfirmationManager {
  create(action: string, payload?: Record<string, unknown>): string;
  consume(
    id: string,
    action: string,
    payload?: Record<string, unknown>,
  ): boolean;
}

const CONFIRMATION_TTL_MS = 10 * 60 * 1000;

const records = new Map<string, ConfirmationRecord>();

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }

  return value;
};

const fingerprint = (
  action: string,
  payload?: Record<string, unknown>,
): string => {
  const canonical = JSON.stringify({
    action,
    payload: canonicalize(payload ?? {}),
  });

  return createHash('sha256').update(canonical).digest('hex');
};

const cleanupExpired = (): void => {
  const now = Date.now();

  for (const [id, record] of records) {
    if (record.expiresAt <= now) {
      records.delete(id);
    }
  }
};

export const createConfirmationManager = (): ConfirmationManager => ({
  create(action, payload) {
    cleanupExpired();

    const id = randomUUID();
    const now = Date.now();

    records.set(id, {
      id,
      action,
      payloadFingerprint: fingerprint(action, payload),
      createdAt: now,
      expiresAt: now + CONFIRMATION_TTL_MS,
    });

    return id;
  },

  consume(id, action, payload) {
    cleanupExpired();

    const record = records.get(id);

    if (!record) {
      return false;
    }

    if (record.action !== action) {
      return false;
    }

    if (record.payloadFingerprint !== fingerprint(action, payload)) {
      return false;
    }

    if (record.expiresAt <= Date.now()) {
      records.delete(id);
      return false;
    }

    records.delete(id);
    return true;
  },
});
