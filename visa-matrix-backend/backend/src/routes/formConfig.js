import { Router } from "express";
import { getFormConfig } from "../controllers/formConfigController.js";

const router = Router();

router.get("/", getFormConfig);

export default router;
