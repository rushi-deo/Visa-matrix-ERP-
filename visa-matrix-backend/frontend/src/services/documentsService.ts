import { requestWithFallback } from "../api/apiClient";
import type { DocumentUploadPayload } from "../types";

export async function uploadDocument({
  applicationId,
  documentName,
  file,
}: DocumentUploadPayload) {
  const formData = new FormData();
  formData.append("application_id", applicationId);
  formData.append("document_name", documentName);
  formData.append("file", file);

  const response = await requestWithFallback<Record<string, unknown>>({
    method: "POST",
    url: "/documents/upload",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
