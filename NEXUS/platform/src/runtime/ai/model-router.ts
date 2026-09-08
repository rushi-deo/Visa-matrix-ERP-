import type { AIProvider, ProviderHealth, ProviderManager, ProviderRequest } from '../../providers/types.js';

export interface RoutingPolicy {
  priority: readonly string[];
}

export interface CapabilityMatcher {
  match(provider: AIProvider, request: ProviderRequest): boolean;
}

export interface CostPolicy {
  estimate(provider: AIProvider, request: ProviderRequest): number;
}

export interface LatencyPolicy {
  estimate(provider: AIProvider): number;
}

export interface FallbackPolicy {
  fallback(providers: readonly AIProvider[]): AIProvider | undefined;
}

export interface HealthPolicy {
  healthy(health: ProviderHealth): boolean;
}

export interface ProviderResolver {
  resolve(request: ProviderRequest): Promise<AIProvider>;
}

export const createModelRouter = (
  manager: ProviderManager,
  policy: RoutingPolicy = { priority: [] },
  matcher: CapabilityMatcher = { match: () => true },
  healthPolicy: HealthPolicy = { healthy: (health) => health.ok },
  fallbackPolicy: FallbackPolicy = { fallback: (providers) => providers[0] },
): ProviderResolver => ({
  resolve: async (request) => {
    const providers = policy.priority
      .map((name) => manager.get(name))
      .filter((provider): provider is AIProvider => Boolean(provider));
    const candidate = providers.find((provider) => matcher.match(provider, request));
    if (candidate && healthPolicy.healthy(await candidate.health())) {
      return candidate;
    }
    const fallback = fallbackPolicy.fallback(providers);
    if (!fallback) {
      throw new Error('No provider available');
    }
    return fallback;
  },
});
