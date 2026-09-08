import type { BrainHealth, ConnectorHealth, ModuleHealth, OverallHealth, PlatformHealth, ProviderHealth, RuntimeHealth } from '../deployment/health.js';

export type HealthDashboard = Readonly<{
  platform: PlatformHealth;
  module: ModuleHealth;
  provider: ProviderHealth;
  connector: ConnectorHealth;
  runtime: RuntimeHealth;
  brain: BrainHealth;
  overall: OverallHealth;
}>;

export const createHealthDashboard = (): HealthDashboard => ({
  platform: { ok: true },
  module: { ok: true },
  provider: { ok: true },
  connector: { ok: true },
  runtime: { ok: true },
  brain: { ok: true },
  overall: { ok: true },
});
