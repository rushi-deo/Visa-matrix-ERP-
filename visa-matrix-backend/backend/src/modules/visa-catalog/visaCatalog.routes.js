import { Router } from "express";
import {
  listCountriesController,
  listVisaRequirementsController,
  listVisaTypesController,
} from "./visaCatalog.controller.js";

const router = Router();

router.get("/countries", listCountriesController);
router.get("/visa-types", listVisaTypesController);
router.get("/visa-requirements", listVisaRequirementsController);

export default router;
