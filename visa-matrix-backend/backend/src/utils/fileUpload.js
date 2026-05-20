import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import env from "../config/env.js";
import supabase from "../config/supabase.js";
import { ExternalServiceError } from "../core/errors.js";

const sanitizeFileName = (value) => {
  return String(value || "document")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const uploadSingleFile = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploadsMaxFileSizeBytes,
  },
});

export const buildStoragePath = ({ applicationId, originalName }) => {
  const extension = path.extname(originalName || "").toLowerCase();
  const baseName = sanitizeFileName(path.basename(originalName, extension));

  return `applications/${applicationId}/${Date.now()}-${crypto.randomUUID()}-${baseName}${extension}`;
};

export const uploadBufferToStorage = async ({
  buffer,
  contentType,
  storagePath,
}) => {
  const { error } = await supabase.storage
    .from(env.supabaseStorageBucket)
    .upload(storagePath, buffer, {
      upsert: false,
      contentType: contentType || "application/octet-stream",
    });

  if (error) {
    throw new ExternalServiceError("Failed to upload file to Supabase Storage.", {
      message: error.message,
      details: error,
    });
  }

  const { data } = supabase.storage
    .from(env.supabaseStorageBucket)
    .getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
};

export const removeStoredFile = async (storagePath) => {
  if (!storagePath) {
    return;
  }

  const { error } = await supabase.storage
    .from(env.supabaseStorageBucket)
    .remove([storagePath]);

  if (error) {
    throw new ExternalServiceError("Failed to delete file from Supabase Storage.", {
      message: error.message,
      details: error,
    });
  }
};
