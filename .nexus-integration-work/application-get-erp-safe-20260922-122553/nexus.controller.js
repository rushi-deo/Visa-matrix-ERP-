import { recordAuditEvent, createAuditContext } from "../../core/audit.js";
import {
  AppError,
  asyncHandler,
  ForbiddenError,
  NotFoundError,
  RequestValidationError,
} from "../../core/errors.js";
import { getCustomer } from "../customers/customer.service.js";

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

const toSafeIntegrationError = (error) => {
  if (
    error instanceof NotFoundError ||
    error instanceof ForbiddenError ||
    error instanceof RequestValidationError
  ) {
    return error;
  }

  return new AppError("Customer integration request failed.", 500);
};

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