# Test Spec Example: TransactionApproval

This is a real test spec from the project. Use it as the reference pattern for generating new test specs.

## Source: `tests/TransactionApproval.spec.ts`

```typescript
import { expect, test } from '../lib/hook';
import { PageInitializer } from '../helper/pageInitializer';
import { setup } from '../lib/setup';
import { ApprovalPage } from '../pages/approval.page';

test.describe('Transaction Approval functionality', () => {
  let ssoLoginPage;
  let approvalPage: ApprovalPage;

  test.beforeEach(async ({ page }) => {
    ({ ssoLoginPage } = PageInitializer(page));
    approvalPage = new ApprovalPage(page);

    // Login with admin user who has approval permissions
    await page.goto(setup.baseUrl);
    await ssoLoginPage.userLoginAs({ userKey: 'super-admin1', isValid: true });
    await expect(page).toHaveURL(setup.baseUrl);
  });

  test('438105,438107,438110,438111-admin can approve awaiting approval', async () => {
    await approvalPage.navigateToApprovals();
    await approvalPage.filterByYear();
    await approvalPage.filterByAwaitingApproval();
    await approvalPage.clickActionsForFirstTransaction();
    await approvalPage.clickApproveTransaction();
    await approvalPage.verifyConfirmationDialog();
    await approvalPage.clickCancelInConfirmation();
    await approvalPage.clickActionsForFirstTransaction();
    await approvalPage.clickApproveTransaction();
    await approvalPage.verifyConfirmationDialog();
    await approvalPage.clickApproveInConfirmation();
    await approvalPage.verifyApprovalSuccess();
  });

  test('438116,438117,438125,438126-admin can approve awaiting approval from details', async () => {
    await approvalPage.navigateToApprovals();
    await approvalPage.filterByYear();
    await approvalPage.filterByAwaitingApproval();
    await approvalPage.clickActionsForFirstTransaction();
    await approvalPage.clickViewDetailsForFirstTransaction();
    await approvalPage.verifyTransactionDetailsPage();
    await approvalPage.clickApproveInDetails();
    await approvalPage.verifyConfirmationDialog();
    await approvalPage.clickApproveInConfirmation();
    await approvalPage.verifyApprovalSuccess();
  });

  test('438106-user able to filter approvals by month', async ({ page }) => {
    await approvalPage.navigateToApprovals();
    await approvalPage.filterByMonth();
    await approvalPage.waitForPageLoad();
    await expect(page.locator('//table')).toBeVisible();
  });

  test('438108-user able to filter approvals by status approved', async () => {
    await approvalPage.navigateToApprovals();
    await approvalPage.filterByYear();
    await approvalPage.filterByApproved();
    await approvalPage.waitForPageLoad();
    const status = await approvalPage.getFirstTransactionStatus();
    expect(status.toLowerCase()).toContain('approved');
  });

  test('438112,438115-user able to reject from actions dropdown and cancel', async () => {
    await approvalPage.navigateToApprovals();
    await approvalPage.filterByYear();
    await approvalPage.filterByAwaitingApproval();
    await approvalPage.clickActionsForFirstTransaction();
    await approvalPage.clickRejectTransaction();
    await approvalPage.verifyRejectDialog();
    // ... continue with cancel and reject flows
  });
});
```

## Source: `tests/UsersInvitation.spec.ts`

```typescript
import { expect, test } from '../lib/hook';
import { PageInitializer } from '../helper/pageInitializer';
import { setup } from '../lib/setup';

test.describe('Users: invite, search, and filter', () => {
  let ssoLoginPage, usersPage;

  test.beforeEach(async ({ page }) => {
    ({ ssoLoginPage, usersPage } = PageInitializer(page));
    await ssoLoginPage.userLoginAs({ userKey: 'super-admin1', isValid: true });
    await expect(page).toHaveURL(setup.baseUrl);
    await usersPage.gotoUsers();
  });

  test('427368,441371-invite user and admin', async () => {
    const adminEmail = await usersPage.inviteAdmin();
    await usersPage.confirmInvitationSuccess();
    await usersPage.ConfirmationUserIndex(adminEmail, "Admin");

    const userEmail = await usersPage.inviteUser();
    await usersPage.confirmInvitationSuccess();
    await usersPage.ConfirmationUserIndex(userEmail, "User");
  });

  test('441372,441373,441374-filter and search invited users by email', async () => {
    const userEmail = await usersPage.inviteUser();
    await usersPage.confirmInvitationSuccess();
    await usersPage.filterbyRole();
    await usersPage.filterbyStatus();
    await usersPage.searchByEmail(userEmail);
    await usersPage.ConfirmationUserIndex(userEmail, "User");
    await usersPage.clearSearch();
    await usersPage.rowsPerPage.isVisible();
  });
});
```

## Key Patterns to Follow

1. **Imports**: Always import `{ expect, test }` from `'../lib/hook'` (NOT from `@playwright/test`)
2. **PageInitializer**: Use destructuring `({ ssoLoginPage } = PageInitializer(page))`
3. **Direct instantiation**: For pages NOT in PageInitializer, use `new PageName(page)`
4. **beforeEach**: Login + navigate to starting page — every test starts fresh
5. **Test ID format**: `'caseId1,caseId2-descriptive kebab name'` — comma-separated case IDs before hyphen
6. **Page object methods**: All interactions go through page object methods, NOT raw `page.click()` in specs
7. **Assertions in specs**: Use `expect` for final assertions; use page object `verify*` methods for intermediate checks
8. **No `page` parameter needed**: If test only uses page objects, omit `{ page }` from async callback
