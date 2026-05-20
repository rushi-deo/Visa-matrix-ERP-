import {
  createRecord,
  deleteRecord,
  fetchRecordById,
  listRecords,
  updateRecord,
} from "./baseService.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
} from "../utils/tenantSecurity.js";

export const listDocuments = async (queryParams) => {
  return listRecords("documents", queryParams, {
    select: "*",
    entityLabel: "Documents",
  });
};

export const getDocumentById = async (id, authContext = {}) => {
  const document = await fetchRecordById("documents", id, {
    select: "*",
    entityLabel: "Document",
  });

  return assertTenantAccess(document, authContext, "document");
};

export const createDocument = async (payload, authContext = {}) => {
  return createRecord("documents", applyTenantToPayload(payload, authContext), {
    select: "*",
    entityLabel: "Document",
  });
};

export const updateDocument = async (id, payload, authContext = {}) => {
  const document = await getDocumentById(id, authContext);
  assertTenantAccess(document, authContext, "document");

  return updateRecord("documents", id, applyTenantToPayload(payload, authContext), {
    select: "*",
    entityLabel: "Document",
  });
};

export const deleteDocument = async (id, authContext = {}) => {
  const document = await getDocumentById(id, authContext);
  assertTenantAccess(document, authContext, "document");

  const deletedDocument = await deleteRecord("documents", id, {
    select: "id",
    entityLabel: "Document",
  });

  return {
    id: deletedDocument.id,
  };
};
