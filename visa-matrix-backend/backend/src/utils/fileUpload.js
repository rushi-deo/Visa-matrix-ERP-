import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import env from "../config/env.js";
import supabase from "../config/supabase.js";
import {
  ExternalServiceError,
  RequestValidationError,
} from "../core/errors.js";

const DOCUMENT_UPLOAD_MIME_TYPES = Object.freeze({
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

export const isAllowedDocumentUpload = (file) => {
  const extension = path.extname(file?.originalname || "").toLowerCase();
  return DOCUMENT_UPLOAD_MIME_TYPES[extension] === file?.mimetype;
};

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
  fileFilter: (_req, file, callback) => {
    if (!isAllowedDocumentUpload(file)) {
      return callback(
        new RequestValidationError(
          "Unsupported document type. Upload a PDF, JPG, PNG, or DOCX file.",
        ),
      );
    }

    return callback(null, true);
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

  return {
    storagePath,
  };
};

export const createSignedStorageUrl = async (storagePath, expiresIn = 300) => {
  if (!storagePath) {
    throw new ExternalServiceError("Document storage location is unavailable.");
  }
  const { data, error } = await supabase.storage
    .from(env.supabaseStorageBucket)
    .createSignedUrl(storagePath, expiresIn);
  if (error || !data?.signedUrl) {
    throw new ExternalServiceError("Failed to create a secure document link.");
  }
  return data.signedUrl;
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
