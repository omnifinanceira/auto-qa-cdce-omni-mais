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

test("Giro Rotativo - Dados Dinamicos e Ficticios", async ({ page }) => {
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
  ///////////QUALIFICAÇÃO DA EMPRESA//////
  await page.locator('[ng-reflect-placeholder="CNPJ"]').fill(cnpj.fake());
  await page.locator('[ng-reflect-placeholder="CNPJ"]').press("Tab");
  await page
    .locator('[ng-reflect-placeholder="Razão Social"]')
    .first()
    .fill(faker.company.name());
  await page
    .locator('[ng-reflect-placeholder="Faturamento Atual"]')
    .pressSequentially("5500000");
  await page
    .locator('[ng-reflect-placeholder="Faturamento Atual"]')
    .press("Tab");
  //await page.waitForTimeout(5000);
  ///COMANDO PARA SALVAR A ID DA PROPOSTA ////

  await page.waitForTimeout(2000);
  //await page.waitForTimeout(8000);
  await page
    .locator('[ng-reflect-placeholder="Faturamento Anterior"]')
    .pressSequentially("6500000");
  await page
    .locator('[data-placeholder="Data da Constituição"]')
    .fill("26/02/1900");
  //await page.waitForTimeout(5000);
  await page.click('[placeholder="CNAE"]');
  await page.getByText(" 7311-4/00 - Agências de publicidade ").click();
  await page
    .locator('[data-placeholder="Patrimônio Líquido"]')
    .pressSequentially("10000000");
  await page
    .locator('[data-placeholder="Quantidade de Funcionários"]')
    .pressSequentially("150");
  await page.click('[formcontrolname="naturezaJuridica"]');
  await page
    .getByText(" 101-5 - Órgão Público do Poder Executivo Federal ")
    .click();
  await page
    .locator('[data-placeholder="Inscrição Estadual"]')
    .fill(faker.finance.accountNumber());
  await page
    .locator('[data-placeholder="Data Registro Junta/Cartório"]')
    .fill("10/02/1993");
  await page
    .locator('[data-placeholder="Nº Reg. Junta Comercial"]')
    .fill(faker.finance.accountNumber());
  await page.click('[formcontrolname="categoria"]');
  await page.getByText("COMÉRCIO").click();
  await page
    .locator(
      '[data-placeholder="Data última alteração de Contrato/Estatuto social/Requerimento"]'
    )
    .fill("10/02/2016");
  ////ADMINISTRADORES/////
  await page.locator('[formcontrolname="cpf"]').fill(cpf.fake());
  await page
    .locator('[formcontrolname="nomeAdministrador"]')
    .fill(faker.internet.userName());
  await page
    .locator('[data-placeholder="Email"]')
    .first()
    .fill(faker.internet.email());
  await page.locator('[data-placeholder="Celular"]').fill(faker.phone.number()); // (11) 9 8765-4321
  await page.click('[formcontrolname="formaAssinatura"]');
  await page.getByText("Individual").click();
  await page
    .locator("omni-field-administrador mat-form-field")
    .filter({ hasText: "Início da Vigência *" })
    .getByLabel("Open calendar")
    .click();
  await page.getByLabel("Choose month and year").click();
  await page.getByLabel("2001").click();
  await page.getByLabel("01/02/").click();
  await page.getByLabel("6 de fevereiro de 2001", { exact: true }).click();
  // await page
  //   .locator('[placeholder="Início da Vigência"]')
  //   .nth(1)
  //   .fill("10/02/1992");
  await page.locator(".mat-checkbox-inner-container").click();
  await page.click("css=button >> text=Salvar");

  await page.waitForTimeout(5000);
  //ENDEREÇOS//
  await page.click("css=div >> text=Endereços");
  ///CONSULTAR CEP DO BRASIL///
  const cep = await Utility.obterCEP(
    "SP",
    "São Paulo",
    "DOUTOR BENEDITO TOLOSA"
  );

  await page.locator('[formcontrolname="cep"]').first().pressSequentially(cep);
  await page.waitForResponse(
    (response) =>
      response.url().includes("/geral/api/enderecos/") &&
      response.status() === 200
  );

  await page
    .locator('[formcontrolname="numero"]')
    .first()
    .fill(faker.location.buildingNumber());
  await page.locator('[formcontrolname="complemento"]').first().fill("Empresa");

  await page
    .locator('[formcontrolname="telefoneComercial"]')
    .first()
    .fill(faker.phone.number());
  await page
    .locator('[formcontrolname="email"]')
    .last()
    .fill(faker.internet.email());
  //Endereço de Correspondencia//
  await page.click('[formcontrolname="tipoEnderecoCorrespondencia"]');
  await page.getByText(" Endereço Comercial ").last().click();
  //CADEIA SOCIETARIA//
  await page.click("css=div >> text=Cadeia Societária");
  await page.locator('[ng-reflect-message="Adicionar sócio"]').click();
  await page.locator('[formcontrolname="cpfCnpj"]').fill(cpf.fake());
  await page.locator('[formcontrolname="cpfCnpj"]').first().press("Tab");
  await page.waitForTimeout(2000);
  await page
    .locator('[formcontrolname="nomeRazaoSocial"]')
    .fill(faker.company.name());
  await page
    .locator('[formcontrolname="percentualParticipacao"]')
    .pressSequentially("100");
  await page
    .locator('[data-placeholder="Data de nascimento"]')
    .first()
    .fill("10/02/1989");
  await page
    .locator('[data-placeholder="Data de nascimento"]')
    .first()
    .press("Tab");
  //await page.locator('[formcontrolname="devedorSolidario"]').click();
  await page
    .locator('[formcontrolname="email"]')
    .last()
    .fill(faker.internet.email());
  //await page.locator('[formcontrolname="email"]').last().press("Tab");
  ///CAMPOS NOVOS///
  await page.locator('[formcontrolname="rg"]').fill("278783752767654");
  await page.locator('[placeholder="UF de emissão do RG"]').click();
  await page.locator('[ng-reflect-value="SP"]').click();
  await page.locator('[formcontrolname="celular"]').fill("4698889-8788"); // (11) 9 8765-4321
  await page.locator('[formcontrolname="celular"]').first().press("Tab");

  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(8000);

  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(8000);

  //PRINCIPAIS CLIENTES///
  await page.click("css=div >> text=Principais Clientes");
  await page
    .locator('[formcontrolname="nomeCliente"]')
    .fill(faker.internet.userName());
  await page
    .locator('[formcontrolname="percentualFaturamento"]')
    .first()
    .pressSequentially("100");
  await page.getByRole("button", { name: "Salvar" }).click();

  //PRINCIPAIS FORNECEDORES///
  await page.click("css=div >> text=Principais Fornecedores");
  await page
    .locator('[formcontrolname="nomeFornecedor"]')
    .fill(faker.company.name());
  await page
    .locator('[formcontrolname="percentualCompras"]')
    .pressSequentially("100");
  await page.getByRole("button", { name: "Salvar" }).click();

  //PRINCIPAIS PRODUTOS///
  await page.click("css=div >> text=Principais Produtos");
  await page
    .locator('[formcontrolname="nomeProduto"]')
    .fill(faker.commerce.productName());
  await page
    .locator('[formcontrolname="percentualFaturamento"]')
    .last()
    .pressSequentially("100");
  await page.getByRole("button", { name: "Salvar" }).click();

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

  // await page.locator('[placeholder="Cobrar Tarifa de Cadastro"]').click();
  // await page.getByText("NÃO").click();
  // await page
  //   .locator('[placeholder="Cobrar Tarifa de Abertura de Crédito"]')
  //   .click();
  // await page.getByText("NÃO").click();

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
  // await page.waitForTimeout(8000);

  // await page.goto(url + id);
  // //await page.waitForTimeout(5000);
  // await page.reload();
  // /////AÇÃO DE ENVIAR PROPOSTA 9   > AGUARDANDO CONTRATO PARA FINALIZADO
  // await page.getByRole("button", { name: " Ações " }).click();
  // await page.click('[formcontrolname="acao"]');
  // await page.locator('[ng-reflect-value="approve"]').click();
  // await page.locator('[formcontrolname="parecer"]').fill("Teste");
  // await page.getByRole("button", { name: "Salvar" }).click();
  //await page.waitForTimeout(8000);

  //await page.goto(url + id);
  //await page.pause();
  await page.close();
});
