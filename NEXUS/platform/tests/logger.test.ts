import { describe, expect, it, vi } from 'vitest';

import { createJsonLogger } from '../src/shared/logger.js';

describe('logger', () => {
  it('writes structured log entries', () => {
    const transport = vi.fn();
    const logger = createJsonLogger(transport);

    logger.info('platform.ready', { correlationId: 'corr-1', requestId: 'req-1' });

    expect(transport).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        message: 'platform.ready',
        correlationId: 'corr-1',
        requestId: 'req-1',
        context: {
          correlationId: 'corr-1',
          requestId: 'req-1',
        },
      }),
    );
  });
});
