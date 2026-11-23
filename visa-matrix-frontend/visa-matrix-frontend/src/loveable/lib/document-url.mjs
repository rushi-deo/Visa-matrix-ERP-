/**
 * Return only an API-issued, authorization-checked signed document URL.
 * Raw storage URLs may be public and must not be used as a fallback.
 * @param {Record<string, unknown> | null | undefined} document
 */
export const getSignedDocumentUrl = (document) => {
  const value = document?.signed_url ?? document?.signedUrl;
  return typeof value === "string" && value.trim() ? value : null;
};
