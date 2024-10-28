import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
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

test("Limite CDC Estruturado - Implantação", async ({ page }) => {
  const homePage = new HomePage(page);

  test.slow();
  await homePage.enterHomePage();

  const limiteCdcEstruturado = await homePage.entrarLimiteCdcEstruturado();

  await limiteCdcEstruturado.escreverCNPJ("10313830276977");

  await page.locator('[ng-reflect-placeholder="CNPJ"]').first().press("Tab");

  await page.waitForTimeout(5000);

  ////COMANDO PARA GERAÇÃO DE DATAS
  const currentDate = new Date();
  const formattedDate = `${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${currentDate.getFullYear()}`;
  const futureDate = new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000);
  const formattedFutureDate = `${futureDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${(futureDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${futureDate.getFullYear()}`;
  //CONSULTAR CEP DO BRASIL///
  const cep = await Utility.obterCEP(
    "SP",
    "São Paulo",
    "DOUTOR BENEDITO TOLOSA"
  );

  //PROPOSTA DE NEGOCIO/////
  await page.click("css=div >> text=Proposta de Negócios");
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/cdc-loja"
  );
  await page.locator('[placeholder="Tipo de Operação"]').click();
  await page.getByText(" Implantação ").click();

  await page
    .locator('[data-placeholder="Início do Convênio"]')
    .fill(formattedDate);
  await page
    .locator('[data-placeholder="Término do Convênio"]')
    .fill(formattedFutureDate);
  await page
    .locator('[data-placeholder="Limite Mensal"]')
    .pressSequentially("15000000");
  await page
    .locator('[data-placeholder="Limite Máximo Carteira"]')
    .pressSequentially("17500000");

  await page
    .locator('[data-placeholder="Taxa de inadimplência do Convênio (%)"]')
    .pressSequentially("2.21");

  const inputTaxamax = page.locator(
    '[data-placeholder="Taxa de inadimplência Máxima (%)"]'
  );
  await inputTaxamax.pressSequentially("2");
  await inputTaxamax.press("Tab");
  await page.locator('[placeholder="Índice Taxa Pós-Fixada"]').click();
  await page.getByText(" SELIC ").click();
  const inputTaxaomni = page.locator(
    '[data-placeholder="Taxa de Referência Omni (%)"]'
  );
  await inputTaxaomni.pressSequentially("2");
  await inputTaxaomni.press("Tab");
  await page
    .locator('[data-placeholder="Taxa Mínima de Juros (%)"]')
    .pressSequentially("22");
  await page
    .locator('[data-placeholder="Taxa Máxima de Juros (%)"]')
    .pressSequentially("33");
  await page
    .locator('[data-placeholder="Prazo Máximo (Meses)"]')
    .pressSequentially("68");
  await page
    .locator('[data-placeholder="Prazo Máximo de Carência (Meses)"]')
    .pressSequentially("3");
  await page
    .locator('[data-placeholder="Taxa Média Ponderada de Juros (%)"]')
    .pressSequentially("33");
  await page
    .locator('[data-placeholder="Prazo Médio das Operações (Meses)"]')
    .pressSequentially("45");
  await page.locator('[data-placeholder="Agente"]').pressSequentially("3133");
  await page.waitForResponse(
    (response) =>
      response.url().includes("/geral/api/agentes/consulta?codigo=3133") &&
      response.status() === 200
  );

  await page.getByText(" 3133 - Nome Agente 3133 ").click();
  await page
    .locator('[data-placeholder="Data do Contrato"]')
    .fill(formattedDate);
  await page
    .locator('[data-placeholder="Percentual TC (%)"]')
    .pressSequentially("3");
  await page
    .locator('[data-placeholder="Percentual de MMJ (Multa, Mora e Juros) (%)"]')
    .pressSequentially("6");
  await page.locator('[placeholder="Haverá recebimento em loja?"]').click();
  await page.locator('[ng-reflect-value="NAO"]').click();
  await page.locator('[placeholder="Possui Filiais?"]').click();
  await page.locator('[ng-reflect-value="NAO"]').click();

  // //// /GARANTIA//////////
  await page.click("css=div >> text=Garantias");
  await page.waitForTimeout(3000);
  await page.click('[ng-reflect-message="Adicionar Garantia"]');
  await page.locator('[formcontrolname="tipoGarantia"]').click();

  await page.getByText("Nota Promissória").click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Salvar" }).click();

  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Proposta").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const preProposta = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await preProposta;

  //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
  const proposta = await page
    .locator('[id="header-proposta-idPropostaCliente"]')
    .innerText();

  const id = await page.locator('[id="etapas-proposta__id"]').innerText();

  let url =
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/cdc-loja/";
  await page.goto(url + id);
  await page.waitForTimeout(2000);
  await page.reload();
  /////AÇÃO DE ENVIAR PROPOSTA 2.1    > Analise PLD PARA ANALISE COMERCIAL
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const analisePld = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await analisePld;
  //await page.pause();

  await page.goto(url + id);
  await page.waitForTimeout(7000);
  await page.reload();
  // // // //////RELATÓRIO DE VISITA////
  await page.click("css=div >> text=Relatório de Visita");
  await page.waitForSelector('[id="relatorio-visita-add-action"]'); // Substitua pelo seletor correto
  await page.click('[id="relatorio-visita-add-action"]');
  await page.locator('[data-placeholder="Data da visita"]').fill(formattedDate);
  await page.getByLabel("Motivo da visita *").locator("div").nth(3).click();
  await page.locator('[ng-reflect-value="ACOMPANHAMENTO"]').click();

  await page
    .locator('[data-placeholder="Data de fundação"]')
    .fill(formattedDate);
  await page.getByLabel("Segmento de atuação *").locator("div").nth(3).click();
  await page.getByText("Acabamentos Finos").click();
  await page.getByLabel("Histórico junto à OMNI").locator("div").nth(2).click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  await page.getByLabel("Nº de lojas próprias").click();
  await page.getByLabel("Nº de lojas próprias").fill("876");
  await page.getByLabel("Nº de lojas alugadas").click();
  await page.getByLabel("Nº de lojas alugadas").fill("767");
  await page.getByLabel("Nº de funcionários").click();
  await page.getByLabel("Nº de funcionários").fill("7667");
  await page.getByLabel("Região de atuação").click();
  await page.getByLabel("Região de atuação").fill("8765678");
  await page.getByLabel("Público alvo").click();
  await page.getByLabel("Público alvo").fill("FDFGHj");
  await page.getByLabel("Formas de recebimento").click();
  await page.getByLabel("Formas de recebimento").fill("GFDSDFg");
  await page.getByLabel("Ticket médio").click();
  await page.getByLabel("Valor mínimo financiado").click();
  await page.getByLabel("Valor máximo financiado").click();
  await page.getByLabel("Prazo médio dos").click();
  await page.getByLabel("Prazo médio dos").fill("87");
  await page.getByLabel("Prazo máximo dos").click();
  await page.getByLabel("Prazo máximo dos").fill("876");
  await page.getByLabel("Prazo médio de Carência (").click();
  await page.getByLabel("Prazo médio de Carência (").fill("876");
  await page
    .getByLabel("Prazo máximo de carência (meses)", { exact: true })
    .click();
  await page
    .getByLabel("Prazo máximo de carência (meses)", { exact: true })
    .fill("876");
  await page.getByLabel("Opera com crediário próprio").locator("span").click();
  await page.getByText("SIM", { exact: true }).click();
  await page.getByLabel("Descreva o nome do crediário *").click();
  await page.getByLabel("Descreva o nome do crediário *").fill("UYTRESDFg");
  await page.getByLabel("Possui bureau próprio").locator("span").click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();

  await page
    .locator("div")
    .filter({ hasText: /^Realiza a negativação$/ })
    .click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  await page
    .getByLabel("Recebimento em loja", { exact: true })
    .locator("span")
    .click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  await page.getByLabel("Histórico do cliente/visita *").click();
  await page.getByLabel("Histórico do cliente/visita *").fill("TESTe");
  await page.getByLabel("Originação/ Relacionamento").click();
  await page.getByLabel("Originação/ Relacionamento").fill("TESTe");
  await page.getByLabel("Alteração societária *").click();
  await page.getByLabel("Alteração societária *").fill("TESTe");
  await page.getByLabel("Justificativas restrições *").click();
  await page.getByLabel("Justificativas restrições *").fill("TESTe");
  await page.getByLabel("Pontos fortes *").click();
  await page.getByLabel("Pontos fortes *").fill("TESTe");
  await page.getByLabel("Pontos fracos *").click();
  await page.getByLabel("Pontos fracos *").fill("TESTe");
  await page.getByLabel("Parecer comercial *").click();
  await page.getByLabel("Parecer comercial *").fill("TESTe");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(4000);
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
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
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
  await page.waitForTimeout(2000);
  await page.locator('[data-placeholder="Nº Proposta"]').fill(proposta);
  await page.waitForTimeout(4000);

  await page.locator('[ng-reflect-message="Limite CDC Estruturado"]').click();
  await expect(page.locator(".mat-checkbox-inner-container")).toBeVisible({
    timeout: 30_000,
  });

  await page.click("css=div >> text=Bureau de Crédito");
  await page.click("css=div >> text=Redisparo da crivo Manual");
  const statusMock = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/mock/crivo") &&
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
  await page.locator('[data-placeholder="Data do Comitê"]').fill(formattedDate);
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
  await page.waitForTimeout(3000);
  await page.reload();

  await page.click("css=div >> text=Proposta de Negócios");

  await page
    .locator('[data-placeholder="Taxa de inadimplência do Convênio (%)"]')
    .fill("2");

  await page
    .locator('[data-placeholder="Taxa de inadimplência do Convênio (%)"]')
    .press("Tab");

  ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
  await page.click("css=div >> text=Dados Bancários");
  await page.getByRole("button", { name: " Buscar conta(s) " }).click();
  await page.waitForTimeout(2000);
  await page.locator('[ng-reflect-placeholder="Código Agência"]').fill("1234");

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
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await statusAprovado;

  await page.goto(url + id);

  await page.reload();

  // // /////PROCESSO PARA UPLOAD CERTIFICADO UNICAD
  // // await page.click("css=div >> text=Documentos");
  // // const fileChooserPromise = page.waitForEvent("filechooser");

  // // await page.click('[ng-reflect-message="Anexar Cadastro UNICAD"]');
  // // const fileChooser = await fileChooserPromise;

  // // await fileChooser.setFiles(
  //   "OperacaoEmpresas/utils/fixtures/images/imagem1.png"
  // );

  // await page.getByRole("button", { name: "Salvar" }).click();

  // //await page.goto(url + id);
  // await page.waitForTimeout(6000);
  // //await page.reload();

  ////AÇÃO DE ENVIAR PROPOSTA 5   >  PRE FORMALIZAÇÃO PARA FORMALIZAÇÃO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Formalização").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const preFormalizacao = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_0000 }
    ),
  ]);
  await preFormalizacao;

  await page.goto(url + id);
  await page.waitForTimeout(5000);
  await page.reload();

  /////AÇÃO DE ENVIAR PROPOSTA 6   > FORMALIZAÇÃO PARA AGUARDANDO ASSINATURA
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const statusFormalizacao = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 80_000 }
    ),
  ]);
  await statusFormalizacao;

  await page.goto(url + id);

  await page.reload();
  /////AÇÃO DE ENVIAR PROPOSTA 7   > AGUARDANDO ASSINATURA PARA AGUARDANDO LIBERAÇÃO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const aguardandoAssinatura = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
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
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await aguardandoLiberacao;

  await page.goto(url + id);

  await page.reload();
  // /////AÇÃO DE ENVIAR PROPOSTA 9   > AGUARDANDO CONTRATO PARA FINALIZADO
  // await page.getByRole("button", { name: " Ações " }).click();
  // await page.click('[formcontrolname="acao"]');
  // await page.locator('[ng-reflect-value="approve"]').click();
  // await page.locator('[formcontrolname="parecer"]').fill("Teste");
  // await page.getByRole("button", { name: "Salvar" }).click();
  //await page.waitForTimeout(8000);

  //await page.goto(url + id);
  await page.close();
});

