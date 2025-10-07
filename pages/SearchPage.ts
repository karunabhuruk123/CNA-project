import { Page } from '@playwright/test';

export class SearchPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getResultsText() {
    return this.page.textContent('span.a-color-state, span.a-color-base');
  }
}
