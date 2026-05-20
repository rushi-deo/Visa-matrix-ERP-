import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import {
  createDocumentHandler,
  deleteDocumentHandler,
  getDocumentByIdHandler,
  getDocuments,
  updateDocumentHandler,
} from "../controllers/documentController.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("documents", "view"),
  getDocuments
);
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("documents", "view"),
  getDocumentByIdHandler
);
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("documents", "upload"),
  createDocumentHandler
);
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("documents", "upload"),
  updateDocumentHandler
);
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("documents", "delete"),
  deleteDocumentHandler
);

export default router;
