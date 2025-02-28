import { Page } from "@playwright/test";

export class CancelaPropostaPage {
  constructor(public readonly page: Page) {}
  /**
   * @async Entra na tela inicial do sistema Omni Empresas
   */
  async enterHomePage(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForLoadState();
  }

  clicarCdcEstruturado() {
    return this.page.getByText(" CDC Estruturado ").click();
  }
  clicarSelecioneLogista() {
    return this.page
      .locator("omni-input")
      .filter({ hasText: "Selecione um lojista" })
      .getByRole("textbox")
      .click();
  }

  async escreverCNPJ(cnpj: string) {
    await this.page
      .locator('[ng-reflect-placeholder="CNPJ"]')
      .first()
      .pressSequentially(cnpj);
    await this.page
      .locator('[ng-reflect-placeholder="CNPJ"]')
      .first()
      .press("Tab");
    // await this.page.waitForResponse(
    //   (response) =>
    //     response.url().includes("/crivo-last-result") &&
    //     response.status() === 200
    // );
  }

  clicarPropostaNegocio() {
    return this.page.click("css=div >> text=Proposta de Negócios");
  }

  abrirOperacoes() {
    return this.page.locator('[placeholder="Operação"]').click();
  }

  clicarOpcaoOperacao(opcaoOperacao: string) {
    return this.page.getByText(opcaoOperacao).click();
  }

  async escreverValorEmprestimo(valorEmprestimo: string) {
    await this.page
      .locator('[data-placeholder="Valor do Empréstimo"]')
      .pressSequentially(valorEmprestimo);
    await this.page.locator('[data-placeholder="Valor do Empréstimo"]').focus();
    await this.page.locator('[data-placeholder="Valor do Empréstimo"]').blur();
  }

  async escreverTaxa(valorTaxa: string) {
    await this.page.locator('[formcontrolname="taxaMensal"]').fill(valorTaxa);
    await this.page.locator('[formcontrolname="taxaMensal"]').press("Tab");
  }

  async clicarPeriodicidade(opcaoPeriodicidade: string) {
    await this.page.locator('[placeholder="Periodicidade"]').click();
    await this.page.getByText(opcaoPeriodicidade).click();
  }

  escreverParcelas(qtdParcela: string) {
    return this.page.locator('[data-placeholder="Parcelas"]').fill(qtdParcela);
  }

  async clicarTarifaCadastro(opcaoTarifaCadastro: string) {
    await this.page
      .locator('[formcontrolname="pagamentoTarifaCadastro"]')
      .click();
    await this.page.locator(opcaoTarifaCadastro).click();
  }

  escreverTarifaCadastro(valorTarifaCadastro: string) {
    return this.page
      .locator('[formcontrolname="valorTarifaCadastro"]')
      .pressSequentially(valorTarifaCadastro);
  }

  async clicarPagamentoSeguro(opcaoPagamentoSeguro: string) {
    await this.page.locator('[formcontrolname="pagamentoSeguro"]').click();
    await this.page.locator(opcaoPagamentoSeguro).click();
  }

  async escreverGarantiaBndes(opcaoGarantiaBndes: string) {
    await this.page.locator('[formcontrolname="possuiGarantiaBNDES"]').click();
    await this.page.locator(opcaoGarantiaBndes).click();
  }
  async escreverTipoGarantiaBndes(tipoGarantiaBNDES: string) {
    await this.page.locator('[formcontrolname="tipoGarantiaBNDES"]').click();
    await this.page.getByText(tipoGarantiaBNDES).click();
  }

  async escreverPercentualCobertura(valorCobertura: string) {
    await this.page
      .locator('[formcontrolname="percentualCoberturaBNDES"]')
      .click();
    await this.page.getByText(valorCobertura).click();
  }

  async escreverTipoPagamento(tipoPagamentoECG: string) {
    await this.page.locator('[formcontrolname="tipoPagamentoECG"]').click();
    await this.page.locator(tipoPagamentoECG).click();
  }

  async escreverPagamentoIof(valorPagamentoIof: string) {
    await this.page.locator('[formcontrolname="pagamentoIof"]').click();
    await this.page.locator(valorPagamentoIof).click();
  }

  async clicarCalcular() {
    await this.page.getByText(" Calcular ").click();
    const calculoRequests = Promise.all([
      this.page.waitForResponse(
        (response) =>
          response
            .url()
            .includes("/capital-giro/api/calculations/financed-amount") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/proposals") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);
    await calculoRequests;
  }
}
