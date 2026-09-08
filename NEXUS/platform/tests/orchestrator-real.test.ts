import { describe, expect, it } from 'vitest';

import { createPlatformConfig } from '../src/config/service.js';
import { createContainer } from '../src/infrastructure/container/index.js';
import { registerCoreServices } from '../src/infrastructure/container/registrations.js';
import { AgentManagerToken, RuntimeToken, ToolManagerToken } from '../src/infrastructure/container/service-tokens.js';
import { createRequestCoordinator } from '../src/orchestration/manager.js';
import { createOrchestrator } from '../src/orchestration/manager.js';
import { createExecutionPipeline } from '../src/orchestration/pipeline.js';
import type { ExecutionContext } from '../src/orchestration/types.js';
import { createPlatformRuntime } from '../src/runtime/runtime.js';
import { createLoggerFactory } from '../src/shared/logger.js';
import type { Tool, ToolContext } from '../src/tools/types.js';
import type { Agent, AgentContext, AgentTask } from '../src/workforce/types.js';

describe('real orchestrator flow (pass 2)', () => {
  it('routes a request through context → plan → execute → result using real managers', async () => {
    const container = createContainer();
    registerCoreServices(container);

    const runtime = createPlatformRuntime({ config: createPlatformConfig(), logger: createLoggerFactory('json'), container });
    container.register(RuntimeToken, { lifetime: 'singleton', factory: () => runtime });

    // register a fake tool
    const toolManager = container.resolve(ToolManagerToken);
    const helloTool: Tool = { definition: { name: 'hello-tool', version: '1.0' }, execute: async (_ctx: ToolContext) => ({ ok: true }) };
    toolManager.register(helloTool);

    // register a fake agent
    const agentManager = container.resolve(AgentManagerToken);
    const fakeAgent: Agent = { initialize: async () => undefined, execute: async (_task: AgentTask, _ctx: AgentContext) => ({ ok: true }) };
    agentManager.register('agent1', fakeAgent);

    const router = createRequestCoordinator(container);
    const ctx = await router.route({ id: 'req-real-1', source: 'api' });

    const execCtx = { ...ctx, selectedTools: ['hello-tool'], selectedAgents: ['agent1'] };

    const pipeline = createExecutionPipeline();
    const orchestrator = createOrchestrator(pipeline);

    const result = await orchestrator.execute(execCtx as unknown as ExecutionContext);

    expect(result.ok).toBe(true);
  });
});
