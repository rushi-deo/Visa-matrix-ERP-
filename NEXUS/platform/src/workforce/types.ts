import type { BrainContext } from '../brain/types.js';
import type { EngineManager } from '../engines/core/types.js';
import type { EventBus } from '../events/event-bus.js';
import type { KnowledgeManager } from '../knowledge/types.js';
import type { KnowledgeDocument } from '../knowledge/types.js';
import type { MemoryManager } from '../memory/types.js';
import type { MemoryRecord } from '../memory/types.js';
import type { ExecutionRequest } from '../orchestration/types.js';
import type { PluginManager } from '../plugins/manager.js';
import type { PlatformRuntime } from '../runtime/types.js';

export type WorkerProfile = Readonly<{
  id: string;
  name: string;
  version: string;
}>;

export type WorkerCapability = Readonly<{
  id: string;
  name: string;
}>;

export type WorkerSkill = Readonly<{
  id: string;
  name: string;
}>;

export type WorkerRole = Readonly<{
  name: string;
}>;

export type WorkerSession = Readonly<{
  id: string;
  startedAt: string;
  updatedAt: string;
}>;

export type WorkerAssignment = Readonly<{
  id: string;
  taskId: string;
  workerId: string;
}>;

export type WorkerResult = Readonly<{
  ok: boolean;
  details?: string;
}>;

export type WorkerContext = Readonly<{
  brain: BrainContext;
  knowledge: KnowledgeManager;
  memory: MemoryManager;
  runtime: PlatformRuntime;
  engines: EngineManager;
  plugins: PluginManager;
  events: EventBus<unknown>;
  session: WorkerSession;
}>;

export interface Worker {
  initialize(context: WorkerContext): Promise<void>;
  assign(assignment: WorkerAssignment): Promise<void>;
  execute(context: WorkerContext): Promise<WorkerResult>;
  pause(context: WorkerContext): Promise<void>;
  resume(context: WorkerContext): Promise<void>;
  complete(context: WorkerContext): Promise<void>;
  terminate(context: WorkerContext): Promise<void>;
}

export interface WorkerRegistry {
  register(name: string, worker: Worker): void;
  get(name: string): Worker | undefined;
}

export interface WorkforceManager {
  register(name: string, worker: Worker): void;
  initialize(name: string, context: WorkerContext): Promise<void>;
  assign(name: string, assignment: WorkerAssignment): Promise<void>;
  execute(name: string, context: WorkerContext): Promise<WorkerResult>;
  pause(name: string, context: WorkerContext): Promise<void>;
  resume(name: string, context: WorkerContext): Promise<void>;
  complete(name: string, context: WorkerContext): Promise<void>;
  terminate(name: string, context: WorkerContext): Promise<void>;
}

export interface AgentProfile {
  id: string;
  name: string;
  role: AgentRole;
}

export type AgentCapability = WorkerCapability;

export type AgentTask = Readonly<{
  id: string;
  name: string;
  input?: Readonly<{
    request: ExecutionRequest;
    metadata: Readonly<Record<string, unknown>>;
    memory: readonly MemoryRecord[];
    knowledge: readonly KnowledgeDocument[];
  }>;
}>;

export type AgentResponse = Readonly<{
  ok: boolean;
  details?: string;
}>;

export type AgentRole = 'single' | 'multi' | 'supervisor' | 'collaborator' | 'reviewer' | 'coordinator';

export interface AgentContext extends WorkerContext {
  profile: AgentProfile;
}

export interface Agent {
  initialize(context: AgentContext): Promise<void>;
  execute(task: AgentTask, context: AgentContext): Promise<AgentResponse>;
}

export interface AgentRegistry {
  register(name: string, agent: Agent): void;
  get(name: string): Agent | undefined;
}

export interface AgentManager {
  register(name: string, agent: Agent): void;
  initialize(name: string, context: AgentContext): Promise<void>;
  execute(name: string, task: AgentTask, context: AgentContext): Promise<AgentResponse>;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 'queued' | 'scheduled' | 'dispatched' | 'running' | 'paused' | 'completed' | 'failed';

export type TaskPolicy = Readonly<{
  validationRequired: boolean;
  authorizationRequired: boolean;
  retryEnabled: boolean;
  timeoutMs?: number;
  rollbackEnabled: boolean;
}>;

export type TaskResult = Readonly<{
  ok: boolean;
  status: TaskStatus;
  details?: string;
}>;

export type Task = Readonly<{
  id: string;
  name: string;
  priority: TaskPriority;
  status: TaskStatus;
}>;

export type Goal = Readonly<{
  id: string;
  description: string;
}>;

export type Objective = Readonly<{
  id: string;
  description: string;
}>;

export type Action = Readonly<{
  id: string;
  name: string;
}>;

export type ActionResult = Readonly<{
  ok: boolean;
  details?: string;
}>;

export type ExecutionPlan = Readonly<{
  id: string;
  tasks: readonly Task[];
  actions: readonly Action[];
}>;

export type Decision = Readonly<{
  value: string;
}>;

export type Outcome = Readonly<{
  status: 'success' | 'failure' | 'pending';
}>;

export interface TaskManager {
  register(task: Task): void;
  list(): readonly Task[];
}

export interface TaskQueue {
  enqueue(task: Task): void;
  dequeue(): Task | undefined;
}

export interface TaskScheduler {
  schedule(task: Task): void;
}

export interface TaskDispatcher {
  dispatch(task: Task): Promise<TaskResult>;
}

export interface TaskExecutor {
  execute(task: Task): Promise<TaskResult>;
}

export interface TaskEngine {
  queue: TaskQueue;
  scheduler: TaskScheduler;
  dispatcher: TaskDispatcher;
  executor: TaskExecutor;
}
