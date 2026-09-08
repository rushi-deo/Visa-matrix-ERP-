export interface TokenCounter {
  count(text: string): number;
}

export interface TokenBudget {
  limit: number;
}

export interface ContextBudget {
  limit: number;
}

export interface ExecutionBudget {
  limit: number;
}

export interface CostEstimator {
  estimate(tokens: number): number;
}

export const createTokenCounter = (): TokenCounter => ({
  count: (text) => text.trim().split(/\s+/).filter(Boolean).length,
});
