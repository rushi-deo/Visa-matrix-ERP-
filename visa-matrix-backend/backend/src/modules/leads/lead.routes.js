import { Router } from "express";

import {
  listLeadsController,
  getLeadController,
  createLeadController,
  updateLeadController,
  deleteLeadController,
} from "./lead.controller.js";

const router = Router();

router.get("/", listLeadsController);
router.get("/:id", getLeadController);
router.post("/", createLeadController);
router.put("/:id", updateLeadController);
router.delete("/:id", deleteLeadController);

export default router;