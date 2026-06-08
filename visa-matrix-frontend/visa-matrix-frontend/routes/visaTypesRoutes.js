import express from "express";
import { getVisaTypesHandler } from "../controllers/visaTypesController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/visa-types", asyncHandler(getVisaTypesHandler));

export default router;
