import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import fs from 'fs';

test('Login to Amazon.in using environment variables', async ({ page }) => {
  const AMAZON_USER = process.env.AMAZON_USER;
  const AMAZON_PASS = process.env.AMAZON_PASS;

  if (!AMAZON_USER || !AMAZON_PASS) {
    throw new Error('Please set AMAZON_USER and AMAZON_PASS environment variables.');
  }

  await page.goto('https://www.amazon.in/ap/signin?openid.pape.max_auth_age=900&openid.return_to=https%3A%2F%2Fwww.amazon.in%2Fgp%2Fhomepage.html%3F_encoding%3DUTF8%26ref_%3Dnavm_em_signin%26action%3Dsign-out%26path%3D%252Fgp%252Fhomepage.html%253F_encoding%253DUTF8%2526ref_%253Dnavm_em_signin%26signIn%3D1%26useRedirectOnSuccess%3D1%26ref_%3Dnav_em_signout_0_1_1_38&openid.assoc_handle=inflex&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0');

  // Enter email/phone
  await page.fill('input[name="email"]', AMAZON_USER);
  await page.click('input#continue');

  // Enter password
  await page.fill('input[name="password"]', AMAZON_PASS);
  await page.click('input#signInSubmit');

  // Wait for navigation or check for successful login
  await page.waitForLoadState('networkidle');
  expect(page.url()).toContain('amazon.in');


  // Search for 'kids clothing'
  await page.fill('input#twotabsearchtextbox', 'kids clothing');
  await page.click('input#nav-search-submit-button');
  await page.waitForLoadState('networkidle');
  const kidsResultsText = await page.textContent('span.a-color-state, span.a-color-base');
  expect(kidsResultsText?.toLowerCase()).toContain('kids clothing');

  // Click on 'Amazon Pay' in the navigation
  // Try to find the Amazon Pay link by text or aria-label
  const amazonPaySelector = 'a[href*="/amazonpay"], a[aria-label*="Amazon Pay"], a:has-text("Amazon Pay")';
  await page.click(amazonPaySelector);
  await page.waitForLoadState('networkidle');
  // Optionally, check that the Amazon Pay page loaded
  expect(page.url()).toContain('amazon.in/amazonpay');
  await page.waitForTimeout(5000);

  // Go to Watchlist page
  await page.goto('https://www.amazon.in/hz/wishlist/ls');
  await page.waitForLoadState('networkidle');

  // Fetch watchlist items (titles)
  const items = await page.$$eval('div[data-itemid] h2, .g-item-sortable h2', els => els.map(e => e.textContent?.trim() || ''));

  // Prepare data for Excel
  const data = items.map(title => ({ title }));

  // Write to Excel
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Watchlist');
  XLSX.writeFile(wb, 'amazon-watchlist.xlsx');
  expect(fs.existsSync('amazon-watchlist.xlsx')).toBe(true);
});
