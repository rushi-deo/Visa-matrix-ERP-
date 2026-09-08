export type InferencePipeline = Readonly<{
  stages: readonly string[];
}>;

export type ExecutionContext = Readonly<{
  requestId: string;
}>;

export type DecisionContext = Readonly<{
  requestId: string;
}>;

export type Recommendation = Readonly<{
  value: string;
}>;

export type Prediction = Readonly<{
  value: string;
}>;

export type ConfidenceScore = Readonly<{
  value: number;
}>;

export type ExplainabilityReport = Readonly<{
  summary: string;
}>;

export interface IntelligenceEngine {
  infer(context: ExecutionContext): Promise<void>;
}

export interface IntelligenceManager {
  register(name: string, engine: IntelligenceEngine): void;
  get(name: string): IntelligenceEngine | undefined;
}
