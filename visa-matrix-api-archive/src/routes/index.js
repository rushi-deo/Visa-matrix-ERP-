import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import applicationsRoutes from '../modules/applications/applications.routes.js';
import countriesRoutes from '../modules/countries/countries.routes.js';
import quotationRoutes from './quotation.routes.js';
import visaController from '../modules/visa/visa.controller.js';

const router = Router();

router.use('/countries', countriesRoutes);
router.use('/auth', authRoutes);
router.use('/applications', applicationsRoutes);
router.use('/quotation', quotationRoutes);
router.get('/visa-types', visaController.getVisaTypes);

export default router;
