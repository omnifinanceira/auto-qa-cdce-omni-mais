import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import * as cnpj from "validation-br/dist/cnpj";
import * as cpf from "validation-br/dist/cpf";
import { Utility } from "../../support/utils/utility";

test.describe("suite de teste capital de giro", () => {
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

  test.only("Capital de Giro - FGI A VISTA com Seguro prestamista FINANCIADO", async ({
    page,
  }) => {
    await page.goto("/");
    await page.click("css=button >> text=Nova");
    await page.locator('[ng-reflect-router-link="/capital-giro"]').click();
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro"
    );
    await page
      .locator('[ng-reflect-placeholder="CNPJ"]')
      .fill("92950226278617");
    await page.locator('[ng-reflect-placeholder="CNPJ"]').press("Tab");
    await page.waitForResponse(
      (response) =>
        response.url().includes("/crivo-last-result") &&
        response.status() === 200
    );
    const id = await page.locator('[id="etapas-proposta__id"]').innerText();
    //PROPOSTA DE NEGOCIO
    await page.click("css=div >> text=Proposta de Negócios");
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro"
    );
    await page.locator('[placeholder="Operação"]').click();
    await page.getByText(" 8818 - CAPITAL DE GIRO MIDDLE - 445 ").click();
    await page
      .locator('[data-placeholder="Valor do Empréstimo"]')
      .pressSequentially("25000000");
    await page.locator('[data-placeholder="Valor do Empréstimo"]').focus();
    await page.locator('[data-placeholder="Valor do Empréstimo"]').blur();
    const inputTaxa = page.locator('[formcontrolname="taxaMensal"]');
    await inputTaxa.pressSequentially("1.00");
    await inputTaxa.press("Tab");
    await page.locator('[placeholder="Periodicidade"]').click();
    await page.getByText("  MENSAL ").click();
    await page.locator('[data-placeholder="Parcelas"]').fill("68");
    await page.locator('[formcontrolname="pagamentoTarifaCadastro"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    await page
      .locator('[formcontrolname="valorTarifaCadastro"]')
      .pressSequentially("2");
    ////PAGAMNETO SEGURO////
    await page.locator('[formcontrolname="pagamentoSeguro"]').click();
    await page.locator('[ng-reflect-value="F"]').click();
    ///////////GARANTIA BNDES////
    await page.locator('[formcontrolname="possuiGarantiaBNDES"]').click();
    await page.locator('[ng-reflect-value="S"]').click();
    await page.waitForTimeout(5000);
    await page.locator('[formcontrolname="tipoGarantiaBNDES"]').click();
    await page.getByText(" FGI ").click();
    await page.locator('[formcontrolname="percentualCoberturaBNDES"]').click();
    await page.getByText("70%").click();
    await page.locator('[formcontrolname="tipoPagamentoECG"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    await page.locator('[formcontrolname="pagamentoIof"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getFullYear()}`;
    const futureDate = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const formattedFutureDate = `${futureDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(futureDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${futureDate.getFullYear()}`;

    // await page.locator('[data-placeholder="Data de Emissão do Contrato"]').fill('26/02/2024');
    await page
      .locator('[data-placeholder="Data de Emissão do Contrato"]')
      .fill(formattedDate);
    await page
      .locator('[data-placeholder="Data de Liberação"]')
      .fill(formattedDate);
    await page
      .locator('[data-placeholder="Vencimento Primeira Parcela"]')
      .fill(formattedFutureDate);
    await page
      .locator('[data-placeholder="Vencimento Primeira Parcela"]')
      .blur();
    await page.getByText(" Calcular ").click();
    await page.waitForTimeout(40000);
    await page.getByText("Cálculo realizado com sucesso!");
    // //// /GARANTIA
    await page.click("css=div >> text=Garantias");
    await page.waitForTimeout(7000);
    /////AÇÃO DE ENVIAR PROPOSTA 1    > PRE PROPOSTA PARA ANALISE COMERCIAL
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Proposta").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
    const proposta = await page
      .locator('[id="header-proposta-idPropostaCliente"]')
      .innerText();
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(10000);

    let url =
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro/";
    await page.goto(url + id);
    await page.waitForTimeout(10000);
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
    await page.locator('[ng-reflect-message="Capital de Giro"]').click();
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
    await page
      .locator('[data-placeholder="Data do Comitê"]')
      .fill(formattedDate);
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(120000);
    //await page.pause();
    //await page.reload();
    await page.goto(url + id);
    await page.reload();
    ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
    await page.click("css=div >> text=Dados Bancários");
    await page
      .locator('[formcontrolname="codigoAgencia"]')
      .first()
      .fill("1234");
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
    await page.waitForTimeout(8000);

    await page.goto(url + id);
    //await page.waitForTimeout(8000);
    await page.reload();
    await page.click("css=div >> text=Proposta de Negócios");
    await page.click('[ng-reflect-message="Gerar Contrato"]');
    await page.waitForTimeout(8000);

    await page.goto(url + id);
    await page.waitForTimeout(8000);
    // await page.reload();

    //////PROCESSO PARA UPLOAD DE TERMO DE ADESÃO
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar Termo de adesão"]');
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles("support/fixtures/images/imagem1.png");

    await page.getByRole("button", { name: "Salvar" }).click();

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
    //////PROCESSO PARA UPLOAD DE CCB ASSINADA
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise1 = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar CCB Assinada"]');
    const fileChooser1 = await fileChooserPromise1;

    await fileChooser1.setFiles("support/fixtures/images/imagem1.png");

    await page.getByRole("button", { name: "Salvar" }).click();
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

    await page.close();

    //await page.goto(url + id);
    //await page.pause();
  });

  test("Capital de Giro - FGI PEAC A VISTA com NÃO POSSUI Seguro prestamista", async ({
    page,
  }) => {
    test.slow();
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/login?route=home"
    );
    await page.locator('[data-placeholder="Usuário"]').fill("TIAGO_FARIAS");
    await page.locator('[data-placeholder="Senha"]').fill("AH52SI31");
    await page.getByRole("button").click();
    // await page.goto('https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/login?route=home');
    // await page.getByText(' 331 - Nome Agente 331 ').check();
    // await page.getByText(' Confirmar ').click();
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/home"
    );
    await page.click("css=button >> text=Nova");
    //await page.getByRole('button', { name: 'Nova' }).click(); /// tambem esta certo
    //await page.locator('[ng-reflect-router-link="/capital-giro"]').click();
    await page.locator('[ng-reflect-router-link="/capital-giro"]').click();
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro"
    );
    // const inputCnpj = page.locator('#mat-input-5');
    // //await page.pause();
    // await inputCnpj.fill('35543713000186');
    await page
      .locator('[ng-reflect-placeholder="CNPJ"]')
      .fill("00844270180659");
    await page.locator('[ng-reflect-placeholder="CNPJ"]').press("Tab");
    //await inputCnpj.press('Tab');
    await page.waitForTimeout(25000);
    const id = await page.locator('[id="etapas-proposta__id"]').innerText();
    //PROPOSTA DE NEGOCIO
    await page.click("css=div >> text=Proposta de Negócios");
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro"
    );
    await page.locator('[placeholder="Operação"]').click();
    await page.getByText(" 8818 - CAPITAL DE GIRO MIDDLE - 445 ").click();
    await page
      .locator('[data-placeholder="Valor do Empréstimo"]')
      .pressSequentially("25000000");
    await page.locator('[data-placeholder="Valor do Empréstimo"]').focus();
    await page.locator('[data-placeholder="Valor do Empréstimo"]').blur();
    const inputTaxa = page.locator('[formcontrolname="taxaMensal"]');
    await inputTaxa.pressSequentially("2.0000");
    await inputTaxa.press("Tab");
    await page.locator('[placeholder="Periodicidade"]').click();
    await page.getByText("  MENSAL ").click();
    await page.locator('[data-placeholder="Parcelas"]').fill("68");
    await page.locator('[formcontrolname="pagamentoTarifaCadastro"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    await page
      .locator('[formcontrolname="valorTarifaCadastro"]')
      .pressSequentially("2");
    await page.locator('[formcontrolname="pagamentoSeguro"]').click();
    await page.locator('[ng-reflect-value="N"]').click();
    //await page.locator('[data-placeholder="Valor do Seguro"]').pressSequentially('23');
    await page.locator('[formcontrolname="possuiGarantiaBNDES"]').click();
    await page.locator('[ng-reflect-value="S"]').click();
    await page.waitForTimeout(5000);
    await page.locator('[formcontrolname="tipoGarantiaBNDES"]').click();
    await page.getByText(" PEAC ").click();
    //await page.locator('[formcontrolname="percentualCoberturaBNDES"]').click();
    //await page.getByText('20%').click();
    await page.locator('[formcontrolname="tipoPagamentoECG"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getFullYear()}`;
    const futureDate = new Date(
      currentDate.getTime() + 36 * 24 * 60 * 60 * 1000
    );
    const formattedFutureDate = `${futureDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(futureDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${futureDate.getFullYear()}`;

    // await page.locator('[data-placeholder="Data de Emissão do Contrato"]').fill('26/02/2024');
    await page
      .locator('[data-placeholder="Data de Emissão do Contrato"]')
      .fill(formattedDate);
    await page
      .locator('[data-placeholder="Data de Liberação"]')
      .fill(formattedDate);
    await page
      .locator('[data-placeholder="Vencimento Primeira Parcela"]')
      .fill(formattedFutureDate);
    await page
      .locator('[data-placeholder="Vencimento Primeira Parcela"]')
      .blur();
    await page.getByText(" Calcular ").click();
    await page.waitForTimeout(40000);
    await page.getByText("Cálculo realizado com sucesso!");
    // //// /GARANTIA
    await page.click("css=div >> text=Garantias");
    await page.waitForTimeout(7000);
    /////AÇÃO DE ENVIAR PROPOSTA 1    > PRE PROPOSTA PARA ANALISE COMERCIAL
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Proposta").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
    const proposta = await page
      .locator('[id="header-proposta-idPropostaCliente"]')
      .innerText();
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(10000);

    let url =
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro/";
    await page.goto(url + id);
    //await page.waitForTimeout(8000);
    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 2.1    > pré porposta PARA ANALISE comercial
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Proposta").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(10000);

    await page.goto(url + id);
    //await page.waitForTimeout(8000);
    await page.reload();

    /////AÇÃO DE ENVIAR PROPOSTA 3    > ANALISE COMERCIAL PARA ANALISE DE CREDITO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();
    //await page.pause();
    await page.waitForTimeout(15000);

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
    await page.locator('[data-placeholder="Nº Proposta"]').fill(proposta);
    await page.waitForTimeout(15000);
    //await page.pause();
    await page.locator('[ng-reflect-message="Capital de Giro"]').click();
    // await page.waitForTimeout(10000);

    await page.click("css=div >> text=Bureau de Crédito");
    await page.click("css=div >> text=Redisparo da crivo Manual");
    await page.waitForTimeout(10000);
    /////AÇÃO DE ENVIAR PROPOSTA 4    >  ANALISE DE CREDITO PARA APROVADO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page
      .locator('[data-placeholder="Data do Comitê"]')
      .fill(formattedDate);
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    await page.waitForTimeout(120000);
    //await page.pause();

    await page.goto(url + id);
    await page.reload();
    ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
    await page.click("css=div >> text=Dados Bancários");
    await page
      .locator('[formcontrolname="codigoAgencia"]')
      .first()
      .fill("1234");
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
    await page.waitForTimeout(8000);

    await page.goto(url + id);
    //await page.waitForTimeout(8000);
    await page.reload();
    await page.click("css=div >> text=Proposta de Negócios");
    await page.click('[ng-reflect-message="Gerar Contrato"]');
    await page.waitForTimeout(8000);

    await page.goto(url + id);
    //await page.waitForTimeout(8000);
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
    //////PROCESSO PARA UPLOAD DE CCB ASSINADA
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise1 = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar CCB Assinada"]');
    const fileChooser1 = await fileChooserPromise1;

    await fileChooser1.setFiles("support/fixtures/images/imagem1.png");

    await page.getByRole("button", { name: "Salvar" }).click();
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
    await page.close();
    //await page.goto(url + id);
    //await page.pause();
  });
  test("Capital de Giro - FGI A VISTA com Seguro prestamista FINANCIADO com operação de Renegociação", async ({
    page,
  }) => {
    await page.goto("/");
    await page.click("css=button >> text=Nova");
    await page.locator('[ng-reflect-router-link="/capital-giro"]').click();
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro"
    );
    await page
      .locator('[ng-reflect-placeholder="CNPJ"]')
      .fill("50999062175008");
    await page.locator('[ng-reflect-placeholder="CNPJ"]').press("Tab");
    await page.waitForResponse(
      (response) =>
        response.url().includes("/crivo-last-result") &&
        response.status() === 200
    );
    const id = await page.locator('[id="etapas-proposta__id"]').innerText();
    //////PROPOSTA DE NEGOCIO
    await page.click("css=div >> text=Proposta de Negócios");
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro"
    );
    await page.locator('[placeholder="Operação"]').click();
    await page.getByText("12864 - CAPITAL DE GIRO RENEGOCIAÇÃO").click();
    await page
      .locator('[data-placeholder="Valor do Empréstimo"]')
      .pressSequentially("25000000");
    await page.locator('[data-placeholder="Valor do Empréstimo"]').focus();
    await page.locator('[data-placeholder="Valor do Empréstimo"]').blur();
    const inputTaxa = page.locator('[formcontrolname="taxaMensal"]');
    await inputTaxa.pressSequentially("1");
    await inputTaxa.press("Tab");
    await page.locator('[placeholder="Periodicidade"]').click();
    await page.getByText("  MENSAL ").click();
    await page.locator('[data-placeholder="Parcelas"]').fill("68");
    await page
      .locator('[data-placeholder="Número Contrato Renegociado"]')
      .pressSequentially("102646000025624");
    await page.locator('[formcontrolname="pagamentoTarifaCadastro"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    await page
      .locator('[formcontrolname="valorTarifaCadastro"]')
      .pressSequentially("1");
    ////PAGAMNETO SEGURO////
    await page.locator('[formcontrolname="pagamentoSeguro"]').click();
    await page.locator('[ng-reflect-value="F"]').click();
    ///////////GARANTIA BNDES////
    await page.locator('[formcontrolname="possuiGarantiaBNDES"]').click();
    await page.locator('[ng-reflect-value="S"]').click();
    await page.waitForTimeout(5000);
    await page.locator('[formcontrolname="tipoGarantiaBNDES"]').click();
    await page.getByText(" FGI ").click();
    await page.locator('[formcontrolname="percentualCoberturaBNDES"]').click();
    await page.getByText("70%").click();
    await page.locator('[formcontrolname="tipoPagamentoECG"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    await page.locator('[formcontrolname="pagamentoIof"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getFullYear()}`;
    const futureDate = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const formattedFutureDate = `${futureDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(futureDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${futureDate.getFullYear()}`;

    // await page.locator('[data-placeholder="Data de Emissão do Contrato"]').fill('26/02/2024');
    await page
      .locator('[data-placeholder="Data de Emissão do Contrato"]')
      .fill(formattedDate);
    await page
      .locator('[data-placeholder="Data de Liberação"]')
      .fill(formattedDate);
    await page
      .locator('[data-placeholder="Vencimento Primeira Parcela"]')
      .fill(formattedFutureDate);
    await page
      .locator('[data-placeholder="Vencimento Primeira Parcela"]')
      .blur();
    await page.getByText(" Calcular ").click();
    await page.waitForTimeout(40000);
    await page.getByText("Cálculo realizado com sucesso!");
    // //// /GARANTIA
    await page.click("css=div >> text=Garantias");
    await page.waitForTimeout(7000);
    /////AÇÃO DE ENVIAR PROPOSTA 1    > PRE PROPOSTA PARA ANALISE COMERCIAL
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Proposta").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
    const proposta = await page
      .locator('[id="header-proposta-idPropostaCliente"]')
      .innerText();
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(8000);

    let url =
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro/";
    await page.goto(url + id);
    //await page.waitForTimeout(8000);
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
    await page.locator('[ng-reflect-message="Capital de Giro"]').click();
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
    await page
      .locator('[data-placeholder="Data do Comitê"]')
      .fill(formattedDate);
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(120000);
    //await page.pause();
    //await page.reload();
    await page.goto(url + id);
    await page.reload();
    ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
    await page.click("css=div >> text=Dados Bancários");
    await page
      .locator('[formcontrolname="codigoAgencia"]')
      .first()
      .fill("1234");
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
    await page.waitForTimeout(8000);

    await page.goto(url + id);
    //await page.waitForTimeout(8000);
    await page.reload();
    await page.click("css=div >> text=Proposta de Negócios");
    await page.click('[ng-reflect-message="Gerar Contrato"]');
    await page.waitForTimeout(8000);

    await page.goto(url + id);
    await page.waitForTimeout(8000);
    // await page.reload();

    //////PROCESSO PARA UPLOAD DE TERMO DE ADESÃO
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar Termo de adesão"]');
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles("support/fixtures/images/imagem1.png");

    await page.getByRole("button", { name: "Salvar" }).click();

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
    //////PROCESSO PARA UPLOAD DE CCB ASSINADA
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise1 = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar CCB Assinada"]');
    const fileChooser1 = await fileChooserPromise1;

    await fileChooser1.setFiles("support/fixtures/images/imagem1.png");

    await page.getByRole("button", { name: "Salvar" }).click();
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

    //await page.goto(url + id);
    //await page.pause();
  });
});
