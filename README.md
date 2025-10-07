# Amazon Playwright POM Project

This project demonstrates Playwright end-to-end testing for Amazon.in using the Page Object Model (POM) structure in TypeScript.

## Structure
- `pages/` — Page Object classes (HomePage, LoginPage, SearchPage)
- `tests/` — Example Playwright tests

## Getting Started
1. Install dependencies:
   ```sh
   npm install
   ```
2. Set environment variables for your Amazon credentials:
   ```sh
   $env:AMAZON_USER="your_email_or_phone"
   $env:AMAZON_PASS="your_password"
   ```
3. Run the sample test:
   ```sh
   npx playwright test tests/amazon-pom.spec.ts --headed
   ```

## Notes
- Do not use real credentials for production accounts.
- Update or extend page objects and tests as needed for your scenarios.
