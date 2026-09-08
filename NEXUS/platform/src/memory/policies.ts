export type RetentionPolicy = Readonly<{
  maxAgeDays: number;
}>;

export type ExpirationPolicy = Readonly<{
  ttlDays: number;
}>;

export type CompressionPolicy = Readonly<{
  enabled: boolean;
}>;

export type EncryptionPolicy = Readonly<{
  enabled: boolean;
  algorithm?: string;
}>;

export type PriorityPolicy = Readonly<{
  level: number;
}>;

export type AccessControlPolicy = Readonly<{
  roles: readonly string[];
}>;

export type IsolationPolicy = Readonly<{
  scope: string;
}>;

export interface MemoryPolicies {
  retention: RetentionPolicy;
  expiration: ExpirationPolicy;
  compression: CompressionPolicy;
  encryption: EncryptionPolicy;
  priority: PriorityPolicy;
  accessControl: AccessControlPolicy;
  isolation: IsolationPolicy;
}
