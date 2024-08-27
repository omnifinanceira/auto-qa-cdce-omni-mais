import { faker } from "@faker-js/faker";
import { test, expect, chromium } from "@playwright/test";
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

test("Giro Rotativo - CNPJ cadastrado", async ({ page }) => {
  test.slow();
  await page.goto("/");
  await page.click("css=button >> text=Nova");
  //await page.getByRole('button', { name: 'Nova' }).click(); /// tambem esta certo
  //await page.locator('[ng-reflect-router-link="/capital-giro"]').click();
  await page
    .locator('[ng-reflect-router-link="/capital-giro-rotativo"]')
    .click();
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro-rotativo"
  );
  await page.locator('[ng-reflect-placeholder="CNPJ"]').fill("14055248609657");
  await page.locator('[ng-reflect-placeholder="CNPJ"]').press("Tab");
  //   await page.waitForResponse(
  //     (response) =>
  //       response.url().includes("/crivo-last-result") && response.status() === 200
  //   );
  await page.waitForTimeout(7000);

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
  //PROPOSTA DE NEGOCIO/////
  await page.click("css=div >> text=Proposta de Negócios");
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro-rotativo"
  );
  await page.locator('[placeholder="Tipo de Operação"]').click();
  await page.getByText(" Implantação ").click();
  await page
    .locator('[data-placeholder="Valor do Limite"]')
    .pressSequentially("15000000");
  const inputTaxa = page.locator('[formcontrolname="taxaMensal"]');
  await inputTaxa.pressSequentially("2");
  await inputTaxa.press("Tab");
  await page.locator('[placeholder="Índice Taxa Pós-Fixada"]').click();
  await page.getByText(" SELIC ").click();
  await page.locator('[data-placeholder="Prazo"]').pressSequentially("76");
  await page.getByRole("button", { name: "Open calendar" }).click();
  await page.getByLabel("Choose month and year").click();
  await page.getByLabel("2024").click();
  await page.getByLabel("01/07/").click();
  await page.getByLabel("15 de julho de").click();
  // await page
  //   .locator('[data-placeholder="Início da Vigência"]')
  //   .nth(2)
  //   .fill(formattedDate);
  await page
    .getByLabel("Cobrar Tarifa de Cadastro")
    .locator("div")
    .nth(3)
    .click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  await page
    .getByLabel("Cobrar Tarifa de Abertura de")
    .locator("div")
    .nth(2)
    .click();
  await page.getByRole("option", { name: "NÃO" }).locator("span").click();

  // //// /GARANTIA//////////
  await page.click("css=div >> text=Garantias");
  await page.waitForTimeout(5000);
  await page.click('[ng-reflect-message="Adicionar Garantia"]');
  await page.locator('[formcontrolname="tipoGarantia"]').click();
  await page.getByText("Floor Plan").click();
  await page.getByLabel("% sobre o valor da operação *").click();
  await page.getByLabel("% sobre o valor da operação *").fill("100");
  await page.locator('[formcontrolname="tipoGarantia"]').press("Tab");
  await page.getByLabel("% sobre o valor da operação *").press("Tab");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.getByRole("button", { name: "Salvar" }).click();

  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Proposta").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.waitForTimeout(2000);

  //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
  const proposta = await page
    .locator('[id="header-proposta-idPropostaCliente"]')
    .innerText();
  await page.getByRole("button", { name: "Salvar" }).click();
  const id = await page.locator('[id="etapas-proposta__id"]').innerText();
  await page.waitForTimeout(10000);

  let url =
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro-rotativo/";
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
  // // // // //////RELATÓRIO DE VISITA////
  // await page.click("css=div >> text=Relatório de Visita");
  // await page.waitForSelector('[id="relatorio-visita-add-action"]'); // Substitua pelo seletor correto
  // await page.click('[id="relatorio-visita-add-action"]');
  // await page.locator('[data-placeholder="Data da visita"]').fill(formattedDate);
  // await page.getByLabel("Motivo da visita *").locator("div").nth(3).click();
  // await page.getByText("Acompanhamento").click();
  // await page
  //   .locator('[data-placeholder="Data de fundação"]')
  //   .fill(formattedDate);
  // await page.getByLabel("Segmento de atuação *").locator("div").nth(3).click();
  // await page.getByText("Acabamentos Finos").click();
  // await page.getByLabel("Histórico junto à OMNI").locator("div").nth(2).click();
  // await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  // await page.getByLabel("Nº de lojas próprias").click();
  // await page.getByLabel("Nº de lojas próprias").fill("876");
  // await page.getByLabel("Nº de lojas alugadas").click();
  // await page.getByLabel("Nº de lojas alugadas").fill("767");
  // await page.getByLabel("Nº de funcionários").click();
  // await page.getByLabel("Nº de funcionários").fill("7667");
  // await page.getByLabel("Região de atuação").click();
  // await page.getByLabel("Região de atuação").fill("8765678");
  // await page.getByLabel("Público alvo").click();
  // await page.getByLabel("Público alvo").fill("FDFGHj");
  // await page.getByLabel("Formas de recebimento").click();
  // await page.getByLabel("Formas de recebimento").fill("GFDSDFg");
  // await page.getByLabel("Ticket médio").click();
  // await page.getByLabel("Valor mínimo financiado").click();
  // await page.getByLabel("Valor máximo financiado").click();
  // await page.getByLabel("Prazo médio dos").click();
  // await page.getByLabel("Prazo médio dos").fill("87");
  // await page.getByLabel("Prazo máximo dos").click();
  // await page.getByLabel("Prazo máximo dos").fill("876");
  // await page.getByLabel("Prazo médio de Carência (").click();
  // await page.getByLabel("Prazo médio de Carência (").fill("876");
  // await page
  //   .getByLabel("Prazo máximo de carência (meses)", { exact: true })
  //   .click();
  // await page
  //   .getByLabel("Prazo máximo de carência (meses)", { exact: true })
  //   .fill("876");
  // await page.getByLabel("Opera com crediário próprio").locator("span").click();
  // await page.getByText("SIM", { exact: true }).click();
  // await page.getByLabel("Descreva o nome do crediário *").click();
  // await page.getByLabel("Descreva o nome do crediário *").fill("UYTRESDFg");
  // await page.getByLabel("Possui bureau próprio").locator("span").click();
  // await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  // // await page.getByLabel("Possui bureau próprio").locator("span").click();
  // // await page.getByRole("combobox", { name: "Possui bureau próprio" }).click();
  // // await page.locator(".cdk-overlay-container > div:nth-child(3)").click();
  // // await page.getByLabel("Nome do bureau *").click();
  // // await page.getByLabel("Nome do bureau *").fill("TESTe");
  // await page
  //   .locator("div")
  //   .filter({ hasText: /^Realiza a negativação$/ })
  //   .click();
  // await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  // await page
  //   .getByLabel("Recebimento em loja", { exact: true })
  //   .locator("span")
  //   .click();
  // await page.getByRole("option", { name: "NÃO" }).locator("span").click();
  // await page.getByLabel("Histórico do cliente/visita *").click();
  // await page.getByLabel("Histórico do cliente/visita *").fill("TESTe");
  // await page.getByLabel("Originação/ Relacionamento").click();
  // await page.getByLabel("Originação/ Relacionamento").fill("TESTe");
  // await page.getByLabel("Alteração societária *").click();
  // await page.getByLabel("Alteração societária *").fill("TESTe");
  // await page.getByLabel("Justificativas restrições *").click();
  // await page.getByLabel("Justificativas restrições *").fill("TESTe");
  // await page.getByLabel("Pontos fortes *").click();
  // await page.getByLabel("Pontos fortes *").fill("TESTe");
  // await page.getByLabel("Pontos fracos *").click();
  // await page.getByLabel("Pontos fracos *").fill("TESTe");
  // await page.getByLabel("Parecer comercial *").click();
  // await page.getByLabel("Parecer comercial *").fill("TESTe");
  // await page.getByRole("button", { name: "Salvar" }).click();
  // await page.getByRole("button", { name: "Salvar" }).click();
  // await page.waitForTimeout(3000);
  // await page.reload();

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
  await page.locator('[ng-reflect-message="Giro Rotativo"]').click();
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
  await page.getByRole("button", { name: " Buscar conta(s) " }).click();
  await page.waitForTimeout(8000);
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
  await page.waitForTimeout(3000);

  // await page.goto(url + id);
  // //await page.waitForTimeout(8000);
  // await page.reload();
  // await page.click("css=div >> text=Proposta de Negócios");
  // await page.click('[ng-reflect-message="Gerar Contrato"]');
  // await page.waitForTimeout(8000);

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
  //   /////AÇÃO DE ENVIAR PROPOSTA 9   > AGUARDANDO CONTRATO PARA FINALIZADO
  //   await page.getByRole("button", { name: " Ações " }).click();
  //   await page.click('[formcontrolname="acao"]');
  //   await page.locator('[ng-reflect-value="approve"]').click();
  //   await page.locator('[formcontrolname="parecer"]').fill("Teste");
  //   await page.getByRole("button", { name: "Salvar" }).click();
  //   //await page.waitForTimeout(8000);

  //await page.goto(url + id);
  //await page.pause();
  await page.close();
});
