import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ownerUsername = process.env.DEMO_OWNER_USERNAME ?? "playwright-owner";
const ownerPassword =
  process.env.DEMO_OWNER_PASSWORD ?? "playwright-local-password";

async function expectNoWcagViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
}

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(ownerUsername);
  await page.getByLabel("Password").fill(ownerPassword);
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("login has no automated WCAG A or AA violations", async ({ page }) => {
  await page.goto("/login");
  await expectNoWcagViolations(page);
});

test("overview has no automated WCAG A or AA violations", async ({ page }) => {
  await signIn(page);
  await expect(
    page.getByRole("heading", {
      name: "What changed across the three markets",
    }),
  ).toBeVisible();
  await expectNoWcagViolations(page);
});

test("country view reflows at 390 pixels without horizontal page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.goto("/countries/SG");

  const viewport = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(viewport.documentWidth).toBeLessThanOrEqual(viewport.viewportWidth);
  await expectNoWcagViolations(page);
});

test("primary navigation is keyboard reachable", async ({ page }) => {
  await signIn(page);
  const skipLink = page.getByRole("link", { name: "Skip to content" });

  for (let index = 0; index < 24; index += 1) {
    if (await skipLink.evaluate((element) => element === document.activeElement)) {
      break;
    }
    await page.keyboard.press("Tab");
  }

  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeVisible();
});
