import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  listDocuments,
  updateDocument,
} from "../services/documentService.js";
import {
  validatePayloadBody,
  validateResourceId,
} from "../validators/requestValidators.js";

export const getDocuments = asyncHandler(async (req, res) => {
  const data = await listDocuments(req.query);
  return sendSuccess(res, data);
});

export const createDocumentHandler = asyncHandler(async (req, res) => {
  const payload = validatePayloadBody(req.body);
  const data = await createDocument(payload, req.auth);
  return sendSuccess(res, data, 201);
});

export const getDocumentByIdHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await getDocumentById(id, req.auth);
  return sendSuccess(res, data);
});

export const updateDocumentHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const payload = validatePayloadBody(req.body);
  const data = await updateDocument(id, payload, req.auth);
  return sendSuccess(res, data);
});

export const deleteDocumentHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await deleteDocument(id, req.auth);
  return sendSuccess(res, data);
});
