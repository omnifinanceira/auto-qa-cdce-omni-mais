import { faker } from "@faker-js/faker";
import { test, expect, chromium } from "@playwright/test";
import fs from "node:fs";
import * as cnpj from "validation-br/dist/cnpj";
import * as cpf from "validation-br/dist/cpf";
import { Utility } from "../../utils/utility";
import { HomePage } from "../../Pages/HomePage/HomePage";

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

test("PAF", async ({ page }) => {
  test.slow();

  await page.goto("/");
  await page.click("css=button >> text=menu");
  await page.click("css=button >> text=PAF");
  const carregarTelaPaf = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/mesa-credito-pj/api/economic-groups/all") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await carregarTelaPaf;
  await page.click("css=button >> text=add");
  await page.click('[formcontrolname="idGrupoEconomicoMesa"]');
  await page.getByText(" 1473 - MM MERCADOS ").click();
  await page.waitForTimeout(2000);
  await page.click('[formcontrolname="propostaCliente"]');
  await page.click('[ng-reflect-value="54318354"]'); ///validar
  await page.click("css=div >> text=Proposta de Negócios");
  await page.locator(".cdk-overlay-pane").nth(1).click();
});
