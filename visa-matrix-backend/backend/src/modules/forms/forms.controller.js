import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createFormRecord,
  deleteFormRecord,
  importFormsRecord,
  getForm,
  getFormByCountryVisa,
  getForms,
  publishFormRecord,
  updateFormRecord,
} from "./forms.service.js";

export const listFormsController = asyncHandler(async (req, res) => {
  const data = await getForms(req.query);
  return sendSuccess(res, data);
});

export const getFormByIdController = asyncHandler(async (req, res) => {
  const data = await getForm(req.params.id);
  return sendSuccess(res, data);
});

export const getFormByCountryVisaController = asyncHandler(async (req, res) => {
  const data = await getFormByCountryVisa(req.params.countryId, req.params.visaTypeId);
  return sendSuccess(res, data);
});

export const createFormController = asyncHandler(async (req, res) => {
  const data = await createFormRecord(req.body);
  return sendCreated(res, data, "Form created successfully.");
});

export const updateFormController = asyncHandler(async (req, res) => {
  const data = await updateFormRecord(req.params.id, req.body);
  return sendSuccess(res, data, {
    message: "Form updated successfully.",
  });
});

export const deleteFormController = asyncHandler(async (req, res) => {
  const data = await deleteFormRecord(req.params.id);
  return sendSuccess(res, data, {
    message: "Form deleted successfully.",
  });
});

export const publishFormController = asyncHandler(async (req, res) => {
  const data = await publishFormRecord(req.params.id);
  return sendSuccess(res, data, {
    message: "Form published successfully.",
  });
});

export const importFormsController = asyncHandler(async (req, res) => {
  const data = await importFormsRecord({
    body: req.body,
    file: req.files?.find((file) => file.fieldname === "file") || null,
    files: req.files || [],
    records: req.body?.records,
    record: req.body?.record,
  });

  return sendSuccess(res, data, {
    message: "Forms import completed.",
  });
});
