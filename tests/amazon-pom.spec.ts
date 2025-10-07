import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SearchPage } from '../pages/SearchPage';

test('Amazon POM: Login and search', async ({ page }) => {
  const home = new HomePage(page);
  const login = new LoginPage(page);
  const searchPage = new SearchPage(page);

  // Login
  await login.goto();
  await login.login(process.env.AMAZON_USER || '', process.env.AMAZON_PASS || '');
  await expect(page).toHaveURL(/amazon.in/);

  // Search
  await home.goto();
  await home.search('Deals inspired by your recent history');
  const resultsText = await searchPage.getResultsText();
  expect(resultsText).toContain('Deals inspired by your recent history');
});
