import { describe, expect, it } from 'vitest';

import { createAutomationManager } from '../src/automation/index.js';

describe('workflow engine', () => {
  it('executes a workflow', async () => {
    const manager = createAutomationManager();
    const definition = { id: 'workflow-1', name: 'Workflow', steps: [] };
    await expect(manager.execute(definition, { workflowId: 'workflow-1' })).resolves.toEqual({
      ok: true,
      details: 'workflow-1',
    });
  });
});
