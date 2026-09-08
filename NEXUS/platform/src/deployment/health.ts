import type { HealthCheck, LivenessCheck, ReadinessCheck } from './types.js';

export type PlatformHealth = Readonly<{
  ok: boolean;
}>;

export type ModuleHealth = PlatformHealth;
export type ProviderHealth = PlatformHealth;
export type ConnectorHealth = PlatformHealth;
export type RuntimeHealth = PlatformHealth;
export type BrainHealth = PlatformHealth;
export type OverallHealth = PlatformHealth;

export const createPlatformHealth = (): PlatformHealth => ({ ok: true });

export const createModuleHealth = (): ModuleHealth => ({ ok: true });
export const createProviderHealth = (): ProviderHealth => ({ ok: true });
export const createConnectorHealth = (): ConnectorHealth => ({ ok: true });
export const createRuntimeHealth = (): RuntimeHealth => ({ ok: true });
export const createBrainHealth = (): BrainHealth => ({ ok: true });
export const createOverallHealth = (): OverallHealth => ({ ok: true });

export interface HealthAggregator {
  aggregate(
    health: Readonly<{
      healthChecks: readonly HealthCheck[];
      readinessChecks: readonly ReadinessCheck[];
      livenessChecks: readonly LivenessCheck[];
    }>,
  ): OverallHealth;
}

export const createHealthAggregator = (): HealthAggregator => ({
  aggregate: () => ({ ok: true }),
});
