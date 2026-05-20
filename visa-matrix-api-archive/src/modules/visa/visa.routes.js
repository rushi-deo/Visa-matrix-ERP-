import { Router } from 'express';

import visaController from './visa.controller.js';

const router = Router();

router.get('/countries', visaController.getCountries);
router.post('/countries', visaController.createCountry);

router.get('/visa-types', visaController.getVisaTypes);
router.post('/visa-types', visaController.createVisaType);

router.get('/requirements', visaController.getRequirements);
router.post('/requirements', visaController.createRequirement);

export default router;
