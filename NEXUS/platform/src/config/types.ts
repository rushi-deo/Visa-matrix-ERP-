export type RuntimeMode = 'development' | 'testing' | 'production';

export type PlatformConfig = Readonly<{
  nodeEnv: RuntimeMode;
  port: number;
  logLevel: string;
  openaiApiKey?: string;
  openaiModel?: string;
  openaiOrganization?: string;
  openaiProject?: string;
  anthropicApiKey?: string;
  anthropicModel?: string;
}>;

export type ConfigSource = Readonly<{
  NODE_ENV: string | undefined;
  PORT: string | undefined;
  LOG_LEVEL: string | undefined;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_ORGANIZATION?: string;
  OPENAI_PROJECT?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL?: string;
}>;
