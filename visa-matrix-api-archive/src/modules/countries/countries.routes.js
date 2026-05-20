import { Router } from 'express';

import countriesController from './countries.controller.js';

const router = Router();

router.get('/', countriesController.getCountries);
router.get('/:countryId/questions', countriesController.getCountryQuestions);

export default router;
