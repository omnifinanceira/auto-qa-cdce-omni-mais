import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import * as cnpj from "validation-br/dist/cnpj";
import * as cpf from "validation-br/dist/cpf";
import { Utility } from "../../utils/utility";
import { CapitalGiroPage } from "../../Pages/CapitalGiro/CapitalGiroPage";
import { HomePage } from "../../Pages/HomePage/HomePage";

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
    const homePage = new HomePage(page);

    test.slow();

    await homePage.enterHomePage();

    const capitalGiro = await homePage.entrarCapitalGiro();

    await capitalGiro.escreverCNPJ("35543713000186");

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
      .pressSequentially("39999998");
    await page.locator('[data-placeholder="Valor do Empréstimo"]').focus();
    await page.locator('[data-placeholder="Valor do Empréstimo"]').blur();
    const inputTaxa = page.locator('[formcontrolname="taxaMensal"]');
    await inputTaxa.fill("1.45");
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
    await page.waitForTimeout(2000); ///antes era 5
    await page.locator('[formcontrolname="tipoGarantiaBNDES"]').click();
    await page.getByText(" FGI ").click();
    await page.locator('[formcontrolname="percentualCoberturaBNDES"]').click();
    await page.getByText("70%").click();
    await page.locator('[formcontrolname="tipoPagamentoECG"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    await page.locator('[formcontrolname="pagamentoIof"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    ////FORMATO DE DATA
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getFullYear()}`;
    const futureDate = new Date(
      currentDate.getTime() + 60 * 24 * 60 * 60 * 1000
    );
    const formattedFutureDate = `${futureDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(futureDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${futureDate.getFullYear()}`;

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
    await page.locator('[data-placeholder="Valor do Empréstimo"]').press("Tab");

    await page.getByText(" Calcular ").click();

    const calculoRequests = Promise.all([
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes("/capital-giro/api/calculations/financed-amount") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await calculoRequests;

    // //// /GARANTIA
    await page.click("css=div >> text=Garantias");
    await page.waitForTimeout(5000); ///antes era 7
    /////AÇÃO DE ENVIAR PROPOSTA 1    > PRE PROPOSTA PARA ANALISE PLD
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Proposta").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
    const proposta = await page
      .locator('[id="header-proposta-idPropostaCliente"]')
      .innerText();
    await page.getByRole("button", { name: "Salvar" }).click();

    const preProposta = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await preProposta;
    let url =
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro/";
    await page.goto(url + id);
    await page.waitForTimeout(6000); ///antes era 10
    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 2    > Analise PLD PARA ANALISE COMERCIAL
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const analisePld = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await analisePld;
    await page.goto(url + id);

    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 3    > ANALISE COMERCIAL PARA ANALISE DE CREDITO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const analiseComercial = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await analiseComercial;
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/fila-agente"
    );
    await page.click("css=div >> text=Em Análise");

    await page
      .getByRole("button")
      .filter({ hasText: " Filtrar Propostas " })
      .nth(1)
      .click();
    await page.waitForTimeout(2000); ///antes era 5
    await page.locator('[data-placeholder="Nº Proposta"]').fill(proposta);

    await page.waitForTimeout(6000); ///antes era 10
    await expect(
      page.locator('[ng-reflect-message="Capital de Giro"]')
    ).toBeVisible({
      timeout: 30_000,
    });

    await page.locator('[ng-reflect-message="Capital de Giro"]').click();
    await expect(page.locator(".mat-checkbox-inner-container")).toBeVisible({
      timeout: 30_000,
    });

    await page.click("css=div >> text=Bureau de Crédito");
    await page.click("css=div >> text=Redisparo da crivo Manual");
    const statusMock = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/mock/crivo") &&
          response.status() === 200,
        { timeout: 80_000 }
      ),
    ]);
    await statusMock;
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

    const etapaCrivo = Promise.all([
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              "/mesa-credito-pj/api/economic-groups/find-by-member-cnpj"
            ) && response.status() === 200,
        { timeout: 12_0000 }
      ),
    ]);

    await etapaCrivo;

    await page.goto(url + id);
    await page.waitForTimeout(5000);
    await page.reload();

    ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
    await page.click("css=div >> text=Dados Bancários");
    await page
      .locator('[formcontrolname="codigoAgencia"]')
      .first()
      .fill("1234");

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
    await page.waitForTimeout(3000);
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Pré-Formalização").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const statusAprovado = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await statusAprovado;
    await page.goto(url + id);

    await page.reload();
    ////AÇÃO DE ENVIAR PROPOSTA 5   >  PRE FORMALIZAÇÃO PARA FORMALIZAÇÃO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Formalização").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const preFormalizacao = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_0000 }
      ),
    ]);
    await preFormalizacao;
    await page.goto(url + id);
    await page.waitForTimeout(3000);
    await page.reload();
    await page.click("css=div >> text=Proposta de Negócios");
    await page.click('[ng-reflect-message="Gerar Contrato"]');
    const gerarContrato = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_0000 }
      ),
    ]);
    await gerarContrato;

    await page.goto(url + id);

    //////PROCESSO PARA UPLOAD DE TERMO DE ADESÃO
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar Termo de adesão"]');
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles(
      "OperacaoEmpresas/utils/fixtures/images/imagem1.png"
    );

    await page.getByRole("button", { name: "Salvar" }).click();

    /////AÇÃO DE ENVIAR PROPOSTA 6   > FORMALIZAÇÃO PARA AGUARDANDO ASSINATURA
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const statusFormalizacao = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 80_000 }
      ),
    ]);
    await statusFormalizacao;
    await page.goto(url + id);

    await page.reload();
    //////PROCESSO PARA UPLOAD DE CCB ASSINADA
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise1 = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar CCB Assinada"]');
    const fileChooser1 = await fileChooserPromise1;

    await fileChooser1.setFiles(
      "OperacaoEmpresas/utils/fixtures/images/imagem1.png"
    );

    await page.getByRole("button", { name: "Salvar" }).click();
    /////AÇÃO DE ENVIAR PROPOSTA 7   > AGUARDANDO ASSINATURA PARA AGUARDANDO LIBERAÇÃO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const aguardandoAssinatura = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await aguardandoAssinatura;
    await page.goto(url + id);

    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 8   > AGUARDANDO LIBERAÇÃO PARA AGUARDANDO CONTRATO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.locator('[ng-reflect-value="approve"]').click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const aguardandoLiberacao = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await aguardandoLiberacao;
    await page.goto(url + id);

    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 9   > AGUARDANDO CONTRATO PARA FINALIZADO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.locator('[ng-reflect-value="approve"]').click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    await page.close();
  });

  test("Capital de Giro - FGI PEAC A VISTA com NÃO POSSUI Seguro prestamista", async ({
    page,
  }) => {
    const homePage = new HomePage(page);

    test.slow();

    await homePage.enterHomePage();

    const capitalGiro = await homePage.entrarCapitalGiro();

    await capitalGiro.escreverCNPJ("68929861000192");

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
      .pressSequentially("24500000");
    await page.locator('[data-placeholder="Valor do Empréstimo"]').focus();
    await page.locator('[data-placeholder="Valor do Empréstimo"]').blur();
    const inputTaxa = page.locator('[formcontrolname="taxaMensal"]');
    await inputTaxa.fill("2.35");
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

    await page.locator('[formcontrolname="possuiGarantiaBNDES"]').click();
    await page.locator('[ng-reflect-value="S"]').click();
    await page.waitForTimeout(3000);
    await page.locator('[formcontrolname="tipoGarantiaBNDES"]').click();
    await page.getByText(" PEAC ").click();

    await page.locator('[formcontrolname="tipoPagamentoECG"]').click();
    await page.locator('[ng-reflect-value="A"]').click();
    ///FORMATO DATA////
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getFullYear()}`;
    const futureDate = new Date(
      currentDate.getTime() + 60 * 24 * 60 * 60 * 1000
    );
    const formattedFutureDate = `${futureDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(futureDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${futureDate.getFullYear()}`;

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
    await page.locator('[data-placeholder="Valor do Empréstimo"]').press("Tab");
    await page.getByText(" Calcular ").click();

    const calculoRequests = Promise.all([
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes("/capital-giro/api/calculations/financed-amount") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await calculoRequests;
    //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
    const proposta = await page
      .locator('[id="header-proposta-idPropostaCliente"]')
      .innerText();

    /////AÇÃO DE ENVIAR PROPOSTA 1    > PRE PROPOSTA PARA ANALISE PLD
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Proposta").click();
    await page.locator('[formcontrolname="parecer"]').fill("Testedfghj");
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(4000);
    // const preProposta = Promise.all([
    //   page.waitForResponse(
    //     (response) =>
    //       response.url().includes("/capital-giro/api/proposals") &&
    //       response.status() === 200,
    //     { timeout: 60_000 }
    //   ),
    // ]);
    // await preProposta;

    let url =
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro/";
    await page.goto(url + id);

    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 1.1    > PRE PROPOSTA PARA ANALISE PLD
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Proposta").click();
    await page.locator('[formcontrolname="parecer"]').fill("Testedfghj");
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(6000);
    // const preProposta = Promise.all([
    //   page.waitForResponse(
    //     (response) =>
    //       response.url().includes("/capital-giro/api/proposals") &&
    //       response.status() === 200,
    //     { timeout: 60_000 }
    //   ),
    // ]);
    // await preProposta;

    // /////AÇÃO DE ENVIAR PROPOSTA 2    > Analise PLD PARA ANALISE COMERCIAL
    // await page.getByRole("button", { name: " Ações " }).click();
    // await page.click('[formcontrolname="acao"]');
    // await page.getByText("Aprovar").click();
    // await page.locator('[formcontrolname="parecer"]').fill("Teste");
    // await page.getByRole("button", { name: "Salvar" }).click();

    // const analisePld = Promise.all([
    //   page.waitForResponse(
    //     (response) =>
    //       response.url().includes("/capital-giro/api/proposals") &&
    //       response.status() === 200,
    //     { timeout: 60_000 }
    //   ),
    // ]);
    // await analisePld;
    await page.goto(url + id);

    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 3    > ANALISE COMERCIAL PARA ANALISE DE CREDITO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const analiseComercial = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await analiseComercial;
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/fila-agente"
    );
    await page.click("css=div >> text=Em Análise");

    await page
      .getByRole("button")
      .filter({ hasText: " Filtrar Propostas " })
      .nth(1)
      .click();
    await page.waitForTimeout(2000); ///antes era 5
    await page.locator('[data-placeholder="Nº Proposta"]').fill(proposta);

    await page.waitForTimeout(6000); ///antes era 10
    await expect(
      page.locator('[ng-reflect-message="Capital de Giro"]')
    ).toBeVisible({
      timeout: 30_000,
    });

    await page.locator('[ng-reflect-message="Capital de Giro"]').click();
    await expect(page.locator(".mat-checkbox-inner-container")).toBeVisible({
      timeout: 30_000,
    });

    await page.click("css=div >> text=Bureau de Crédito");
    await page.click("css=div >> text=Redisparo da crivo Manual");
    const statusMock = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/mock/crivo") &&
          response.status() === 200,
        { timeout: 80_000 }
      ),
    ]);
    await statusMock;
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

    const etapaCrivo = Promise.all([
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              "/mesa-credito-pj/api/economic-groups/find-by-member-cnpj"
            ) && response.status() === 200,
        { timeout: 12_0000 }
      ),
    ]);

    await etapaCrivo;

    await page.goto(url + id);
    await page.waitForTimeout(7000);
    await page.reload();

    ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
    await page.click("css=div >> text=Dados Bancários");
    await page
      .locator('[formcontrolname="codigoAgencia"]')
      .first()
      .fill("1234");

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
    await page.waitForTimeout(3000);
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Pré-Formalização").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const statusAprovado = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await statusAprovado;
    await page.goto(url + id);

    await page.reload();
    ////AÇÃO DE ENVIAR PROPOSTA 5   >  PRE FORMALIZAÇÃO PARA FORMALIZAÇÃO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Formalização").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const preFormalizacao = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_0000 }
      ),
    ]);
    await preFormalizacao;
    await page.goto(url + id);
    await page.waitForTimeout(3000);
    await page.reload();
    await page.click("css=div >> text=Proposta de Negócios");
    await page.click('[ng-reflect-message="Gerar Contrato"]');
    const gerarContrato = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_0000 }
      ),
    ]);
    await gerarContrato;

    await page.goto(url + id);

    //////PROCESSO PARA UPLOAD DE TERMO DE ADESÃO
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar Termo de adesão"]');
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles(
      "OperacaoEmpresas/utils/fixtures/images/imagem1.png"
    );

    await page.getByRole("button", { name: "Salvar" }).click();

    /////AÇÃO DE ENVIAR PROPOSTA 6   > FORMALIZAÇÃO PARA AGUARDANDO ASSINATURA
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const statusFormalizacao = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 80_000 }
      ),
    ]);
    await statusFormalizacao;
    await page.goto(url + id);

    await page.reload();
    //////PROCESSO PARA UPLOAD DE CCB ASSINADA
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise1 = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar CCB Assinada"]');
    const fileChooser1 = await fileChooserPromise1;

    await fileChooser1.setFiles(
      "OperacaoEmpresas/utils/fixtures/images/imagem1.png"
    );

    await page.getByRole("button", { name: "Salvar" }).click();
    /////AÇÃO DE ENVIAR PROPOSTA 7   > AGUARDANDO ASSINATURA PARA AGUARDANDO LIBERAÇÃO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const aguardandoAssinatura = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await aguardandoAssinatura;
    await page.goto(url + id);

    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 8   > AGUARDANDO LIBERAÇÃO PARA AGUARDANDO CONTRATO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.locator('[ng-reflect-value="approve"]').click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const aguardandoLiberacao = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await aguardandoLiberacao;
    await page.goto(url + id);

    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 9   > AGUARDANDO CONTRATO PARA FINALIZADO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.locator('[ng-reflect-value="approve"]').click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.close();
  });

  test("Capital de Giro - FGI A VISTA com Seguro prestamista FINANCIADO com operação de Renegociação", async ({
    page,
  }) => {
    const homePage = new HomePage(page);

    test.slow();

    await homePage.enterHomePage();

    const capitalGiro = await homePage.entrarCapitalGiro();

    await capitalGiro.escreverCNPJ("35543713000186");

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
    await inputTaxa.fill("1.67");
    await inputTaxa.press("Tab");
    await page.locator('[placeholder="Periodicidade"]').click();
    await page.getByText("  MENSAL ").click();
    await page.locator('[data-placeholder="Parcelas"]').fill("68");
    await page
      .locator('[data-placeholder="Número Contrato Renegociado"]')
      .pressSequentially("102646000040924");
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
    await page.waitForTimeout(2000);
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
    await page.locator('[data-placeholder="Valor do Empréstimo"]').press("Tab");
    await page.getByText(" Calcular ").click();
    const calculoRequests = Promise.all([
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes("/capital-giro/api/calculations/financed-amount") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await calculoRequests;
    // //// /GARANTIA
    await page.click("css=div >> text=Garantias");
    await page.waitForTimeout(3000);
    /////AÇÃO DE ENVIAR PROPOSTA 1    > PRE PROPOSTA PARA ANALISE PLD
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Proposta").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
    const proposta = await page
      .locator('[id="header-proposta-idPropostaCliente"]')
      .innerText();
    await page.getByRole("button", { name: "Salvar" }).click();

    const preProposta = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await preProposta;
    let url =
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro/";
    await page.goto(url + id);
    await page.waitForTimeout(4000); ///antes era 10
    await page.reload();
    // /////AÇÃO DE ENVIAR PROPOSTA 2    > Analise PLD PARA ANALISE COMERCIAL
    // await page.getByRole("button", { name: " Ações " }).click();
    // await page.click('[formcontrolname="acao"]');
    // await page.getByText("Aprovar").click();
    // await page.locator('[formcontrolname="parecer"]').fill("Teste");
    // await page.getByRole("button", { name: "Salvar" }).click();

    // const analisePld = Promise.all([
    //   page.waitForResponse(
    //     (response) =>
    //       response.url().includes("/capital-giro/api/proposals") &&
    //       response.status() === 200,
    //     { timeout: 60_000 }
    //   ),
    // ]);
    // await analisePld;
    // await page.goto(url + id);

    // await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 3    > ANALISE COMERCIAL PARA ANALISE DE CREDITO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const analiseComercial = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await analiseComercial;
    await page.goto(
      "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/fila-agente"
    );
    await page.click("css=div >> text=Em Análise");

    await page
      .getByRole("button")
      .filter({ hasText: " Filtrar Propostas " })
      .nth(1)
      .click();
    await page.waitForTimeout(2000); ///antes era 5
    await page.locator('[data-placeholder="Nº Proposta"]').fill(proposta);

    await page.waitForTimeout(6000); ///antes era 10
    await expect(
      page.locator('[ng-reflect-message="Capital de Giro"]')
    ).toBeVisible({
      timeout: 30_000,
    });

    await page.locator('[ng-reflect-message="Capital de Giro"]').click();
    await expect(page.locator(".mat-checkbox-inner-container")).toBeVisible({
      timeout: 30_000,
    });

    await page.click("css=div >> text=Bureau de Crédito");
    await page.click("css=div >> text=Redisparo da crivo Manual");
    const statusMock = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/mock/crivo") &&
          response.status() === 200,
        { timeout: 80_000 }
      ),
    ]);
    await statusMock;
    await page.waitForTimeout(3000);
    /////AÇÃO DE ENVIAR PROPOSTA 4    >  ANALISE DE CREDITO PARA APROVADO
    await page.getByRole("button", { name: " Ações " }).click();
    await expect(page.locator('[formcontrolname="acao"]')).toBeVisible({
      timeout: 50_000,
    });
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page
      .locator('[data-placeholder="Data do Comitê"]')
      .fill(formattedDate);
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const etapaCrivo = Promise.all([
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              "/mesa-credito-pj/api/economic-groups/find-by-member-cnpj"
            ) && response.status() === 200,
        { timeout: 12_0000 }
      ),
    ]);

    await etapaCrivo;

    await page.goto(url + id);
    await page.waitForTimeout(5000);
    await page.reload();

    ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
    await page.click("css=div >> text=Dados Bancários");
    await page
      .locator('[formcontrolname="codigoAgencia"]')
      .first()
      .fill("1234");

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
    await page.waitForTimeout(3000);
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Pré-Formalização").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const statusAprovado = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await statusAprovado;
    await page.goto(url + id);

    await page.reload();
    ////AÇÃO DE ENVIAR PROPOSTA 5   >  PRE FORMALIZAÇÃO PARA FORMALIZAÇÃO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Enviar Formalização").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const preFormalizacao = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_0000 }
      ),
    ]);
    await preFormalizacao;
    await page.goto(url + id);
    await page.waitForTimeout(3000);
    await page.reload();
    await page.click("css=div >> text=Proposta de Negócios");
    await page.click('[ng-reflect-message="Gerar Contrato"]');
    const gerarContrato = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_0000 }
      ),
    ]);
    await gerarContrato;

    await page.goto(url + id);

    //////PROCESSO PARA UPLOAD DE TERMO DE ADESÃO
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar Termo de adesão"]');
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles(
      "OperacaoEmpresas/utils/fixtures/images/imagem1.png"
    );

    await page.getByRole("button", { name: "Salvar" }).click();

    /////AÇÃO DE ENVIAR PROPOSTA 6   > FORMALIZAÇÃO PARA AGUARDANDO ASSINATURA
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const statusFormalizacao = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 80_000 }
      ),
    ]);
    await statusFormalizacao;
    await page.goto(url + id);

    await page.reload();
    //////PROCESSO PARA UPLOAD DE CCB ASSINADA
    await page.click("css=div >> text=Documentos");
    const fileChooserPromise1 = page.waitForEvent("filechooser");

    await page.click('[ng-reflect-message="Anexar CCB Assinada"]');
    const fileChooser1 = await fileChooserPromise1;

    await fileChooser1.setFiles(
      "OperacaoEmpresas/utils/fixtures/images/imagem1.png"
    );

    await page.getByRole("button", { name: "Salvar" }).click();
    /////AÇÃO DE ENVIAR PROPOSTA 7   > AGUARDANDO ASSINATURA PARA AGUARDANDO LIBERAÇÃO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.getByText("Aprovar").click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const aguardandoAssinatura = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await aguardandoAssinatura;
    await page.goto(url + id);

    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 8   > AGUARDANDO LIBERAÇÃO PARA AGUARDANDO CONTRATO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.locator('[ng-reflect-value="approve"]').click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    const aguardandoLiberacao = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await aguardandoLiberacao;
    await page.goto(url + id);

    await page.reload();
    /////AÇÃO DE ENVIAR PROPOSTA 9   > AGUARDANDO CONTRATO PARA FINALIZADO
    await page.getByRole("button", { name: " Ações " }).click();
    await page.click('[formcontrolname="acao"]');
    await page.locator('[ng-reflect-value="approve"]').click();
    await page.locator('[formcontrolname="parecer"]').fill("Teste");
    await page.getByRole("button", { name: "Salvar" }).click();

    await page.close();
  });
});
