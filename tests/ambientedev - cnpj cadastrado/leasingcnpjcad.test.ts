import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import * as cnpj from "validation-br/dist/cnpj";
import * as cpf from "validation-br/dist/cpf";
import { Utility } from "../../support/utils/utility";

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

test("Leasing - CNPJ ja cadastrado", async ({ page }) => {
  test.slow();
  await page.goto("/");
  await page.click("css=button >> text=Nova");
  //await page.getByRole('button', { name: 'Nova' }).click(); /// tambem esta certo
  //await page.locator('[ng-reflect-router-link="/capital-giro"]').click();
  await page.locator('[ng-reflect-router-link="/leasing"]').click();
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/leasing"
  );
  await page.locator('[ng-reflect-placeholder="CNPJ"]').fill("40482121324891");
  await page.locator('[ng-reflect-placeholder="CNPJ"]').press("Tab");
  await page.waitForResponse(
    (response) =>
      response.url().includes("/crivo-last-result") && response.status() === 200
  );
  await page.waitForTimeout(3000);

  ////COMANDO PARA GERAÇÃO DE DATAS
  const currentDate = new Date();
  const formattedDate = `${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${currentDate.getFullYear()}`;
  const futureDate = new Date(currentDate.getTime() + 66 * 24 * 60 * 60 * 1000);
  const formattedFutureDate = `${futureDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${(futureDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${futureDate.getFullYear()}`;

  ////PROPOSTA DE NEGOCIO
  await page.click("css=div >> text=Proposta de Negócios");
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/leasing"
  );
  await page.locator('[placeholder="Promotor"]').click();
  await page.getByText(" Nome do Operador 1602 ").first().click();
  await page.locator('[placeholder="Origem"]').click();
  await page.getByText(" OMNI BANCO ").first().click();
  await page.locator('[placeholder="Operação"]').click();
  await page.getByText(" 10129 - LEASING CANAL DE EMPRESAS ").click();
  await page.locator('[data-placeholder="Parcelas"]').fill("68");
  const inputTaxa = page.locator('[formcontrolname="taxaMensal"]');
  await inputTaxa.pressSequentially("2");
  await inputTaxa.press("Tab");
  await page
    .locator('[data-placeholder="Valor Tarifa de Cadastro"]')
    .pressSequentially("1.00");
  await page
    .locator('[data-placeholder="Valor do(s) bem(s)"]')
    .pressSequentially("25000000");
  await page
    .locator('[data-placeholder="Valor de Entrada"]')
    .pressSequentially("0");
  await page
    .locator('[data-placeholder="Data de Liberação"]')
    .fill(formattedDate);
  await page
    .locator('[data-placeholder="Vencimento Primeira Parcela"]')
    .fill(formattedFutureDate);
  await page
    .locator('[data-placeholder="Vencimento Primeira Parcela"]')
    .press("Tab");
  await page.getByText(" Calcular ").click();
  await page.waitForTimeout(40000);
  await page.getByText("Cálculo realizado com sucesso!");

  // //// /GARANTIA///
  await page.click("css=div >> text=Garantias");
  //await page.pause();
  await page.waitForTimeout(5000);
  await page.locator("omni-garantias-shared").getByRole("button").click();
  await page.getByLabel("Tipo Garantia *").locator("div").nth(2).click();
  await page.getByText("Máquinas e Equipamentos").click();
  await page.locator('[placeholder="Segmento"]').click();
  await page.getByText(" Acabamentos Finos ").first().click();
  await page.locator('[formcontrolname="fabricante"]').fill("FBB");
  await page
    .locator('[formcontrolname="numeroSerie"]')
    .pressSequentially("345652");
  await page.locator('[formcontrolname="modelo"]').pressSequentially("345652");
  await page
    .locator('[formcontrolname="notaFiscal"]')
    .pressSequentially("32345");
  await page.locator('[placeholder="Status do Bem"]').click();
  await page.getByText(" Usado ").first().click();
  await page.locator('[formcontrolname="anoFabricacao"]').fill("2020");
  await page.locator('[placeholder="Prazo Vida Útil"]').click();
  await page.getByText("4", { exact: true }).click();
  await page
    .locator('[formcontrolname="valorBem"]')
    .last()
    .pressSequentially("25000000");
  await page.locator('[placeholder="Tipo do Bem"]').click();
  await page.getByText(" Bem Arrendado ").first().click();

  await page.getByRole("button", { name: "Salvar" }).click();

  await page.getByRole("button", { name: "Salvar" }).click();
  //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
  const proposta = await page
    .locator('[id="header-proposta-idPropostaCliente"]')
    .innerText();
  await page.getByRole("button", { name: "Salvar" }).click();
  const id = await page.locator('[id="etapas-proposta__id"]').innerText();
  await page.waitForTimeout(10000);

  let url =
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/leasing/";
  await page.goto(url + id);
  await page.waitForTimeout(8000);
  await page.reload();

  /////AÇÃO DE ENVIAR PROPOSTA 1    > PRE PROPOSTA PARA ANALISE COMERCIAL
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Proposta").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(3000);

  await page.goto(url + id);
  await page.reload();
  /////AÇÃO DE ENVIAR PROPOSTA 1.1    > PRE PROPOSTA PARA ANALISE COMERCIAL
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Proposta").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(3000);

  /////AÇÃO DE ENVIAR PROPOSTA 2.1    > Analise PLD PARA ANALISE COMERCIAL
  // let url =
  //   "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/leasing/";
  await page.goto(url + id);
  await page.reload();
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  //await page.waitForTimeout(10000);
  //await page.pause();
  await page.waitForTimeout(8000);
  await page.goto(url + id);
  await page.reload();
  /////AÇÃO DE ENVIAR PROPOSTA 3    > ANALISE COMERCIAL PARA ANALISE DE CREDITO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  //await page.pause();
  await page.waitForTimeout(10000);

  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/fila-agente"
  );
  await page.click("css=div >> text=Em Análise");
  //await page.getByRole('button').filter({ hasText: ' Filtrar Propostas ' }).click();
  await page
    .getByRole("button")
    .filter({ hasText: " Filtrar Propostas " })
    .nth(1)
    .click();
  await page.waitForTimeout(5000);
  await page.locator('[data-placeholder="Nº Proposta"]').fill(proposta);
  await page.waitForTimeout(10000);
  //await page.pause();
  await page.locator('[ng-reflect-message="Leasing"]').click();
  await expect(page.locator(".mat-checkbox-inner-container")).toBeVisible({
    timeout: 30_000,
  });
  // await page.waitForTimeout(10000);

  await page.click("css=div >> text=Bureau de Crédito");
  await page.click("css=div >> text=Redisparo da crivo Manual");
  await page.waitForTimeout(10000);
  await page.reload();
  /////AÇÃO DE ENVIAR PROPOSTA 4    >  ANALISE DE CREDITO PARA APROVADO
  await page.getByRole("button", { name: " Ações " }).click();
  await expect(page.locator('[formcontrolname="acao"]')).toBeVisible({
    timeout: 30_000,
  });
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[data-placeholder="Data do Comitê"]').fill(formattedDate);
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(120000);
  //await page.pause();
  //await page.reload();
  await page.goto(url + id);
  await page.reload();
  ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
  await page.click("css=div >> text=Dados Bancários");
  await page.locator('[formcontrolname="favorecido"]').click();
  await page.getByText("TERCEIRO").first().click();
  await page.locator('[formcontrolname="cpfCnpj"]').fill(cnpj.fake());
  await page.locator('[formcontrolname="cpfCnpj"]').press("Tab");
  await page.locator('[formcontrolname="titular"]').fill("Teste");
  await page.locator('[formcontrolname="codigoBanco"]').first().click();
  await page.getByText("613").first().click();
  await page.locator('[formcontrolname="codigoAgencia"]').first().fill("1234");
  //await page.waitForTimeout(2000);
  await page.locator('[formcontrolname="descricaoAgencia"]').first().click();
  await page
    .locator('[formcontrolname="descricaoAgencia"]')
    .first()
    .fill("TESTE12");
  await page
    .locator('[formcontrolname="numeroContaCorrente"]')
    .first()
    .fill("123456");
  await page
    .locator('[formcontrolname="digitoContaCorrente"]')
    .first()
    .fill("12");
  await page.locator('[formcontrolname="contaVinculada"]').fill("789123");
  await page.click("css=button >> text=Salvar");
  await page.waitForTimeout(5000);
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Pré-Formalização").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(8000);

  await page.goto(url + id);
  //await page.waitForTimeout(10000);
  await page.reload();
  ////AÇÃO DE ENVIAR PROPOSTA 5   >  PRE FORMALIZAÇÃO PARA FORMALIZAÇÃO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Formalização").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  //await page.waitForTimeout(1000);

  await page.goto(url + id);
  await page.waitForTimeout(1000);
  await page.reload();
  await page.click("css=div >> text=Proposta de Negócios");
  await page.click('[ng-reflect-message="Gerar Contrato"]');
  //await page.waitForTimeout(8000);

  await page.goto(url + id);
  await page.waitForTimeout(8000);
  await page.reload();

  /////AÇÃO DE ENVIAR PROPOSTA 6   > FORMALIZAÇÃO PARA AGUARDANDO ASSINATURA
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(5000);

  await page.goto(url + id);
  //await page.waitForTimeout(8000);
  await page.reload();

  /////AÇÃO DE ENVIAR PROPOSTA 7   > AGUARDANDO ASSINATURA PARA AGUARDANDO LIBERAÇÃO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(8000);

  await page.goto(url + id);
  //await page.waitForTimeout(8000);
  await page.reload();
  /////AÇÃO DE ENVIAR PROPOSTA 8   > AGUARDANDO LIBERAÇÃO PARA AGUARDANDO CONTRATO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.locator('[ng-reflect-value="approve"]').click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(8000);

  await page.goto(url + id);
  //await page.waitForTimeout(5000);
  await page.reload();
  // /////AÇÃO DE ENVIAR PROPOSTA 9   > AGUARDANDO CONTRATO PARA FINALIZADO
  // await page.getByRole("button", { name: " Ações " }).click();
  // await page.click('[formcontrolname="acao"]');
  // await page.locator('[ng-reflect-value="approve"]').click();
  // await page.locator('[formcontrolname="parecer"]').fill("Teste");
  // await page.getByRole("button", { name: "Salvar" }).click();
  await page.close();
  //await page.pause();
});
