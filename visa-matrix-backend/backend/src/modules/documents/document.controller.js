import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  deleteDocumentRecord,
  getDocument,
  getDocuments,
  updateDocumentRecord,
  uploadDocumentRecord,
} from "./document.service.js";

export const listDocumentsController = asyncHandler(async (req, res) => {
  const data = await getDocuments(req.query);
  return sendSuccess(res, data);
});

export const getDocumentByIdController = asyncHandler(async (req, res) => {
  const data = await getDocument(req.params.id, req.auth);
  return sendSuccess(res, data);
});

export const uploadDocumentController = asyncHandler(async (req, res) => {
  const data = await uploadDocumentRecord({
    file: req.file,
    body: req.body,
    authContext: req.auth,
  });

  return sendCreated(res, data, "Document uploaded successfully.");
});

export const updateDocumentController = asyncHandler(async (req, res) => {
  const data = await updateDocumentRecord(req.params.id, req.body, req.auth);
  return sendSuccess(res, data, {
    message: "Document updated successfully.",
  });
});

export const deleteDocumentController = asyncHandler(async (req, res) => {
  const data = await deleteDocumentRecord(req.params.id, req.auth);
  return sendSuccess(res, data, {
    message: "Document deleted successfully.",
  });
});
