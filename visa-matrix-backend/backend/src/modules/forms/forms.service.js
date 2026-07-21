import { z } from "zod";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { AppError, RequestValidationError } from "../../core/errors.js";
import { createRollbackTransaction } from "../../core/transaction.js";
import {
  createForm,
  deleteForm,
  findCountryMatch,
  findDuplicateForm,
  findVisaTypeMatch,
  getFormByCountryAndVisaType,
  getFormById,
  listForms,
  updateForm,
} from "./forms.repository.js";

const execFileAsync = promisify(execFile);

const jsonSchemaValue = z
  .unknown()
  .refine((value) => {
    if (value === null) {
      return true;
    }

    const type = typeof value;
    return (
      type === "string" ||
      type === "number" ||
      type === "boolean" ||
      Array.isArray(value) ||
      Object.prototype.toString.call(value) === "[object Object]"
    );
  }, "form_schema must be valid JSON.");

const formStatusSchema = z.enum(["draft", "published", "archived"]);

const normalizeFormPayload = (payload = {}, { isCreate = false } = {}) => {
  const nextPayload = {};

  if (payload.name !== undefined) {
    nextPayload.name = String(payload.name).trim();
  }

  if (payload.country_id !== undefined) {
    nextPayload.country_id = String(payload.country_id).trim();
  }

  if (payload.visa_type_id !== undefined) {
    nextPayload.visa_type_id = String(payload.visa_type_id).trim();
  }

  if (payload.form_schema !== undefined) {
    jsonSchemaValue.parse(payload.form_schema);
    nextPayload.form_schema = payload.form_schema;
  }

  if (payload.version !== undefined) {
    nextPayload.version = Number(payload.version);
  } else if (isCreate) {
    nextPayload.version = 1;
  }

  if (payload.status !== undefined) {
    nextPayload.status = formStatusSchema.parse(payload.status);
  } else if (isCreate) {
    nextPayload.status = "draft";
  }

  return nextPayload;
};

const ensureRequiredFields = (payload) => {
  const missing = [];

  if (!payload.country_id) missing.push("country_id");
  if (!payload.visa_type_id) missing.push("visa_type_id");
  if (payload.form_schema === undefined) missing.push("form_schema");

  if (missing.length) {
    throw new RequestValidationError(
      `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`
    );
  }
};

const buildDefaultFormName = (payload) => {
  if (payload.name) {
    return payload.name;
  }

  return `Form ${payload.country_id} / ${payload.visa_type_id}`;
};

const normalizeJsonObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RequestValidationError("Each form import must be a JSON object.");
  }

  return value;
};

const SUPPORTED_RULE_OPERATORS = new Set([">", ">=", "<", "<=", "=", "!=", "includes"]);
const FIELD_REFERENCE_KEYS = [
  "field",
  "field_id",
  "fieldId",
  "field_name",
  "application_field",
  "depends_on",
  "dependsOn",
];

const collectFields = (formSchema) => {
  if (!formSchema || typeof formSchema !== "object" || Array.isArray(formSchema)) {
    throw new RequestValidationError("form_schema must be a JSON object.");
  }

  if (!Array.isArray(formSchema.sections) || formSchema.sections.length === 0) {
    throw new RequestValidationError("form_schema.sections must be a non-empty array.");
  }

  const fields = [];
  for (const [sectionIndex, section] of formSchema.sections.entries()) {
    if (!section || typeof section !== "object" || Array.isArray(section)) {
      throw new RequestValidationError(`form_schema.sections[${sectionIndex}] must be an object.`);
    }
    if (!Array.isArray(section.fields)) {
      throw new RequestValidationError(`form_schema.sections[${sectionIndex}].fields must be an array.`);
    }
    for (const [fieldIndex, field] of section.fields.entries()) {
      if (!field || typeof field !== "object" || Array.isArray(field)) {
        throw new RequestValidationError(`Field ${sectionIndex}.${fieldIndex} must be an object.`);
      }
      if (typeof field.id !== "string" || !field.id.trim()) {
        throw new RequestValidationError(`Field ${sectionIndex}.${fieldIndex} requires a non-empty id.`);
      }
      if (typeof field.type !== "string" || !field.type.trim()) {
        throw new RequestValidationError(`Field '${field.id}' requires a type.`);
      }
      fields.push(field);
    }
  }
  return fields;
};

