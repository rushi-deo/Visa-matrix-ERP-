import type { AIExecutionContext, AIExecutionResult } from '../runtime/ai/types.js';
export type AgentSession = Readonly<{
  id: string;
  startedAt: string;
  updatedAt: string;
}>;

export type AgentCapability = Readonly<{
  name: string;
}>;

export type AgentMemory = Readonly<{
  summary: string;
}>;

export type AgentTask = Readonly<{
  id: string;
  input: string;
}>;

export type AgentResult = Readonly<{
  ok: boolean;
  output?: string;
}>;

export interface AgentContext {
  session: AgentSession;
  capabilities: readonly AgentCapability[];
  memory: AgentMemory;
  execution: AIExecutionContext;
}

export interface AgentLifecycle {
  register(): Promise<void>;
  load(): Promise<void>;
  execute(task: AgentTask): Promise<AgentResult>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
}

export interface Agent {
  execute(task: AgentTask, context: AgentContext): Promise<AgentResult>;
}

export interface AgentRegistry {
  register(name: string, agent: Agent): void;
  get(name: string): Agent | undefined;
  list(): readonly string[];
}

export interface AgentManager {
  register(name: string, agent: Agent): void;
  load(name: string): Promise<void>;
  execute(name: string, task: AgentTask, context: AgentContext): Promise<AgentResult>;
  pause(name: string): Promise<void>;
  resume(name: string): Promise<void>;
  stop(name: string): Promise<void>;
}

export interface AgentRuntime {
  execute(name: string, task: AgentTask, context: AgentContext): Promise<AIExecutionResult>;
}
