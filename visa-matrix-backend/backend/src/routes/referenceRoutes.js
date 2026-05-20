import { Router } from "express";
import { searchReferenceHandler } from "../controllers/referenceController.js";

const router = Router();

router.get("/search", searchReferenceHandler);

export default router;