const collectReferences = (value, references = []) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectReferences(item, references));
    return references;
  }
  if (!value || typeof value !== "object") return references;

  for (const [key, nested] of Object.entries(value)) {
    if (FIELD_REFERENCE_KEYS.includes(key)) {
      if (typeof nested === "string") references.push(nested);
      else if (Array.isArray(nested)) nested.forEach((item) => {
        if (typeof item === "string") references.push(item);
      });
    }
    collectReferences(nested, references);
  }
  return references;
};

const validateFormStructure = (formSchema) => {
  const fields = collectFields(formSchema);
  const fieldIds = new Set();
  for (const field of fields) {
    if (fieldIds.has(field.id)) {
      throw new RequestValidationError(`Duplicate field id '${field.id}'.`);
    }
    fieldIds.add(field.id);

    if (["select", "multiselect", "radio"].includes(field.type) &&
        field.options !== undefined && !Array.isArray(field.options)) {
      throw new RequestValidationError(`Field '${field.id}' options must be an array.`);
    }

    const rules = field.validation ?? field.validation_rules ?? field.validationRules ?? field.rules;
    if (rules !== undefined) {
      if (!Array.isArray(rules)) {
        throw new RequestValidationError(`Validation rules for field '${field.id}' must be an array.`);
      }
      for (const rule of rules) {
        if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
          throw new RequestValidationError(`Validation rules for field '${field.id}' must contain objects.`);
        }
        if (rule.operator !== undefined && !SUPPORTED_RULE_OPERATORS.has(rule.operator)) {
          throw new RequestValidationError(`Invalid validation operator '${rule.operator}' for field '${field.id}'.`);
        }
        if (rule.operator === undefined && rule.type === undefined && rule.kind === undefined) {
          throw new RequestValidationError(`Validation rule for field '${field.id}' requires an operator or rule type.`);
        }
        if (rule.operator !== undefined && !Object.prototype.hasOwnProperty.call(rule, "value")) {
          throw new RequestValidationError(`Validation rule for field '${field.id}' requires a value.`);
        }
      }
    }
  }

  const references = collectReferences(formSchema);
  const unknownReference = references.find((reference) => {
    const root = reference.split(".")[0];
    return !fieldIds.has(root);
  });
  if (unknownReference) {
    throw new RequestValidationError(`Conditional field reference '${unknownReference}' does not exist.`);
  }
};

const parseJsonContent = (content, sourceLabel) => {
  try {
    const parsed = JSON.parse(String(content));
    return normalizeJsonObject(parsed);
  } catch (error) {
    throw new RequestValidationError(
      `Invalid JSON in ${sourceLabel || "import payload"}.`
    );
  }
};

const readJsonFile = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  return parseJsonContent(content, path.basename(filePath));
};

