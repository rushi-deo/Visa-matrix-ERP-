import type { PromptBuilder, PromptManager, PromptRegistry, PromptRenderer, PromptTemplate } from './types.js';

export const createPromptRegistry = (): PromptRegistry => {
  const templates = new Map<string, PromptTemplate>();

  return {
    register: (template) => {
      templates.set(template.name, template);
    },
    get: (name) => templates.get(name),
  };
};

export const createPromptRenderer = (): PromptRenderer => ({
  render: (template, variables) =>
    variables.reduce(
      (output, variable) => output.replaceAll(`{{${variable.name}}}`, variable.value),
      template.content,
    ),
});

export const createPromptBuilder = (registry: PromptRegistry = createPromptRegistry()): PromptBuilder => ({
  addTemplate: (template) => {
    registry.register(template);
  },
  build: (name, variables) => {
    const template = registry.get(name);
    if (!template) {
      throw new Error(`Prompt template not registered: ${name}`);
    }
    return createPromptRenderer().render(template, variables);
  },
});

export const createPromptManager = (registry: PromptRegistry = createPromptRegistry()): PromptManager => ({
  register: (template) => registry.register(template),
  build: (name, variables) => createPromptBuilder(registry).build(name, variables),
  validate: (template) => Boolean(template.name && template.content),
});
