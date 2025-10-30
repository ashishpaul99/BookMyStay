import { test, expect } from "@playwright/test";
import * as path from "path";

const UI_URL = "http://localhost:5173/";

test.beforeEach( async ({ page }) => {
  await page.goto(UI_URL);
  await page.getByRole("link", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Sign In Page" })).toBeVisible();
  await page.locator('[name="email"]').fill("codevwithpaul@gmail.com");
  await page.locator('[name="password"]').fill("ashish");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Logged In Successfully!")).toBeVisible();
});

test("should allow user to add a hotel", async ({ page }) => {
  await page.goto(`${UI_URL}add-hotel`);

  await page.locator('[name="name"]').fill("Test Hotel");
  await page.locator('[name="city"]').fill("Test City");
  await page.locator('[name="country"]').fill("Test Country");
  await page
    .locator('[name="description"]')
    .fill("This is a description for the Test Hotel");
  await page.locator('[name="pricePerNight"]').fill("100");
  await page.selectOption('select[name="starRating"]', "3");

  await page.getByText("Budget").click();

  await page.getByLabel("Free Wifi").check();
  await page.getByLabel("Parking").check();

  await page.locator('[name="adultCount"]').fill("2");
  await page.locator('[name="childCount"]').fill("4");

  await page.setInputFiles('[name="imageFiles"]', [
    path.join(__dirname, "files", "1.jpeg"),
    path.join(__dirname, "files", "2.jpeg"),
  ]);

  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForSelector('text=Hotel Saved!', { timeout: 15000 });
});


test("should display hotels correctly", async ({ page }) => {
  await page.goto(`${UI_URL}my-hotels`);

  // Check page title and Add Hotel link
  await expect(page.getByRole("heading", { name: "My Hotels" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Hotel" })).toBeVisible();

  // Check hotel details (sample seeded data)
  await expect(page.getByRole("heading",{name:"Test Hotel"})).toBeVisible();
  await expect(page.getByText("This is a description for the Test Hotel")).toBeVisible();
  await expect(page.getByText("Test City, Test Country")).toBeVisible();
  await expect(page.getByText("Budget")).toBeVisible();
  await expect(page.getByText("₹ 100 Per Night")).toBeVisible();
  await expect(page.getByText("2 adults, 4 children")).toBeVisible();
  await expect(page.getByText("3 Star Rating")).toBeVisible();

  // Check "View Details" button
  await expect(page.getByRole("link", { name: "View Details" })).toBeVisible();
});

test("should edit hotel", async ({ page }) => {
  await page.goto(`${UI_URL}my-hotels`);
  await page.getByRole("link", { name: "View Details" }).first().click();
  
  await page.waitForSelector('[name="name"]', { state: "attached" });
  await expect(page.locator('[name="name"]')).toHaveValue("Test Hotel");

  await page.locator('[name="name"]').fill("Test Hotel Updated");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Hotel Saved!")).toBeVisible();

  // Reload to verify the change persists after refresh
  await page.reload();
  await expect(page.locator('[name="name"]')).toHaveValue("Test Hotel Updated");
  await page.locator('[name="name"]').fill("Test Hotel");
});

