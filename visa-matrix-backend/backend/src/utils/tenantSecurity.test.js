import test from "node:test";
import assert from "node:assert/strict";
import { ForbiddenError } from "../core/errors.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  canBypassTenantCheck,
} from "./tenantSecurity.js";

const organizationA = "11111111-1111-4111-8111-111111111111";
const organizationB = "22222222-2222-4222-8222-222222222222";

test("tenant access allows a matching organization", () => {
  const resource = { id: "record-a", organization_id: organizationA };
  assert.equal(assertTenantAccess(resource, { organization_id: organizationA }), resource);
});

test("tenant access denies missing user organization context", () => {
  assert.throws(
    () => assertTenantAccess({ organization_id: organizationA }, {}),
    ForbiddenError,
  );
});

test("tenant access denies missing resource ownership", () => {
  assert.throws(
    () => assertTenantAccess({ id: "legacy-record" }, { organization_id: organizationA }),
    ForbiddenError,
  );
});

test("tenant access denies cross-organization records", () => {
  assert.throws(
    () => assertTenantAccess({ organization_id: organizationB }, { organization_id: organizationA }),
    ForbiddenError,
  );
});

test("new records receive server-derived tenant ownership", () => {
  assert.deepEqual(
    applyTenantToPayload({ name: "New record" }, { organization_id: organizationA }),
    { name: "New record", organization_id: organizationA },
  );
});

test("new records cannot forge another tenant", () => {
  assert.throws(
    () => applyTenantToPayload({ organization_id: organizationB }, { organization_id: organizationA }),
    ForbiddenError,
  );
});

test("admin bypass is based on normalized role identifiers and still requires record ownership", () => {
  assert.equal(canBypassTenantCheck({ role: " Super Admin " }), true);
  assert.equal(canBypassTenantCheck({ role: "ADMIN" }), true);
  assert.equal(canBypassTenantCheck({ role: "case_manager" }), false);
  assert.throws(() => assertTenantAccess({ id: "unowned" }, { role: "Super Admin" }), ForbiddenError);
  assert.equal(
    assertTenantAccess({ organization_id: organizationB }, { role: "Super Admin" }).organization_id,
    organizationB,
  );
});
