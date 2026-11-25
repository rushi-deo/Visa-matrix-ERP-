import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

test("document updates return a signed URL using the caller's tenant context", async () => {
  const document = {
    id: "document-a",
    organization_id: "organization-a",
    application_id: "application-a",
    storage_path: "applications/application-a/passport.pdf",
    file_name: "passport.pdf",
    status: "uploaded",
  };
  const application = {
    id: "application-a",
    organization_id: "organization-a",
  };
  const requests = [];
  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    requests.push({ method: request.method, pathname: requestUrl.pathname, search: requestUrl.search });

    if (requestUrl.pathname === "/rest/v1/documents" && request.method === "GET") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(document));
      return;
    }

    if (requestUrl.pathname === "/rest/v1/applications" && request.method === "GET") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(application));
      return;
    }

    if (requestUrl.pathname === "/rest/v1/documents" && request.method === "PATCH") {
      let body = "";
      for await (const chunk of request) body += chunk;
      const updated = { ...document, ...JSON.parse(body) };
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(updated));
      return;
    }

    if (requestUrl.pathname.startsWith("/storage/v1/object/sign/")) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ signedURL: "/object/sign/visa-documents/test-signed-path" }));
      return;
    }

    if (requestUrl.pathname.startsWith("/storage/v1/object/")) {
      response.writeHead(500, { "content-type": "application/json" });
      response.end(JSON.stringify({ message: "Storage unavailable" }));
      return;
    }

    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ message: "Unexpected test request" }));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  process.env.SUPABASE_URL = `http://127.0.0.1:${port}`;

  try {
    const { deleteDocumentRecord, updateDocumentRecord } = await import(
      "../src/modules/documents/document.service.js"
    );
    const authContext = {
      userId: "employee-a",
      organizationId: "organization-a",
      role: "employee",
    };
    const result = await updateDocumentRecord(
      "document-a",
      { status: "verified" },
      authContext,
    );

    assert.equal(result.status, "verified");
    assert.equal(result.organization_id, "organization-a");
    assert.match(result.signed_url, /^http:\/\/127\.0\.0\.1:\d+\/storage\/v1\/object\/sign\//);
    assert.ok(requests.some(({ method, pathname, search }) =>
      method === "GET" && pathname === "/rest/v1/documents" &&
      search.includes("organization_id=eq.organization-a")));
    assert.ok(requests.some(({ method, pathname, search }) =>
      method === "PATCH" && pathname === "/rest/v1/documents" &&
      search.includes("organization_id=eq.organization-a")));
    await assert.rejects(
      deleteDocumentRecord("document-a", authContext),
      /Failed to delete file from Supabase Storage/,
    );
    assert.ok(
      !requests.some(
        ({ method, pathname }) =>
          method === "DELETE" && pathname === "/rest/v1/documents",
      ),
      "document metadata must remain when storage deletion fails",
    );
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
