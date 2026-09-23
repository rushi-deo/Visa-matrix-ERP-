import { Router } from "express";
import { z } from "zod";
import {
  authenticateToken,
  authorizePermissions,
} from "../../middleware/rbac.middleware.js";
import { authenticateNexusService } from "../../middleware/nexusInternalAuth.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import { customerGetIntegrationController } from "./nexus.controller.js";

const router = Router();

const customerGetBodySchema = z
  .object({
    customerId: z.string().uuid(),
  })
  .strict();

router.post(
  "/customer.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("customers:view"),
  requestValidator({ body: customerGetBodySchema }),
  customerGetIntegrationController,
);


router.post(
  "/application.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("applications:view"),
  requestValidator({ body: applicationGetBodySchema }),
  applicationGetIntegrationController,
  applicationListIntegrationController,
  documentGetIntegrationController,
  documentListIntegrationController,
);

const applicationListBodySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    country_id: z.string().uuid().optional(),
    visa_type_id: z.string().uuid().optional(),
  })
  .strict();

router.post(
  "/application.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("applications:view"),
  requestValidator({ body: applicationListBodySchema }),
  applicationListIntegrationController,
  documentGetIntegrationController,
  documentListIntegrationController,
);

const documentGetBodySchema = z
  .object({
    documentId: z.string().uuid(),
  })
  .strict();

const documentListBodySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    application_id: z.string().uuid().optional(),
    customer_id: z.string().uuid().optional(),
  })
  .strict();

router.post(
  "/document.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("documents:view"),
  requestValidator({ body: documentGetBodySchema }),
  documentGetIntegrationController,
);

router.post(
  "/document.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("documents:view"),
  requestValidator({ body: documentListBodySchema }),
  documentListIntegrationController,
);
export default router;


