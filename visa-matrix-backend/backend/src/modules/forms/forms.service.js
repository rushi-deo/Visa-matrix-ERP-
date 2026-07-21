import { z } from "zod";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { AppError, RequestValidationError } from "../../core/errors.js";
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

  return { tempRoot, jsonFiles: collected };
};

const parseImportSource = async (input = {}) => {
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
  const countrySource = record.country ?? record.country_name ?? record.country_code ?? record.country_id;
  const visaTypeSource = record.visa_type ?? record.visa_name ?? record.visa_code ?? record.visa_type_id;

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
  const resolved = await resolveForeignKeys(normalized, index);
  const form_schema = normalized.form_schema ?? normalized.schema ?? normalized.fields;

  if (form_schema === undefined) {
    throw new RequestValidationError(
      `Import row ${index + 1}: form_schema is required.`
    );
  }

  jsonSchemaValue.parse(form_schema);

  const name =
    String(normalized.name || "").trim() ||
    `${resolved.country_name || "Form"} - ${resolved.visa_type_name || "Template"}`;

  return {
    name,
    country_id: resolved.country_id,
    visa_type_id: resolved.visa_type_id,
    form_schema,
    version: 1,
    status: "draft",
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
  const rawRecords = await parseImportSource(input);
  const imported = [];
  const skipped = [];
  const errors = [];
  const createdIds = [];

  try {
    for (let index = 0; index < rawRecords.length; index += 1) {
      try {
        const candidate = await normalizeImportedRecord(rawRecords[index], index);
        const duplicate = await findDuplicateForm(candidate);

        if (duplicate) {
          skipped.push({
            index,
            reason: "duplicate",
            name: candidate.name,
            country_id: candidate.country_id,
            visa_type_id: candidate.visa_type_id,
          });
          continue;
        }

        const created = await createForm(candidate);
        createdIds.push(created.id);
        imported.push(created);
      } catch (error) {
        errors.push({
          index,
          message: error.message,
        });
        throw error;
      }
    }

    return { imported, skipped, errors };
  } catch (error) {
    for (const id of createdIds.reverse()) {
      await deleteForm(id).catch(() => null);
    }

    if (errors.length === 0) {
      errors.push({ index: null, message: error.message });
    }

    return { imported: [], skipped, errors };
  }
};
