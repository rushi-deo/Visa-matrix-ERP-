import { describe, expect, it } from 'vitest';

import { createNotificationManager } from '../src/communication/index.js';

describe('communication', () => {
  it('sends notifications through the framework contract', async () => {
    await expect(createNotificationManager().send({ name: 'notice', body: 'hello' })).resolves.toEqual({
      ok: true,
    });
  });
});
