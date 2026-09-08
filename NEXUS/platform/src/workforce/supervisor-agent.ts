import { AgentManagerToken } from '../infrastructure/container/service-tokens.js';
import type { Agent, AgentResponse, AgentTask } from './types.js';

const agentKeywords: ReadonlyArray<readonly [string, string]> = [
  ['visa', 'visa-agent'],
  ['document', 'document-agent'],
  ['passport', 'document-intelligence-agent'],
  ['customer', 'crm-agent'],
  ['lead', 'crm-agent'],
  ['knowledge', 'knowledge-agent'],
  ['research', 'research-agent'],
];

const selectAgents = (task: AgentTask): readonly string[] => {
  const source = JSON.stringify({
    name: task.name,
    payload: task.input?.request.payload,
    requestMetadata: task.input?.request.metadata,
  }).toLowerCase();
  const selected = [...new Set(agentKeywords.filter(([keyword]) => source.includes(keyword)).map(([, name]) => name))];
  return selected.length > 0 ? selected : ['research-agent'];
};

export const createSupervisorAgent = (): Agent => ({
  initialize: async () => undefined,
  execute: async (task, context): Promise<AgentResponse> => {
    try {
      const manager = context.runtime.getContext().container.resolve(AgentManagerToken);
      const results: Array<{ agent: string; response: AgentResponse }> = [];
      for (const agentName of selectAgents(task)) {
        if (agentName === 'supervisor-agent') continue;
        let response: AgentResponse;
        try {
          response = await manager.execute(
            agentName,
            { ...task, id: `${task.id}:${agentName}` },
            { ...context, profile: { id: agentName, name: agentName, role: 'single' } },
          );
        } catch (error) {
          response = { ok: false, details: error instanceof Error ? error.message : `${agentName}: execution failed` };
        }
        results.push({ agent: agentName, response });
      }

      const ok = results.length > 0 && results.every(({ response }) => response.ok);
      return { ok, details: JSON.stringify({ selectedAgents: results.map(({ agent }) => agent), results }) };
    } catch (error) {
      return { ok: false, details: error instanceof Error ? error.message : 'supervisor-agent: coordination failed' };
    }
  },
});
