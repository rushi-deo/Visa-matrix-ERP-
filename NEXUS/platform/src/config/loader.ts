import type { ConfigSource } from './types.js';

export const loadEnvironment = (env: NodeJS.ProcessEnv = process.env): ConfigSource => ({
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  LOG_LEVEL: env.LOG_LEVEL,
  ...(env.OPENAI_API_KEY ? { OPENAI_API_KEY: env.OPENAI_API_KEY } : {}),
  ...(env.OPENAI_MODEL ? { OPENAI_MODEL: env.OPENAI_MODEL } : {}),
  ...(env.OPENAI_ORGANIZATION ? { OPENAI_ORGANIZATION: env.OPENAI_ORGANIZATION } : {}),
  ...(env.OPENAI_PROJECT ? { OPENAI_PROJECT: env.OPENAI_PROJECT } : {}),
  ...(env.ANTHROPIC_API_KEY ? { ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY } : {}),
  ...(env.ANTHROPIC_MODEL ? { ANTHROPIC_MODEL: env.ANTHROPIC_MODEL } : {}),
});
