import { Router } from 'express';

import quotationController from '../controllers/quotation.controller.js';

const router = Router();

router.post('/create', quotationController.createQuotation);

export default router;
