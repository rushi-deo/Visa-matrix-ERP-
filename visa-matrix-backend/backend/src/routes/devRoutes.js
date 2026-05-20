import { Router } from "express";
import { testDatabaseHandler } from "../controllers/devController.js";

const router = Router();

router.get("/test-db", testDatabaseHandler);

export default router;
