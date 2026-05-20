import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../../middleware/authMiddleware.js";
import permissionMiddleware from "../../middleware/permissionMiddleware.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import { uploadSingleFile } from "../../utils/fileUpload.js";
import {
  deleteDocumentController,
  getDocumentByIdController,
  listDocumentsController,
  updateDocumentController,
  uploadDocumentController,
} from "./document.controller.js";

const router = Router();

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  applicationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

const uploadBodySchema = z.object({
  applicationId: z.string().uuid(),
  documentType: z.string().min(2).max(100).optional(),
  document_type: z.string().min(2).max(100).optional(),
});

const updateBodySchema = z
  .object({
    document_type: z.string().optional(),
    status: z.string().optional(),
    verification_status: z.string().optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

router.use(authMiddleware);

router.get(
  "/",
  permissionMiddleware("documents", "view"),
  requestValidator({ query: listQuerySchema }),
  listDocumentsController
);
router.get(
  "/:id",
  permissionMiddleware("documents", "view"),
  requestValidator({ params: paramsSchema }),
  getDocumentByIdController
);
router.post(
  "/upload",
  permissionMiddleware("documents", "upload"),
  uploadSingleFile.single("file"),
  requestValidator({ body: uploadBodySchema }),
  uploadDocumentController
);
router.put(
  "/:id",
  permissionMiddleware("documents", "upload"),
  requestValidator({ params: paramsSchema, body: updateBodySchema }),
  updateDocumentController
);
router.delete(
  "/:id",
  permissionMiddleware("documents", "delete"),
  requestValidator({ params: paramsSchema }),
  deleteDocumentController
);

export default router;
