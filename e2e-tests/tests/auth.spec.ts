import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:5173/";

// test('should navigate to homepage', async ({ page }) => {
//     await page.goto(UI_URL);
    
//     // get the Sign In button
//     await page.getByRole("link", { name: "Sign In" }).click();

//     // Assertion: expect Sign In page heading to be visible
//     await expect(page.getByRole("heading", { name: "Sign In Page" })).toBeVisible();

//     // find the element on the page with name email
//     // add this user manually to test database
//     await page.locator("[name=email]").fill("codevwithpaul@gmail.com");
//     await page.locator("[name=password]").fill("ashish");

//     // click on login button
//     await page.getByRole("button", { name: "Sign In" }).click();

//     await expect(page.getByText("Logged In Successfully!")).toBeVisible();

    // await expect(page.getByRole("link", { name: "My Booking" })).toBeVisible();
    // await expect(page.getByRole("link", { name: "My Hotels" })).toBeVisible();
    // await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();
// });

// Test: User should be able to successfully sign in (actually sign up + auto login)
test("should allow user to sign in", async ({ page }) => {

  const testEmail = `test_register_${Math.floor(Math.random() * 90000) + 1000}@test.com`;

  // Navigate to the app's homepage
  await page.goto(UI_URL);

  // Click on "Sign Up" link
  await page.getByRole("link", { name: "Sign Up" }).click();

  // Verify "Create an Account" heading is visible
  await expect(page.getByRole("heading", { name: "Create an Account" })).toBeVisible();

  // Fill registration form fields
  await page.locator("[name=firstName]").fill("Ashish");
  await page.locator("[name=lastName]").fill("G");
  await page.locator("[name=email]").fill(testEmail);
  await page.locator("[name=password]").fill("ashish");
  await page.locator("[name=confirmPassword]").fill("ashish");

  // Click on "Create Account" button
  await page.getByRole("button", { name: "Create Account" }).click();

  // ✅ Assert success message appears
  await expect(page.getByText("Registration Successful!")).toBeVisible();

  // ✅ Assert user is redirected to logged-in state with nav links/buttons visible
  await expect(page.getByRole("link", { name: "My Booking" })).toBeVisible();
  await expect(page.getByRole("link", { name: "My Hotels" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();
});

