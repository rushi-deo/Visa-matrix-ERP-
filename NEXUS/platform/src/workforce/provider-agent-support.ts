import { ProviderManagerToken } from '../infrastructure/container/service-tokens.js';
import type { ProviderRequest } from '../providers/types.js';
import type { Agent, AgentResponse } from './types.js';

const providerModel = (providerName: string) => ({
  name: providerName,
  version: '1.0',
  capabilities: {
    streaming: false,
    vision: false,
    tools: false,
    structuredOutput: false,
  },
} as const);

type AgentRole = string;

export const executeProviderAgent = async (
  role: AgentRole,
  task: Parameters<Agent['execute']>[0],
  context: Parameters<Agent['execute']>[1],
  instruction: string,
  additionalInput: Record<string, unknown> = {},
): Promise<AgentResponse> => {
  try {
    const providerManager = context.runtime.getContext().container.resolve(ProviderManagerToken);
    const requestedProvider = task.input?.metadata.providerName;
    const providerName = typeof requestedProvider === 'string' && requestedProvider.trim().length > 0
      ? requestedProvider.trim()
      : 'openai';
    const request: ProviderRequest = {
      providerName,
      model: providerModel(providerName),
      input: JSON.stringify({
        role,
        instruction,
        task,
        taskInput: task.input,
        request: task.input?.request,
        requestPayload: task.input?.request.payload,
        requestMetadata: task.input?.request.metadata,
        executionMetadata: task.input?.metadata,
        memory: task.input?.memory ?? [],
        knowledge: task.input?.knowledge ?? [],
        agentProfile: context.profile,
        sessions: {
          brain: context.brain.session,
          worker: context.session,
        },
        ...additionalInput,
      }),
    };
    const response = await providerManager.execute(request);

    if (!response.ok || !response.output) {
      return { ok: false, details: `${role}: provider returned no usable output` };
    }

    return { ok: true, details: response.output };
  } catch (error) {
    const details = error instanceof Error ? error.message : `${role}: provider execution failed`;
    return { ok: false, details };
  }
};

export const createProviderBackedAgent = (role: AgentRole, instruction: string): Agent => ({
  initialize: async () => undefined,
  execute: async (task, context) => executeProviderAgent(role, task, context, instruction),
});
