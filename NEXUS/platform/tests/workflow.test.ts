import { describe, expect, it } from 'vitest';

import type { Workflow } from '../src/automation/index.js';

describe('workflow', () => {
  it('supports workflow contracts', () => {
    const workflow: Workflow = {
      definition: { id: 'w1', name: 'Workflow', steps: [] },
      execute: async () => ({ ok: true }),
    };

    expect(workflow.definition.id).toBe('w1');
  });
});
