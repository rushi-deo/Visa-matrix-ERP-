import type { ExecutionContext } from '../orchestration/types.js';
import type { ToolManager } from '../tools/types.js';
import type { AgentContext, AgentManager, AgentTask } from '../workforce/types.js';
import type { AutomationManager, WorkflowDefinition, WorkflowRegistry, WorkflowResult } from './types.js';

type RuntimeWorkflowContext = {
  readonly executionContext?: ExecutionContext;
};

export const createWorkflowRegistry = (): WorkflowRegistry => {
  const workflows = new Map<string, WorkflowDefinition>();

  return {
    register: (definition) => {
      workflows.set(definition.id, definition);
    },
    get: (id) => workflows.get(id),
  };
};

export const createAutomationManager = (
  registry: WorkflowRegistry = createWorkflowRegistry(),
  agentManager?: AgentManager,
  toolManager?: ToolManager,
): AutomationManager => {
  const executeDefinition = async (definition: WorkflowDefinition, context: { workflowId: string } & RuntimeWorkflowContext): Promise<WorkflowResult> => {
    registry.register(definition);
    if (definition.steps.length === 0) {
      return { ok: true, details: context.workflowId };
    }

    const executionContext = context.executionContext;
    const completed: string[] = [];

    for (const step of definition.steps) {
      if (step.id.trim().length === 0) {
        return { ok: false, details: [...completed, 'Workflow step identifier is required'].join('; ') };
      }

      let agentError: unknown;
      if (agentManager && executionContext) {
        try {
          const task: AgentTask = {
            id: `${definition.id}:agent:${step.id}`,
            name: step.name,
            input: {
              request: executionContext.request,
              metadata: executionContext.metadata ?? {},
              memory: Array.isArray(executionContext.metadata?.memory) ? executionContext.metadata.memory : [],
              knowledge: Array.isArray(executionContext.metadata?.knowledge) ? executionContext.metadata.knowledge : [],
            },
          };
          const agentContext: AgentContext = {
            ...executionContext.worker,
            profile: { id: step.id, name: step.name, role: 'single' },
          };
          const result = await agentManager.execute(step.id, task, agentContext);
          if (result.ok) {
            completed.push(result.details ? `${step.id}: ${result.details}` : step.id);
            continue;
          }
          agentError = new Error(result.details ?? `Agent step failed: ${step.id}`);
        } catch (error) {
          agentError = error;
        }
      }

      if (toolManager) {
        try {
          const result = await toolManager.execute(
            step.id,
            executionContext?.tools ?? { requestId: context.workflowId, correlationId: context.workflowId },
          );
          if (result.ok) {
            completed.push(result.details ? `${step.id}: ${result.details}` : step.id);
            continue;
          }
          return { ok: false, details: [...completed, result.details ?? `Tool step failed: ${step.id}`].join('; ') };
        } catch (error) {
          return { ok: false, details: [...completed, error instanceof Error ? error.message : `Workflow step failed: ${step.id}`].join('; ') };
        }
      }

      return {
        ok: false,
        details: [...completed, agentError instanceof Error ? agentError.message : `Workflow step is not executable: ${step.id}`].join('; '),
      };
    }

    return { ok: true, details: completed.join('; ') };
  };

  return {
    register: (definition) => {
      registry.register(definition);
    },
    execute: executeDefinition,
    run: async (id, context) => {
      const workflow = registry.get(id);
      if (!workflow) {
        throw new Error(`Workflow not registered: ${id}`);
      }

      if (workflow.steps.length === 0) {
        return { ok: true };
      }

      return executeDefinition(workflow, context);
    },
  };
};
