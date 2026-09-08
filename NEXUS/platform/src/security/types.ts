export type Permission = Readonly<{
  name: string;
  description?: string;
}>;

export type Role = Readonly<{
  name: string;
  permissions: readonly Permission[];
}>;

export type Policy = Readonly<{
  name: string;
  roles: readonly Role[];
}>;

export type SecurityContext = Readonly<{
  subjectId?: string;
  roles: readonly string[];
  permissions: readonly string[];
}>;

export type AuditContext = Readonly<{
  actorId?: string;
  action: string;
  resource?: string;
  timestamp: string;
}>;

export interface PolicyEngine {
  evaluate(context: SecurityContext, policy: Policy): boolean;
}

export interface SecurityManager {
  audit(context: AuditContext): void;
  evaluate(context: SecurityContext, policy: Policy): boolean;
}
