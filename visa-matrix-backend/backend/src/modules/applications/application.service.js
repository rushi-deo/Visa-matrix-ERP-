import { emitSystemNotification } from "../notifications/notification.service.js";
import { executeWorkflowForApplication } from "../workflows/workflow.service.js";
import logger from "../../core/logger.js";
import { createRollbackTransaction } from "../../core/transaction.js";
import { createInvoice } from "../../services/invoice.service.js";
import { generateQuotation } from "../../services/quotation.service.js";
import { eventPublisher } from "../../platform/events/index.js";
import { getCustomerById } from "../customers/customer.repository.js";
import { ForbiddenError } from "../../core/errors.js";
import {
  createApplication,
  deleteApplicationById,
  deleteApplication,
  getApplicationById,
  listApplications,
  updateApplication,
} from "./application.repository.js";
import {
  recordApplicationEvent,
  recordApplicationStatusHistory,
  recordAuditLog,
} from "./application.events.js";
import {
  APPLICATION_STATUSES,
  assertApplicationTransition,
  normalizeApplicationStatus,
} from "./application.stateMachine.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  getTenantOrganizationScope,
} from "../../utils/tenantSecurity.js";

const resolveApplicationStatus = (application) => {
  return application.status || application.application_status || APPLICATION_STATUSES.DRAFT;
};

export const getApplications = async (query = {}, authContext = {}) =>
  listApplications(query, getTenantOrganizationScope(authContext));
export const getApplication = async (id, authContext = {}) => {
  const application = await getApplicationById(
    id,
    getTenantOrganizationScope(authContext),
  );
  return assertTenantAccess(application, authContext, "application");
};

export const createApplicationRecord = async (payload, authContext = {}) => {
  const transaction = createRollbackTransaction();
  const nextPayload =
    payload.status || payload.application_status
      ? payload
      : {
          ...payload,
          status: APPLICATION_STATUSES.DRAFT,
        };
  const tenantPayload = applyTenantToPayload(nextPayload, authContext);

  if (tenantPayload.customer_id) {
    const customer = await getCustomerById(
      tenantPayload.customer_id,
      tenantPayload.organization_id,
    );
    assertTenantAccess(customer, authContext, "customer");
    if (customer.organization_id !== tenantPayload.organization_id) {
      throw new ForbiddenError("Application customer belongs to another organization.");
    }
  }

  let application;

  try {
    application = await createApplication(tenantPayload);
    try {
      eventPublisher.publish({
        module: "applications",
        action: "created",
        entityType: "application",
        entityId: application.id,
        actorId: authContext.userId || null,
        timestamp: new Date().toISOString(),
        metadata: {
          source: "application.service.createApplicationRecord",
          status: resolveApplicationStatus(application),
          tenantId: authContext.tenantId || null,
        },
      });
    } catch (eventError) {
      logger.error("Application creation event publish failed", {
        applicationId: application.id,
        error: eventError instanceof Error ? eventError.message : eventError,
      });
    }
    transaction.addRollback("delete_application", () =>
      deleteApplicationById(application.id)
    );

    await recordApplicationStatusHistory({
      applicationId: application.id,
      fromStatus: null,
      toStatus: resolveApplicationStatus(application),
      changedBy: authContext.userId || null,
      reason: "application_created",
    });

    await recordApplicationEvent({
      applicationId: application.id,
      eventType: "application_created",
      actorId: authContext.userId || null,
      title: "Application created",
      metadata: {
        status: resolveApplicationStatus(application),
      },
    });

    await recordAuditLog({
      actorId: authContext.userId || null,
      action: "create",
      entityType: "application",
      entityId: application.id,
      after: application, 
    });

    const quotation = await generateQuotation(application.id, authContext);
    const invoice = await createInvoice(quotation.id, authContext);

    await executeWorkflowForApplication({
      triggerKey: "application_created",
      application,
      authContext,
    });

    return {
      ...application,
      quotation,
      invoice,
    };
  } catch (error) {
    logger.error("Application creation flow failed", {
      applicationId: application?.id || null,
      error: error.message,
      details: error.details || null,
    });

    await transaction.rollback(error);
    throw error;
  }
};

export const updateApplicationRecord = async (id, payload, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const currentApplication = await getApplicationById(id, organizationId);
  assertTenantAccess(currentApplication, authContext, "application");
  if (payload.customer_id && payload.customer_id !== currentApplication.customer_id) {
    const customer = await getCustomerById(payload.customer_id, organizationId);
    assertTenantAccess(customer, authContext, "customer");
    if (String(customer.organization_id) !== String(currentApplication.organization_id)) {
      throw new ForbiddenError("Application customer belongs to another organization.");
    }
  }
  const previousStatus = resolveApplicationStatus(currentApplication);
  const requestedStatus = payload.status || payload.application_status;

  if (requestedStatus) {
    const { to } = assertApplicationTransition(previousStatus, requestedStatus);
    payload = {
      ...payload,
      status: to,
      application_status: to,
    };
  }

  const updatedApplication = await updateApplication(
    id,
    applyTenantToPayload({
      ...payload,
      organization_id: currentApplication.organization_id,
    }, authContext),
    organizationId,
  );
  const nextStatus = resolveApplicationStatus(updatedApplication);

  if (previousStatus !== nextStatus) {
    await recordApplicationStatusHistory({
      applicationId: id,
      fromStatus: normalizeApplicationStatus(previousStatus),
      toStatus: normalizeApplicationStatus(nextStatus),
      changedBy: authContext.userId || null,
      reason: payload.status_reason || null,
    });

    await recordApplicationEvent({
      applicationId: id,
      eventType: "status_changed",
      actorId: authContext.userId || null,
      title: "Application status changed",
      description: `Application changed from ${previousStatus} to ${nextStatus}.`,
      metadata: {
        previousStatus,
        nextStatus,
      },
    });

    await emitSystemNotification({
      userId: authContext.userId || null,
      applicationId: id,
      type: "application_status_updated",
      title: "Application status updated",
      message: `Application ${id} changed from ${previousStatus} to ${nextStatus}.`,
      metadata: {
        previousStatus,
        nextStatus,
      },
    });
  }

  await recordAuditLog({
    actorId: authContext.userId || null,
    action: "update",
    entityType: "application",
    entityId: id,
    before: currentApplication,
    after: updatedApplication,
  });

  return updatedApplication;
};

export const deleteApplicationRecord = async (id, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const currentApplication = await getApplicationById(id, organizationId);
  assertTenantAccess(currentApplication, authContext, "application");
  return deleteApplication(id, organizationId);
};
