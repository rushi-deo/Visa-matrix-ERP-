import type { Connector, ConnectorManager, ConnectorRegistry } from './types.js';

export const createConnectorRegistry = (): ConnectorRegistry => {
  const connectors = new Map<string, Connector>();

  return {
    register: (name, connector) => {
      connectors.set(name, connector);
    },
    get: (name) => connectors.get(name),
  };
};

export const createConnectorManager = (registry: ConnectorRegistry = createConnectorRegistry()): ConnectorManager => ({
  register: (name, connector) => {
    registry.register(name, connector);
  },
  get: (name) => registry.get(name),
  connect: async (name, context) => {
    const connector = registry.get(name);
    if (!connector) throw new Error(`Connector not registered: ${name}`);
    await connector.connect(context);
  },
  disconnect: async () => undefined,
  health: async (name) => {
    const connector = registry.get(name);
    if (!connector) throw new Error(`Connector not registered: ${name}`);
    return connector.health();
  },
  reconnect: async (name, context) => {
    const connector = registry.get(name);
    if (!connector) throw new Error(`Connector not registered: ${name}`);
    await connector.connect(context);
  },
});
