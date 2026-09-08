import { describe, expect, it } from 'vitest';

import type { APIHost, EndpointDefinition, RateLimitPolicy, RouteRegistry, Versioning } from '../src/api/index.js';

describe('api framework', () => {
  it('exposes api host and registry contracts', () => {
    const endpoint: EndpointDefinition = { method: 'GET', path: '/health' };
    const versioning: Versioning = { current: 'v1', supported: ['v1'] };
    const policy: RateLimitPolicy = { requests: 100, windowMs: 60000 };
    const routes: RouteRegistry = { register: () => undefined };
    const host: APIHost = { start: async () => undefined, stop: async () => undefined };

    expect(endpoint.path).toBe('/health');
    expect(versioning.current).toBe('v1');
    expect(policy.requests).toBe(100);
    expect(routes.register).toBeTypeOf('function');
    expect(host.start).toBeTypeOf('function');
  });
});
