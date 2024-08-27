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

test("Financiamento PJ - CNPJ cadastrado", async ({ page }) => {
  test.slow();
  await page.goto("/");
  await page.click("css=button >> text=Nova");
  //await page.getByRole('button', { name: 'Nova' }).click(); /// tambem esta certo
  //await page.locator('[ng-reflect-router-link="/capital-giro"]').click();
  await page.locator('[ng-reflect-router-link="/financiamento-pj"]').click();
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/financiamento-pj"
  );
  await page.locator('[ng-reflect-placeholder="CNPJ"]').fill("67311343000148");
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
  //////PROPOSTA DE NEGOCIOS //////
  await page.click("css=div >> text=Proposta de Negócios");
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/financiamento-pj"
  );

  await page.getByLabel("Promotor *").getByText("Promotor").click();
  await page
    .getByRole("option", { name: "Nome do Operador 1602" })
    .locator("span")
    .click();

  await page.locator('[placeholder="Origem"]').click();
  await page.locator('[ng-reflect-message="OMNI BANCO"]').click();
  //8511 - FINANCIAMENTOPJ DE MÁQUINAS COM 3
  await page.locator('[placeholder="Operação"]').click();
  await page.locator('[ng-reflect-value="8511"]').click();
  await page.locator('[data-placeholder="Parcelas"]').pressSequentially("56");
  const inputTaxa = page.locator('[data-placeholder="Taxa Básica"]');
  await inputTaxa.pressSequentially("2");
  await inputTaxa.press("Tab");
  await page
    .locator('[data-placeholder="Valor Tarifa de Cadastro"]')
    .pressSequentially("100");
  await page
    .locator('[data-placeholder="Valor do(s) bem(s)"]')
    .pressSequentially("8.28000");
  await page
    .locator('[data-placeholder="Valor de Entrada"]')
    .pressSequentially("0");
  await page.locator('[placeholder="Pagamento IOF"]').click();
  await page.getByText(" NÃO POSSUI ").first().click();
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

  // //// /GARANTIA//////////
  await page.click("css=div >> text=Garantias");
  await page.waitForTimeout(5000);
  await page.click('[ng-reflect-message="Adicionar Garantia"]');
  await page.locator('[formcontrolname="tipoGarantia"]').click();
  //await page.getByLabel('Tipo Garantia *').locator('span').click();
  await page.getByText("Avalista - PF").click();
  //await page.getByRole('textbox', { name: 'CPF', exact: true }).click({
  button: "right";
  //});
  //await page.locator('[formcontrolname="cpf"]').nth(2).fill(cpf.fake());
  await page
    .getByRole("textbox", { name: "CPF", exact: true })
    .fill("136.754.650-80");
  await page.getByRole("textbox", { name: "CPF", exact: true }).press("Tab");

  await page.getByRole("button", { name: "Salvar" }).click();
  await page.click('[ng-reflect-message="Adicionar Garantia"]');
  await page.locator('[formcontrolname="tipoGarantia"]').click();
  await page
    .getByRole("option", { name: "Veículo" })
    .locator("span")
    .first()
    .click();
  await page.getByLabel("UF de licenciamento *").locator("div").nth(2).click();
  await page.getByText("RJ").click();
  await page
    .getByLabel("Categoria", { exact: true })
    .getByText("Categoria")
    .click();
  await page.getByText("AUTOMOVEL").click();
  await page.getByLabel("Marca").locator("div").nth(3).click();
  await page.getByText("FORD").click();
  await page.getByLabel("Ano Modelo *").locator("div").nth(2).click();
  await page.getByText("2000").click();
  await page.getByLabel("Ano Fabricação *").locator("div").nth(3).click();
  await page.getByText("1999").click();
  await page.getByLabel("Modelo", { exact: true }).getByText("Modelo").click();
  await page.getByText("FIESTA").click();
  await page.getByLabel("Versão").locator("div").nth(3).click();
  await page.getByText("CLASS 1.0 2P G").click();
  await page.getByLabel("Placa").click();
  await page.getByLabel("Placa").fill("GHJ8765");
  await page.getByLabel("Renavam").click();
  await page.getByLabel("Renavam").fill("34567876456");
  await page.getByLabel("Chassi").click();
  await page.getByLabel("Chassi").fill("6544567890");
  await page.getByLabel("Combustível").locator("div").nth(3).click();
  await page.getByText("ÁLCOOL/GNV").click();
  await page.getByLabel("Cor", { exact: true }).getByText("Cor").click();
  await page.getByText("CINZA").click();
  await page.waitForTimeout(3000);
  await page
    .getByLabel("Tipo Dados do Fiduciante *")
    .locator("div")
    .nth(2)
    .click();
  await page.getByRole("option", { name: "Cliente" }).locator("span").click();
  await page.getByLabel("CPF/CNPJ *").click();
  await page.getByLabel("CPF/CNPJ *").fill("35543713000186");
  await page.waitForTimeout(3000);
  await page.getByLabel("% Sobre a operação *").click();
  await page.getByLabel("% Sobre a operação *").fill("100");
  //await page.waitForTimeout(3000);
  await page.getByLabel("% Sobre a operação *").press("Tab");
  await page.locator('[formcontrolname="tipoGarantia"]').press("Tab");
  await page.getByLabel("% Sobre a operação *").press("Tab");
  // await page.getByText("AUTOMOVEL").press("Tab");
  // await page.getByLabel("UF de licenciamento *").press("Tab");
  await page.getByRole("button", { name: "Salvar" }).click();
  //await page.getByRole("button", { name: "Salvar" }).click();
  await page.getByRole("button", { name: "Salvar" }).click();

  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Proposta").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.waitForTimeout(10000);

  //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
  const proposta = await page
    .locator('[id="header-proposta-idPropostaCliente"]')
    .innerText();
  await page.getByRole("button", { name: "Salvar" }).click();
  const id = await page.locator('[id="etapas-proposta__id"]').innerText();
  await page.waitForTimeout(10000);

  let url =
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/financiamento-pj/";
  await page.goto(url + id);
  await page.waitForTimeout(8000);
  await page.reload();
  /////AÇÃO DE ENVIAR PROPOSTA 2.1    > Analise PLD PARA ANALISE COMERCIAL
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(10000);
  //await page.pause();

  await page.goto(url + id);
  await page.waitForTimeout(8000);
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
  await page.locator('[ng-reflect-message="Financiamento PJ"]').click();
  await expect(page.locator(".mat-checkbox-inner-container")).toBeVisible({
    timeout: 30_000,
  });
  // await page.waitForTimeout(10000);

  await page.click("css=div >> text=Bureau de Crédito");
  await page.click("css=div >> text=Redisparo da crivo Manual");
  await page.waitForTimeout(10000);
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
  await page.locator('[formcontrolname="favorecido"]').first().click();
  await page.getByText("TERCEIRO").click();
  await page.locator('[formcontrolname="cpfCnpj"]').fill(cnpj.fake());
  await page.locator('[formcontrolname="cpfCnpj"]').press("Tab");
  await page.locator('[formcontrolname="titular"]').fill("Teste Maria");
  await page.locator('[formcontrolname="codigoBanco"]').first().click();
  await page.getByText("613").click();
  //await page.getByRole("button", { name: "613" }).click();
  //await page.waitForTimeout(8000);
  await page.locator('[formcontrolname="codigoAgencia"]').first().fill("1234");
  await page.locator('[formcontrolname="codigoAgencia"]').first().press("Tab");
  //await page.waitForTimeout(2000);
  //await page.locator('[formcontrolname="descricaoAgencia"]').first().click();
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

  // /////PROCESSO PARA UPLOAD CERTIFICADO UNICAD
  // await page.click("css=div >> text=Documentos");
  // const fileChooserPromise = page.waitForEvent("filechooser");

  // await page.click('[ng-reflect-message="Anexar Cadastro UNICAD"]');
  // const fileChooser = await fileChooserPromise;

  // await fileChooser.setFiles("support/fixtures/images/imagem1.png");

  // await page.getByRole("button", { name: "Salvar" }).click();

  // await page.goto(url + id);
  // //await page.waitForTimeout(10000);
  // await page.reload();

  ////AÇÃO DE ENVIAR PROPOSTA 5   >  PRE FORMALIZAÇÃO PARA FORMALIZAÇÃO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Formalização").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(8000);

  await page.goto(url + id);
  await page.waitForTimeout(8000);
  await page.reload();
  await page.click("css=div >> text=Proposta de Negócios");
  await page.click('[ng-reflect-message="Gerar Contrato"]');
  await page.waitForTimeout(8000);

  await page.goto(url + id);
  await page.waitForTimeout(3000);
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
  // //////PROCESSO PARA UPLOAD DE CCB ASSINADA
  // await page.click("css=div >> text=Documentos");
  // const fileChooserPromise1 = page.waitForEvent("filechooser");

  // await page.click('[ng-reflect-message="Anexar CCB Assinada"]');
  // const fileChooser1 = await fileChooserPromise1;

  // await fileChooser1.setFiles("support/fixtures/images/imagem1.png");

  // await page.getByRole("button", { name: "Salvar" }).click();
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
  /////AÇÃO DE ENVIAR PROPOSTA 9   > AGUARDANDO CONTRATO PARA FINALIZADO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.locator('[ng-reflect-value="approve"]').click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(8000);

  await page.goto(url + id);
  //await page.pause();
});
