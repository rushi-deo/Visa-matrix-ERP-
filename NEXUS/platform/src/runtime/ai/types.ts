import type { BrainContext } from '../../brain/types.js';
import type { KnowledgeManager } from '../../knowledge/types.js';
import type { MemoryManager } from '../../memory/types.js';
import type { PromptContext } from '../../prompt/types.js';
import type { ProviderManager } from '../../providers/types.js';
import type { PlatformRuntime } from '../types.js';

export type AIExecutionSession = Readonly<{
  id: string;
  createdAt: string;
  updatedAt: string;
}>;

export type AIExecutionContext = Readonly<{
  runtime: PlatformRuntime;
  brain: BrainContext;
  knowledge: KnowledgeManager;
  memory: MemoryManager;
  prompt: PromptContext;
  provider: ProviderManager;
}>;

export type AIExecutionResult = Readonly<{
  ok: boolean;
  output?: string;
}>;

export type AIExecutionHistory = Readonly<{
  sessionId: string;
  results: readonly AIExecutionResult[];
}>;

export interface AIRuntime {
  execute(context: AIExecutionContext): Promise<AIExecutionResult>;
}

export interface AIExecutionManager {
  execute(context: AIExecutionContext): Promise<AIExecutionResult>;
  history(sessionId: string): Promise<AIExecutionHistory>;
}
