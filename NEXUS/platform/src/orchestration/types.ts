import type { WorkflowDefinition, WorkflowResult } from '../automation/types.js';
import type { BrainContext, BrainPlanner } from '../brain/types.js';
import type { EventBus } from '../events/event-bus.js';
import type { KnowledgeManager } from '../knowledge/types.js';
import type { MemoryManager } from '../memory/types.js';
import type { Metrics } from '../observability/metrics.js';
import type { PlatformRuntime } from '../runtime/types.js';
import type { AuditContext } from '../security/types.js';
import type { ToolContext, ToolResult } from '../tools/types.js';
import type { WorkerContext } from '../workforce/types.js';

export type ExecutionRequest = Readonly<{
  id: string;
  source: 'internal' | 'external' | 'scheduled' | 'event' | 'api';
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}>;

export type ExecutionUser = Readonly<{
  id?: string;
  name?: string;
  roles?: readonly string[];
  permissions?: readonly string[];
}>;

export type ExecutionOrganization = Readonly<{
  id?: string;
  name?: string;
}>;

export type ExecutionContext = Readonly<{
  request: ExecutionRequest;
  runtime: PlatformRuntime;
  brain: BrainContext;
  memory: MemoryManager;
  knowledge: KnowledgeManager;
  worker: WorkerContext;
  workflow: WorkflowDefinition;
  tools: ToolContext;
  requestId?: string;
  sessionId?: string;
  conversationId?: string;
  user?: ExecutionUser;
  organization?: ExecutionOrganization;
  planner?: BrainPlanner;
  selectedAgents?: readonly string[];
  selectedTools?: readonly string[];
  events?: EventBus<unknown>;
  metrics?: Metrics | ExecutionMetrics;
  audit?: AuditContext;
  response?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}>;

export type ExecutionContextInput = Readonly<{
  request: ExecutionRequest;
  runtime?: PlatformRuntime;
  brain?: BrainContext;
  memory?: MemoryManager;
  knowledge?: KnowledgeManager;
  worker?: WorkerContext;
  workflow?: WorkflowDefinition;
  tools?: ToolContext;
  requestId?: string;
  sessionId?: string;
  conversationId?: string;
  user?: ExecutionUser;
  organization?: ExecutionOrganization;
  planner?: BrainPlanner;
  selectedAgents?: readonly string[];
  selectedTools?: readonly string[];
  events?: EventBus<unknown>;
  metrics?: Metrics | ExecutionMetrics;
  audit?: AuditContext;
  response?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}>;

export type ExecutionPlan = Readonly<{
  id: string;
  steps: readonly string[];
}>;

export type ExecutionResult = Readonly<{
  ok: boolean;
  details?: string;
}>;

export type ExecutionHistory = Readonly<{
  id: string;
  entries: readonly ExecutionResult[];
}>;

export type ExecutionState = Readonly<{
  status: 'idle' | 'validated' | 'planned' | 'executed' | 'observed' | 'completed' | 'recovered';
}>;

export type ExecutionMetrics = Readonly<{
  attempts: number;
  durationMs: number;
}>;

export interface Orchestrator {
  execute(context: ExecutionContext): Promise<ExecutionResult>;
}

export interface ExecutionCoordinator {
  coordinate(context: ExecutionContext): Promise<ExecutionState>;
}

export interface RequestCoordinator {
  route(request: ExecutionRequest): Promise<ExecutionContext>;
}

export interface PipelineCoordinator {
  validate(context: ExecutionContext): Promise<ExecutionState>;
  buildContext(context: ExecutionContext): Promise<ExecutionContext>;
  loadMemory(context: ExecutionContext): Promise<ExecutionContext>;
  loadKnowledge(context: ExecutionContext): Promise<ExecutionContext>;
  createPlan(context: ExecutionContext): Promise<ExecutionPlan>;
  resolveAgents(context: ExecutionContext): Promise<ExecutionContext>;
  resolveTools(context: ExecutionContext): Promise<ExecutionContext>;
  plan(context: ExecutionContext): Promise<ExecutionPlan>;
  execute(context: ExecutionContext, plan: ExecutionPlan): Promise<ExecutionResult>;
  observe(context: ExecutionContext, result: ExecutionResult): Promise<ExecutionState>;
  audit(context: ExecutionContext, result: ExecutionResult): Promise<ExecutionState>;
  complete(context: ExecutionContext, result: ExecutionResult): Promise<ExecutionState>;
  buildResponse(context: ExecutionContext, result: ExecutionResult): Promise<ExecutionResult>;
  recover(context: ExecutionContext, error: unknown): Promise<ExecutionState>;
}

export interface WorkflowCoordinator {
  execute(workflow: WorkflowDefinition, context: ExecutionContext): Promise<WorkflowResult>;
}

export interface AgentCoordinator {
  execute(context: ExecutionContext): Promise<ExecutionResult>;
}

export interface ToolCoordinator {
  execute(context: ToolContext): Promise<ToolResult>;
}
