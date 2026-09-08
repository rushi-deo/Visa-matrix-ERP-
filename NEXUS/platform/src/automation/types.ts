export type WorkflowStep = Readonly<{
  id: string;
  name: string;
}>;

export type WorkflowContext = Readonly<{
  workflowId: string;
}>;

export type WorkflowDefinition = Readonly<{
  id: string;
  name: string;
  steps: readonly WorkflowStep[];
}>;

export type WorkflowResult = Readonly<{
  ok: boolean;
  details?: string;
}>;

export type WorkflowTrigger =
  | Readonly<{ type: 'manual' }>
  | Readonly<{ type: 'event'; eventName?: string }>
  | Readonly<{ type: 'schedule'; cron?: string }>
  | Readonly<{ type: 'webhook'; path?: string }>
  | Readonly<{ type: 'api'; path?: string }>
  | Readonly<{ type: 'state-change'; state?: string }>;

export type WorkflowAction = Readonly<{
  id: string;
  name: string;
}>;

export type WorkflowCondition = Readonly<{
  expression: string;
}>;

export interface Workflow {
  readonly definition: WorkflowDefinition;
  execute(context: WorkflowContext): Promise<WorkflowResult>;
}

export interface WorkflowRegistry {
  register(definition: WorkflowDefinition): void;
  get(id: string): WorkflowDefinition | undefined;
}

export interface WorkflowEngine {
  run(definition: WorkflowDefinition, context: WorkflowContext): Promise<WorkflowResult>;
}

export interface AutomationManager {
  register(definition: WorkflowDefinition): void;
  run(id: string, context: WorkflowContext): Promise<WorkflowResult>;
  execute(definition: WorkflowDefinition, context: WorkflowContext): Promise<WorkflowResult>;
}