test("Limite CDC Estruturado Renovação/Aditamento - CNPJ Cadastrado", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  test.slow();
  await homePage.enterHomePage();

  const limiteCdcEstruturado = await homePage.entrarLimiteCdcEstruturado();

  await limiteCdcEstruturado.escreverCNPJ("10313830276977");

  await page.locator('[ng-reflect-placeholder="CNPJ"]').first().press("Tab");

  await page.waitForTimeout(5000);

  ////COMANDO PARA GERAÇÃO DE DATAS
  const currentDate = new Date();
  const formattedDate = `${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${currentDate.getFullYear()}`;
  const futureDate = new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000);
  const formattedFutureDate = `${futureDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${(futureDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${futureDate.getFullYear()}`;
  //CONSULTAR CEP DO BRASIL///
  const cep = await Utility.obterCEP(
    "SP",
    "São Paulo",
    "DOUTOR BENEDITO TOLOSA"
  );

  //PROPOSTA DE NEGOCIO/////
  await page.click("css=div >> text=Proposta de Negócios");
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/cdc-loja"
  );
  await page.locator('[placeholder="Tipo de Operação"]').click();
  await page.getByText(" Renovação/Aditamento ").click();

  await page
    .locator('[data-placeholder="Início do Convênio"]')
    .fill(formattedDate);
  await page
    .locator('[data-placeholder="Término do Convênio"]')
    .fill(formattedFutureDate);
  await page
    .locator('[data-placeholder="Limite Mensal"]')
    .pressSequentially("15000000");
  await page
    .locator('[data-placeholder="Limite Máximo Carteira"]')
    .pressSequentially("17500000");

  await page
    .locator('[data-placeholder="Taxa de inadimplência do Convênio (%)"]')
    .pressSequentially("2.21");

  const inputTaxamax = page.locator(
    '[data-placeholder="Taxa de inadimplência Máxima (%)"]'
  );
  await inputTaxamax.pressSequentially("2");
  await inputTaxamax.press("Tab");
  await page.locator('[placeholder="Índice Taxa Pós-Fixada"]').click();
  await page.getByText(" SELIC ").click();
  const inputTaxaomni = page.locator(
    '[data-placeholder="Taxa de Referência Omni (%)"]'
  );
  await inputTaxaomni.pressSequentially("2");
  await inputTaxaomni.press("Tab");
  await page
    .locator('[data-placeholder="Taxa Mínima de Juros (%)"]')
    .pressSequentially("22");
  await page
    .locator('[data-placeholder="Taxa Máxima de Juros (%)"]')
    .pressSequentially("33");
  await page
    .locator('[data-placeholder="Prazo Máximo (Meses)"]')
    .pressSequentially("68");
  await page
    .locator('[data-placeholder="Prazo Máximo de Carência (Meses)"]')
    .pressSequentially("3");
  await page
    .locator('[data-placeholder="Taxa Média Ponderada de Juros (%)"]')
    .pressSequentially("33");
  await page
    .locator('[data-placeholder="Prazo Médio das Operações (Meses)"]')
    .pressSequentially("45");
  await page.locator('[data-placeholder="Agente"]').pressSequentially("3133");
  await page.waitForResponse(
    (response) =>
      response.url().includes("/geral/api/agentes/consulta?codigo=3133") &&
      response.status() === 200
  );

  await page.getByText(" 3133 - Nome Agente 3133 ").click();
  await page
    .locator('[data-placeholder="Data do Contrato"]')
    .fill(formattedDate);
  await page
    .locator('[data-placeholder="Percentual TC (%)"]')
    .pressSequentially("3");
  await page
    .locator('[data-placeholder="Percentual de MMJ (Multa, Mora e Juros) (%)"]')
    .pressSequentially("6");
  await page.locator('[placeholder="Haverá recebimento em loja?"]').click();
  await page.locator('[ng-reflect-value="NAO"]').click();
  await page.locator('[placeholder="Possui Filiais?"]').click();
  await page.locator('[ng-reflect-value="NAO"]').click();

  // //// /GARANTIA//////////
  await page.click("css=div >> text=Garantias");
  await page.waitForTimeout(3000);
  await page.click('[ng-reflect-message="Adicionar Garantia"]');
  await page.locator('[formcontrolname="tipoGarantia"]').click();

  await page.getByText("Nota Promissória").click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Salvar" }).click();

  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Proposta").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const preProposta = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await preProposta;

  //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
  const proposta = await page
    .locator('[id="header-proposta-idPropostaCliente"]')
    .innerText();

  const id = await page.locator('[id="etapas-proposta__id"]').innerText();

  let url =
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/cdc-loja/";
  await page.goto(url + id);
  await page.waitForTimeout(2000);
  await page.reload();
  /////AÇÃO DE ENVIAR PROPOSTA 2.1    > Analise PLD PARA ANALISE COMERCIAL
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const analisePld = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await analisePld;
  //await page.pause();

  await page.goto(url + id);
  await page.waitForTimeout(7000);
  await page.reload();
  // // // //////RELATÓRIO DE VISITA////
  await page.click("css=div >> text=Relatório de Visita");
  await page.waitForSelector('[id="relatorio-visita-add-action"]'); // Substitua pelo seletor correto
  await page.click('[id="relatorio-visita-add-action"]');
  await page.locator('[data-placeholder="Data da visita"]').fill(formattedDate);
  await page.getByLabel("Motivo da visita *").locator("div").nth(3).click();
  await page.locator('[ng-reflect-value="ACOMPANHAMENTO"]').click();

  await page
    .locator('[data-placeholder="Data de fundação"]')
    .fill(formattedDate);
  await page.getByLabel("Segmento de atuação *").locator("div").nth(3).click();
  await page.getByText("Acabamentos Finos").click();
  await page.getByLabel("Histórico junto à OMNI").locator("div").nth(2).click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  await page.getByLabel("Nº de lojas próprias").click();
  await page.getByLabel("Nº de lojas próprias").fill("876");
  await page.getByLabel("Nº de lojas alugadas").click();
  await page.getByLabel("Nº de lojas alugadas").fill("767");
  await page.getByLabel("Nº de funcionários").click();
  await page.getByLabel("Nº de funcionários").fill("7667");
  await page.getByLabel("Região de atuação").click();
  await page.getByLabel("Região de atuação").fill("8765678");
  await page.getByLabel("Público alvo").click();
  await page.getByLabel("Público alvo").fill("FDFGHj");
  await page.getByLabel("Formas de recebimento").click();
  await page.getByLabel("Formas de recebimento").fill("GFDSDFg");
  await page.getByLabel("Ticket médio").click();
  await page.getByLabel("Valor mínimo financiado").click();
  await page.getByLabel("Valor máximo financiado").click();
  await page.getByLabel("Prazo médio dos").click();
  await page.getByLabel("Prazo médio dos").fill("87");
  await page.getByLabel("Prazo máximo dos").click();
  await page.getByLabel("Prazo máximo dos").fill("876");
  await page.getByLabel("Prazo médio de Carência (").click();
  await page.getByLabel("Prazo médio de Carência (").fill("876");
  await page
    .getByLabel("Prazo máximo de carência (meses)", { exact: true })
    .click();
  await page
    .getByLabel("Prazo máximo de carência (meses)", { exact: true })
    .fill("876");
  await page.getByLabel("Opera com crediário próprio").locator("span").click();
  await page.getByText("SIM", { exact: true }).click();
  await page.getByLabel("Descreva o nome do crediário *").click();
  await page.getByLabel("Descreva o nome do crediário *").fill("UYTRESDFg");
  await page.getByLabel("Possui bureau próprio").locator("span").click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();

  await page
    .locator("div")
    .filter({ hasText: /^Realiza a negativação$/ })
    .click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  await page
    .getByLabel("Recebimento em loja", { exact: true })
    .locator("span")
    .click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  await page.getByLabel("Histórico do cliente/visita *").click();
  await page.getByLabel("Histórico do cliente/visita *").fill("TESTe");
  await page.getByLabel("Originação/ Relacionamento").click();
  await page.getByLabel("Originação/ Relacionamento").fill("TESTe");
  await page.getByLabel("Alteração societária *").click();
  await page.getByLabel("Alteração societária *").fill("TESTe");
  await page.getByLabel("Justificativas restrições *").click();
  await page.getByLabel("Justificativas restrições *").fill("TESTe");
  await page.getByLabel("Pontos fortes *").click();
  await page.getByLabel("Pontos fortes *").fill("TESTe");
  await page.getByLabel("Pontos fracos *").click();
  await page.getByLabel("Pontos fracos *").fill("TESTe");
  await page.getByLabel("Parecer comercial *").click();
  await page.getByLabel("Parecer comercial *").fill("TESTe");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(4000);
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
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
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
  await page.waitForTimeout(2000);
  await page.locator('[data-placeholder="Nº Proposta"]').fill(proposta);
  await page.waitForTimeout(4000);

  await page.locator('[ng-reflect-message="Limite CDC Estruturado"]').click();
  await expect(page.locator(".mat-checkbox-inner-container")).toBeVisible({
    timeout: 30_000,
  });

  await page.click("css=div >> text=Bureau de Crédito");
  await page.click("css=div >> text=Redisparo da crivo Manual");
  const statusMock = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/mock/crivo") &&
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
  await page.locator('[data-placeholder="Data do Comitê"]').fill(formattedDate);
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

  await page.click("css=div >> text=Proposta de Negócios");

  await page
    .locator('[data-placeholder="Taxa de inadimplência do Convênio (%)"]')
    .fill("2");

  await page
    .locator('[data-placeholder="Taxa de inadimplência do Convênio (%)"]')
    .press("Tab");

  ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
  await page.click("css=div >> text=Dados Bancários");
  await page.getByRole("button", { name: " Buscar conta(s) " }).click();
  await page.waitForTimeout(2000);
  await page.locator('[ng-reflect-placeholder="Código Agência"]').fill("1234");

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
  await page.waitForTimeout(4000);
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Pré-Formalização").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const statusAprovado = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await statusAprovado;

  await page.goto(url + id);

  await page.reload();

  // // /////PROCESSO PARA UPLOAD CERTIFICADO UNICAD
  // // await page.click("css=div >> text=Documentos");
  // // const fileChooserPromise = page.waitForEvent("filechooser");

  // // await page.click('[ng-reflect-message="Anexar Cadastro UNICAD"]');
  // // const fileChooser = await fileChooserPromise;

  // // await fileChooser.setFiles(
  //   "OperacaoEmpresas/utils/fixtures/images/imagem1.png"
  // );

  // await page.getByRole("button", { name: "Salvar" }).click();

  // //await page.goto(url + id);
  // await page.waitForTimeout(6000);
  // //await page.reload();

  ////AÇÃO DE ENVIAR PROPOSTA 5   >  PRE FORMALIZAÇÃO PARA FORMALIZAÇÃO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Formalização").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const preFormalizacao = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_0000 }
    ),
  ]);
  await preFormalizacao;

  await page.goto(url + id);
  await page.waitForTimeout(5000);
  await page.reload();

  /////AÇÃO DE ENVIAR PROPOSTA 6   > FORMALIZAÇÃO PARA AGUARDANDO ASSINATURA
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const statusFormalizacao = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 80_000 }
    ),
  ]);
  await statusFormalizacao;

  await page.goto(url + id);

  await page.reload();
  /////AÇÃO DE ENVIAR PROPOSTA 7   > AGUARDANDO ASSINATURA PARA AGUARDANDO LIBERAÇÃO
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const aguardandoAssinatura = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
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
        response.url().includes("/limite-cdc-estruturado/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await aguardandoLiberacao;

  await page.goto(url + id);

  await page.reload();
  // /////AÇÃO DE ENVIAR PROPOSTA 9   > AGUARDANDO CONTRATO PARA FINALIZADO
  // await page.getByRole("button", { name: " Ações " }).click();
  // await page.click('[formcontrolname="acao"]');
  // await page.locator('[ng-reflect-value="approve"]').click();
  // await page.locator('[formcontrolname="parecer"]').fill("Teste");
  // await page.getByRole("button", { name: "Salvar" }).click();
  //await page.waitForTimeout(8000);

  //await page.goto(url + id);
  await page.close();
});
