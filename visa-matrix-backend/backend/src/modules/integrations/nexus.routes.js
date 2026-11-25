import { workflowGetIntegrationController, workflowListIntegrationController } from "./nexus.controller.js";
import { paymentGetIntegrationController, paymentListIntegrationController, taskGetIntegrationController, taskListIntegrationController } from "./nexus.controller.js";
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
  customerListIntegrationController,
  customerCreateIntegrationController,
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
  invoiceGetIntegrationController,
  invoiceListIntegrationController,
} from "./nexus.controller.js";

const router = Router();

const customerCreateBodySchema = z
  .object({
    full_name: z.string().min(2).max(120),
    email: z.string().email().optional(),
    phone: z.string().min(6).max(30).optional(),
    passport_number: z.string().min(3).max(50).optional(),
    nationality: z.string().min(2).max(100).optional(),
  })
  .strict();
const customerGetBodySchema = z.object({
  customerId: z.string().uuid(),
}).strict();
const customerListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
}).strict();

const applicationGetBodySchema = z.object({
  applicationId: z.string().uuid(),
}).strict();

const applicationListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
  status: z.string().max(80).optional(),
  countryId: z.string().uuid().optional(),
  visaTypeId: z.string().uuid().optional(),
}).strict();

const documentGetBodySchema = z.object({
  documentId: z.string().uuid(),
}).strict();

const documentListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
  applicationId: z.string().uuid().optional(),
  status: z.string().max(80).optional(),
}).strict();

const leadGetBodySchema = z.object({
  leadId: z.string().uuid(),
}).strict();

const leadListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
  status: z.string().max(80).optional(),
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

const taskGetBodySchema = z.object({ taskId: z.string().uuid() }).strict();
const taskListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
  status: z.string().max(80).optional(),
  applicationId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
}).strict();

const workflowGetBodySchema = z.object({ workflowId: z.string().uuid() }).strict();
const workflowListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
  triggerKey: z.string().max(120).optional(),
  isActive: z.boolean().optional(),
}).strict();

const paymentGetBodySchema = z.object({ paymentId: z.string().uuid() }).strict();
const paymentListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
  applicationId: z.string().uuid().optional(),
  status: z.string().max(80).optional(),
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
}).strict();

const invoiceGetBodySchema = z.object({
  invoiceId: z.string().uuid(),
}).strict();

const invoiceListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
}).strict();
const formGetByCountryVisaBodySchema = z.object({
  countryId: z.string().uuid(),
  visaTypeId: z.string().uuid(),
}).strict();
const formListBodySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
  countryId: z.string().uuid().optional(),
  visaTypeId: z.string().uuid().optional(),
}).strict();

router.post(
  "/invoice.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("invoicing:view"),
  requestValidator({ body: invoiceGetBodySchema }),
  invoiceGetIntegrationController,
);

router.post(
  "/invoice.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("invoicing:view"),
  requestValidator({ body: invoiceListBodySchema }),
  invoiceListIntegrationController,
);
router.post(
  "/customer.create",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("customers:create"),
  requestValidator({ body: customerCreateBodySchema }),
  customerCreateIntegrationController,
);
router.post(
  "/customer.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("customers:view"),
  requestValidator({ body: customerListBodySchema }),
  customerListIntegrationController,
);

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
  authorizePermissions("forms:view"),
  requestValidator({ body: formListBodySchema }),
  formListIntegrationController,
);

router.post(
  "/form.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("forms:view"),
  requestValidator({ body: formGetBodySchema }),
  formGetIntegrationController,
);

router.post(
  "/form.getByCountryVisa",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("forms:view"),
  requestValidator({ body: formGetByCountryVisaBodySchema }),
  formGetByCountryVisaIntegrationController,
);


router.post(
  "/payment.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("payments:view"),
  requestValidator({ body: paymentGetBodySchema }),
  paymentGetIntegrationController,
);

router.post(
  "/payment.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("payments:view"),
  requestValidator({ body: paymentListBodySchema }),
  paymentListIntegrationController,
);
router.post(
  "/task.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("tasks:view"),
  requestValidator({ body: taskGetBodySchema }),
  taskGetIntegrationController,
);
router.post(
  "/task.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("tasks:view"),
  requestValidator({ body: taskListBodySchema }),
  taskListIntegrationController,
);
router.post(
  "/workflow.get",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("workflow:view"),
  requestValidator({ body: workflowGetBodySchema }),
  workflowGetIntegrationController,
);
router.post(
  "/workflow.list",
  authenticateNexusService,
  authenticateToken,
  authorizePermissions("workflow:view"),
  requestValidator({ body: workflowListBodySchema }),
  workflowListIntegrationController,
);

export default router;









