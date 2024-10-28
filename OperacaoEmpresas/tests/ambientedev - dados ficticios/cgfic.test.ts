import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import * as cnpj from "validation-br/dist/cnpj";
import * as cpf from "validation-br/dist/cpf";
import { Utility } from "../../utils/utility";

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

test.only("Capital de Giro - FGI A VISTA com Seguro prestamista FINANCIADO - NOVO REGISTRO", async ({
  page,
}) => {
  test.slow();

  // await page.goto(
  //   "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/login?route=home"
  // );
  // await page.locator('[data-placeholder="Usuário"]').fill("TIAGO_FARIAS");
  // await page.locator('[data-placeholder="Senha"]').fill("AH52SI31");
  // await page.getByRole("button").click();
  // await page.goto('https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/login?route=home');
  // await page.getByText(' 331 - Nome Agente 331 ').check();
  // await page.getByText(' Confirmar ').click();
  await page.goto("/");
  await page.click("css=button >> text=Nova");
  //await page.getByRole('button', { name: 'Nova' }).click(); /// tambem esta certo
  await page.locator('[ng-reflect-router-link="/capital-giro"]').click();
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro"
  );
  ///////////QUALIFICAÇÃO DA EMPRESA//////
  await page.locator('[ng-reflect-placeholder="CNPJ"]').fill(cnpj.fake());
  await page.locator('[ng-reflect-placeholder="CNPJ"]').press("Tab");
  await page
    .locator('[ng-reflect-placeholder="Razão Social"]')
    .fill(faker.company.name());
  await page
    .locator('[ng-reflect-placeholder="Faturamento Atual"]')
    .pressSequentially("10000000");
  await page
    .locator('[ng-reflect-placeholder="Faturamento Atual"]')
    .press("Tab");

  ///COMANDO PARA SALVAR A ID DA PROPOSTA ////

  await page.waitForTimeout(2000);

  await page
    .locator('[ng-reflect-placeholder="Faturamento Anterior"]')
    .pressSequentially("6500000");
  await page
    .locator('[data-placeholder="Data da Constituição"]')
    .fill("26/02/1900");

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
    .locator('[data-placeholder="Início da Vigência"]')
    .fill("10/02/1990");
  await page.locator(".mat-checkbox-inner-container").click();
  await page.click("css=button >> text=Salvar");
  const id = await page.locator('[id="etapas-proposta__id"]').innerText();

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
  await page.locator('[formcontrolname="devedorSolidario"]').click();
  await page
    .locator('[formcontrolname="email"]')
    .last()
    .fill(faker.internet.email());

  ///CAMPOS NOVOS///
  await page.locator('[formcontrolname="rg"]').fill("109567316989876");
  await page.locator('[placeholder="UF de emissão do RG"]').click();
  await page.locator('[ng-reflect-value="SP"]').click();
  await page.locator('[formcontrolname="celular"]').fill("4698889-8788"); // (11) 9 8765-4321
  await page.locator('[formcontrolname="celular"]').first().press("Tab");

  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(4000);

  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(4000);

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

  //////RELATÓRIO DE VISITA////
  await page.click("css=div >> text=Relatório de Visita");
  await page.locator("omni-relatorio-visita-shared button").click();
  const currentDate = new Date();
  const formattedDate = `${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${currentDate.getFullYear()}`;
  const futureDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const formattedFutureDate = `${futureDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${(futureDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${futureDate.getFullYear()}`;

  await page.locator('[data-placeholder="Data da visita"]').fill(formattedDate);

  await page.getByLabel("Motivo da visita *").locator("span").click();
  await page.getByText("Acompanhamento").click();
  await page
    .locator('[data-placeholder="Data de fundação"]')
    .fill(formattedDate);

  await page.getByLabel("Segmento de atuação *").locator("div").nth(2).click();
  await page.getByText("Acabamentos Finos").click();
  await page.getByLabel("Histórico do cliente/visita *").click();
  await page.getByLabel("Histórico do cliente/visita *").fill("TESTE");
  await page.getByLabel("Histórico do cliente/visita *").click();
  await page.getByLabel("Originação/ Relacionamento").click();
  await page.getByLabel("Originação/ Relacionamento").fill("TESTE");
  await page.getByLabel("Alteração societária *").click();
  await page.getByLabel("Alteração societária *").fill("TESTE");
  await page.getByLabel("Justificativas restrições *").click();
  await page.getByLabel("Justificativas restrições *").fill("TESTE");
  await page.getByLabel("Pontos fortes *").click();
  await page.getByLabel("Pontos fortes *").fill("TESTE");
  await page.getByLabel("Pontos fracos *").click();
  await page.getByLabel("Pontos fracos *").fill("TESTE");
  await page.getByLabel("Parecer comercial *").click();
  await page.getByLabel("Parecer comercial *").fill("TESTE");
  await page.getByRole("button", { name: "Salvar" }).click();

  ////PROPOSTA DE NEGOCIO
  await page.click("css=div >> text=Proposta de Negócios");
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/capital-giro"
  );
  await page.locator('[placeholder="Operação"]').click();
  await page.getByText(" 8818 - CAPITAL DE GIRO MIDDLE - 445 ").click();
  await page
    .locator('[data-placeholder="Valor do Empréstimo"]')
    .pressSequentially("50099999");
  await page.locator('[data-placeholder="Valor do Empréstimo"]').focus();
  await page.locator('[data-placeholder="Valor do Empréstimo"]').blur();
  const inputTaxa = page.locator('[formcontrolname="taxaMensal"]');
  await inputTaxa.fill("1.45");
  await inputTaxa.press("Tab");
  await page.locator('[placeholder="Periodicidade"]').click();
  await page.getByText("  MENSAL ").click();
  await page.locator('[data-placeholder="Parcelas"]').fill("56");
  await page.locator('[formcontrolname="pagamentoTarifaCadastro"]').click();
  await page.locator('[ng-reflect-value="A"]').click();
  await page
    .locator('[formcontrolname="valorTarifaCadastro"]')
    .pressSequentially("1.63");
  ////PAGAMNETO SEGURO////
  await page.locator('[formcontrolname="pagamentoSeguro"]').click();
  await page.locator('[ng-reflect-value="F"]').click();
  ///////////GARANTIA BNDES////
  await page.locator('[formcontrolname="possuiGarantiaBNDES"]').click();
  await page.locator('[ng-reflect-value="S"]').click();
  await page.waitForTimeout(3000);
  await page.locator('[formcontrolname="tipoGarantiaBNDES"]').click();
  await page.getByText(" FGI ").click();
  await page.locator('[formcontrolname="percentualCoberturaBNDES"]').click();
  await page.getByText("70%").click();
  await page.locator('[formcontrolname="tipoPagamentoECG"]').click();
  await page.locator('[ng-reflect-value="A"]').click();
  await page.locator('[formcontrolname="pagamentoIof"]').click();
  await page.locator('[ng-reflect-value="A"]').click();

  await page
    .locator('[data-placeholder="Data de Emissão do Contrato"]')
    .fill(formattedDate);
  await page
    .locator('[data-placeholder="Data de Liberação"]')
    .fill(formattedDate);
  await page
    .locator('[data-placeholder="Vencimento Primeira Parcela"]')
    .fill(formattedFutureDate);
  await page.locator('[data-placeholder="Vencimento Primeira Parcela"]').blur();
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

  // //// /GARANTIA///
  await page.click("css=div >> text=Garantias");

  await page.waitForTimeout(3000);
  await page
    .getByRole("button", { name: "Devedor Solidário Valor da" })
    .click();
  await page.locator('[ng-reflect-message="Editar Garantia"]').click();
  await page.getByLabel("Sexo *").locator("div").nth(3).click();
  await page.getByText("MASCULINO").click();
  await page
    .locator("mat-form-field")
    .filter({ hasText: "Data Nascimento *" })
    .getByLabel("Open calendar")
    .click();
  await page.getByLabel("Choose month and year").click();
  await page.getByLabel("2001").click();
  await page.getByLabel("01/01/").click();
  await page.getByLabel("1 de janeiro de 2001", { exact: true }).click();
  await page.getByLabel("Nacionalidade *").locator("div").nth(3).click();
  await page.getByText("BRASILEIRA").click();
  await page.getByRole("combobox", { name: "UF UF" }).locator("span").click();
  await page.getByText("SP", { exact: true }).click();
  await page.getByText("NaturalidadeNaturalidade *").click();
  await page.getByText("BARRETOS").click();
  await page.getByLabel("Tipo Documento *").locator("div").nth(2).click();
  await page.getByText("Carteira de Trabalho").click();
  await page.getByLabel("Nº Documento *").click();
  await page.getByLabel("Nº Documento *").fill(faker.finance.accountNumber());
  await page
    .locator("mat-form-field")
    .filter({ hasText: "Data Expedição *" })
    .getByLabel("Open calendar")
    .click();
  await page.getByLabel("Choose month and year").click();
  await page.getByLabel("2006").click();
  await page.getByLabel("01/06/").click();
  await page.getByLabel("13 de junho de").click();
  await page.getByLabel("Órg. Expedição *").click();
  await page.getByLabel("Órg. Expedição *").fill("UYt");
  await page.getByLabel("UF Expedição *").getByText("UF Expedição").click();
  await page.getByRole("option", { name: "SP" }).locator("span").click();
  await page.getByLabel("Estado Civil *").getByText("Estado Civil").click();
  await page.getByText("SOLTEIRO").click();
  await page.getByLabel("Ocupação *").locator("div").nth(3).click();
  await page.getByText("EMPREGADO").click();
  await page.getByLabel("Profissão *").getByText("Profissão").click();
  await page.getByText("ANALISTA DE SISTEMAS").click();
  await page.getByLabel("Renda *").pressSequentially("345000");
  await page.getByLabel("Patrimônio *").pressSequentially("10000000");
  await page.locator('[formcontrolname="nomeDaMae"]').fill("JANETE");
  await page.getByLabel("Nome Pai *").click();
  await page.getByLabel("Nome Pai *").fill("MARIO");
  await page.getByLabel("Dependentes").click();
  await page.getByLabel("Dependentes").fill("0");
  await page.locator('[formcontrolname="pep"]').click();
  await page.locator('[ng-reflect-value="NAO"]').click();
  await page.locator('[formcontrolname="fatca"]').click();
  await page.locator('[ng-reflect-value="NAO"]').click();

  /////////CEP1/////
  await page.locator('[data-placeholder="CEP"]').nth(2).pressSequentially(cep);
  await page.waitForResponse(
    (response) =>
      response.url().includes("/geral/api/enderecos/") &&
      response.status() === 200
  );
  await page
    .locator('[formcontrolname="numero"]')
    .nth(2)
    .fill(faker.location.buildingNumber());
  await page.locator('[formcontrolname="complemento"]').nth(2).fill("Empresa");
  await page.locator('[formcontrolname="telefone"]').fill("(35) 36454-5555"); // (11) 9 8765-4321
  await page
    .locator('[ng-reflect-placeholder="Email"]')
    .last()
    .fill(faker.internet.email());

  ////CEP2///
  await page.locator('[data-placeholder="CEP"]').nth(3).pressSequentially(cep);
  await page.waitForResponse(
    (response) =>
      response.url().includes("/geral/api/enderecos/") &&
      response.status() === 200
  );
  await page
    .locator('[formcontrolname="numero"]')
    .nth(3)
    .fill(faker.location.buildingNumber());
  await page.locator('[formcontrolname="complemento"]').nth(3).fill("Empresa");
  await page
    .locator('[formcontrolname="telefoneComercial"]')
    .last()
    .fill("(46) 54444-4444"); // (11) 9 8765-4321
  await page
    .locator('[formcontrolname="tipoEnderecoCorrespondencia"]')
    .last()
    .click();
  await page.getByText(" Endereço Comercial ").last().click();

  await page.getByRole("button", { name: "Salvar" }).click();
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
  await page.reload();
  ////AÇÃO DE ENVIAR PROPOSTA 5   >  APROVADO PARA PRE FORMALIZAÇÃO
  await page.click("css=div >> text=Dados Bancários");
  await page.locator('[formcontrolname="codigoAgencia"]').first().fill("1234");

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

  //////PROCESSO PARA UPLOAD DE arquivo Anexar Abertura de endividamento bancario

  const fileChooserPromises = page.waitForEvent("filechooser");

  await page.click('[ng-reflect-message="Anexar Abertura de endividamen"]');
  const fileChoosers = await fileChooserPromises;

  await fileChoosers.setFiles(
    "OperacaoEmpresas/utils/fixtures/images/imagem1.png"
  );
  //////PROCESSO PARA UPLOAD DE arquivo Anexar Contrato Social

  const fileChooserPromisess = page.waitForEvent("filechooser");

  await page.click('[ng-reflect-message="Anexar Contrato Social"]');
  const fileChooserss = await fileChooserPromisess;

  await fileChooserss.setFiles(
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
