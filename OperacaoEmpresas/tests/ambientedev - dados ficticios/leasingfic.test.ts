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
test("Leasing - Dados Dinamicos e Ficticios", async ({ page }) => {
  test.slow();
  await page.goto("/");
  await page.click("css=button >> text=Nova");
  //await page.getByRole('button', { name: 'Nova' }).click(); /// tambem esta certo
  //await page.locator('[ng-reflect-router-link="/capital-giro"]').click();
  await page.locator('[ng-reflect-router-link="/leasing"]').click();
  await page.goto(
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/leasing"
  );

  ///////////QUALIFICAÇÃO DA EMPRESA//////
  await page.locator('[ng-reflect-placeholder="CNPJ"]').fill(cnpj.fake());
  await page.locator('[ng-reflect-placeholder="CNPJ"]').press("Tab");
  await page
    .locator('[ng-reflect-placeholder="Razão Social"]')
    .fill(faker.company.name());
  await page
    .locator('[ng-reflect-placeholder="Faturamento Atual"]')
    .pressSequentially("5500000");
  await page
    .locator('[ng-reflect-placeholder="Faturamento Atual"]')
    .press("Tab");

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
  await page.waitForTimeout(3000);
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
  await page.locator('[formcontrolname="cpfCnpj"]').last().fill(cpf.fake());
  await page.locator('[formcontrolname="cpfCnpj"]').last().press("Tab");
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

  await page
    .locator('[formcontrolname="email"]')
    .last()
    .fill(faker.internet.email());

  ///CAMPOS NOVOS///
  await page.locator('[formcontrolname="rg"]').fill("278783752");
  await page.locator('[placeholder="UF de emissão do RG"]').click();
  await page.locator('[ng-reflect-value="SP"]').click();
  await page.locator('[formcontrolname="celular"]').fill("4698889-8788"); // (11) 9 8765-4321
  await page.locator('[formcontrolname="celular"]').first().press("Tab");

  await page.getByRole("button", { name: "Salvar" }).click();

  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(3000);

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
  ////CONFIGURAÇÃO DA DATA /////
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

  //////////AÇÃO DE SALVAR O NUMERO DA PROPOSTA
  const proposta = await page
    .locator('[id="header-proposta-idPropostaCliente"]')
    .innerText();
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(5000);

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
    .pressSequentially("1,43");
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
  const calculoRequests = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/leasing/api/calculations/financed-amount") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);

  await calculoRequests;

  // //// /GARANTIA///
  await page.click("css=div >> text=Garantias");

  await page.waitForTimeout(3000);
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

  /////AÇÃO DE ENVIAR PROPOSTA 1    > PRE PROPOSTA PARA ANALISE COMERCIAL
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Enviar Proposta").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const preProposta = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/leasing/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);
  await preProposta;
  let url =
    "https://dev-omni-capital-giro-front.dev-omnicfi.us-east-1.omniaws.io/#/leasing/";

  /////AÇÃO DE ENVIAR PROPOSTA 2.1    > Analise PLD PARA ANALISE COMERCIAL

  await page.goto(url + id);
  await page.reload();
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const analisePld = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/leasing/api/proposals") &&
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
        response.url().includes("/leasing/api/proposals") &&
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
  await page.waitForTimeout(3000);
  await page.locator('[data-placeholder="Nº Proposta"]').fill(proposta);
  await page.waitForTimeout(6000);

  await page.locator('[ng-reflect-message="Leasing"]').click();
  await expect(page.locator(".mat-checkbox-inner-container")).toBeVisible({
    timeout: 30_000,
  });

  await page.click("css=div >> text=Bureau de Crédito");
  await page.click("css=div >> text=Redisparo da crivo Manual");
  await page.waitForTimeout(8000);

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
        response.url().includes("/leasing/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
    page.waitForResponse(
      (response) =>
        response
          .url()
          .includes(
            "/mesa-credito-pj/api/agent-queue?status=PRE_PROPOSTA&sort=id,asc&page=0&size=10"
          ) && response.status() === 200,
      { timeout: 13_0000 }
    ),
  ]);

  await etapaCrivo;

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
        response.url().includes("/leasing/api/proposals") &&
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
        response.url().includes("/leasing/api/proposals") &&
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
        response.url().includes("/leasing/api/proposals") &&
        response.status() === 200,
      { timeout: 60_0000 }
    ),
  ]);
  await gerarContrato;
  //await page.reload();

  /////AÇÃO DE ENVIAR PROPOSTA 6   > FORMALIZAÇÃO PARA AGUARDANDO ASSINATURA
  await page.getByRole("button", { name: " Ações " }).click();
  await page.click('[formcontrolname="acao"]');
  await page.getByText("Aprovar").click();
  await page.locator('[formcontrolname="parecer"]').fill("Teste");
  await page.getByRole("button", { name: "Salvar" }).click();
  const statusFormalizacao = Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/leasing/api/proposals") &&
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
        response.url().includes("/leasing/api/proposals") &&
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
  const aguardandoLiberacao = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/leasing/api/proposals") &&
        response.status() === 200,
      { timeout: 60_000 }
    ),
  ]);

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
