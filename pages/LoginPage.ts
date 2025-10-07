import { Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://www.amazon.in/ap/signin');
  }

  async login(username: string, password: string) {
    await this.page.fill('input[name="email"]', username);
    await this.page.click('input#continue');
    await this.page.fill('input[name="password"]', password);
    await this.page.click('input#signInSubmit');
    await this.page.waitForLoadState('networkidle');
  }
}
