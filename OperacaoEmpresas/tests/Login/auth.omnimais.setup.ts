import { test as setup, expect } from "@playwright/test";
import ENV from "../../../setup/env";
import fs from "node:fs";

ENV.BASE_URL_OMNIMAIS = ENV.BASE_URL_OMNIMAIS;
const userName = ENV.APPUSERNAME_OMNIMAIS;
const passWord = ENV.APPPASSWORD_OMNIMAIS;
const authFile = "playwright/.auth/user.omnimais.json";

setup("Realizar login OmniMais", async ({ page }) => {
  await page.goto("/");
  await page.locator('[placeholder="Usuário"]').first().fill(userName);
  await page.locator('[placeholder="Senha"]').fill(passWord);
  await page.getByRole("button").click();

  await page.waitForResponse(
    (response) =>
      response.url().includes("/login-omnifacil/api/user/login") &&
      response.status() === 200
  );
  await page
    .locator("omni-input")
    .filter({ hasText: "Selecione um agente" })
    .getByRole("textbox")
    .click();

  await page.getByText("2719 - MOVEIS LINHARES").click();
  await page.getByRole("button", { name: " Selecionar " }).click();

  await expect(
    page.locator(
      ".agent-selected-container p:has-text('2719 - Moveis linhares')"
    )
  ).toBeVisible({
    timeout: 30_000,
  });

  await page.context().storageState({ path: authFile });

  const sessionStoragestr = await page.evaluate(() =>
    JSON.stringify(sessionStorage)
  );
  fs.writeFileSync(
    "playwright/.auth/session.omnimais.json",
    sessionStoragestr,
    "utf-8"
  );
});
