export type ToolDefinition = Readonly<{
  name: string;
  version: string;
}>;

export type ToolContext = Readonly<{
  requestId?: string;
  correlationId?: string;
}>;

export type ToolResult = Readonly<{
  ok: boolean;
  details?: string;
}>;

export type ToolPermission = Readonly<{
  name: string;
}>;

export type ToolDiscovery = Readonly<{
  name: string;
  version: string;
}>;

export interface Tool {
  readonly definition: ToolDefinition;
  execute(context: ToolContext): Promise<ToolResult>;
}

export interface ToolRegistry {
  register(tool: Tool): void;
  get(name: string): Tool | undefined;
  list(): readonly ToolDiscovery[];
}

export interface ToolManager {
  register(tool: Tool): void;
  discover(name: string): ToolDiscovery | undefined;
  validate(name: string, context: ToolContext): boolean;
  execute(name: string, context: ToolContext): Promise<ToolResult>;
}

export interface ToolExecutor {
  execute(tool: Tool, context: ToolContext): Promise<ToolResult>;
}
