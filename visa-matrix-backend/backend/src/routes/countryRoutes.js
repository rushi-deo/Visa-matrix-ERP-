import { Router } from "express";
import {
  createCountryHandler,
  deleteCountryHandler,
  getCountryByIdHandler,
  getCountries,
  updateCountryHandler,
} from "../controllers/countryController.js";

const router = Router();

router.get("/", getCountries);
router.get("/:id", getCountryByIdHandler);
router.post("/", createCountryHandler);
router.put("/:id", updateCountryHandler);
router.delete("/:id", deleteCountryHandler);

export default router;
