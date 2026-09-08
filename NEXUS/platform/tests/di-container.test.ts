import { describe, expect, it } from 'vitest';

import { createContainer, createToken } from '../src/infrastructure/container/index.js';

describe('di container', () => {
  it('supports singleton and scoped resolution', () => {
    const container = createContainer();
    const singletonToken = createToken<{ id: number }>('singleton');
    const scopedToken = createToken<{ id: number }>('scoped');

    container.register(singletonToken, { lifetime: 'singleton', factory: () => ({ id: Math.random() }) });
    container.register(scopedToken, { lifetime: 'scoped', factory: () => ({ id: Math.random() }) });

    const first = container.resolve(singletonToken);
    const second = container.resolve(singletonToken);
    expect(first).toBe(second);

    const scope = container.createScope();
    expect(scope.resolve(scopedToken)).toBe(scope.resolve(scopedToken));
  });
});
