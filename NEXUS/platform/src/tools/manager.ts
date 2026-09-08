import type {
  Tool,
  ToolContext,
  ToolExecutor,
  ToolManager,
  ToolRegistry
} from './types.js';

export const createToolRegistry = (): ToolRegistry => {
  const tools = new Map<string, Tool>();

  return {
    register: (tool) => {
      tools.set(tool.definition.name, tool);
    },
    get: (name) => tools.get(name),
    list: () => [...tools.values()].map((tool) => ({ name: tool.definition.name, version: tool.definition.version })),
  };
};

export const createToolExecutor = (): ToolExecutor => ({
  execute: async (tool, context) => tool.execute(context),
});

const validateToolName = (name: string): void => {
  if (name.trim().length === 0) {
    throw new Error('Tool identifier is required');
  }
};

export const createToolManager = (registry: ToolRegistry = createToolRegistry()): ToolManager => ({
  register: (tool) => {
    registry.register(tool);
  },
  discover: (name) => registry.list().find((tool) => tool.name === name),
  validate: (name, _context) => Boolean(registry.get(name)),
  execute: async (name: string, context: ToolContext) => {
    validateToolName(name);
    const tool = registry.get(name);
    if (!tool) {
      throw new Error(`Tool not registered: ${name}`);
    }

    return tool.execute(context);
  },
});
