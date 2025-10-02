import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:5173/";

test('should navigate to homepage', async ({ page }) => {
    await page.goto(UI_URL);
    
    // get the Sign In button
    await page.getByRole("link", { name: "Sign In" }).click();

    // Assertion: expect Sign In page heading to be visible
    await expect(page.getByRole("heading", { name: "Sign In Page" })).toBeVisible();

    // find the element on the page with name email
    // add this user manually to test database
    await page.locator("[name=email]").fill("codevwithpaul@gmail.com");
    await page.locator("[name=password]").fill("ashish");

    // click on login button
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Logged In Successfully!")).toBeVisible();

    await expect(page.getByRole("link", { name: "My Booking" })).toBeVisible();
    await expect(page.getByRole("link", { name: "My Hotels" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();
});

test("should allow user to sign in",async({page})=>{
    await page.goto(UI_URL);

})
