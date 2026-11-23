import { getWorkflow, getWorkflows } from "../workflows/workflow.service.js";
import { getPayment, getPayments } from "../payments/payment.service.js";
import { getTask, getTasks } from "../tasks/task.service.js";
import { recordAuditEvent, createAuditContext } from "../../core/audit.js";
import {
  AppError,
  asyncHandler,
  ForbiddenError,
  NotFoundError,
  RequestValidationError,
} from "../../core/errors.js";
import { createCustomerRecord, getCustomer } from "../customers/customer.service.js";
import { getForms, getForm, getFormByCountryVisa } from "../forms/forms.service.js";
import {
  getCountries as getVisaCatalogCountries,
  getVisaTypesByCountry,
  getVisaRequirements,
} from "../visa-catalog/visaCatalog.service.js";
import { getVisaRule } from "../visaRules/visaRule.service.js";
import { getInvoices, getInvoice } from "../invoices/invoice.service.js";
import { getApplication, getApplications } from "../applications/application.service.js";
import { getDocument, getDocuments } from "../documents/document.service.js";
import { getLead, getAllLeads } from "../leads/lead.service.js";
import { getCustomers } from "../customers/customer.service.js";

const SAFE_CUSTOMER_FIELDS = [
  "id",
  "full_name",
  "first_name",
  "middle_name",
  "last_name",
  "email",
  "phone",
  "nationality",
  "status",
  "country_id",
];

const toSafeCustomer = (customer) =>
  Object.fromEntries(
    SAFE_CUSTOMER_FIELDS.filter((field) => customer[field] !== undefined).map(
      (field) => [field, customer[field]],
    ),
  );

const auditCustomerRead = (req, resourceId, status, errorMessage = null) =>
  recordAuditEvent({
    action: "customer.read",
    correlationId: req.correlationId,
    context: createAuditContext(req),
    errorMessage,
    ipAddress: req.ip,
    organizationId: req.user?.organization_id || null,
    requestId: req.requestId,
    resourceId,
    resourceType: "customer",
    status,
    userAgent: req.get("user-agent") || null,
  });

const auditIntegrationRead = (req, action, resourceType, resourceId = null) =>
  recordAuditEvent({
    action,
    correlationId: req.correlationId,
    context: createAuditContext(req),
    ipAddress: req.ip,
    organizationId: req.user?.organization_id || null,
    requestId: req.requestId,
    resourceId,
    resourceType,
    status: "completed",
    userAgent: req.get("user-agent") || null,
  });

const toSafeIntegrationError = (error) => {
  if (error instanceof AppError && error.statusCode === 404) {
    return new NotFoundError("ERP resource not found.");
  }
  if (
    error instanceof NotFoundError ||
    error instanceof ForbiddenError ||
    error instanceof RequestValidationError
  ) {
    return error;
  }

  return new AppError("ERP integration request failed.", 500);
};

