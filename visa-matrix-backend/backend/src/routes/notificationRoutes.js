import { Router } from "express";
import {
  createNotificationHandler,
  getNotifications,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/", getNotifications);
router.post("/", createNotificationHandler);

export default router;
