import type { AuditContext, Policy, PolicyEngine, SecurityContext, SecurityManager } from './types.js';

export const createPolicyEngine = (): PolicyEngine => ({
  evaluate: (context, policy) =>
    policy.roles.some((role) => context.roles.includes(role.name) || role.permissions.some((permission) => context.permissions.includes(permission.name))),
});

export const createSecurityManager = (): SecurityManager => {
  const policyEngine = createPolicyEngine();

  return {
    audit: (_context: AuditContext) => undefined,
    evaluate: (context: SecurityContext, policy: Policy) => policyEngine.evaluate(context, policy),
  };
};
