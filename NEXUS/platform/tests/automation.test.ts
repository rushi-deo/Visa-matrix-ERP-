import { describe, expect, it } from 'vitest';

import { createAutomationManager } from '../src/automation/index.js';

describe('automation', () => {
  it('registers and runs workflows', async () => {
    const manager = createAutomationManager();

    manager.register({
      id: 'workflow-1',
      name: 'Workflow',
      steps: [],
    });

    await expect(manager.run('workflow-1', { workflowId: 'workflow-1' })).resolves.toEqual({ ok: true });
  });

  it('fails meaningfully for non-empty workflows without an executor', async () => {
    const manager = createAutomationManager();
    const workflow = {
      id: 'workflow-2',
      name: 'Workflow',
      steps: [{ id: 'step-1', name: 'Step' }],
    };

    await expect(manager.execute(workflow, { workflowId: 'workflow-2' })).resolves.toEqual({
      ok: false,
      details: 'Workflow step is not executable: step-1',
    });
  });

  it('executes tool steps sequentially and preserves earlier results', async () => {
    const order: string[] = [];
    const toolManager = {
      execute: async (name: string) => {
        order.push(name);
        return { ok: true, details: `${name} complete` };
      },
    } as never;
    const manager = createAutomationManager(undefined, undefined, toolManager);

    const result = await manager.execute({
      id: 'workflow-3',
      name: 'Workflow',
      steps: [{ id: 'first', name: 'First' }, { id: 'second', name: 'Second' }],
    }, {
      workflowId: 'workflow-3',
      executionContext: { tools: { requestId: 'request-3' } },
    } as never);

    expect(order).toEqual(['first', 'second']);
    expect(result).toEqual({ ok: true, details: 'first: first complete; second: second complete' });
  });

  it('runs tool workflows through the registered workflow entry point', async () => {
    const requests: string[] = [];
    const manager = createAutomationManager(undefined, undefined, {
      execute: async (_name: string, context: { requestId?: string }) => {
        requests.push(context.requestId ?? '');
        return { ok: true };
      },
    } as never);
    manager.register({ id: 'workflow-5', name: 'Workflow', steps: [{ id: 'tool-1', name: 'Tool' }] });

    const result = await manager.run('workflow-5', { workflowId: 'workflow-5' });

    expect(requests).toEqual(['workflow-5']);
    expect(result).toEqual({ ok: true, details: 'tool-1' });
  });

  it('stops on a failed executable step and preserves prior results', async () => {
    const manager = createAutomationManager(undefined, undefined, {
      execute: async (name: string) => name === 'first' ? { ok: true, details: 'done' } : { ok: false, details: 'second failed' },
    } as never);

    const result = await manager.execute({
      id: 'workflow-4',
      name: 'Workflow',
      steps: [{ id: 'first', name: 'First' }, { id: 'second', name: 'Second' }],
    }, {
      workflowId: 'workflow-4',
      executionContext: { tools: { requestId: 'request-4' } },
    } as never);

    expect(result).toEqual({ ok: false, details: 'first: done; second failed' });
  });
});
