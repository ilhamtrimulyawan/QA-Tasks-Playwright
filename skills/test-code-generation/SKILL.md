---
name: test-code-generation
description: "Generate Playwright automation test code following project POM patterns. Use when: writing Playwright tests, creating page objects, building test specs, automating test scenarios, converting test cases to code."
argument-hint: "Describe the test scenario or provide test case details to generate automation code"
---

# Playwright Test Code Generation

## Resources

- [Page Object Example](./references/page-object-example.md) — Real `ApprovalPage` class showing full POM pattern
- [Test Spec Example](./references/test-spec-example.md) — Real `TransactionApproval` and `UsersInvitation` specs
- [Framework Files](./references/framework-files.md) — hook.ts, setup.ts, enum.ts, pageInitializer.ts, basic.ts, accessUrl.ts, ssoLogin.page.ts

## When to Use

- Generate Playwright test automation code from test cases or scenarios
- Create new Page Object Model (POM) classes for new features
- Write test spec files following project conventions
- Convert manual test cases into automated Playwright tests

## Project Architecture

```
pages/              → Page Object classes (*.page.ts)
tests/              → Test spec files (*.spec.ts)
helper/             → Utility functions (pageInitializer, basic helpers, accessUrl)
lib/                → Framework hooks, setup, enums (hook.ts, setup.ts, enum.ts)
credentials/        → User credentials per environment (user.json)
data/               → Test data files (testData.json)
assets/             → Test assets (CSV files, images)
```

## Code Conventions

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Page Object | `camelCase.page.ts` | `submitTransaction.page.ts` |
| Test Spec | `PascalCase.spec.ts` | `TransactionSubmit.spec.ts` |
| Helper | `camelCase.ts` | `pageInitializer.ts` |

### Imports

```typescript
// Test files always import from these:
import { expect, test } from '../lib/hook';
import { PageInitializer } from '../helper/pageInitializer';
import { setup } from '../lib/setup';

// Import specific page objects when not in PageInitializer:
import { SpecificPage } from '../pages/specific.page';
```

## Page Object Pattern

### Class Structure

```typescript
import { type Locator, type Page, expect } from '@playwright/test';
import { setup } from '../lib/setup';

export class FeaturePage {
  // Public locator properties — grouped by UI section
  public elementName: Locator;
  public anotherElement: Locator;

  constructor(public page: Page) {
    // Initialize all locators in constructor
    this.elementName = page.locator('selector');
    this.anotherElement = page.getByRole('button', { name: 'Label' });
  }

  // Methods perform actions or verifications
  async methodName(): Promise<void> {
    // implementation
  }
}
```

### Locator Strategy Priority

Use locators in this priority order:

1. **Role-based** (preferred for interactive elements):
   ```typescript
   this.button = page.getByRole('button', { name: 'Submit' });
   this.link = page.getByRole('link', { name: 'Dashboard' });
   ```

2. **CSS selectors** (simple, unique elements):
   ```typescript
   this.emailField = page.locator(".form-group > input[type='email']");
   this.fileInput = page.locator('input[type="file"]');
   ```

3. **XPath** (complex UI, dynamic structures):
   ```typescript
   this.filter = page.locator(`xpath=//input[contains(@id, 'mp-input-') and @value='All status']`);
   ```

4. **Text-based** (labels, headings):
   ```typescript
   this.menuItem = page.locator('text=Approve transaction').first();
   ```

### Method Naming Conventions

| Action | Prefix | Example |
|--------|--------|---------|
| Navigate | `navigateTo`, `goto` | `navigateToApprovals()` |
| Click | `click` | `clickApproveButton()` |
| Fill input | `fill`, `enter` | `fillEmail(email: string)` |
| Select option | `select` | `selectStatusFilter(status: string)` |
| Verify/Assert | `verify`, `assert`, `check` | `verifySuccessMessage()` |
| Get data | `get` | `getFirstTransactionStatus()` |
| Wait | `waitFor` | `waitForPageLoad()` |
| Update | `update` | `updateTransactionDetails()` |

### Method Return Types

- `Promise<void>` — Actions (clicks, fills, navigations)
- `Promise<boolean>` — Existence checks
- `Promise<string>` — Data retrieval
- `Promise<number>` — Counts

### Wait Strategies

```typescript
// Network idle — for page loads with API calls
await this.page.waitForLoadState('networkidle');

// Element visible — explicit wait
await this.element.waitFor({ state: 'visible', timeout: 5000 });

