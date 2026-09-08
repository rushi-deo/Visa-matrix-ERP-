import type { AIProvider, ProviderManager, ProviderRegistry, ProviderRequest, ProviderResponse } from './types.js';

export const createProviderRegistry = (): ProviderRegistry => {
  const providers = new Map<string, AIProvider>();

  return {
    register: (name, provider) => {
      providers.set(name, provider);
    },
    get: (name) => providers.get(name),
    list: () => [...providers.values()],
  };
};

export const createProviderManager = (registry: ProviderRegistry = createProviderRegistry()): ProviderManager => ({
  register: (name, provider) => {
    registry.register(name, provider);
  },
  get: (name) => registry.get(name),
  select: (request: ProviderRequest) => {
    const providers = registry.list();
    const selected = providers.find((provider) => provider.name === request.providerName)
      ?? providers.find((provider) => provider.name === request.model.name)
      ?? providers[0];
    if (request.providerName && !providers.some((provider) => provider.name === request.providerName)) {
      throw new Error(`Unknown provider: ${request.providerName}`);
    }
    if (!selected) {
      throw new Error('No provider available');
    }

    return selected;
  },
  execute: async (request: ProviderRequest): Promise<ProviderResponse> => {
    const providers = registry.list();
    if (request.providerName && !providers.some((candidate) => candidate.name === request.providerName)) {
      throw new Error(`Unknown provider: ${request.providerName}`);
    }
    const provider = providers.find((candidate) => candidate.name === request.providerName)
      ?? providers.find((candidate) => candidate.name === request.model.name)
      ?? providers[0];
    if (!provider) {
      throw new Error('No provider available');
    }

    return provider.request(request);
  },
});
