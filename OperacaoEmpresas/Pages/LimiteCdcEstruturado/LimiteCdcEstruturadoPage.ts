import { Page } from "@playwright/test";

export class LimiteCdcEstruturadoPages {
  constructor(public readonly page: Page) {}

  escreverCNPJ(cnpj: string) {
    return this.page
      .locator('[ng-reflect-placeholder="CNPJ"]')
      .first()
      .fill(cnpj);
  }
}
