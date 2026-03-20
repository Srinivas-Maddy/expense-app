import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should load home page and redirect", async ({ page }) => {
    await page.goto("/");
    // Should redirect to login or dashboard
    await page.waitForURL(/\/(login|dashboard)/);
  });

  test("login page has links to signup and forgot password", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
  });

  test("signup page has link to login", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });
});
