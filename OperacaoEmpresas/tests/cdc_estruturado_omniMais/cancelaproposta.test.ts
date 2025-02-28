import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import * as cnpj from "validation-br/dist/cnpj";
import * as cpf from "validation-br/dist/cpf";
import { Utility } from "../../utils/utility";
import { chromium } from "playwright"; // ou 'firefox' ou 'webkit'

test.describe("Cancelamento de  propostas", { tag: ["@OmniMais"] }, () => {
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

  test.only("Cancela uma proposta qualquer com status - APROVADO", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/");

    await page.getByText(" CDC Estruturado ").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Selecione um lojista" })
      .getByRole("textbox")
      .click();

    await page.getByText(" 8200315 - nome do lojista 8200315 ").click();
    await page.getByRole("button", { name: " Selecionar " }).click();
    await page.getByText(" Aprovada ").first().click();
    await page.locator(".card-content").first().click();
    await page.locator('[data-mat-icon-name="config"]').click();
    await page.getByText("Cancelar Proposta").click();
    await page.getByText(" Sim, cancelar ").click();
    await page.locator(".omni-dialog_close").click();
    await page.waitForTimeout(7000);
  });

  test("Cancela numero de proposta com status - APROVADO", async ({ page }) => {
    test.slow();
    await page.goto("/");

    await page.getByText(" CDC Estruturado ").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Selecione um lojista" })
      .getByRole("textbox")
      .click();

    await page.getByText(" 8200315 - nome do lojista 8200315 ").click();
    await page.getByRole("button", { name: " Selecionar " }).click();
    await page.getByPlaceholder("Buscar").click();
    await page.getByPlaceholder("Buscar").fill("54321576");
    await page.locator(".card-content").first().click();
    await page.locator("omni-config-button").getByRole("button").click();
    await page.getByRole("button", { name: "Cancelar Proposta" }).click();

    await page.getByText(" Sim, cancelar ").click();
    await page.locator(".omni-dialog_close").click();
    await page.waitForTimeout(4000);
    await page.getByPlaceholder("Buscar").click();
    await page.getByPlaceholder("Buscar").fill("54321576");
    await page.waitForTimeout(7000);
  });
});
