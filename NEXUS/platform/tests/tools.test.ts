import { describe, expect, it } from 'vitest';

import { createToolManager } from '../src/tools/index.js';
import { createErpTool } from '../src/tools/erp-tool.js';
import { createConfirmationManager } from '../src/security/confirmation/manager.js';

describe('tools', () => {
  it('registers and executes tools', async () => {
    const manager = createToolManager();

    manager.register({
      definition: { name: 'tool-1', version: '1.0.0' },
      execute: async () => ({ ok: true }),
    });

    await expect(manager.execute('tool-1', {})).resolves.toEqual({ ok: true });
  });

  it('rejects empty and unknown tool identifiers predictably', async () => {
    const manager = createToolManager();

    await expect(manager.execute(' ', {})).rejects.toThrow(
      'Tool identifier is required',
    );

    await expect(manager.execute('missing-tool', {})).rejects.toThrow(
      'Tool not registered: missing-tool',
    );
  });

  it('blocks a write tool and returns a confirmation id', async () => {
    const confirmationManager = createConfirmationManager();

    let connectorCalls = 0;

    const connectorManager = {
      get: () => ({
        request: async () => {
          connectorCalls += 1;
          return { ok: true, payload: { id: 'customer-1' } };
        },
      }),
    };

    const tool = createErpTool(
      connectorManager,
      'customer.create',
      'customer.create',
      {
        kind: 'write',
        requiresConfirmation: true,
        confirmationManager,
      },
    );

    const result = await tool.execute({
      requestId: 'request-1',
      correlationId: 'correlation-1',
      payload: {
        full_name: 'Test Customer',
        email: 'test@example.com',
      },
    });

    expect(result.ok).toBe(false);
    expect(result.details).toBe('CONFIRMATION_REQUIRED');
    expect(result.confirmationRequired).toBe(true);
    expect(result.confirmationId).toEqual(expect.any(String));
    expect(connectorCalls).toBe(0);
  });

  it('allows a confirmed write exactly once', async () => {
    const confirmationManager = createConfirmationManager();

    let connectorCalls = 0;

    const connectorManager = {
      get: () => ({
        request: async () => {
          connectorCalls += 1;
          return { ok: true, payload: { id: 'customer-1' } };
        },
      }),
    };

    const tool = createErpTool(
      connectorManager,
      'customer.create',
      'customer.create',
      {
        kind: 'write',
        requiresConfirmation: true,
        confirmationManager,
      },
    );

    const payload = {
      full_name: 'Test Customer',
      email: 'test@example.com',
    };

    const firstResult = await tool.execute({
      requestId: 'request-1',
      correlationId: 'correlation-1',
      payload,
    });

    expect(firstResult.confirmationId).toEqual(expect.any(String));

    const confirmationId = firstResult.confirmationId;

    const confirmedResult = await tool.execute({
      requestId: 'request-2',
      correlationId: 'correlation-2',
      payload,
      confirmationId,
      confirmed: true,
    });

    expect(confirmedResult.ok).toBe(true);
    expect(confirmedResult.payload).toEqual({ id: 'customer-1' });
    expect(connectorCalls).toBe(1);

    const replayResult = await tool.execute({
      requestId: 'request-3',
      correlationId: 'correlation-3',
      payload,
      confirmationId,
      confirmed: true,
    });

    expect(replayResult.ok).toBe(false);
    expect(replayResult.details).toBe('INVALID_OR_EXPIRED_CONFIRMATION');
    expect(connectorCalls).toBe(1);
  });

  it('rejects a confirmed write when the payload changes', async () => {
    const confirmationManager = createConfirmationManager();

    let connectorCalls = 0;

    const connectorManager = {
      get: () => ({
        request: async () => {
          connectorCalls += 1;
          return { ok: true };
        },
      }),
    };

    const tool = createErpTool(
      connectorManager,
      'customer.update',
      'customer.update',
      {
        kind: 'write',
        requiresConfirmation: true,
        confirmationManager,
      },
    );

    const originalPayload = {
      customer_id: 'customer-1',
      full_name: 'Original Name',
    };

    const proposal = await tool.execute({
      payload: originalPayload,
    });

    expect(proposal.confirmationId).toEqual(expect.any(String));

    const result = await tool.execute({
      payload: {
        customer_id: 'customer-1',
        full_name: 'Changed Name',
      },
      confirmationId: proposal.confirmationId,
      confirmed: true,
    });

    expect(result.ok).toBe(false);
    expect(result.details).toBe('INVALID_OR_EXPIRED_CONFIRMATION');
    expect(connectorCalls).toBe(0);
  });
});
