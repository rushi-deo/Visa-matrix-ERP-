import type {
  AIProvider,
  ModelDefinition,
  ProviderConfiguration,
  ProviderHealth,
  ProviderMetrics,
  ProviderRequest,
  ProviderResponse,
} from './types.js';

export type OpenAIAuthentication = Readonly<{
  apiKey: string;
  organization?: string;
  project?: string;
  model?: string;
}>;

export type OpenAIModelDiscovery = Readonly<{
  models: readonly ModelDefinition[];
}>;

export type OpenAIStreamChunk = Readonly<{
  content?: string;
  done?: boolean;
}>;

export type OpenAIErrorMapping = Readonly<{
  code: string;
  status: number;
}>;

export interface OpenAIProvider extends AIProvider {
  authenticate(): Promise<boolean>;
  discoverModels(): Promise<OpenAIModelDiscovery>;
  stream(request: ProviderRequest): AsyncIterable<OpenAIStreamChunk>;
  complete(request: ProviderRequest): Promise<ProviderResponse>;
  setFallbackHook(hook: (error: unknown) => void): void;
}

export interface OpenAIProviderRuntime {
  provider: OpenAIProvider;
}

const normalizeResponse = (response: unknown): ProviderResponse => {
  if (typeof response !== 'object' || response === null || !('output' in response)) {
    return { ok: true, output: '' };
  }

  const output = (response as { output: unknown }).output;
  if (typeof output === 'string') {
    return { ok: true, output };
  }

  if (Array.isArray(output)) {
    const text = output.flatMap((item) => {
      if (typeof item !== 'object' || item === null || !('content' in item)) {
        return [];
      }

      const content = (item as { content: unknown }).content;
      if (!Array.isArray(content)) {
        return [];
      }

      return content.flatMap((part) => {
        if (typeof part === 'object' && part !== null && 'text' in part && typeof part.text === 'string') {
          return [part.text];
        }
        return [];
      });
    }).join('');
    return { ok: true, output: text };
  }

  return { ok: true, output: '' };
};

export const createOpenAIProviderRuntime = (
  configuration: ProviderConfiguration,
  auth: OpenAIAuthentication,
  fetchImpl: typeof fetch = fetch,
): OpenAIProviderRuntime => {
  let fallbackHook: ((error: unknown) => void) | undefined;
  let requestCount = 0;
  let errorCount = 0;

  const request = async (input: ProviderRequest): Promise<ProviderResponse> => {
    requestCount += 1;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetchImpl('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.apiKey}`,
          'Content-Type': 'application/json',
          ...(auth.organization ? { 'OpenAI-Organization': auth.organization } : {}),
          ...(auth.project ? { 'OpenAI-Project': auth.project } : {}),
        },
        body: JSON.stringify({
          model: auth.model ?? 'gpt-4o-mini',
          input: input.input,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        errorCount += 1;
        const mapped: OpenAIErrorMapping = { code: `HTTP_${response.status}`, status: response.status };
        throw Object.assign(new Error(`OpenAI request failed: ${mapped.code}`), mapped);
      }

      return normalizeResponse(await response.json());
    } catch (error) {
      errorCount += 1;
      fallbackHook?.(error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };

  const provider: OpenAIProvider = {
    name: 'openai',
    configuration,
    authenticate: async () => Boolean(auth.apiKey),
    discoverModels: async () => ({ models: [] }),
    request,
    stream: async function* (_request: ProviderRequest): AsyncIterable<OpenAIStreamChunk> {
      yield { content: '' };
      yield { done: true };
    },
    complete: request,
    health: async (): Promise<ProviderHealth> => ({ ok: Boolean(auth.apiKey) }),
    metrics: async (): Promise<ProviderMetrics> => ({ requests: requestCount, errors: errorCount }),
    setFallbackHook: (hook) => {
      fallbackHook = hook;
    },
  };

  return { provider };
};
