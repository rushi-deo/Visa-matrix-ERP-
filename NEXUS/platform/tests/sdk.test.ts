import { describe, expect, it } from 'vitest';

import type { AutomationSDK, BrainSDK, ClientSDK, EngineSDK, KnowledgeSDK, MemorySDK, PlatformSDK, PluginSDK } from '../src/sdk/index.js';

describe('sdk', () => {
  it('exposes SDK contracts', () => {
    const platform: PlatformSDK = { name: 'platform' };
    const client: ClientSDK = platform;
    const plugin: PluginSDK = platform;
    const engine: EngineSDK = platform;
    const knowledge: KnowledgeSDK = platform;
    const memory: MemorySDK = platform;
    const brain: BrainSDK = platform;
    const automation: AutomationSDK = platform;

    expect([client, plugin, engine, knowledge, memory, brain, automation]).toHaveLength(7);
  });
});
