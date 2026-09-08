import { type Result,success } from '../../shared/result.js';

export type HealthResponse = Readonly<{
  status: 'healthy';
  timestamp: string;
}>;

export interface HealthService {
  getHealth(): Result<HealthResponse>;
  getReadiness(): Result<HealthResponse>;
  getLiveness(): Result<HealthResponse>;
}

export const createHealthService = (): HealthService => {
  const buildResponse = (): Result<HealthResponse> =>
    success({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });

  return {
    getHealth: buildResponse,
    getReadiness: buildResponse,
    getLiveness: buildResponse,
  };
};
