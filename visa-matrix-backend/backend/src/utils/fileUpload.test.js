import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedDocumentUpload } from "./fileUpload.js";

test("document uploads accept only the UI-supported extension and MIME pairs", () => {
  const supportedFiles = [
    { originalname: "passport.pdf", mimetype: "application/pdf" },
    { originalname: "passport.JPG", mimetype: "image/jpeg" },
    { originalname: "passport.jpeg", mimetype: "image/jpeg" },
    { originalname: "passport.png", mimetype: "image/png" },
    {
      originalname: "supporting.docx",
      mimetype:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  ];

  for (const file of supportedFiles) {
    assert.equal(isAllowedDocumentUpload(file), true);
  }
});

test("document uploads reject unsupported types and mismatched MIME metadata", () => {
  assert.equal(
    isAllowedDocumentUpload({
      originalname: "archive.zip",
      mimetype: "application/zip",
    }),
    false,
  );
  assert.equal(
    isAllowedDocumentUpload({
      originalname: "passport.pdf",
      mimetype: "image/jpeg",
    }),
    false,
  );
});