const extractZipArchive = async (buffer) => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "forms-import-"));
  const zipPath = path.join(tempRoot, "upload.zip");
  const extractDir = path.join(tempRoot, "extracted");

  await fs.writeFile(zipPath, buffer);
  await fs.mkdir(extractDir, { recursive: true });

  try {
    await execFileAsync("powershell.exe", [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath "${zipPath.replace(/"/g, '""')}" -DestinationPath "${extractDir.replace(/"/g, '""')}" -Force`,
    ]);
  } catch (error) {
    await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => null);
    throw new AppError("Failed to extract ZIP archive.", 400, {
      message: error.message,
    });
  }

  const collected = [];

  const walk = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        collected.push(fullPath);
      }
    }
  };

  await walk(extractDir);

  if (collected.length === 0) {
    await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => null);
    throw new RequestValidationError("ZIP archive does not contain any JSON files.");
  }

  return { tempRoot, jsonFiles: collected };
};

const parseImportSource = async (input = {}) => {
  const parseRecordsValue = (value) => {
    if (typeof value === "string") {
      try { return JSON.parse(value); } catch { throw new RequestValidationError("records must contain valid JSON."); }
    }
    return value;
  };

  input.records = parseRecordsValue(input.records);
  input.record = parseRecordsValue(input.record);
  if (Array.isArray(input.records)) {
    return input.records.flatMap((record) =>
      Array.isArray(record) ? record.map(normalizeJsonObject) : [normalizeJsonObject(record)],
    );
  }

  if (input.record) {
    return [normalizeJsonObject(input.record)];
  }

  if (Array.isArray(input.files) && input.files.length > 0) {
    const firstFile = input.files[0];
    const isZip =
      firstFile?.mimetype === "application/zip" ||
      String(firstFile?.originalname || "").toLowerCase().endsWith(".zip");

    if (isZip) {
      const { tempRoot, jsonFiles } = await extractZipArchive(firstFile.buffer);

      try {
        const parsed = [];
        for (const filePath of jsonFiles) {
          parsed.push(await readJsonFile(filePath));
        }
        return parsed;
      } finally {
        await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => null);
      }
    }

    const parsed = [];
    for (const file of input.files) {
      parsed.push(parseJsonContent(file.buffer.toString("utf8"), file.originalname));
    }
    return parsed;
  }

  if (input.file) {
    const isZip =
      input.file.mimetype === "application/zip" ||
      String(input.file.originalname || "").toLowerCase().endsWith(".zip");

    if (isZip) {
      const { tempRoot, jsonFiles } = await extractZipArchive(input.file.buffer);

      try {
        const parsed = [];
        for (const filePath of jsonFiles) {
          parsed.push(await readJsonFile(filePath));
        }
        return parsed;
      } finally {
        await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => null);
      }
    }

    return [parseJsonContent(input.file.buffer.toString("utf8"), input.file.originalname)];
  }

  if (Array.isArray(input.body)) {
    return input.body.flatMap((record) =>
      Array.isArray(record) ? record.map(normalizeJsonObject) : [normalizeJsonObject(record)],
    );
  }

  if (input.body && typeof input.body === "object") {
    return [normalizeJsonObject(input.body)];
  }

  throw new RequestValidationError(
    "Import requires a JSON body, JSON files, or a ZIP archive."
  );
};

const resolveForeignKeys = async (record, index) => {
  const lookupValue = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    return value.id ?? value.country_id ?? value.visa_type_id ?? value.name ??
      value.country_name ?? value.visa_name ?? value.code ?? value.country_code;
  };
  const countrySource = lookupValue(record.country ?? record.country_name ?? record.country_code ?? record.country_id);
  const visaTypeSource = lookupValue(record.visa_type ?? record.visa_name ?? record.visa_code ?? record.visa_type_id);

  const country = await findCountryMatch(countrySource);
  const visaType = await findVisaTypeMatch(visaTypeSource);

  if (!country) {
    throw new RequestValidationError(
      `Import row ${index + 1}: country '${countrySource}' not found.`
    );
  }

  if (!visaType) {
    throw new RequestValidationError(
      `Import row ${index + 1}: visa type '${visaTypeSource}' not found.`
    );
  }

  return {
    country_id: country.id,
    visa_type_id: visaType.id,
    country_name: country.country_name || country.name || null,
    visa_type_name: visaType.visa_name || visaType.name || null,
  };
};

const normalizeImportedRecord = async (record, index) => {
  const normalized = normalizeJsonObject(record);
  const metadata = normalized.metadata && typeof normalized.metadata === "object"
    ? normalized.metadata
    : normalized;
  const resolved = await resolveForeignKeys({ ...normalized, ...metadata }, index);
  const form_schema = normalized.form_schema ?? normalized.schema ?? normalized.fields ?? metadata.form_schema ?? metadata.schema;

  if (form_schema === undefined) {
    throw new RequestValidationError(
      `Import row ${index + 1}: form_schema is required.`
    );
  }

  jsonSchemaValue.parse(form_schema);
  validateFormStructure(form_schema);

  const name =
    String(normalized.name || "").trim() ||
    `${resolved.country_name || "Form"} - ${resolved.visa_type_name || "Template"}`;
  const version = normalized.version === undefined ? 1 : Number(normalized.version);
  if (!Number.isInteger(version) || version < 1) {
    throw new RequestValidationError(`Import row ${index + 1}: version must be a positive integer.`);
  }

  return {
    name,
    country_id: resolved.country_id,
    visa_type_id: resolved.visa_type_id,
    form_schema,
    version,
    status: normalized.status === undefined ? "draft" : formStatusSchema.parse(normalized.status),
  };
};

export const getForms = async (query = {}) => listForms(query);

export const getForm = async (id) => {
  const form = await getFormById(id);
  if (!form) {
    throw new AppError("Form not found.", 404);
  }
  return form;
};

export const getFormByCountryVisa = async (countryId, visaTypeId) => {
  const form =
    (await getFormByCountryAndVisaType(countryId, visaTypeId, "published")) ??
    (await getFormByCountryAndVisaType(countryId, visaTypeId));
  if (!form) {
    throw new AppError("Form not found.", 404);
  }
  return form;
};

export const createFormRecord = async (payload) => {
  const normalized = normalizeFormPayload(payload, { isCreate: true });
  ensureRequiredFields(normalized);

  return createForm({
    ...normalized,
    name: buildDefaultFormName(normalized),
  });
};

export const updateFormRecord = async (id, payload) => {
  const normalized = normalizeFormPayload(payload);

  if (Object.keys(normalized).length === 0) {
    throw new RequestValidationError("At least one field must be provided.");
  }

  return updateForm(id, normalized);
};

export const deleteFormRecord = async (id) => {
  const deleted = await deleteForm(id);

  if (!deleted) {
    throw new AppError("Form not found.", 404);
  }

  return deleted;
};

export const publishFormRecord = async (id) => {
  const current = await getFormById(id);

  if (!current) {
    throw new AppError("Form not found.", 404);
  }

  return updateForm(id, {
    status: "published",
    version: Number(current.version || 1),
  });
};

export const importFormsRecord = async (input = {}) => {
  const summary = { imported: 0, skipped: 0, duplicates: 0, failed: 0, errors: [] };
  let rawRecords;
  try {
    rawRecords = await parseImportSource(input);
  } catch (error) {
    summary.failed = 1;
    summary.errors.push({ index: null, message: error.message });
    return summary;
  }

  const transaction = createRollbackTransaction();
  const errors = [];

  try {
    for (let index = 0; index < rawRecords.length; index += 1) {
      try {
        const candidate = await normalizeImportedRecord(rawRecords[index], index);
        const duplicate = await findDuplicateForm(candidate);

        if (duplicate) {
          summary.skipped += 1;
          summary.duplicates += 1;
          continue;
        }

        const created = await createForm(candidate);
        summary.imported += 1;
        transaction.addRollback(`delete_imported_form_${created.id}`, () => deleteForm(created.id));
      } catch (error) {
        errors.push({ index, message: error.message });
        throw error;
      }
    }

    return { ...summary, errors };
  } catch (error) {
    await transaction.rollback(error);
    summary.imported = 0;
    summary.failed = 1;
    summary.errors = errors.length ? errors : [{ index: null, message: error.message }];
    return summary;
  }
};
