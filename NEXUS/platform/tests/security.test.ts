import { describe, expect, it } from 'vitest';

import { createSecurityManager } from '../src/security/index.js';
import { createConfirmationManager } from '../src/security/confirmation/manager.js';

describe('security', () => {
  it('evaluates policies with framework-only logic', () => {
    const manager = createSecurityManager();

    expect(
      manager.evaluate(
        { roles: ['admin'], permissions: ['platform.read'] },
        {
          name: 'platform-policy',
          roles: [
            { name: 'admin', permissions: [{ name: 'platform.read' }] },
          ],
        },
      ),
    ).toBe(true);
  });

  it('creates and consumes a valid confirmation once', () => {
    const manager = createConfirmationManager();
    const payload = {
      full_name: 'Test Customer',
      email: 'test@example.com',
    };

    const confirmationId = manager.create('customer.create', payload);

    expect(confirmationId).toEqual(expect.any(String));
    expect(
      manager.consume('invalid-confirmation-id', 'customer.create', payload),
    ).toBe(false);
    expect(manager.consume(confirmationId, 'customer.create', payload)).toBe(
      true,
    );
    expect(manager.consume(confirmationId, 'customer.create', payload)).toBe(
      false,
    );
  });

  it('rejects a confirmation when the action changes', () => {
    const manager = createConfirmationManager();
    const payload = { customer_id: 'customer-123' };

    const confirmationId = manager.create('customer.update', payload);

    expect(manager.consume(confirmationId, 'customer.delete', payload)).toBe(
      false,
    );
    expect(manager.consume(confirmationId, 'customer.update', payload)).toBe(
      true,
    );
  });

  it('rejects a confirmation when the payload changes', () => {
    const manager = createConfirmationManager();

    const confirmationId = manager.create('customer.update', {
      customer_id: 'customer-123',
      full_name: 'Original Name',
    });

    expect(
      manager.consume(confirmationId, 'customer.update', {
        customer_id: 'customer-123',
        full_name: 'Changed Name',
      }),
    ).toBe(false);

    expect(
      manager.consume(confirmationId, 'customer.update', {
        customer_id: 'customer-123',
        full_name: 'Original Name',
      }),
    ).toBe(true);
  });
});
