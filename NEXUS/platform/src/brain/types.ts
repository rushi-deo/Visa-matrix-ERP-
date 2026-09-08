import type { EngineManager } from '../engines/core/types.js';
import type { EventBus } from '../events/event-bus.js';
import type { KnowledgeManager } from '../knowledge/types.js';
import type { MemoryManager } from '../memory/types.js';
import type { PluginManager } from '../plugins/manager.js';
import type { PlatformRuntime } from '../runtime/types.js';

export type BrainState = Readonly<{
  status: 'idle' | 'initialized' | 'planning' | 'reasoning' | 'executing' | 'evaluating' | 'learning' | 'complete';
  version: string;
}>;

export type BrainSession = Readonly<{
  id: string;
  createdAt: string;
  updatedAt: string;
}>;

export type BrainContext = Readonly<{
  knowledge: KnowledgeManager;
  memory: MemoryManager;
  runtime: PlatformRuntime;
  engines: EngineManager;
  plugins: PluginManager;
  events: EventBus<unknown>;
  session: BrainSession;
}>;

export type BrainPipeline = Readonly<{
  stages: readonly BrainPipelineStage[];
}>;

export type BrainPipelineStage =
  | 'initialize'
  | 'plan'
  | 'reason'
  | 'execute'
  | 'evaluate'
  | 'learn'
  | 'complete';

export interface BrainPlanner {
  plan(context: BrainContext): Promise<ExecutionPlan>;
}

export interface BrainExecutor {
  execute(plan: ExecutionPlan, context: BrainContext): Promise<ActionResult>;
}

export interface BrainReasoner {
  reason(context: BrainContext): Promise<Decision>;
}

export interface BrainCoordinator {
  coordinate(context: BrainContext): Promise<BrainState>;
}

export interface BrainRegistry {
  register(name: string, brain: Brain): void;
  get(name: string): Brain | undefined;
}

export interface Brain {
  initialize(context: BrainContext): Promise<void>;
  plan(context: BrainContext): Promise<ExecutionPlan>;
  reason(context: BrainContext): Promise<Decision>;
  execute(context: BrainContext, plan: ExecutionPlan): Promise<ActionResult>;
  evaluate(context: BrainContext): Promise<Outcome>;
  learn(context: BrainContext): Promise<void>;
  complete(context: BrainContext): Promise<void>;
}

export interface BrainManager {
  register(name: string, brain: Brain): void;
  get(name: string): Brain | undefined;
}

export type Task = Readonly<{
  id: string;
  name: string;
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

export interface BrainPlannerStrategy {
  createPlan(context: BrainContext): Promise<ExecutionPlan>;
}

export interface BrainExecutorStrategy {
  run(plan: ExecutionPlan, context: BrainContext): Promise<ActionResult>;
}

export interface BrainReasoningEngine {
  evaluate(context: BrainContext): Promise<Decision>;
}

export interface BrainLifecycle {
  initialize(): Promise<void>;
  plan(): Promise<void>;
  reason(): Promise<void>;
  execute(): Promise<void>;
  evaluate(): Promise<void>;
  learn(): Promise<void>;
  complete(): Promise<void>;
}

export interface LearningManager {
  learn(context: BrainContext): Promise<void>;
}

export interface FeedbackLoop {
  process(context: BrainContext): Promise<void>;
}

export interface Experience {
  id: string;
}

export interface Skill {
  id: string;
}

export interface Capability {
  id: string;
}

export interface Pattern {
  id: string;
}

export interface Rule {
  id: string;
}

export interface ReasoningEngine {
  reason(context: BrainContext): Promise<Decision>;
}

export interface PlanningEngine {
  plan(context: BrainContext): Promise<ExecutionPlan>;
}

export interface DecisionEngine {
  decide(context: BrainContext): Promise<Decision>;
}

export interface RecommendationEngine {
  recommend(context: BrainContext): Promise<Recommendation>;
}

export interface PredictionEngine {
  predict(context: BrainContext): Promise<Prediction>;
}

export interface EvaluationEngine {
  evaluate(context: BrainContext): Promise<Outcome>;
}

export interface ConfidenceEngine {
  confidence(context: BrainContext): Promise<ConfidenceScore>;
}

export interface ExplanationEngine {
  explain(context: BrainContext): Promise<ExplainabilityReport>;
}

export interface StrategyEngine {
  strategy(context: BrainContext): Promise<string>;
}

export type Recommendation = Readonly<{
  value: string;
}>;

export type Prediction = Readonly<{
  value: string;
}>;

export type ConfidenceScore = Readonly<{
  value: number;
}>;

export type ExplainabilityReport = Readonly<{
  summary: string;
}>;
