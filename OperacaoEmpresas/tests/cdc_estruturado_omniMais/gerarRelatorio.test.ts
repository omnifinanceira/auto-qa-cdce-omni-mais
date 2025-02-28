import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import * as cnpj from "validation-br/dist/cnpj";
import * as cpf from "validation-br/dist/cpf";
import { Utility } from "../../utils/utility";
import { chromium } from "playwright"; // ou 'firefox' ou 'webkit'

test.describe("Gerar Relatório", { tag: ["@OmniMais"] }, () => {
  test.beforeEach(async ({ context, baseURL }) => {
    const sessionStorage = JSON.parse(
      fs.readFileSync("playwright/.auth/session.json", "utf-8")
    );

    await context.addInitScript(
      ({ storage, baseURL }) => {
        if (window.location.hostname === new URL(baseURL!).hostname) {
          for (const [key, value] of Object.entries(storage))
            window.sessionStorage.setItem(key, value as string);
        }
      },
      { storage: sessionStorage, baseURL }
    );
  });

  test.only("Gerar Relatório", async ({ page }) => {
    test.slow();
    await page.goto("/");

    await page.getByText(" CDC Estruturado ").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Selecione um lojista" })
      .getByRole("textbox")
      .click();
    //await page.getByText("Selecione um lojista").click();
    await page.getByText(" 8200315 - nome do lojista 8200315 ").click();
    await page.getByRole("button", { name: " Selecionar " }).click();
    await page.getByRole("link", { name: "CDC Estruturado" }).click();
    await page.getByRole("link", { name: "Relatórios" }).click();
    await page.getByRole("link", { name: "CDC Estruturado" }).click();
    await page.getByRole("link", { name: "Relatórios" }).click();
    await page.locator("omni-datepicker").getByRole("textbox").click();
    await page.getByLabel("01/02/").click();
    await page.getByLabel("19/02/").click();
    await page.getByRole("button", { name: "Aplicar" }).click();
    await page.getByRole("button", { name: "Gerar relatório" }).click();
    await page.waitForTimeout(6000);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar Relatório" }).click();
    const download = await downloadPromise;
    await page.waitForTimeout(5000);
    await page.getByRole("button", { name: "Alterar filtros" }).click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Status da proposta" })
      .getByRole("textbox")
      .click();
    await page.locator("#cdk-overlay-4").getByText("Aprovada").click();
    await page.getByRole("button", { name: "Gerar relatório" }).click();
    await page.getByRole("link", { name: "CDC Estruturado" }).click();

    await page.waitForTimeout(5000);
  });
});
