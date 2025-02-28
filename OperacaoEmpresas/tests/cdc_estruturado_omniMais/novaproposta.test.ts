import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import * as cnpj from "validation-br/dist/cnpj";
import * as cpf from "validation-br/dist/cpf";
import { Utility } from "../../utils/utility";
import { chromium } from "playwright"; // ou 'firefox' ou 'webkit'

test.describe("Criação de propostas", { tag: ["@OmniMais"] }, () => {
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

  test.only("Teste01 - CDC Estruturado - Nova proposta com Assistencia", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/");

    await page.getByText(" CDC Estruturado ").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Selecione um lojista" })
      .getByRole("textbox")
      .click();

    await page.getByText(" 8200315 - nome do lojista 8200315 ").click();
    await page.getByRole("button", { name: " Selecionar " }).click();
    await page.getByText(" Nova Proposta ").click();
    await page.goto(
      "https://dev-erp.omni.com.br/app/omni-cdc-estruturado-mf/proposal"
    );
    /////DADOS DO CLIENTE///////
    await page.locator('input[type="CPF"]').click();
    await page.locator('input[type="CPF"]').fill(cpf.fake());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome completo do cliente" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome completo do cliente" })
      .getByRole("textbox")
      .fill(faker.internet.userName());
    await page.locator("omni-datepicker").getByRole("textbox").click();
    await page.getByLabel("Choose month and year").click();
    await page.getByLabel("Previous 24 years").click();
    await page.getByLabel("1945").click();
    await page.getByLabel("01/02/").click();
    await page.getByLabel("04/02/").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));

    const campoCelularLocator = page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox");

    // Preenche o campo com um número de telefone gerado
    await campoCelularLocator.fill(faker.phone.number("(46) 9####-####"));

    // Agora, você pode pegar o valor do campo e exibi-lo
    const campoCelularValor = await campoCelularLocator.inputValue();
    console.log(campoCelularValor);

    const pegarUltimosNoveDigitos: (campoCelularValor: string) => string = (
      campoCelularValor
    ) => {
      const numeroSemHifen = campoCelularValor.replace(/-/g, "");
      return numeroSemHifen.slice(-9);
    };

    const celular = campoCelularValor;
    const numero = pegarUltimosNoveDigitos(celular); // Correção: chamada da função
    console.log(numero); // Saída esperada: "55284-9778"

    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill("teste@teste.com.br");
    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("790000");

    await page.getByRole("button", { name: "Próximo" }).click();
    const gravaProposta = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/cdc-estruturado/api/internal/proposal") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              "/omni-cdc-estruturado-mf/assets/icons/small/check.svg"
            ) && response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await gravaProposta;
    //////DADOS DA COMPRA/////
    await page.getByText("Dados da compra").click();
    await page.waitForTimeout(2000);
    await page
      .locator("omni-input")
      .filter({ hasText: "Tabela" })
      .getByRole("textbox")
      .click();
    await page.locator(".select_dropdown_item").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Vencimento" })
      .getByRole("textbox")
      .click();

    await page.locator(".select_dropdown_item").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Parcelamento" })
      .getByRole("textbox")
      .click();
    await page.locator(".omni-radio_checkmark").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Produto" })
      .getByRole("textbox")
      .click();
    await page.getByText(" Eletrônicos ").click();
    await page.getByRole("button", { name: "Próximo" }).click();
    /////DADOS COMPLEMENTARES/////
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome da mãe" })
      .getByRole("textbox")
      .fill(faker.internet.userName());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome da pai" })
      .getByRole("textbox")
      .fill(faker.internet.userName());

    await page
      .locator("omni-input")
      .filter({ hasText: "Nacionalidade" })
      .getByRole("textbox")
      .click();
    await page.getByText("Brasileira").click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Classe profissional" })
      .getByRole("textbox")
      .click();
    await page.getByText("Aposentado, pensionista").click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Profissão" })
      .getByRole("textbox")
      .click();
    await page.getByText("Aposentados em geral").click();

    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("8500");

    await page.getByRole("button", { name: "Próximo" }).click();
    ///ENDEREÇO DO CLIENTE///
    await page.waitForTimeout(2000);
    await page
      .locator("omni-input")
      .filter({ hasText: "CEP" })
      .getByRole("textbox")
      .fill("85660-000");

    await page.waitForTimeout(1000);
    await page
      .locator("omni-input")
      .filter({ hasText: "Rua, avenida ou alameda" })
      .getByRole("textbox")
      .fill("Rua teste");
    await page.getByRole("spinbutton").click();
    await page.getByRole("spinbutton").fill("45");
    await page
      .locator("omni-input")
      .filter({ hasText: "Complemento" })
      .getByRole("textbox")
      .fill("casa verde");
    await page.getByRole("button", { name: "Próximo" }).click();
    /////DADOS ADICIONAIS/////
    await page.getByRole("button", { name: "Adicionar Referência" }).click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .fill("Marcos");
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));
    await page.locator("omni-select").getByRole("textbox").click();
    await page.getByText("Filho").click();
    await page.getByRole("button", { name: "Adicionar" }).click();
    await page.getByRole("button", { name: " Ok " }).click();
    await page.getByRole("button", { name: "Adicionar avalista" }).click();
    await page.locator('input[type="CPF"]').click();
    await page.locator('input[type="CPF"]').fill(cpf.fake());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .fill("David");

    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("8500");

    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));

    await page.locator('input[type="email"]').fill("teste1@teste.com");
    await page.locator("omni-select").getByRole("textbox").click();
    await page.getByText("Irmão").click();

    await page.getByRole("button", { name: "Adicionar" }).click();

    await page.getByRole("button", { name: "Próximo" }).click();
    /////AUTENTICAÇÃO////
    await page.getByRole("button", { name: "Enviar" }).click();

    await page.getByText("Enviar Token por SMS").click();

    let codigosms: string = "";

    (async () => {
      const browser = await chromium.launch({ headless: false }); // Defina headless: false para ver o navegador
      const page = await browser.newPage(); // A nova aba
      await page.goto(
        "https://api.dev-omnicfi.us-east-1.omniaws.io/sms/messages"
      ); // Navega para uma URL

      await page.locator('[name="ddd"]').fill("5546");
      await page.locator('[name="fone"]').type(numero);
      await page.waitForTimeout(3000);
      await page.getByRole("button", { name: "Pesquisa" }).click();

      const smsrecebido = await page
        .locator("table tbody tr:nth-child(1) td:nth-child(4)")
        .innerText();

      const regex = /\b\d{6}\b/;

      const matchSms = smsrecebido.match(regex);

      if (matchSms) {
        codigosms = matchSms[0];
        console.log(codigosms);
      }

      await page.goBack(); // Vai para a página anterior no histórico de navegação
    })();
    await page.waitForTimeout(10000);
    await page.getByRole("button", { name: "Validar Token" }).click();
    await page.getByRole("textbox").click();
    await page.getByRole("textbox").fill(codigosms);
    await page.getByRole("button", { name: "Validar" }).click();

    await page.waitForTimeout(2000);

    ////////////////VENDEDOR//////
    await page.getByText("Vendedor").click();
    await page
      .locator("label")
      .filter({ hasText: "Luana Priscila" })
      .locator("span")
      .nth(2)
      .click();
    /////RESUMO////
    await page.getByRole("button", { name: "Enviar proposta" }).click();
    await page.getByRole("button", { name: "Entendi" }).click();
    await page.setDefaultTimeout(2000);
  });

  test("Teste02 - CDC Estruturado - Nova proposta com Seguro", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/");

    await page.getByText(" CDC Estruturado ").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Selecione um lojista" })
      .getByRole("textbox")
      .click();

    await page.getByText(" 8200315 - nome do lojista 8200315 ").click();
    await page.getByRole("button", { name: " Selecionar " }).click();
    await page.getByText(" Nova Proposta ").click();
    await page.goto(
      "https://dev-erp.omni.com.br/app/omni-cdc-estruturado-mf/proposal"
    );
    /////DADOS DO CLIENTE///////
    await page.locator('input[type="CPF"]').click();
    await page.locator('input[type="CPF"]').fill(cpf.fake());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome completo do cliente" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome completo do cliente" })
      .getByRole("textbox")
      .fill(faker.internet.userName());
    await page.locator("omni-datepicker").getByRole("textbox").click();
    await page.getByLabel("Choose month and year").click();
    await page.getByLabel("Previous 24 years").click();
    await page.getByLabel("1945").click();
    await page.getByLabel("01/02/").click();
    await page.getByLabel("04/02/").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));

    const campoCelularLocator = page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox");

    // Preenche o campo com um número de telefone gerado
    await campoCelularLocator.fill(faker.phone.number("(46) 9####-####"));

    // Agora, você pode pegar o valor do campo e exibi-lo
    const campoCelularValor = await campoCelularLocator.inputValue();
    console.log(campoCelularValor);

    const pegarUltimosNoveDigitos: (campoCelularValor: string) => string = (
      campoCelularValor
    ) => {
      const numeroSemHifen = campoCelularValor.replace(/-/g, "");
      return numeroSemHifen.slice(-9);
    };

    const celular = campoCelularValor;
    const numero = pegarUltimosNoveDigitos(celular); // Correção: chamada da função
    console.log(numero); // Saída esperada: "55284-9778"

    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill("teste@teste.com.br");
    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("490000");

    await page.getByRole("button", { name: "Próximo" }).click();
    const gravaProposta = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/cdc-estruturado/api/internal/proposal") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              "/omni-cdc-estruturado-mf/assets/icons/small/check.svg"
            ) && response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await gravaProposta;
    //////DADOS DA COMPRA/////
    await page.getByText("Dados da compra").click();
    await page.waitForTimeout(2000);
    await page.getByRole("button").nth(1).click();
    await page
      .locator(
        "div:nth-child(2) > omni-switch > .omni-switch > .omni-switch_background > .omni-switch_handle"
      )
      .click();
    await page.getByRole("button").click();
    await page.waitForTimeout(2000);
    await page
      .locator("omni-input")
      .filter({ hasText: "Tabela" })
      .getByRole("textbox")
      .click();
    await page.locator(".select_dropdown_item").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Vencimento" })
      .getByRole("textbox")
      .click();

    await page.locator(".select_dropdown_item").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Parcelamento" })
      .getByRole("textbox")
      .click();
    await page.locator(".omni-radio_checkmark").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Produto" })
      .getByRole("textbox")
      .click();
    await page.getByText(" Eletrônicos ").click();
    await page.getByRole("button", { name: "Próximo" }).click();
    /////DADOS COMPLEMENTARES/////
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome da mãe" })
      .getByRole("textbox")
      .fill(faker.internet.userName());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome da pai" })
      .getByRole("textbox")
      .fill(faker.internet.userName());

    await page
      .locator("omni-input")
      .filter({ hasText: "Nacionalidade" })
      .getByRole("textbox")
      .click();
    await page.getByText("Brasileira").click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Classe profissional" })
      .getByRole("textbox")
      .click();
    await page.getByText("Aposentado, pensionista").click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Profissão" })
      .getByRole("textbox")
      .click();
    await page.getByText("Aposentados em geral").click();

    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("8500");

    await page.getByRole("button", { name: "Próximo" }).click();
    ///ENDEREÇO DO CLIENTE///
    await page.waitForTimeout(2000);
    await page
      .locator("omni-input")
      .filter({ hasText: "CEP" })
      .getByRole("textbox")
      .fill("85660-000");

    await page.waitForTimeout(1000);
    await page
      .locator("omni-input")
      .filter({ hasText: "Rua, avenida ou alameda" })
      .getByRole("textbox")
      .fill("Rua teste");
    await page.getByRole("spinbutton").click();
    await page.getByRole("spinbutton").fill("45");
    await page
      .locator("omni-input")
      .filter({ hasText: "Complemento" })
      .getByRole("textbox")
      .fill("casa verde");
    await page.getByRole("button", { name: "Próximo" }).click();
    /////DADOS ADICIONAIS/////
    await page.getByRole("button", { name: "Adicionar Referência" }).click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .fill("Marcos");
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));
    await page.locator("omni-select").getByRole("textbox").click();
    await page.getByText("Filho").click();
    await page.getByRole("button", { name: "Adicionar" }).click();
    await page.getByRole("button", { name: " Ok " }).click();
    await page.getByRole("button", { name: "Adicionar avalista" }).click();
    await page.locator('input[type="CPF"]').click();
    await page.locator('input[type="CPF"]').fill(cpf.fake());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .fill("David");

    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("8500");

    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));

    await page.locator('input[type="email"]').fill("teste1@teste.com");
    await page.locator("omni-select").getByRole("textbox").click();
    await page.getByText("Irmão").click();

    await page.getByRole("button", { name: "Adicionar" }).click();

    await page.getByRole("button", { name: "Próximo" }).click();
    /////AUTENTICAÇÃO////
    await page.getByRole("button", { name: "Enviar" }).click();

    await page.getByText("Enviar Token por SMS").click();

    let codigosms: string = "";

    (async () => {
      const browser = await chromium.launch({ headless: false }); // Defina headless: false para ver o navegador
      const page = await browser.newPage(); // A nova aba
      await page.goto(
        "https://api.dev-omnicfi.us-east-1.omniaws.io/sms/messages"
      ); // Navega para uma URL

      await page.locator('[name="ddd"]').fill("5546");
      await page.locator('[name="fone"]').type(numero);
      await page.waitForTimeout(3000);
      await page.getByRole("button", { name: "Pesquisa" }).click();

      const smsrecebido = await page
        .locator("table tbody tr:nth-child(1) td:nth-child(4)")
        .innerText();

      const regex = /\b\d{6}\b/;

      const matchSms = smsrecebido.match(regex);

      if (matchSms) {
        codigosms = matchSms[0];
        console.log(codigosms);
      }

      await page.goBack(); // Vai para a página anterior no histórico de navegação
    })();
    await page.waitForTimeout(10000);
    await page.getByRole("button", { name: "Validar Token" }).click();
    await page.getByRole("textbox").click();
    await page.getByRole("textbox").fill(codigosms);
    await page.getByRole("button", { name: "Validar" }).click();

    await page.waitForTimeout(2000);

    ////////////////VENDEDOR//////
    await page.getByText("Vendedor").click();
    await page
      .locator("label")
      .filter({ hasText: "Luana Priscila" })
      .locator("span")
      .nth(2)
      .click();
    /////RESUMO////
    await page.getByRole("button", { name: "Enviar proposta" }).click();
    await page.getByRole("button", { name: "Entendi" }).click();
    await page.setDefaultTimeout(2000);
  });
  test("Teste03 - CDC Estruturado - Nova proposta COM Assistencia e COM Seguro ", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/");

    await page.getByText(" CDC Estruturado ").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Selecione um lojista" })
      .getByRole("textbox")
      .click();
    //await page.getByText("Selecione um lojista").click();
    await page.getByText(" 8200315 - nome do lojista 8200315 ").click();
    await page.getByRole("button", { name: " Selecionar " }).click();
    await page.getByText(" Nova Proposta ").click();
    await page.goto(
      "https://dev-erp.omni.com.br/app/omni-cdc-estruturado-mf/proposal"
    );
    /////DADOS DO CLIENTE///////
    await page.locator('input[type="CPF"]').click();
    await page.locator('input[type="CPF"]').fill(cpf.fake());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome completo do cliente" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome completo do cliente" })
      .getByRole("textbox")
      .fill(faker.internet.userName());
    await page.locator("omni-datepicker").getByRole("textbox").click();
    await page.getByLabel("Choose month and year").click();
    await page.getByLabel("Previous 24 years").click();
    await page.getByLabel("1945").click();
    await page.getByLabel("01/02/").click();
    await page.getByLabel("04/02/").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));

    const campoCelularLocator = page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox");

    // Preenche o campo com um número de telefone gerado
    await campoCelularLocator.fill(faker.phone.number("(46) 9####-####"));

    // Agora, você pode pegar o valor do campo e exibi-lo
    const campoCelularValor = await campoCelularLocator.inputValue();
    console.log(campoCelularValor);

    const pegarUltimosNoveDigitos: (campoCelularValor: string) => string = (
      campoCelularValor
    ) => {
      const numeroSemHifen = campoCelularValor.replace(/-/g, "");
      return numeroSemHifen.slice(-9);
    };

    const celular = campoCelularValor;
    const numero = pegarUltimosNoveDigitos(celular); // Correção: chamada da função
    console.log(numero); // Saída esperada: "55284-9778"

    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill("teste@teste.com.br");
    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("490000");

    await page.getByRole("button", { name: "Próximo" }).click();
    const gravaProposta = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/cdc-estruturado/api/internal/proposal") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              "/omni-cdc-estruturado-mf/assets/icons/small/check.svg"
            ) && response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await gravaProposta;
    //////DADOS DA COMPRA/////
    await page.getByText("Dados da compra").click();
    await page.waitForTimeout(2000);
    await page
      .locator("omni-input")
      .filter({ hasText: "Tabela" })
      .getByRole("textbox")
      .click();
    await page.locator(".select_dropdown_item").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Vencimento" })
      .getByRole("textbox")
      .click();

    await page.locator(".select_dropdown_item").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Parcelamento" })
      .getByRole("textbox")
      .click();
    await page.locator(".omni-radio_checkmark").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Produto" })
      .getByRole("textbox")
      .click();
    await page.getByText(" Eletrônicos ").click();
    await page.getByRole("button", { name: "Próximo" }).click();
    /////DADOS COMPLEMENTARES/////
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome da mãe" })
      .getByRole("textbox")
      .fill(faker.internet.userName());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome da pai" })
      .getByRole("textbox")
      .fill(faker.internet.userName());

    await page
      .locator("omni-input")
      .filter({ hasText: "Nacionalidade" })
      .getByRole("textbox")
      .click();
    await page.getByText("Brasileira").click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Classe profissional" })
      .getByRole("textbox")
      .click();
    await page.getByText("Aposentado, pensionista").click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Profissão" })
      .getByRole("textbox")
      .click();
    await page.getByText("Aposentados em geral").click();

    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("8500");

    await page.getByRole("button", { name: "Próximo" }).click();
    ///ENDEREÇO DO CLIENTE///
    await page.waitForTimeout(3000);
    await page
      .locator("omni-input")
      .filter({ hasText: "CEP" })
      .getByRole("textbox")
      .fill("85660-000");

    await page.waitForTimeout(1000);
    await page
      .locator("omni-input")
      .filter({ hasText: "Rua, avenida ou alameda" })
      .getByRole("textbox")
      .fill("Rua teste");
    await page.getByRole("spinbutton").click();
    await page.getByRole("spinbutton").fill("45");
    await page
      .locator("omni-input")
      .filter({ hasText: "Complemento" })
      .getByRole("textbox")
      .fill("casa verde");
    await page.getByRole("button", { name: "Próximo" }).click();
    /////DADOS ADICIONAIS/////
    await page.getByRole("button", { name: "Adicionar Referência" }).click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .fill("Marcos");
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));
    await page.locator("omni-select").getByRole("textbox").click();
    await page.getByText("Filho").click();
    await page.getByRole("button", { name: "Adicionar" }).click();
    await page.getByRole("button", { name: " Ok " }).click();
    await page.getByRole("button", { name: "Adicionar avalista" }).click();
    await page.locator('input[type="CPF"]').click();
    await page.locator('input[type="CPF"]').fill(cpf.fake());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .fill("David");

    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("8500");

    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));

    await page.locator('input[type="email"]').fill("teste1@teste.com");
    await page.locator("omni-select").getByRole("textbox").click();
    await page.getByText("Irmão").click();

    await page.getByRole("button", { name: "Adicionar" }).click();

    await page.getByRole("button", { name: "Próximo" }).click();
    /////AUTENTICAÇÃO////
    await page.getByRole("button", { name: "Enviar" }).click();

    await page.getByText("Enviar Token por SMS").click();

    let codigosms: string = "";

    (async () => {
      const browser = await chromium.launch({ headless: false }); // Defina headless: false para ver o navegador
      const page = await browser.newPage(); // A nova aba
      await page.goto(
        "https://api.dev-omnicfi.us-east-1.omniaws.io/sms/messages"
      ); // Navega para uma URL

      await page.locator('[name="ddd"]').fill("5546");
      await page.locator('[name="fone"]').type(numero);
      await page.waitForTimeout(3000);
      await page.getByRole("button", { name: "Pesquisa" }).click();

      const smsrecebido = await page
        .locator("table tbody tr:nth-child(1) td:nth-child(4)")
        .innerText();

      const regex = /\b\d{6}\b/;

      const matchSms = smsrecebido.match(regex);

      if (matchSms) {
        codigosms = matchSms[0];
        console.log(codigosms);
      }

      await page.goBack(); // Vai para a página anterior no histórico de navegação
    })();
    await page.waitForTimeout(10000);
    await page.getByRole("button", { name: "Validar Token" }).click();
    await page.getByRole("textbox").click();
    await page.getByRole("textbox").fill(codigosms);
    await page.getByRole("button", { name: "Validar" }).click();

    await page.waitForTimeout(2000);

    ////////////////VENDEDOR//////
    await page.getByText("Vendedor").click();
    await page
      .locator("label")
      .filter({ hasText: "Luana Priscila" })
      .locator("span")
      .nth(2)
      .click();
    /////RESUMO////
    await page.getByRole("button", { name: "Enviar proposta" }).click();
    await page.getByRole("button", { name: "Entendi" }).click();
    await page.setDefaultTimeout(2000);
  });

  test("Teste04 - CDC Estruturado - Nova proposta SEM Assistencia e SEM Seguro ", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/");

    await page.getByText(" CDC Estruturado ").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Selecione um lojista" })
      .getByRole("textbox")
      .click();
    //await page.getByText("Selecione um lojista").click();
    await page.getByText(" 8200315 - nome do lojista 8200315 ").click();
    await page.getByRole("button", { name: " Selecionar " }).click();
    await page.getByText(" Nova Proposta ").click();
    await page.goto(
      "https://dev-erp.omni.com.br/app/omni-cdc-estruturado-mf/proposal"
    );
    /////DADOS DO CLIENTE///////
    await page.locator('input[type="CPF"]').click();
    await page.locator('input[type="CPF"]').fill(cpf.fake());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome completo do cliente" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome completo do cliente" })
      .getByRole("textbox")
      .fill(faker.internet.userName());
    await page.locator("omni-datepicker").getByRole("textbox").click();
    await page.getByLabel("Choose month and year").click();
    await page.getByLabel("Previous 24 years").click();
    await page.getByLabel("1945").click();
    await page.getByLabel("01/02/").click();
    await page.getByLabel("04/02/").click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));

    const campoCelularLocator = page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox");

    // Preenche o campo com um número de telefone gerado
    await campoCelularLocator.fill(faker.phone.number("(46) 9####-####"));

    // Agora, você pode pegar o valor do campo e exibi-lo
    const campoCelularValor = await campoCelularLocator.inputValue();
    console.log(campoCelularValor);

    const pegarUltimosNoveDigitos: (campoCelularValor: string) => string = (
      campoCelularValor
    ) => {
      const numeroSemHifen = campoCelularValor.replace(/-/g, "");
      return numeroSemHifen.slice(-9);
    };

    const celular = campoCelularValor;
    const numero = pegarUltimosNoveDigitos(celular); // Correção: chamada da função
    console.log(numero); // Saída esperada: "55284-9778"

    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill("teste@teste.com.br");
    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("490000");

    await page.getByRole("button", { name: "Próximo" }).click();
    const gravaProposta = Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/cdc-estruturado/api/internal/proposal") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              "/omni-cdc-estruturado-mf/assets/icons/small/check.svg"
            ) && response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await gravaProposta;
    //////DADOS DA COMPRA/////
    await page.getByText("Dados da compra").click();
    await page.waitForTimeout(2000);
    await page.getByRole("button").nth(1).click();
    await page.locator(".omni-switch_background").first().click();
    await page
      .locator(
        "div:nth-child(2) > omni-switch > .omni-switch > .omni-switch_background > .omni-switch_handle"
      )
      .click();
    await page.getByRole("button").click();
    await page.waitForTimeout(2000);
    await page
      .locator("omni-input")
      .filter({ hasText: "Tabela" })
      .getByRole("textbox")
      .click();
    await page.locator(".select_dropdown_item").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Vencimento" })
      .getByRole("textbox")
      .click();

    await page.locator(".select_dropdown_item").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Parcelamento" })
      .getByRole("textbox")
      .click();
    await page.locator(".omni-radio_checkmark").first().click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Produto" })
      .getByRole("textbox")
      .click();
    await page.getByText(" Eletrônicos ").click();
    await page.getByRole("button", { name: "Próximo" }).click();
    /////DADOS COMPLEMENTARES/////
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome da mãe" })
      .getByRole("textbox")
      .fill(faker.internet.userName());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome da pai" })
      .getByRole("textbox")
      .fill(faker.internet.userName());

    await page
      .locator("omni-input")
      .filter({ hasText: "Nacionalidade" })
      .getByRole("textbox")
      .click();
    await page.getByText("Brasileira").click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Classe profissional" })
      .getByRole("textbox")
      .click();
    await page.getByText("Aposentado, pensionista").click();

    await page
      .locator("omni-input")
      .filter({ hasText: "Profissão" })
      .getByRole("textbox")
      .click();
    await page.getByText("Aposentados em geral").click();

    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("8500");

    await page.getByRole("button", { name: "Próximo" }).click();
    ///ENDEREÇO DO CLIENTE///
    await page.waitForTimeout(2000);
    await page
      .locator("omni-input")
      .filter({ hasText: "CEP" })
      .getByRole("textbox")
      .fill("85660-000");

    await page.waitForTimeout(1000);
    await page
      .locator("omni-input")
      .filter({ hasText: "Rua, avenida ou alameda" })
      .getByRole("textbox")
      .fill("Rua teste");
    await page.getByRole("spinbutton").click();
    await page.getByRole("spinbutton").fill("45");
    await page
      .locator("omni-input")
      .filter({ hasText: "Complemento" })
      .getByRole("textbox")
      .fill("casa verde");
    await page.getByRole("button", { name: "Próximo" }).click();
    /////DADOS ADICIONAIS/////
    await page.getByRole("button", { name: "Adicionar Referência" }).click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .fill("Marcos");
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .click();
    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));
    await page.locator("omni-select").getByRole("textbox").click();
    await page.getByText("Filho").click();
    await page.getByRole("button", { name: "Adicionar" }).click();
    await page.getByRole("button", { name: " Ok " }).click();
    await page.getByRole("button", { name: "Adicionar avalista" }).click();
    await page.locator('input[type="CPF"]').click();
    await page.locator('input[type="CPF"]').fill(cpf.fake());
    await page
      .locator("omni-input")
      .filter({ hasText: "Nome" })
      .getByRole("textbox")
      .fill("David");

    await page
      .locator("omni-money")
      .getByRole("textbox")
      .pressSequentially("8500");

    await page
      .locator("omni-input")
      .filter({ hasText: "Telefone" })
      .getByRole("textbox")
      .fill(faker.phone.number("(46) 9####-####"));

    await page.locator('input[type="email"]').fill("teste1@teste.com");
    await page.locator("omni-select").getByRole("textbox").click();
    await page.getByText("Irmão").click();

    await page.getByRole("button", { name: "Adicionar" }).click();

    await page.getByRole("button", { name: "Próximo" }).click();
    /////AUTENTICAÇÃO////
    await page.getByRole("button", { name: "Enviar" }).click();
    //await page.getByRole("button", { name: "Reenviar" }).click();
    await page.getByText("Enviar Token por SMS").click();

    let codigosms: string = "";

    (async () => {
      const browser = await chromium.launch({ headless: false }); // Defina headless: false para ver o navegador
      const page = await browser.newPage(); // A nova aba
      await page.goto(
        "https://api.dev-omnicfi.us-east-1.omniaws.io/sms/messages"
      ); // Navega para uma URL

      await page.locator('[name="ddd"]').fill("5546");
      await page.locator('[name="fone"]').type(numero);
      await page.waitForTimeout(3000);
      await page.getByRole("button", { name: "Pesquisa" }).click();

      const smsrecebido = await page
        .locator("table tbody tr:nth-child(1) td:nth-child(4)")
        .innerText();

      const regex = /\b\d{6}\b/;

      const matchSms = smsrecebido.match(regex);

      if (matchSms) {
        codigosms = matchSms[0];
        console.log(codigosms);
      }

      await page.goBack(); // Vai para a página anterior no histórico de navegação
    })();
    await page.waitForTimeout(10000);
    await page.getByRole("button", { name: "Validar Token" }).click();
    await page.getByRole("textbox").click();
    await page.getByRole("textbox").fill(codigosms);
    await page.getByRole("button", { name: "Validar" }).click();

    await page.waitForTimeout(2000);

    ////////////////VENDEDOR//////
    await page.getByText("Vendedor").click();
    await page
      .locator("label")
      .filter({ hasText: "Luana Priscila" })
      .locator("span")
      .nth(2)
      .click();
    /////RESUMO////
    await page.getByRole("button", { name: "Enviar proposta" }).click();
    await page.getByRole("button", { name: "Entendi" }).click();
    await page.setDefaultTimeout(2000);
  });
});
