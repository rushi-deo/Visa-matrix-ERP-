export type PluginType = 'engine' | 'integration' | 'storage' | 'transport' | 'ai-provider' | 'tool';

export type PluginManifest = Readonly<{
  name: string;
  version: string;
  type: PluginType;
  dependencies: readonly string[];
}>;

export interface Plugin {
  readonly manifest: PluginManifest;
  install(): Promise<void>;
  enable(): Promise<void>;
  disable(): Promise<void>;
  unload(): Promise<void>;
  update(): Promise<void>;
}
