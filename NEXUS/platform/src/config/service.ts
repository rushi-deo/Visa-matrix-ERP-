import { loadEnvironment } from './loader.js';
import type { PlatformConfig } from './types.js';
import { validateConfig } from './validation.js';

export interface ConfigService {
  getConfig(): PlatformConfig;
}

export const createConfigService = (): ConfigService => ({
  getConfig: () => validateConfig(loadEnvironment()),
});

export const createPlatformConfig = (): PlatformConfig => createConfigService().getConfig();
