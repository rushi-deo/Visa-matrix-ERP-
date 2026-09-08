export type DeploymentProfile = Readonly<{
  name: string;
  environment: 'development' | 'testing' | 'staging' | 'production';
}>;

export type EnvironmentProfile = Readonly<{
  name: string;
  variables: Readonly<Record<string, string>>;
}>;

export type HealthCheck = Readonly<{
  name: string;
}>;

export type ReadinessCheck = Readonly<{
  name: string;
}>;

export type LivenessCheck = Readonly<{
  name: string;
}>;

export type FeatureFlags = Readonly<Record<string, boolean>>;