// Fixed timeout — UI animations only (avoid when possible)
await this.page.waitForTimeout(1000);
```

## Test Spec Pattern

### Structure

```typescript
import { expect, test } from '../lib/hook';
import { PageInitializer } from '../helper/pageInitializer';
import { setup } from '../lib/setup';
import { FeaturePage } from '../pages/feature.page';

test.describe('Feature Name', () => {
  let featurePage: FeaturePage;

  test.beforeEach(async ({ page }) => {
    // 1. Initialize page objects
    const { ssoLoginPage } = PageInitializer(page);
    featurePage = new FeaturePage(page);

    // 2. Login
    await page.goto(setup.baseUrl);
    await ssoLoginPage.userLoginAs({ userKey: 'super-admin1', isValid: true });
  });

  test('TC-001-feature description', async ({ page }) => {
    // Arrange
    await featurePage.navigateToFeature();

    // Act
    await featurePage.performAction();

    // Assert
    await featurePage.verifyExpectedState();
  });
});
```

### Test ID Convention

Test titles follow: `TC-<ID>-<short-kebab-description>`

```typescript
test('TC-001-submit-single-transaction', async ({ page }) => { ... });
test('TC-002-reject-transaction-with-reason', async ({ page }) => { ... });
```

### Authentication

Always use `SsoLoginPage.userLoginAs()`:

```typescript
// Valid login
await ssoLoginPage.userLoginAs({ userKey: 'super-admin1', isValid: true });

// Invalid login (negative test)
await ssoLoginPage.userLoginAs({ userKey: 'user1', isValid: false });
```

Available user keys are defined in `credentials/user.json`:
- `super-admin1` — Admin role
- `user1` — Regular user role

### Assertion Patterns

```typescript
// Visibility
await expect(element).toBeVisible({ timeout: 5000 });
await expect(element).toBeHidden();

// Text
await expect(element).toHaveText('Exact text');
await expect(element).toContainText('Partial');

// Count
await expect(element).toHaveCount(5);

// URL
await expect(page).toHaveURL(/.*expected-path/);

// Input value
await expect(element).toHaveValue('expected');
```

### Error Handling in Tests

```typescript
// Try-catch for optional/conditional elements
try {
  await featurePage.verifyOptionalElement();
} catch {
  // Fallback verification
  await expect(page.locator('...fallback')).toBeVisible();
}
```

## PageInitializer Registration

When creating a new page object, register it in `helper/pageInitializer.ts`:

```typescript
import { FeaturePage } from '../pages/feature.page';

export function PageInitializer(page: Page) {
  const featurePage = new FeaturePage(page);
  // ... other existing page objects
  return { featurePage, /* ...existing */ };
}
```

## Procedure: Creating a New Test

### Step 1: Create Page Object

Refer to [Page Object Example](./references/page-object-example.md) for the full real pattern.

1. Create `pages/<featureName>.page.ts`
2. Define class with locators in constructor
3. Add action and verification methods
4. Follow locator strategy priority and naming conventions above

### Step 2: Register in PageInitializer

Refer to [Framework Files](./references/framework-files.md) for current PageInitializer source.

1. Import the new page class in `helper/pageInitializer.ts`
2. Instantiate and add to the return object

### Step 3: Create Test Spec

Refer to [Test Spec Example](./references/test-spec-example.md) for real test patterns.

1. Create `tests/<FeatureName>.spec.ts`
2. Import from `../lib/hook`, `../helper/pageInitializer`, `../lib/setup`
3. Use `test.describe` block with `test.beforeEach` for login
4. Write tests using Arrange/Act/Assert pattern
5. Use `TC-<ID>-<description>` naming for test titles

### Step 4: Add Test Data (if needed)

- User credentials → `credentials/user.json`
- Static test data → `data/testData.json`
- File uploads → `assets/`

## Rules

1. **Never hardcode URLs** — always use `setup.baseUrl` or `setup.ssoUrl`
2. **Never hardcode credentials** — use `credentials/user.json` via `SsoLoginPage`
3. **All locators in constructor** — never define locators inside methods
4. **Public locator properties** — use `public` modifier for all locators
5. **Constructor receives `Page`** — use `constructor(public page: Page)`
6. **Async all methods** — every page method returns a Promise
7. **Prefer `networkidle`** over arbitrary `waitForTimeout` for page loads
8. **One `test.describe` per spec file** — maps to one feature
9. **Independent tests** — each test must work in isolation (login in `beforeEach`)
10. **Use `expect` from `../lib/hook`** — not from `@playwright/test` directly in specs
