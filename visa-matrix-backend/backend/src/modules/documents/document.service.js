import {
  buildStoragePath,
  removeStoredFile,
  uploadBufferToStorage,
} from "../../utils/fileUpload.js";
import { RequestValidationError } from "../../core/errors.js";
import { emitSystemNotification } from "../notifications/notification.service.js";
import { getApplicationById } from "../applications/application.repository.js";
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
} from "../../utils/tenantSecurity.js";

export const getDocuments = async (query) => listDocuments(query);
export const getDocument = async (id, authContext = {}) => {
  const document = await getDocumentById(id);
  return assertTenantAccess(document, authContext, "document");
};

export const uploadDocumentRecord = async ({ file, body, authContext }) => {
  if (!file) {
    throw new RequestValidationError("A file upload is required.");
  }

  if (!body.applicationId) {
    throw new RequestValidationError("applicationId is required.");
  }

  const application = await getApplicationById(body.applicationId);
  assertTenantAccess(application, authContext, "application");

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
    file_url: uploadedFile.publicUrl,
    storage_path: uploadedFile.storagePath,
    mime_type: file.mimetype,
    size_bytes: file.size,
    uploaded_by: authContext.userId || null,
    status: "uploaded",
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

  return document;
};

export const updateDocumentRecord = async (id, payload, authContext = {}) => {
  const document = await getDocumentById(id);
  assertTenantAccess(document, authContext, "document");
  return updateDocument(id, applyTenantToPayload(payload, authContext));
};

export const deleteDocumentRecord = async (id, authContext = {}) => {
  const document = await getDocumentById(id);
  assertTenantAccess(document, authContext, "document");

  if (document.storage_path) {
    await removeStoredFile(document.storage_path).catch(() => null);
  }

  return deleteDocument(id);
};
