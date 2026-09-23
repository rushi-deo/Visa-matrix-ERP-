import { Router } from "express";
import { z } from "zod";
import {
  authenticateToken,
  authorizePermissions,
} from "../../middleware/rbac.middleware.js";
import { authenticateNexusService } from "../../middleware/nexusInternalAuth.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  customerGetIntegrationController,
  applicationGetIntegrationController,
  applicationListIntegrationController,
  documentGetIntegrationController,
  documentListIntegrationController,
  leadGetIntegrationController,
  leadListIntegrationController,
  countryListIntegrationController,
  visaTypeListIntegrationController,
  visaRequirementsGetIntegrationController,
  visaRulesGetIntegrationController,
  formListIntegrationController,
  formGetIntegrationController,
  formGetByCountryVisaIntegrationController,
} from "./nexus.controller.js";

const router = Router();

const customerGetBodySchema = z.object({
  customerId: z.string().uuid(),
}).strict();

const applicationGetBodySchema = z.object({
  applicationId: z.string().uuid(),
}).strict();

const applicationListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  country_id: z.string().uuid().optional(),
  visa_type_id: z.string().uuid().optional(),
}).strict();

const documentGetBodySchema = z.object({
  documentId: z.string().uuid(),
}).strict();

const documentListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  application_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
}).strict();

const leadGetBodySchema = z.object({
  leadId: z.string().uuid(),
}).strict();

const leadListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
}).strict();

const countryListBodySchema = z.object({}).strict();

const visaTypeListBodySchema = z.object({
  countryId: z.string().uuid(),
}).strict();

const visaRequirementsGetBodySchema = z.object({
  countryId: z.string().uuid(),
  visaTypeId: z.string().uuid(),
}).strict();

const visaRulesGetBodySchema = z.object({
  visaRuleId: z.string().uuid(),
}).strict();

const formGetBodySchema = z.object({
  formId: z.string().uuid(),
}).strict();

const formGetByCountryVisaBodySchema = z.object({
  countryId: z.string().uuid(),
  visaTypeId: z.string().uuid(),
}).strict();

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
);

router.post(
  "/application.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("applications:view"),
  requestValidator({ body: applicationListBodySchema }),
  applicationListIntegrationController,
);

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

router.post(
  "/lead.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("leads:view"),
  requestValidator({ body: leadGetBodySchema }),
  leadGetIntegrationController,
);

router.post(
  "/lead.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("leads:view"),
  requestValidator({ body: leadListBodySchema }),
  leadListIntegrationController,
);

router.post(
  "/country.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("countries:view"),
  requestValidator({ body: countryListBodySchema }),
  countryListIntegrationController,
);

router.post(
  "/visa-type.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("visa_types:view"),
  requestValidator({ body: visaTypeListBodySchema }),
  visaTypeListIntegrationController,
);

router.post(
  "/visa-requirements.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("visa_requirements:view"),
  requestValidator({ body: visaRequirementsGetBodySchema }),
  visaRequirementsGetIntegrationController,
);

router.post(
  "/visa-rules.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("visa_rules:view"),
  requestValidator({ body: visaRulesGetBodySchema }),
  visaRulesGetIntegrationController,
);

router.post(
  "/form.list",
  authenticateNexusService,
  authenticateToken,
  formListIntegrationController,
);

router.post(
  "/form.get",
  authenticateNexusService,
  authenticateToken,
  requestValidator({ body: formGetBodySchema }),
  formGetIntegrationController,
);

router.post(
  "/form.getByCountryVisa",
  authenticateNexusService,
  authenticateToken,
  requestValidator({ body: formGetByCountryVisaBodySchema }),
  formGetByCountryVisaIntegrationController,
);

export default router;
