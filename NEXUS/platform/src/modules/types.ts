export type ModuleVersion = string;

export type ModuleMetadata = Readonly<{
  name: string;
  version: ModuleVersion;
  dependencies: readonly string[];
  capabilities: readonly string[];
}>;

export interface PlatformModule {
  readonly metadata: ModuleMetadata;
  install(): Promise<void>;
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  unload(): Promise<void>;
}
