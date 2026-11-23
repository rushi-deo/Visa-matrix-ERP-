import { RequestValidationError } from "../../core/errors.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  getTenantOrganizationScope,
} from "../../utils/tenantSecurity.js";
import {
  createLead,
  deleteLead,
  getLeadById,
  listLeads,
  updateLead,
} from "./lead.repository.js";

const sanitizeLeadPayload = (payload = {}) => {
  const data = {
    ...payload,
    full_name: payload.full_name?.trim(),
    email: payload.email?.trim().toLowerCase(),
    phone: payload.phone?.trim(),
  };

  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );
};

export const getAllLeads = async (query = {}, authContext = {}) =>
  listLeads(query, getTenantOrganizationScope(authContext));

export const getLead = async (id, authContext = {}) => {
  const lead = await getLeadById(id, getTenantOrganizationScope(authContext));
  return assertTenantAccess(lead, authContext, "lead");
};

export const createLeadRecord = async (payload, authContext = {}) => {
  const lead = sanitizeLeadPayload(payload);

  if (!lead.full_name) {
    throw new RequestValidationError("Lead name is required.");
  }

  return createLead(applyTenantToPayload(lead, authContext));
};

export const updateLeadRecord = async (id, payload, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const currentLead = await getLeadById(id, organizationId);
  assertTenantAccess(currentLead, authContext, "lead");
  return updateLead(
    id,
    applyTenantToPayload({
      ...sanitizeLeadPayload(payload),
      organization_id: currentLead.organization_id,
    }, authContext),
    organizationId,
  );
};

export const deleteLeadRecord = async (id, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const currentLead = await getLeadById(id, organizationId);
  assertTenantAccess(currentLead, authContext, "lead");
  return deleteLead(id, organizationId);
};
