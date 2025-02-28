// import { test as setup, expect } from "@playwright/test";
// import ENV from "../../../setup/env";
// import fs from "node:fs";

// ENV.BASE_URL = ENV.BASE_URL;

// const userName = ENV.APPUSERNAME;
// const passWord = ENV.APPPASSWORD;
// const authFile = "playwright/.auth/user.json";

// setup("Realizar login OminiEmpresas", async ({ page }) => {
//   await page.goto("/");
//   await page.locator('[data-placeholder="Usuário"]').fill(userName);
//   await page.locator('[data-placeholder="Senha"]').fill(passWord);
//   await page.getByRole("button").click();

//   await expect(page.locator("css=button >> text=Nova")).toBeVisible({
//     timeout: 30_000,
//   });

//   await page.context().storageState({ path: authFile });

//   const sessionStoragestr = await page.evaluate(() =>
//     JSON.stringify(sessionStorage)
//   );
//   fs.writeFileSync("playwright/.auth/session.json", sessionStoragestr, "utf-8");
// });
