import { Page } from "@playwright/test";
import { AntecipacaoRecebiveisPage } from "../AntecipacaoRecebiveis/AntecipacaoRecebiveisPage";
import { CapitalGiroPage } from "../CapitalGiro/CapitalGiroPage";
import { ArFicPage } from "../ArFic/ArFicPage";
import { CdcFicPages } from "../CdcFic/CdcFicPage";
import { LimiteCdcEstruturadoPages } from "../LimiteCdcEstruturado/LimiteCdcEstruturadoPage";

export class HomePage {
  constructor(public readonly page: Page) {}

  /**
   * @async Entra na tela inicial do sistema Omni Empresas
   */
  async enterHomePage(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForLoadState();
  }

  clicarNovaProposta() {
    return this.page.click("css=button >> text=Nova");
  }

  async entrarAntecipacaoRecebiveis() {
    await this.clicarNovaProposta();
    await this.page
      .locator('[ng-reflect-router-link="/antecipacao-recebiveis"]')
      .click();

    const antecipacaoRecebiveisResponses = Promise.all([
      this.page.waitForResponse(
        (response) =>
          response
            .url()
            .includes("/antecipacao-recebiveis/api/document-types") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/geral/api/segmentos") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await antecipacaoRecebiveisResponses;
    await this.page.waitForLoadState();

    return new AntecipacaoRecebiveisPage(this.page);
  }

  async entrarCapitalGiro() {
    await this.clicarNovaProposta();
    await this.page.locator('[ng-reflect-router-link="/capital-giro"]').click();

    const capitalGiroResponses = Promise.all([
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
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/financeiro/api/banco") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await capitalGiroResponses;
    await this.page.waitForLoadState();

    return new CapitalGiroPage(this.page);
  }

  async entrarArFic() {
    await this.clicarNovaProposta();
    await this.page
      .locator('[ng-reflect-router-link="/antecipacao-recebiveis"]')
      .click();

    const arficResponses = Promise.all([
      this.page.waitForResponse(
        (response) =>
          response
            .url()
            .includes("/antecipacao-recebiveis/api/document-types") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/geral/api/segmentos") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await arficResponses;
    await this.page.waitForLoadState();

    return new ArFicPage(this.page);
  }

  async entrarCdcFic() {
    await this.clicarNovaProposta();
    await this.page.locator('[ng-reflect-router-link="/cdc-loja"]').click();

    const cdcficResponses = Promise.all([
      this.page.waitForResponse(
        (response) =>
          response
            .url()
            .includes("/limite-cdc-estruturado/api/document-types") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/geral/api/segmentos") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await cdcficResponses;
    await this.page.waitForLoadState();

    return new CdcFicPages(this.page);
  }

  async entrarLimiteCdcEstruturado() {
    await this.clicarNovaProposta();
    await this.page.locator('[ng-reflect-router-link="/cdc-loja"]').click();

    const limitecdcestruturadoResponses = Promise.all([
      this.page.waitForResponse(
        (response) =>
          response
            .url()
            .includes("/limite-cdc-estruturado/api/document-types") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/geral/api/segmentos") &&
          response.status() === 200,
        { timeout: 60_000 }
      ),
    ]);

    await limitecdcestruturadoResponses;
    await this.page.waitForLoadState();

    return new LimiteCdcEstruturadoPages(this.page);
  }
}
