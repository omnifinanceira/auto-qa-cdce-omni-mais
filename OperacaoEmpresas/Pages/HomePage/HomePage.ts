import { Page } from "@playwright/test";
import { CancelaPropostaPage } from "../CdcOmniMais/CancelaPropostaPage";

export class HomePage {
  constructor(public readonly page: Page) {}

  /**
   * @async Entra na tela inicial do sistema Omni Empresas
   */
  async enterHomePage(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForLoadState();
  }
}

async cancelaProposta() {
    await this.clicarCdcEstruturado();
    await this.page.getByText(" CDC Estruturado ").click();

    const cancelaPropostaResponses = Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/capital-giro/api/document-types") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/financeiro/api/banco") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await cancelaPropostaResponses;
    await this.page.waitForLoadState();

    return new CancelaPropostaPage(this.page);
  
}