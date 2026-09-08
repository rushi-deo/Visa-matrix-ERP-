import { describe, expect, it } from 'vitest';

import type { SearchFramework } from '../src/knowledge/search.js';

describe('search framework', () => {
  it('exposes generic search contracts', () => {
    const searchFramework: SearchFramework = {
      search: async () => ({ items: [], ranking: [] }),
    };

    expect(searchFramework.search).toBeTypeOf('function');
  });
});
