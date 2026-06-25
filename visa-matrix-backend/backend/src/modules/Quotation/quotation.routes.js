import { Router } from "express";
import {
  listQuotations,
  getQuotationById,
  createQuotation,
} from "./quotation.controller.js";

const router = Router();

router.get("/", listQuotations);
router.get("/:id", getQuotationById);
router.post("/", createQuotation);

export default router;