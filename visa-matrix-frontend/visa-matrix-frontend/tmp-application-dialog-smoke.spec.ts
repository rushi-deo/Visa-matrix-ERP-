import { expect, test } from "@playwright/test";

const tokenPayload = Buffer.from(
  JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    role: "Super Admin",
    email: "admin@example.com",
    permissions: ["*"],
  }),
).toString("base64url");

const token = `test.${tokenPayload}.signature`;
const user = {
  id: "smoke-user",
  name: "Smoke User",
  email: "admin@example.com",
  role: "Super Admin",
  permissions: ["*"],
};

test("application create dialog loads live countries and visa types", async ({
  page,
}) => {
  const requests: string[] = [];

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { user, role: user.role, permissions: user.permissions },
      }),
    });
  });

  await page.route("**/api/applications", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }

    await route.continue();
  });

  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/countries") || url.includes("/api/visa-types")) {
      requests.push(url);
    }
  });

  await page.addInitScript(
    ({ token, user }) => {
      window.localStorage.setItem(
        "visa-matrix-auth",
        JSON.stringify({ token, user }),
      );
    },
    { token, user },
  );

  await page.goto("http://127.0.0.1:5173/visa/applications");
  await page.getByRole("button", { name: "New Application" }).click();
  await expect(page.getByText("New Visa Application")).toBeVisible();

  await page.getByText("Select country").click();
  await page.getByRole("option", { name: "Australia" }).click();

  await page.getByText("Loading visa types...").waitFor({ state: "hidden" });
  await page.getByText("Select visa type").click();
  await expect(page.getByRole("option", { name: "Business" })).toBeVisible();

  expect(requests.some((url) => url.includes("/api/countries"))).toBe(true);
  expect(
    requests.some((url) =>
      url.includes("/api/visa-types?country_id=0bfe5f76-e126-485a-ade6-1b9166b1f54b"),
    ),
  ).toBe(true);
});
