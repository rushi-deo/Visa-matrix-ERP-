import { Router } from 'express';
import applicationsController from './applications.controller.js';

const router = Router();

router.get('/', applicationsController.getApplications);

export default router;
