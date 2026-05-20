import { Router } from "express";
import {
  createWorkflowHandler,
  getWorkflows,
  updateWorkflowHandler,
} from "../controllers/workflowController.js";

const router = Router();

router.get("/", getWorkflows);
router.post("/", createWorkflowHandler);
router.put("/:id", updateWorkflowHandler);

export default router;
