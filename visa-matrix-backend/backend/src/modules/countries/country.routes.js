import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../../middleware/auth.js";
import { authorize } from "../../middleware/rbac.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createCountryController,
  deleteCountryController,
  getCountryByIdController,
  listCountriesController,
  updateCountryController,
} from "./country.controller.js";

const router = Router();

const countryIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  search: z.string().optional(),
});

const countryBodySchema = z
  .object({
    country_name: z.string().min(2).max(100).optional(),
    country_code: z.string().min(2).max(10).optional(),
    region: z.string().min(2).max(100).optional(),
    processing_time: z.string().min(2).max(100).optional(),
    visa_required: z.boolean().optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

router.get(
  "/",
  requestValidator({ query: querySchema }),
  listCountriesController,
);
router.get(
  "/:id",
  requestValidator({ params: countryIdParamsSchema }),
  getCountryByIdController,
);
router.post(
  "/",
  authenticateUser,
  authorize("admin", "case_manager"),
  requestValidator({ body: countryBodySchema }),
  createCountryController,
);
router.put(
  "/:id",
  authenticateUser,
  authorize("admin", "case_manager"),
  requestValidator({
    params: countryIdParamsSchema,
    body: countryBodySchema,
  }),
  updateCountryController,
);
router.delete(
  "/:id",
  authenticateUser,
  authorize("admin"),
  requestValidator({ params: countryIdParamsSchema }),
  deleteCountryController,
);

export default router;
