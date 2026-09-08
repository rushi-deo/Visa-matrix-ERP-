import type { CompositionContext, ConnectorComposer,EngineComposer, ModuleComposer, PlatformComposer, ProviderComposer, ServiceComposer, WorkflowComposer } from './types.js';

const createNoopComposer = (): { compose(): Promise<void> } => ({
  compose: async () => undefined,
});

export const createPlatformComposer = (_context: CompositionContext): PlatformComposer => ({
  service: createServiceComposer(),
  module: createModuleComposer(),
  engine: createEngineComposer(),
  provider: createProviderComposer(),
  connector: createConnectorComposer(),
  workflow: createWorkflowComposer(),
});

export const createServiceComposer = (): ServiceComposer => createNoopComposer();
export const createModuleComposer = (): ModuleComposer => createNoopComposer();
export const createEngineComposer = (): EngineComposer => createNoopComposer();
export const createProviderComposer = (): ProviderComposer => createNoopComposer();
export const createConnectorComposer = (): ConnectorComposer => createNoopComposer();
export const createWorkflowComposer = (): WorkflowComposer => createNoopComposer();
