import assert from "node:assert/strict";
import test from "node:test";
import { requestContext } from "../src/middleware/requestContext.js";

process.env.SUPABASE_URL ||= "https://example.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";
process.env.JWT_SECRET ||= "test-jwt-secret";
process.env.NEXUS_INTERNAL_TOKEN ||= "test-nexus-internal-token";

const { authenticateNexusService, isValidNexusInternalToken } =
  await import("../src/middleware/nexusInternalAuth.js");
const {
  getCustomerTenantContext,
  sanitizeCustomerPayload,
} = await import("../src/modules/customers/customer.service.js");
const { redactAuditValue } = await import("../src/core/audit.js");

const runNexusMiddleware = (headers, query = {}) => {
  const req = { headers, query };
  let statusCode;
  let responseBody;
  let nextCalled = false;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  authenticateNexusService(req, res, () => {
    nextCalled = true;
  });

  return { nextCalled, req, responseBody, statusCode };
};

test("request context generates and propagates safe IDs", () => {
  const req = { headers: {} };
  const responseHeaders = new Map();
  const res = {
    setHeader(name, value) {
      responseHeaders.set(name, value);
    },
  };

  requestContext(req, res, () => undefined);

  assert.match(req.requestId, /^[0-9a-f-]{36}$/);
  assert.equal(req.correlationId, req.requestId);
  assert.equal(responseHeaders.get("X-Request-ID"), req.requestId);
  assert.equal(responseHeaders.get("X-Correlation-ID"), req.correlationId);
});

test("request context preserves valid IDs and replaces malformed IDs", () => {
  const preserved = { headers: { "x-request-id": "req-123", "x-correlation-id": "corr-456" } };
  requestContext(preserved, { setHeader() {} }, () => undefined);
  assert.equal(preserved.requestId, "req-123");
  assert.equal(preserved.correlationId, "corr-456");

  const malformed = { headers: { "x-request-id": "bad value" } };
  requestContext(malformed, { setHeader() {} }, () => undefined);
  assert.notEqual(malformed.requestId, "bad value");
});

test("NEXUS service authentication is constant-time and service-only", () => {
  assert.equal(
    isValidNexusInternalToken(
      "test-nexus-internal-token",
      "test-nexus-internal-token",
    ),
    true,
  );
  assert.equal(
    isValidNexusInternalToken("wrong-token", "test-nexus-internal-token"),
    false,
  );

  const missing = runNexusMiddleware({});
  assert.equal(missing.statusCode, 401);
  assert.equal(missing.nextCalled, false);

  const queryOnly = runNexusMiddleware(
    {},
    { token: "test-nexus-internal-token" },
  );
  assert.equal(queryOnly.statusCode, 401);

  const malformed = runNexusMiddleware({
    "x-nexus-internal-token": ["test-nexus-internal-token"],
  });
  assert.equal(malformed.statusCode, 401);

  const valid = runNexusMiddleware({
    "x-nexus-internal-token": "test-nexus-internal-token",
  });
  assert.equal(valid.nextCalled, true);
  assert.deepEqual(valid.req.internalService, {
    authenticated: true,
    name: "nexus",
    type: "service",
  });
  assert.equal("user" in valid.req, false);
  assert.equal("auth" in valid.req, false);
  assert.equal("organization_id" in valid.req.internalService, false);
});

test("customer tenant context fails closed and preserves admin policy", () => {
  assert.deepEqual(
    getCustomerTenantContext({ organization_id: "org-a", role: "Visa Officer" }),
    { organizationId: "org-a" },
  );
  assert.throws(
    () => getCustomerTenantContext({ role: "Visa Officer" }),
    /organization context is required/,
  );
  assert.deepEqual(getCustomerTenantContext({ role: "Admin" }), {
    organizationId: null,
  });
  assert.deepEqual(getCustomerTenantContext({ role: "Super Admin" }), {
    organizationId: null,
  });
});

test("customer payload ownership cannot be supplied by the client", () => {
  const payload = sanitizeCustomerPayload({
    full_name: "Test Customer",
    organization_id: "attacker-org",
  });

  assert.equal(payload.organization_id, undefined);
  assert.equal(payload.full_name, "Test Customer");
});

test("audit redaction removes credential-shaped fields", () => {
  assert.deepEqual(
    redactAuditValue({
      requestId: "request-id",
      accessToken: "sensitive",
      nested: { password: "sensitive", safe: "value" },
    }),
    {
      requestId: "request-id",
      accessToken: "[REDACTED]",
      nested: { password: "[REDACTED]", safe: "value" },
    },
  );
});