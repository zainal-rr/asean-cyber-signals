import { expect, test, type Page } from "@playwright/test";

const ownerUsername = process.env.DEMO_OWNER_USERNAME ?? "playwright-owner";
const ownerPassword =
  process.env.DEMO_OWNER_PASSWORD ?? "playwright-local-password";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(ownerUsername);
  await page.getByLabel("Password").fill(ownerPassword);
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("redirects anonymous workspace requests and rejects anonymous APIs", async ({
  page,
  request,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  await expect(
    page.getByRole("heading", {
      name: "Turn regional signals into stronger security conversations.",
    }),
  ).toBeVisible();

  const apiResponse = await request.post("/api/briefs/generate", {
    data: {},
  });
  expect(apiResponse.status()).toBe(401);
  await expect(apiResponse.json()).resolves.toEqual({
    error: "Authentication required.",
  });
});

test("uses a generic error for incorrect credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("unknown-owner");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Open workspace" }).click();

  await expect(
    page.getByText("Sign-in failed. Check your credentials.", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("signs in, navigates the owner workspace, and signs out", async ({ page }) => {
  await signIn(page);

  await expect(
    page.getByRole("heading", {
      name: "What changed across the three markets",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Compare markets" }).click();
  await expect(page).toHaveURL(/\/compare$/);
  await expect(
    page.getByRole("heading", {
      name: "Compare local signals without flattening their meaning",
    }),
  ).toBeVisible();
  await page.waitForLoadState("domcontentloaded");

  await page.getByRole("button", { name: "Open account menu" }).click();
  await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible();

  const logoutResponse = await page.request.post("/api/auth/logout", {
    headers: { accept: "application/json" },
  });
  expect(logoutResponse.status()).toBe(200);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
});

test("presentation mode hides internal administration navigation", async ({
  page,
}) => {
  await signIn(page);

  await expect(page.getByRole("link", { name: "Review queue" })).toBeVisible();
  await page.getByRole("switch", { name: "Presentation mode" }).click();

  await expect(page.getByRole("link", { name: "Review queue" })).toBeHidden();
  await expect(page.getByText("Opportunity", { exact: true })).toHaveCount(0);
});
