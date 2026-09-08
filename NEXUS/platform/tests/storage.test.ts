import { describe, expect, it } from 'vitest';

import type { BlobStorage, StorageProvider } from '../src/storage/index.js';

describe('storage', () => {
  it('exposes storage abstraction contracts', () => {
    const storage: StorageProvider & BlobStorage = { name: 'blob' };

    expect(storage.name).toBe('blob');
  });
});
