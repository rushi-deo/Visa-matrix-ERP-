import { Router } from "express";
import {
  createVisaTypeHandler,
  deleteVisaTypeHandler,
  getVisaTypeByIdHandler,
  getVisaTypes,
  updateVisaTypeHandler,
} from "../controllers/visaTypeController.js";

const router = Router();

router.get("/", getVisaTypes);
router.get("/:id", getVisaTypeByIdHandler);
router.post("/", createVisaTypeHandler);
router.put("/:id", updateVisaTypeHandler);
router.delete("/:id", deleteVisaTypeHandler);

export default router;
