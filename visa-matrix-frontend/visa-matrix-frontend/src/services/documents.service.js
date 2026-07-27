import apiClient, { extractResponseData } from "./apiClient";

export const fallbackChecklistCatalog = [];
export const fallbackVisaDocumentChecklists = [];

const normalizeDocument = (document = {}) => ({
  ...document,
  id: document.id ?? document.document_id ?? "",
  documentName:
    document.documentName ??
    document.document_name ??
    document.document_type ??
    document.document_type_name ??
    document.type ??
    "Document",
  applicationId:
    document.applicationId ??
    document.application_id ??
    "",
  uploadedBy:
    document.uploadedBy ??
    document.uploaded_by ??
    "Operations Team",
  uploadDate:
    document.uploadDate ??
    document.upload_date ??
    document.uploaded_at ??
    "",
  fileName:
    document.fileName ??
    document.file_name ??
    "",
  fileType:
    document.fileType ??
    document.file_type ??
    "",
  url:
    document.url ??
    document.file_url ??
    document.download_url ??
    "",
});

export async function fetchDocuments(options = {}) {
  try {
    const applicationId =
      typeof options === "object"
        ? options.applicationId
        : options;

    const response = await apiClient.get("/documents", {
      params: applicationId
        ? { applicationId }
        : {},
    });

    const payload = extractResponseData(response);

    const documents = Array.isArray(payload)
      ? payload
      : payload?.data ?? [];

    return documents.map(normalizeDocument);
  } catch (error) {
    console.error("Documents fetch error:", error);
    return [];
  }
}

export async function uploadDocuments({
  applicationId,
  documentName,
  uploadedBy,
  files = [],
}) {
  const uploaded = [];

  for (const file of files) {
    const formData = new FormData();

    formData.append("applicationId", applicationId);
    formData.append("documentType", documentName);
    formData.append("file", file);

    const response = await apiClient.post(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    uploaded.push(
      normalizeDocument(extractResponseData(response))
    );
  }

  return uploaded;
}

export async function updateDocument(id, payload) {
  const response = await apiClient.put(
    `/documents/${id}`,
    payload
  );

  return normalizeDocument(extractResponseData(response));
}

export async function deleteDocument(id) {
  await apiClient.delete(`/documents/${id}`);

  return true;
}