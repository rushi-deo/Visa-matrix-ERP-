import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";

test("JWT access fails closed when the access profile cannot be loaded", async () => {
  let profileMode = "error";
  const userId = "11111111-1111-4111-8111-111111111111";
  const organizationId = "22222222-2222-4222-8222-222222222222";
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    if (requestUrl.pathname === "/rest/v1/role_permissions") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end("[]");
      return;
    }

    if (requestUrl.pathname !== "/rest/v1/profiles") {
      response.writeHead(404);
      response.end();
      return;
    }

    if (profileMode === "error") {
      response.writeHead(500, { "content-type": "application/json" });
      response.end(JSON.stringify({ message: "database unavailable" }));
      return;
    }

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      profileMode === "missing"
        ? "null"
        : JSON.stringify({
            id: userId,
            user_id: userId,
            email: "employee@example.test",
            organization_id: organizationId,
            is_active: true,
            status: "active",
            user_roles: [
              {
                role_id: "44444444-4444-4444-8444-444444444444",
                roles: {
                  id: "44444444-4444-4444-8444-444444444444",
                  name: "Employee",
                },
              },
            ],
          }),
    );
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  process.env.SUPABASE_URL = `http://127.0.0.1:${port}`;

  try {
    const { authenticateToken } = await import(
      "../src/middleware/rbac.middleware.js"
    );
    const app = express();
    app.get("/protected", authenticateToken, (req, res) => {
      res.json(req.user);
    });

    const token = jwt.sign(
      {
        sub: userId,
        userId,
        role: "Super Admin",
        permissions: ["*"],
        organization_id: "33333333-3333-4333-8333-333333333333",
      },
      process.env.JWT_SECRET,
    );

    const unavailableResponse = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(unavailableResponse.status, 503);

    profileMode = "missing";
    const missingResponse = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(missingResponse.status, 401);

    profileMode = "profile";
    const profileResponse = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(profileResponse.status, 200);
    assert.equal(profileResponse.body.role, "Employee");
    assert.equal(profileResponse.body.organization_id, organizationId);
    assert.deepEqual(profileResponse.body.permissions, []);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("JWT verification rejects unsupported signing algorithms", async () => {
  const { authenticateToken } = await import(
    "../src/middleware/rbac.middleware.js"
  );
  const app = express();
  app.get("/protected", authenticateToken, (_req, res) => res.sendStatus(204));
  const token = jwt.sign(
    { sub: "11111111-1111-4111-8111-111111111111" },
    process.env.JWT_SECRET,
    { algorithm: "HS512" },
  );

  const response = await request(app)
    .get("/protected")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 401);
});
