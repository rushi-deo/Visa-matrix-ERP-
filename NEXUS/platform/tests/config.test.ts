import { afterEach, describe, expect, it } from 'vitest';

import { loadEnvironment, validateConfig } from '../src/config/index.js';

const originalEnv = process.env;

afterEach(() => {
  process.env = originalEnv;
});

describe('configuration', () => {
  it('loads environment variables', () => {
    process.env = { ...originalEnv, NODE_ENV: 'testing', PORT: '4100', LOG_LEVEL: 'debug', OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-test', ANTHROPIC_API_KEY: 'claude-key', ANTHROPIC_MODEL: 'claude-test' };

    expect(loadEnvironment()).toEqual({
      NODE_ENV: 'testing',
      PORT: '4100',
      LOG_LEVEL: 'debug',
      OPENAI_API_KEY: 'test-key',
      OPENAI_MODEL: 'gpt-test',
      ANTHROPIC_API_KEY: 'claude-key',
      ANTHROPIC_MODEL: 'claude-test',
    });
  });

  it('validates and normalizes configuration', () => {
    expect(validateConfig({ NODE_ENV: 'production', PORT: '8080', LOG_LEVEL: 'warn', OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-test', ANTHROPIC_API_KEY: 'claude-key', ANTHROPIC_MODEL: 'claude-test' })).toEqual({
      nodeEnv: 'production',
      port: 8080,
      logLevel: 'warn',
      openaiApiKey: 'test-key',
      openaiModel: 'gpt-test',
      anthropicApiKey: 'claude-key',
      anthropicModel: 'claude-test',
    });
  });

  it('rejects incomplete or malformed ERP configuration', () => {
    expect(() => validateConfig({
      NODE_ENV: 'testing',
      PORT: '8080',
      LOG_LEVEL: 'info',
      VISA_MATRIX_ERP_BASE_URL: 'http://erp.example.test',
    })).toThrowError('ERP connector requires both base URL and internal token');

    expect(() => validateConfig({
      NODE_ENV: 'testing',
      PORT: '8080',
      LOG_LEVEL: 'info',
      VISA_MATRIX_ERP_BASE_URL: 'not-a-url',
      NEXUS_INTERNAL_TOKEN: 'test-token',
    })).toThrowError('Invalid VISA_MATRIX_ERP_BASE_URL value');
  });
});
