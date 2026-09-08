import type { ExecutionContext, ExecutionPlan } from '../orchestration/types.js';
import type { ProviderManager, ProviderRequest } from '../providers/types.js';

const plannerModel = {
  name: 'brain-planner',
  version: '1.0',
  capabilities: {
    streaming: false,
    vision: false,
    tools: false,
    structuredOutput: true,
  },
} as const;

const ensurePlanShape = (value: unknown): ExecutionPlan => {
  if (!value || typeof value !== 'object') {
    throw new Error('planner: invalid output');
  }

  const candidate = value as { id?: unknown; steps?: unknown };
  const id = typeof candidate.id === 'string' && candidate.id.trim().length > 0 ? candidate.id : 'plan';
  if (!Array.isArray(candidate.steps) || !candidate.steps.every((step) => typeof step === 'string' && step.trim().length > 0)) {
    throw new Error('planner: invalid output');
  }

  return {
    id,
    steps: candidate.steps.map((step) => step.trim()),
  };
};

export const createBrainPlanner = (manager: ProviderManager) => {
  return async (context: ExecutionContext): Promise<ExecutionPlan> => {
    const request: ProviderRequest = {
      model: plannerModel,
      input: JSON.stringify({
        request: context.request,
        metadata: context.metadata ?? {},
        memory: context.metadata?.memory ?? [],
        knowledge: context.metadata?.knowledge ?? [],
      }),
    };

    const provider = manager.select(request);
    const response = await provider.request(request);

    if (!response.ok || !response.output) {
      throw new Error('planner: provider failed');
    }

    try {
      return ensurePlanShape(JSON.parse(response.output));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      throw new Error(`planner: parse failed: ${message}`);
    }
  };
};

export default createBrainPlanner;
