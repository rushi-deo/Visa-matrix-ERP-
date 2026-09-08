import { describe, expect, it } from 'vitest';

import { createPromptManager } from '../src/prompt/index.js';

describe('prompt engine', () => {
  it('builds prompts from templates and variables', () => {
    const manager = createPromptManager();
    manager.register({
      name: 'greeting',
      version: '1.0.0',
      content: 'Hello {{name}}',
    });

    expect(manager.build('greeting', [{ name: 'name', value: 'NEXUS' }])).toBe('Hello NEXUS');
  });
});
