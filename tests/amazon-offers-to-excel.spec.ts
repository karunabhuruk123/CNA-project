import { test, expect, Page } from '@playwright/test';
import * as XLSX from 'xlsx';
import fs from 'fs';

test('Scrape Amazon deals and export to Excel', async ({ page }) => {
  // Go to Amazon deals page
  let success = false;
  let offers: { title: string; price?: string }[] = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto('https://www.amazon.in/gp/goldbox', { timeout: 60000 });
      try {
        await page.waitForLoadState('networkidle', { timeout: 60000 });
      } catch (e) {
        console.warn('Page did not reach networkidle state in 60s, continuing...');
      }
      await page.waitForSelector('div[data-testid="grid-deals-container"]', { timeout: 60000 });
      offers = await page.$$eval(
        'div[data-testid="grid-deals-container"] .DealContent-module__truncate_sWbxETx42ZPStTc9jwySW',
        (nodes: Element[]) =>
          nodes.slice(0, 20).map(node => ({
            title: (node.textContent || '').trim(),
          }))
      );
      const prices = await page.$$eval(
        'div[data-testid="grid-deals-container"] .a-price-whole',
        (nodes: Element[]) => nodes.slice(0, 20).map(node => (node.textContent || '').trim())
      );
      for (let i = 0; i < offers.length; i++) {
        (offers[i] as { price?: string }).price = prices[i] || '';
      }
      success = true;
      break;
    } catch (err) {
      console.warn(`Attempt ${attempt}: Error occurred - ${err}`);
      if (attempt < 3) {
        await new Promise(res => setTimeout(res, 5000));
      }
    }
  }
  if (!success) {
    throw new Error('Failed to scrape Amazon deals after 3 attempts. The page may have been closed or blocked.');
  }

  const ws = XLSX.utils.json_to_sheet(offers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'AmazonDeals');
  XLSX.writeFile(wb, 'amazon-offers.xlsx');
  expect(fs.existsSync('amazon-offers.xlsx')).toBe(true);
}, 120000); // Set test timeout to 2 minutes
