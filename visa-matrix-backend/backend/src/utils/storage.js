import path from "node:path";
import { randomUUID } from "node:crypto";
import env from "../config/env.js";
import supabase from "../config/supabaseClient.js";
import { ApiError } from "./apiError.js";

const sanitizeFileName = (value) => {
  return String(value || "document")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const decodeBase64Content = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "file_base64 must be a non-empty base64 string.");
  }

  const rawValue = value.includes("base64,")
    ? value.split("base64,").pop()
    : value;

  try {
    const buffer = Buffer.from(rawValue, "base64");

    if (!buffer.length) {
      throw new Error("Empty buffer");
    }

    return buffer;
  } catch (_error) {
    throw new ApiError(400, "file_base64 is not valid base64 content.");
  }
};

export const uploadBase64Document = async ({
  applicationId,
  documentType,
  fileName,
  fileBase64,
  contentType,
}) => {
  const buffer = decodeBase64Content(fileBase64);
  const extension = path.extname(fileName || "").toLowerCase();
  const safeBaseName = sanitizeFileName(
    path.basename(fileName || documentType || "document", extension)
  );
  const objectPath = `applications/${applicationId}/${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(env.storageBucket)
    .upload(objectPath, buffer, {
      contentType: contentType || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new ApiError(
      500,
      `Failed to upload document to Supabase Storage: ${uploadError.message}`
    );
  }

  const { data } = supabase.storage
    .from(env.storageBucket)
    .getPublicUrl(objectPath);

  return {
    fileUrl: data.publicUrl,
    storagePath: objectPath,
    fileName: `${safeBaseName}${extension}`,
    sizeBytes: buffer.byteLength,
  };
};

export const removeStoredDocument = async (storagePath) => {
  if (!storagePath) {
    return;
  }

  const { error } = await supabase.storage
    .from(env.storageBucket)
    .remove([storagePath]);

  if (error) {
    console.error(
      `[WARN] Failed to delete storage object ${storagePath}: ${error.message}`
    );
  }
};
