import { Router } from "express";
import multer from "multer";
import env from "../../config/env.js";
import { z } from "zod";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createFormController,
  deleteFormController,
  importFormsController,
  getFormByCountryVisaController,
  getFormByIdController,
  listFormsController,
  publishFormController,
  updateFormController,
} from "./forms.controller.js";

const router = Router();

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const countryVisaParamsSchema = z.object({
  countryId: z.string().uuid(),
  visaTypeId: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const jsonValueSchema = z
  .unknown()
  .refine((value) => {
    if (value === null) {
      return true;
    }

    const type = typeof value;
    return (
      type === "string" ||
      type === "number" ||
      type === "boolean" ||
      Array.isArray(value) ||
      Object.prototype.toString.call(value) === "[object Object]"
    );
  }, "form_schema must be valid JSON.");

const bodySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    version: z.coerce.number().int().positive().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    country_id: z.string().uuid().optional(),
    visa_type_id: z.string().uuid().optional(),
    form_schema: jsonValueSchema.optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploadsMaxFileSizeBytes,
  },
});

router.get(
  "/",
  requestValidator({ query: querySchema }),
  listFormsController,
);

router.get(
  "/country/:countryId/visa-type/:visaTypeId",
  requestValidator({ params: countryVisaParamsSchema }),
  getFormByCountryVisaController,
);

router.get(
  "/:id",
  requestValidator({ params: paramsSchema }),
  getFormByIdController,
);

router.post(
  "/",
  requestValidator({ body: bodySchema }),
  createFormController,
);

router.post(
  "/import",
  importUpload.any(),
  importFormsController,
);

router.put(
  "/:id",
  requestValidator({ params: paramsSchema, body: bodySchema }),
  updateFormController,
);

router.delete(
  "/:id",
  requestValidator({ params: paramsSchema }),
  deleteFormController,
);

router.post(
  "/:id/publish",
  requestValidator({ params: paramsSchema }),
  publishFormController,
);

export default router;
