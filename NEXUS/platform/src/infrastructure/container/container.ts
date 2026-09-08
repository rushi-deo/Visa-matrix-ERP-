import type { Container, ServiceDescriptor, ServiceToken } from '../../shared/di.js';

type RegistryEntry<T> = Readonly<{
  descriptor: ServiceDescriptor<T>;
  instance?: T;
  resolving: boolean;
}>;

type InternalState = Readonly<{
  registry: Map<ServiceToken<unknown>, RegistryEntry<unknown>>;
  scopedInstances: WeakMap<Container, Map<ServiceToken<unknown>, unknown>>;
}>;

const createState = (): InternalState => ({
  registry: new Map<ServiceToken<unknown>, RegistryEntry<unknown>>(),
  scopedInstances: new WeakMap<Container, Map<ServiceToken<unknown>, unknown>>(),
});

const createContainerFromState = (state: InternalState): Container => {
  const resolveWith = <T>(token: ServiceToken<T>, scope?: Container): T => {
    const entry = state.registry.get(token) as RegistryEntry<T> | undefined;
    if (!entry) {
      throw new Error(`Service not registered: ${String(token.description)}`);
    }

    if (entry.resolving) {
      throw new Error(`Circular dependency detected: ${String(token.description)}`);
    }

    if (entry.descriptor.lifetime === 'singleton' && entry.instance !== undefined) {
      return entry.instance;
    }

    if (entry.descriptor.lifetime === 'scoped' && scope) {
      const scoped = state.scopedInstances.get(scope);
      const scopedInstance = scoped?.get(token) as T | undefined;
      if (scopedInstance !== undefined) {
        return scopedInstance;
      }
    }

    state.registry.set(token, { ...entry, resolving: true });
    const instance = entry.descriptor.factory(container, scope);
    state.registry.set(token, {
      descriptor: entry.descriptor,
      instance: entry.descriptor.lifetime === 'singleton' ? instance : entry.instance,
      resolving: false,
    });

    if (entry.descriptor.lifetime === 'scoped' && scope) {
      const scoped = state.scopedInstances.get(scope) ?? new Map<ServiceToken<unknown>, unknown>();
      scoped.set(token, instance);
      state.scopedInstances.set(scope, scoped);
    }

    return instance;
  };

  const container: Container = {
    register: <T>(token: ServiceToken<T>, descriptor: ServiceDescriptor<T>) => {
      state.registry.set(token, { descriptor, resolving: false });
    },
    resolve: <T>(token: ServiceToken<T>) => resolveWith(token, container),
    createScope: () => {
      const scope = createContainerFromState(state);
      state.scopedInstances.set(scope, new Map<ServiceToken<unknown>, unknown>());
      return scope;
    },
  };

  return container;
};

export const createContainer = (): Container => createContainerFromState(createState());
