import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export interface JsonStore<T> {
  read(): Promise<T | undefined>;
  write(value: T): Promise<void>;
}

const defaultRoot = join(process.cwd(), '.nexus-state');

const cache = new Map<string, unknown>();

export const createJsonStore = <T>(
  name: string,
  root: string = defaultRoot,
): JsonStore<T> => {
  const path = join(root, `${name}.json`);

  return {
    read: async () => {
      const cached = cache.get(path);

      if (cached !== undefined) {
        return cached as T;
      }

      try {
        const raw = await readFile(path, 'utf8');
        const value = JSON.parse(raw) as T;

        cache.set(path, value);

        return value;
      } catch {
        return undefined;
      }
    },

    write: async (value) => {
      await mkdir(dirname(path), { recursive: true });

      cache.set(path, value);

      await writeFile(
        path,
        JSON.stringify(value, null, 2),
        'utf8',
      );
    },
  };
};