import {test,expect} from "@playwright/test"

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

test("should show hotel search results",async ({page})=>{
  await page.goto(UI_URL);
  await page.getByPlaceholder("Where are you going?").fill("Test City");
  await page.getByRole("button",{name:"Search"}).click();
  await expect(page.getByText("Hotels found in Test City")).toBeVisible();
  await expect(page.getByRole("link",{name:"Test Hotel"})).toBeVisible();
})