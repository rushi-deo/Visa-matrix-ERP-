import type { Request, Response } from 'express';

import { matchResult } from '../../shared/result.js';
import type { HealthService } from './service.js';

export const createHealthController = (healthService: HealthService) => ({
  health: (_request: Request, response: Response) => {
    const result = healthService.getHealth();
    return matchResult(result, {
      success: (value) => response.status(200).json(value),
      failure: (error) => response.status(503).json({ error }),
    });
  },
  ready: (_request: Request, response: Response) => {
    const result = healthService.getReadiness();
    return matchResult(result, {
      success: (value) => response.status(200).json(value),
      failure: (error) => response.status(503).json({ error }),
    });
  },
  live: (_request: Request, response: Response) => {
    const result = healthService.getLiveness();
    return matchResult(result, {
      success: (value) => response.status(200).json(value),
      failure: (error) => response.status(503).json({ error }),
    });
  },
});
