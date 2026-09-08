export type PromptVersion = string;

export type PromptVariable = Readonly<{
  name: string;
  value: string;
}>;

export type PromptTemplate = Readonly<{
  name: string;
  version: PromptVersion;
  content: string;
  extends?: string;
}>;

export type PromptContext = Readonly<{
  sessionId: string;
  variables: readonly PromptVariable[];
  execution?: unknown;
}>;

export interface PromptBuilder {
  addTemplate(template: PromptTemplate): void;
  build(name: string, variables: readonly PromptVariable[]): string;
}

export interface PromptRenderer {
  render(template: PromptTemplate, variables: readonly PromptVariable[]): string;
}

export interface PromptRegistry {
  register(template: PromptTemplate): void;
  get(name: string): PromptTemplate | undefined;
}

export interface PromptManager {
  register(template: PromptTemplate): void;
  build(name: string, variables: readonly PromptVariable[]): string;
  validate(template: PromptTemplate): boolean;
}
