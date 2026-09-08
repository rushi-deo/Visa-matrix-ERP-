import { Router } from 'express';

import { createHealthController } from './controller.js';
import type { HealthService } from './service.js';

export const createHealthRoutes = (healthService: HealthService): Router => {
  const router = Router();
  const controller = createHealthController(healthService);

  router.get('/health', controller.health);
  router.get('/ready', controller.ready);
  router.get('/live', controller.live);

  return router;
};
