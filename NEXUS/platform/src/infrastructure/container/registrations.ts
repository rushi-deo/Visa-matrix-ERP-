import { createAutomationManager } from '../../automation/manager.js';
import { createBrainPlanner } from '../../brain/planner.js';
import { createConnectorManager } from '../../connectors/manager.js';
import { createEngineManager } from '../../engines/core/manager.js';
import { createEventBus } from '../../events/event-bus.js';
import { createKnowledgeManager } from '../../knowledge/manager.js';
import { createMemoryManager } from '../../memory/manager.js';
import { createOrchestrator } from '../../orchestration/manager.js';
import { createExecutionPipeline } from '../../orchestration/pipeline.js';
import { createPluginManager } from '../../plugins/manager.js';
import { createProviderManager } from '../../providers/manager.js';
import type { Container } from '../../shared/di.js';
import { createToken } from '../../shared/di.js';
import { createToolManager } from '../../tools/manager.js';
import { createCrmAgent } from '../../workforce/crm-agent.js';
import { createDocumentAgent } from '../../workforce/document-agent.js';
import { createDocumentIntelligenceAgent } from '../../workforce/document-intelligence-agent.js';
import { createKnowledgeAgent } from '../../workforce/knowledge-agent.js';
import { createAgentManager,createWorkforceManager } from '../../workforce/manager.js';
import { createProviderAgent } from '../../workforce/provider-agent.js';
import { createResearchAgent } from '../../workforce/research-agent.js';
import { createSupervisorAgent } from '../../workforce/supervisor-agent.js';
import { createVisaAgent } from '../../workforce/visa-agent.js';
import { PlannerToken } from './service-tokens.js';
import {
  AgentManagerToken,
  AutomationManagerToken,
  ConnectorManagerToken,
  EngineManagerToken,
  EventBusToken,
  KnowledgeManagerToken,
  MemoryManagerToken,
  PluginManagerToken,
  ProviderManagerToken,
  ToolManagerToken,
  WorkforceManagerToken,
} from './service-tokens.js';

export const registerCoreServices = (container: Container): void => {
  container.register(EventBusToken, { lifetime: 'singleton', factory: () => createEventBus() });

  container.register(MemoryManagerToken, { lifetime: 'singleton', factory: () => createMemoryManager() });
  container.register(KnowledgeManagerToken, { lifetime: 'singleton', factory: () => createKnowledgeManager() });

  container.register(ToolManagerToken, { lifetime: 'singleton', factory: () => createToolManager() });

  container.register(WorkforceManagerToken, { lifetime: 'singleton', factory: () => createWorkforceManager() });
  container.register(AgentManagerToken, {
    lifetime: 'singleton',
    factory: () => {
      const manager = createAgentManager();
      manager.register('provider-agent', createProviderAgent());
      manager.register('research-agent', createResearchAgent());
      manager.register('document-agent', createDocumentAgent());
      manager.register('visa-agent', createVisaAgent());
      manager.register('crm-agent', createCrmAgent());
      manager.register('knowledge-agent', createKnowledgeAgent());
      manager.register('document-intelligence-agent', createDocumentIntelligenceAgent());
      manager.register('supervisor-agent', createSupervisorAgent());
      return manager;
    },
  });

  container.register(EngineManagerToken, { lifetime: 'singleton', factory: () => createEngineManager() });
  container.register(PluginManagerToken, { lifetime: 'singleton', factory: () => createPluginManager() });
  container.register(ProviderManagerToken, { lifetime: 'singleton', factory: () => createProviderManager() });
  container.register(ConnectorManagerToken, { lifetime: 'singleton', factory: () => createConnectorManager() });

  container.register(AutomationManagerToken, {
    lifetime: 'singleton',
    factory: (c) => createAutomationManager(undefined, c.resolve(AgentManagerToken), c.resolve(ToolManagerToken)),
  });

  // Orchestrator is a core service but doesn't depend on runtime directly here
  const orchestratorToken = createToken('orchestrator');
  container.register(orchestratorToken, { lifetime: 'singleton', factory: () => createOrchestrator(createExecutionPipeline()) });
  // Planner (AI) wiring
  container.register(PlannerToken, {
    lifetime: 'singleton',
    factory: (c) => createBrainPlanner(c.resolve(ProviderManagerToken)),
  });
};

export type { Container };
