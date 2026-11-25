import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import nexusRoutes from "../src/modules/integrations/nexus.routes.js";

const app = express();
app.use(express.json());
app.use("/integrations/nexus", nexusRoutes);

const serviceToken = "test-nexus-internal-token";

test("NEXUS integration routes reject missing internal service authentication", async () => {
  const response = await request(app)
    .post("/integrations/nexus/customer.list")
    .send({});

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Unauthorized");
});

test("NEXUS integration routes require a bearer user token after service authentication", async () => {
  const response = await request(app)
    .post("/integrations/nexus/customer.list")
    .set("x-nexus-internal-token", serviceToken)
    .send({});

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Missing or invalid authorization header");
});

test("every NEXUS route applies service auth, user auth, and a named permission gate", () => {
  const routes = nexusRoutes.stack.filter((layer) => layer.route);
  assert.equal(routes.length, 24);

  for (const layer of routes) {
    const middleware = layer.route.stack.map((entry) => entry.handle);
    assert.equal(middleware[0].name, "authenticateNexusService", `${layer.route.path} must require service auth first`);
    assert.equal(middleware[1].name, "authenticateToken", `${layer.route.path} must require bearer user auth`);
    assert.match(middleware[2].toString(), /hasPermissionAccess/, `${layer.route.path} must enforce a permission`);
  }
});
