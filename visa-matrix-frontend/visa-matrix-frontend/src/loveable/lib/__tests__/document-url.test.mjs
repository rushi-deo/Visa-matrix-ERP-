import test from "node:test";
import assert from "node:assert/strict";
import { getSignedDocumentUrl } from "../document-url.mjs";

test("document links require an API-issued signed URL", () => {
  const signedUrl = "https://storage.example.test/signed/document?token=short-lived";

  assert.equal(getSignedDocumentUrl({ signed_url: signedUrl }), signedUrl);
  assert.equal(getSignedDocumentUrl({ signedUrl }), signedUrl);
  assert.equal(getSignedDocumentUrl({ file_url: "https://storage.example.test/public/file" }), null);
  assert.equal(getSignedDocumentUrl({ public_url: "https://storage.example.test/public/file" }), null);
  assert.equal(getSignedDocumentUrl({ url: "https://storage.example.test/public/file" }), null);
  assert.equal(getSignedDocumentUrl(null), null);
});
