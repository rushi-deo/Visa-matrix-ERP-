export type ServiceLifetime = 'singleton' | 'transient' | 'scoped';

export type ServiceToken<T> = symbol & { readonly __type?: T };

export type ServiceDescriptor<T> = Readonly<{
  lifetime: ServiceLifetime;
  factory: (container: Container, scope?: Container) => T;
}>;

export interface Container {
  register<T>(token: ServiceToken<T>, descriptor: ServiceDescriptor<T>): void;
  resolve<T>(token: ServiceToken<T>): T;
  createScope(): Container;
}

export const createToken = <T>(description: string): ServiceToken<T> =>
  Symbol(description) as ServiceToken<T>;