export const invoiceGetIntegrationController = asyncHandler(
  async (req, res) => {
    const { invoiceId } = req.body;

    try {
      const invoice = await getInvoice(invoiceId, req.user);

      await recordAuditEvent({
        action: "invoice.read",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceId: invoiceId,
        resourceType: "invoice",
        status: "completed",
        userAgent: req.get("user-agent") || null,
      });

      return res.status(200).json({
        success: true,
        data: invoice,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      await recordAuditEvent({
        action: "invoice.read",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        errorMessage:
          error instanceof Error ? error.message : "Invoice read failed.",
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceId: invoiceId,
        resourceType: "invoice",
        status: "failed",
        userAgent: req.get("user-agent") || null,
      }).catch(() => undefined);

      throw toSafeIntegrationError(error);
    }
  },
);

export const invoiceListIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const invoices = await getInvoices(req.body || {}, req.user);

      await recordAuditEvent({
        action: "invoice.list",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceType: "invoice",
        status: "completed",
        userAgent: req.get("user-agent") || null,
      });

      return res.status(200).json({
        success: true,
        data: invoices,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      await recordAuditEvent({
        action: "invoice.list",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        errorMessage:
          error instanceof Error ? error.message : "Invoice list failed.",
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceType: "invoice",
        status: "failed",
        userAgent: req.get("user-agent") || null,
      }).catch(() => undefined);

      throw toSafeIntegrationError(error);
    }
  },
);

export const customerGetIntegrationController = asyncHandler(
  async (req, res) => {
    const { customerId } = req.body;

    try {
      const customer = await getCustomer(customerId, req.user);
      await auditCustomerRead(req, customerId, "completed");

      return res.status(200).json({
        success: true,
        data: toSafeCustomer(customer),
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      await auditCustomerRead(
        req,
        customerId,
        "failed",
        error instanceof Error ? error.message : "Customer read failed.",
      ).catch(() => undefined);

      throw toSafeIntegrationError(error);
    }
  },
);

export const customerListIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const customers = await getCustomers(req.body || {}, req.user);
      await auditIntegrationRead(req, "customer.list", "customer");
      const data = Array.isArray(customers)
        ? customers.map(toSafeCustomer)
        : { ...customers, items: (customers.items || []).map(toSafeCustomer) };
      return res.status(200).json({
        success: true,
        data,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const customerCreateIntegrationController = asyncHandler(
  async (req, res) => {
    const payload = req.body || {};

    try {
      const customer = await createCustomerRecord(payload, req.user);

      await recordAuditEvent({
        action: "customer.create",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceType: "customer",
        resourceId: customer?.id || null,
        status: "completed",
        userAgent: req.get("user-agent") || null,
      }).catch(() => undefined);

      return res.status(201).json({
        success: true,
        data: toSafeCustomer(customer),
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      await recordAuditEvent({
        action: "customer.create",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        errorMessage:
          error instanceof Error ? error.message : "Customer creation failed.",
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceType: "customer",
        status: "failed",
        userAgent: req.get("user-agent") || null,
      }).catch(() => undefined);

      throw toSafeIntegrationError(error);
    }
  },
);
export const applicationGetIntegrationController = asyncHandler(
  async (req, res) => {
    const { applicationId } = req.body;

    try {
      const application = await getApplication(applicationId, req.user);

      await recordAuditEvent({
        action: "application.read",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceId: applicationId,
        resourceType: "application",
        status: "completed",
        userAgent: req.get("user-agent") || null,
      });

      return res.status(200).json({
        success: true,
        data: application,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      await recordAuditEvent({
        action: "application.read",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        errorMessage:
          error instanceof Error
            ? error.message
            : "Application read failed.",
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceId: applicationId,
        resourceType: "application",
        status: "failed",
        userAgent: req.get("user-agent") || null,
      }).catch(() => undefined);

      throw toSafeIntegrationError(error);
    }
  },
);

export const applicationListIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const applications = await getApplications(req.body || {}, req.user);

      await recordAuditEvent({
        action: "application.list",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceType: "application",
        status: "completed",
        userAgent: req.get("user-agent") || null,
      });

      return res.status(200).json({
        success: true,
        data: applications,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      await recordAuditEvent({
        action: "application.list",
        correlationId: req.correlationId,
        context: createAuditContext(req),
        errorMessage:
          error instanceof Error
            ? error.message
            : "Application list failed.",
        ipAddress: req.ip,
        organizationId: req.user?.organization_id || null,
        requestId: req.requestId,
        resourceType: "application",
        status: "failed",
        userAgent: req.get("user-agent") || null,
      }).catch(() => undefined);

      throw toSafeIntegrationError(error);
    }
  },
);

export const documentGetIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const document = await getDocument(req.body.documentId, req.user);
      await auditIntegrationRead(req, "document.read", "document", req.body.documentId);

      return res.status(200).json({
        success: true,
        data: document,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const documentListIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const documents = await getDocuments(req.body || {}, req.user);
      await auditIntegrationRead(req, "document.list", "document");

      return res.status(200).json({
        success: true,
        data: documents,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const leadGetIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const lead = await getLead(req.body.leadId, req.user);
      await auditIntegrationRead(req, "lead.read", "lead", req.body.leadId);

      return res.status(200).json({
        success: true,
        data: lead,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const leadListIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const leads = await getAllLeads(req.body || {}, req.user);
      await auditIntegrationRead(req, "lead.list", "lead");

      return res.status(200).json({
        success: true,
        data: leads,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const countryListIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const data = await getVisaCatalogCountries();

      return res.status(200).json({
        success: true,
        data,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const visaTypeListIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const data = await getVisaTypesByCountry(req.body.countryId);

      return res.status(200).json({
        success: true,
        data,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const visaRequirementsGetIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const data = await getVisaRequirements({
        countryId: req.body.countryId,
        visaTypeId: req.body.visaTypeId,
      });

      return res.status(200).json({
        success: true,
        data,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const visaRulesGetIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const data = await getVisaRule(req.body.visaRuleId);

      return res.status(200).json({
        success: true,
        data,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const formListIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const data = await getForms({ ...(req.body || {}), status: "published" });

      return res.status(200).json({
        success: true,
        data,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const formGetIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const data = await getForm(req.body.formId);
      if (data.status !== "published") throw new NotFoundError("Form not found.");

      return res.status(200).json({
        success: true,
        data,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const formGetByCountryVisaIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const data = await getFormByCountryVisa(
        req.body.countryId,
        req.body.visaTypeId,
      );

      return res.status(200).json({
        success: true,
        data,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);


export const paymentGetIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const { paymentId } = req.body;
      const payment = await getPayment(paymentId, req.user);
      await auditIntegrationRead(req, "payment.read", "payment", paymentId);
      return res.status(200).json({
        success: true,
        data: payment,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);

export const paymentListIntegrationController = asyncHandler(
  async (req, res) => {
    try {
      const payments = await getPayments(req.body || {}, req.user);
      await auditIntegrationRead(req, "payment.list", "payment");
      return res.status(200).json({
        success: true,
        data: payments,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    } catch (error) {
      throw toSafeIntegrationError(error);
    }
  },
);







export const taskGetIntegrationController = asyncHandler(async (req, res) => {
  try {
    const data = await getTask(req.body.taskId, req.user);
    await auditIntegrationRead(req, "task.read", "task", req.body.taskId);
    return res.status(200).json({
      success: true,
      data,
      requestId: req.requestId,
      correlationId: req.correlationId,
    });
  } catch (error) {
    throw toSafeIntegrationError(error);
  }
});

export const taskListIntegrationController = asyncHandler(async (req, res) => {
  try {
    const data = await getTasks(req.body || {}, req.user);
    await auditIntegrationRead(req, "task.list", "task");
    return res.status(200).json({
      success: true,
      data,
      requestId: req.requestId,
      correlationId: req.correlationId,
    });
  } catch (error) {
    throw toSafeIntegrationError(error);
  }
});

export const workflowGetIntegrationController = asyncHandler(async (req, res) => {
  try {
    const data = await getWorkflow(req.body.workflowId, req.user);
    await auditIntegrationRead(req, "workflow.read", "workflow", req.body.workflowId);
    return res.status(200).json({
      success: true,
      data,
      requestId: req.requestId,
      correlationId: req.correlationId,
    });
  } catch (error) {
    throw toSafeIntegrationError(error);
  }
});

export const workflowListIntegrationController = asyncHandler(async (req, res) => {
  try {
    const data = await getWorkflows(req.body || {}, req.user);
    await auditIntegrationRead(req, "workflow.list", "workflow");
    return res.status(200).json({
      success: true,
      data,
      requestId: req.requestId,
      correlationId: req.correlationId,
    });
  } catch (error) {
    throw toSafeIntegrationError(error);
  }
});

