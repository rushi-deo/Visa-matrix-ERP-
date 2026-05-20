import { Router } from "express";
import { createApplication } from "../controllers/application.controller";

const router = Router();

router.post("/", createApplication);

export default router;
