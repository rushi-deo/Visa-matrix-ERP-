import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from "./task.repository.js";
import { getApplication } from "../applications/application.service.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  getTenantOrganizationScope,
} from "../../utils/tenantSecurity.js";
import { ForbiddenError } from "../../core/errors.js";

const assertTaskApplicationOwnership = async (task, authContext) => {
  assertTenantAccess(task, authContext, "task");
  if (task.application_id) {
    const application = await getApplication(task.application_id, authContext);
    if (String(application.organization_id) !== String(task.organization_id)) {
      throw new ForbiddenError("Task organization does not match its application.");
    }
  }
  return task;
};

export const getTasks = async (query = {}, authContext = {}) => {
  const result = await listTasks(query, getTenantOrganizationScope(authContext));
  const items = await Promise.all((result.items || []).map((task) =>
    assertTaskApplicationOwnership(task, authContext),
  ));
  return { ...result, items };
};
export const getTask = async (id, authContext = {}) => {
  const task = await getTaskById(id, getTenantOrganizationScope(authContext));
  return assertTaskApplicationOwnership(task, authContext);
};
export const createTaskRecord = async (payload, authContext = {}) => {
  const nextPayload =
    payload.status || payload.task_status
      ? payload
      : {
          ...payload,
          status: "open",
        };

  let organizationId = nextPayload.organization_id;
  if (nextPayload.application_id) {
    const application = await getApplication(nextPayload.application_id, authContext);
    organizationId = application.organization_id;
  }
  return createTask(applyTenantToPayload({
    ...nextPayload,
    ...(organizationId ? { organization_id: organizationId } : {}),
  }, authContext));
};
export const updateTaskRecord = async (id, payload, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const current = await getTaskById(id, organizationId);
  await assertTaskApplicationOwnership(current, authContext);
  if (payload.application_id) {
    const application = await getApplication(payload.application_id, authContext);
    if (application.organization_id !== current.organization_id) {
      throw new ForbiddenError("Task application must belong to the task organization.");
    }
  }
  return updateTask(id, applyTenantToPayload({
    ...payload,
    organization_id: current.organization_id,
  }, authContext), organizationId);
};
export const deleteTaskRecord = async (id, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const current = await getTaskById(id, organizationId);
  await assertTaskApplicationOwnership(current, authContext);
  return deleteTask(id, organizationId);
};
