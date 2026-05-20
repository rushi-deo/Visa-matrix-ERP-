import { Router } from "express";
import {
  createTaskHandler,
  deleteTaskHandler,
  getTasks,
  updateTaskHandler,
} from "../controllers/taskController.js";

const router = Router();

router.get("/", getTasks);
router.post("/", createTaskHandler);
router.put("/:id", updateTaskHandler);
router.delete("/:id", deleteTaskHandler);

export default router;
