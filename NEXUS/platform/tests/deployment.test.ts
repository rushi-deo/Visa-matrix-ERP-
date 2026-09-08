import { describe, expect, it } from 'vitest';

import type { DeploymentProfile, EnvironmentProfile, FeatureFlags } from '../src/deployment/index.js';

describe('deployment', () => {
  it('exposes deployment contracts', () => {
    const profile: DeploymentProfile = { name: 'default', environment: 'development' };
    const environment: EnvironmentProfile = { name: 'dev', variables: {} };
    const flags: FeatureFlags = { featureA: true };

    expect(profile.environment).toBe('development');
    expect(environment.name).toBe('dev');
    expect(flags.featureA).toBe(true);
  });
});
