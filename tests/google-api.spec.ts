import { test, expect } from '@playwright/test';

// Simple API test for google.com

test('GET request to google.com', async ({ request }) => {
  const response = await request.get('https://www.google.com');
  console.log('Status:', response.status());
  console.log('Headers:', response.headers());
  expect(response.status()).toBe(200);
  // Optionally, check for a header
  expect(response.headers()).toHaveProperty('content-type');
});
