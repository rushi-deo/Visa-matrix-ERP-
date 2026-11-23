import {
  buildStoragePath,
  createSignedStorageUrl,
  removeStoredFile,
  uploadBufferToStorage,
} from "../../utils/fileUpload.js";
import { ForbiddenError, RequestValidationError } from "../../core/errors.js";
import { emitSystemNotification } from "../notifications/notification.service.js";
import { getApplication } from "../applications/application.service.js";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  listDocuments,
  updateDocument,
} from "./document.repository.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  getTenantOrganizationScope,
} from "../../utils/tenantSecurity.js";

const withAuthorizedSignedUrl = async (document, authContext) => {
  assertTenantAccess(document, authContext, "document");
  if (!document.application_id) {
    throw new ForbiddenError("Document application ownership is required.");
  }
  const application = await getApplication(document.application_id, authContext);
  if (String(application.organization_id) !== String(document.organization_id)) {
    throw new ForbiddenError("Document organization does not match its application.");
  }
  const signedUrl = document.storage_path
    ? await createSignedStorageUrl(document.storage_path)
    : null;
  return { ...document, file_url: signedUrl, signed_url: signedUrl };
};

export const getDocuments = async (query = {}, authContext = {}) => {
  const documents = await listDocuments(
    query,
    getTenantOrganizationScope(authContext),
  );
  const items = await Promise.all((documents.items || []).map(async (document) => {
    return withAuthorizedSignedUrl(document, authContext);
  }));
  return { ...documents, items };
};
export const getDocument = async (id, authContext = {}) => {
  const document = await getDocumentById(
    id,
    getTenantOrganizationScope(authContext),
  );
  return withAuthorizedSignedUrl(document, authContext);
};

export const uploadDocumentRecord = async ({ file, body, authContext }) => {
  if (!file) {
    throw new RequestValidationError("A file upload is required.");
  }

  if (!body.applicationId) {
    throw new RequestValidationError("applicationId is required.");
  }

  const application = await getApplication(body.applicationId, authContext);

  const storagePath = buildStoragePath({
    applicationId: body.applicationId,
    originalName: file.originalname,
  });

  const uploadedFile = await uploadBufferToStorage({
    buffer: file.buffer,
    contentType: file.mimetype,
    storagePath,
  });

  const document = await createDocument(applyTenantToPayload({
    application_id: body.applicationId,
    document_type: body.documentType || body.document_type || null,
    file_name: file.originalname,
    file_url: `storage://${uploadedFile.storagePath}`,
    storage_path: uploadedFile.storagePath,
    mime_type: file.mimetype,
    size_bytes: file.size,
    uploaded_by: authContext.userId || null,
    status: "uploaded",
    organization_id: application.organization_id,
  }, authContext));

  await emitSystemNotification({
    userId: authContext.userId || null,
    applicationId: body.applicationId,
    type: "document_uploaded",
    title: "Document uploaded",
    message: `A document was uploaded for application ${body.applicationId}.`,
    metadata: {
      documentId: document.id,
      fileName: file.originalname,
    },
  }).catch(() => null);

  return withAuthorizedSignedUrl(document, authContext);
};

export const updateDocumentRecord = async (id, payload, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const document = await getDocumentById(id, organizationId);
  assertTenantAccess(document, authContext, "document");
  if (!document.application_id) {
    throw new ForbiddenError("Document application ownership is required.");
  }
  const application = await getApplication(document.application_id, authContext);
  if (String(application.organization_id) !== String(document.organization_id)) {
    throw new ForbiddenError("Document organization does not match its application.");
  }
  if (payload.application_id !== undefined && payload.application_id !== document.application_id) {
    if (!payload.application_id) {
      throw new ForbiddenError("A document must remain linked to an authorized application.");
    }
    const nextApplication = await getApplication(payload.application_id, authContext);
    if (String(nextApplication.organization_id) !== String(document.organization_id)) {
      throw new ForbiddenError("Document application must belong to the document organization.");
    }
  }
  const updated = await updateDocument(
    id,
    applyTenantToPayload({
      ...payload,
      organization_id: document.organization_id,
    }, authContext),
    organizationId,
  );
  return withAuthorizedSignedUrl(updated);
};

export const deleteDocumentRecord = async (id, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const document = await getDocumentById(id, organizationId);
  assertTenantAccess(document, authContext, "document");
  if (!document.application_id) {
    throw new ForbiddenError("Document application ownership is required.");
  }
  const application = await getApplication(document.application_id, authContext);
  if (String(application.organization_id) !== String(document.organization_id)) {
    throw new ForbiddenError("Document organization does not match its application.");
  }

  if (document.storage_path) {
    await removeStoredFile(document.storage_path).catch(() => null);
  }

  return deleteDocument(id, organizationId);
};
