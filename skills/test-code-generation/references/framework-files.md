# Framework Files Reference

Real source code of the framework infrastructure. Use these as-is when generating new code.

## `lib/hook.ts` — Custom Test Fixture

```typescript
import { test as base } from "@playwright/test";
import * as basicHelpers from '../helper/basic';
import * as baseValue from './setup';

export const test = base.extend<{ testHook: void, basicHelpers: typeof basicHelpers, baseValue: typeof baseValue }>({
  testHook: [
    async ({ page }, use, testInfo) => {
      // BEFORE HOOK
      await use();
      // AFTER HOOK
      if (testInfo.status !== testInfo.expectedStatus) {
        const screenshotPath = testInfo.outputPath(`failure.png`);
        testInfo.attachments.push({ name: 'screenshot', path: screenshotPath, contentType: 'image/png' });
        await page.screenshot({ path: screenshotPath, timeout: 5000 });
      }
      const title = testInfo.title
      const cases = title.split('-')[0].split(',')
      for (const id of cases) {
        const result = { case_id: id, status: testInfo.status }
        console.log(result)
      }
      await page.close()
    },
    { auto: true },
  ],
  basicHelpers: async ({}, use) => { await use(basicHelpers); },
  baseValue: async ({}, use) => { await use(baseValue); }
});

export { expect } from "@playwright/test";
```

**Key points:**
- Auto-screenshot on failure (attached to test report)
- Test title parsing: IDs before first `-`, comma-separated
- Page auto-close after each test
- Re-exports `expect` from `@playwright/test`

## `lib/setup.ts` — Environment Configuration

```typescript
const env = process.env.ENV;
const baseUrl = process.env.BASE_URL;
const ssoUrl = process.env.SSO_URL;

export const setup = { env, baseUrl, ssoUrl }
```

**Usage:** `setup.baseUrl`, `setup.env`, `setup.ssoUrl`

## `lib/enum.ts` — Element Condition Enums

```typescript
export enum ElementCondition {
  visible, textEqual, textContains, inputEqual,
  arrayLength, disable, hidden, haveAttribute, countEqual
}

export enum ElementState {
  visible, hidden
}
```

## `helper/pageInitializer.ts` — Page Object Factory

```typescript
import { TransactionPage } from "../pages/transaction.page"
import { SsoLoginPage } from "../pages/ssoLogin.page"
import { Page } from '@playwright/test';
import { UsersPage } from "../pages/users.page";
import { BalancePage } from "../pages/balance.page";

export function PageInitializer(page: Page) {
  const ssoLoginPage = new SsoLoginPage(page)
  const transactionPage = new TransactionPage(page)
  const usersPage = new UsersPage(page)
  const balancePage = new BalancePage(page)
  return { ssoLoginPage, transactionPage, usersPage, balancePage }
}
```

**When adding a new page:** Import the class, instantiate it, add to the return object.

## `helper/basic.ts` — Utility Functions

```typescript
import { ElementCondition, ElementState } from '../lib/enum';
import { Locator } from '@playwright/test';
import { expect } from '../lib/hook';

// HTTP request helper
export const sendRequest = async (request: any, method: string, url: string, header: any = null, body: any = null) => {
  // Supports GET, POST, PATCH, PUT
};

// Multipart form data request
export const sendMultipartRequest = async (request: any, method: string, url: string, header: any = null, body: any = null) => {
  // Supports GET, POST with multipart
};

// Generic element wait
export const waitForElement = async (element: Locator, states: keyof typeof ElementState = 'visible', timeout: number = 30000) => {
  await element.waitFor({ state: states, timeout })
}

// Generic assertion helper
export const assertElement = async (element: Locator, condition: keyof typeof ElementCondition, text: string | null = null, value: string | null = null, timeout: number = 3000) => {
  // Supports: visible, hidden, textEqual, textContains, inputEqual, countEqual, etc.
}
```

## `helper/accessUrl.ts` — URL Navigation

```typescript
import { type Page } from "@playwright/test";
import { setup } from "../lib/setup";

export const accessUrl = async (page: Page, url: string): Promise<void> => {
  switch (url) {
    case "account":     await page.goto(`${setup.baseUrl}/accounts`); break;
    case "transaction":  await page.goto(`${setup.baseUrl}/transactions`); break;
    case "balance":      await page.goto(`${setup.baseUrl}/balance`); break;
    case "approvals":    await page.goto(`${setup.baseUrl}/approval/reimbursement-cash-advance`); break;
    case "users":        await page.goto(`${setup.baseUrl}/employees`); break;
    case "cards":        await page.goto(`${setup.baseUrl}/cards`); break;
    case "workflow":     await page.goto(`${setup.baseUrl}/workflow/company-wide/reimbursement`); break;
    // ... more routes
    default: throw new Error(`Unknown URL key: ${url}`);
  }
}
```

## `pages/ssoLogin.page.ts` — Authentication Page Object

```typescript
import { type Page, type Locator } from "@playwright/test";
import { setup } from "../lib/setup";
import User from "../credentials/user.json";

interface UserLoginParams {
  userKey: string;
  isValid: boolean;
}

export class SsoLoginPage {
  public fieldEmail: Locator;
  public fieldPassword: Locator;
  public buttonLogin: Locator;
  public alertErrorMessage: Locator;

  constructor(public page: Page) {
    this.fieldEmail = page.locator(".form-group > input[type='email']");
    this.fieldPassword = page.locator(".form-group > input[type='password']");
    this.buttonLogin = page.locator("#new-signin-button");
    this.alertErrorMessage = page.locator("#alert-danger-be");
  }

  async userLoginAs({ userKey, isValid }: UserLoginParams): Promise<void> {
    const email = User[userKey][setup.env]['email']
    const password = User[userKey][setup.env]['password']
    await this.page.context().clearCookies();
    await this.page.goto(`${setup.baseUrl}`)
    // ... fill credentials and submit
  }
}
```

**Login usage in tests:**
```typescript
await ssoLoginPage.userLoginAs({ userKey: 'super-admin1', isValid: true });
```

## `credentials/user.json` — User Credentials

```json
{
  "super-admin1": {
    "staging": { "email": "automation.admin@yopmail.com", "password": "Password@123" },
    "production": { "email": "", "password": "" }
  },
  "user1": {
    "staging": { "email": "automation.user@yopmail.com", "password": "Password@123" },
    "production": { "email": "", "password": "" }
  }
}
```

**To add a new user:** Add a new key with `staging` and `production` sub-objects.
