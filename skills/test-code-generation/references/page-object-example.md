# Page Object Example: ApprovalPage

This is a real page object from the project. Use it as the reference pattern for generating new page objects.

## Source: `pages/approval.page.ts`

```typescript
import { Page, Locator, expect } from "@playwright/test";

export class ApprovalPage {
  // --- Locator properties: public, grouped by UI section ---

  // Navigation
  public approvalsMenu: Locator;

  // Action elements
  public actionsButton: Locator;
  public approveTransactionAction: Locator;
  public viewDetailsAction: Locator;
  public rejectTransactionAction: Locator;

  // Dialog elements
  public confirmationDialog: Locator;
  public approveButton: Locator;
  public cancelButton: Locator;
  public rejectDialog: Locator;
  public rejectButton: Locator;
  public rejectReasonInput: Locator;

  // Status and feedback
  public successMessage: Locator;
  public errorMessage: Locator;
  public transactionTable: Locator;
  public statusBadge: Locator;

  // Filters
  public statusFilter: Locator;
  public checkboxAllStatus: Locator;
  public checkboxAwaitingApprovalStatus: Locator;
  public checkboxApprovedStatus: Locator;
  public checkboxRejectedStatus: Locator;
  public filterDateApproval: Locator;
  public perYearFilterApproval: Locator;
  public perMonthFilterApproval: Locator;
  public yearFilterApproval: Locator;
  public monthFilterApproval: Locator;
  public yearFilter2025: Locator;

  // Pagination
  public paginationNext: Locator;
  public paginationPrev: Locator;
  public rowsPerPageDropdown: Locator;

  // Modal/Navigation
  public backButton: Locator;
  public closeModalButton: Locator;
  public transactionSummaryModal: Locator;

  constructor(public page: Page) {
    // Navigation - role-based selector
    this.approvalsMenu = page.getByRole('link', { name: 'Approvals' });

    // Actions - XPath for complex UI
    this.actionsButton = page.locator('xpath=//button[contains(normalize-space(.), "Actions")]');
    this.approveTransactionAction = page.locator('text=Approve transaction').first();
    this.viewDetailsAction = page.locator('text=View details').first();
    this.rejectTransactionAction = page.locator('text=Reject transaction').first();

    // Dialogs - mixed selectors
    this.confirmationDialog = page.locator('text=Approve and submit transactions?');
    this.approveButton = page.getByRole('button', { name: 'Approve' }).last();
    this.cancelButton = page.getByRole('button', { name: 'Cancel' }).first();
    this.rejectDialog = page.locator('text=Reject transaction?, text=Reject transaction, text=Reject file').first();
    this.rejectButton = page.getByRole('button', { name: 'Reject' }).last();
    this.rejectReasonInput = page.locator('textarea[placeholder*="reason" i], textarea[name*="reason" i], textarea');

    // Status feedback
    this.successMessage = page.locator('#toast-0tn-label, [role="alert"], .toast');
    this.errorMessage = page.locator('[role="alert"], .toast, .error-message');
    this.transactionTable = page.locator('//table');
    this.statusBadge = page.locator('//span[contains(@class, "mp-badge")]');

    // Filters - XPath for Mekari Pixel components
    this.statusFilter = page.locator(`xpath=//input[contains(@id, 'mp-input-') and @value='All status']`);
    this.checkboxAllStatus = page.locator(`xpath=//label[.//p[normalize-space()='Select all']]`);
    this.checkboxAwaitingApprovalStatus = page.locator(`xpath=//label[.//p[normalize-space()='Awaiting approval']]`);
    this.checkboxApprovedStatus = page.locator(`xpath=//label[.//p[normalize-space()='Approved']]`);
    this.checkboxRejectedStatus = page.locator(`xpath=//label[.//p[normalize-space()='Rejected']]`);
    this.filterDateApproval = page.locator(`xpath=//input[@placeholder='Select period' and contains(@class, 'mp-input__control')]`);
    this.perYearFilterApproval = page.locator(`xpath=//button[@data-pixel-component='MpPopoverListItem']//div[normalize-space()='Per Year']`);
    this.perMonthFilterApproval = page.locator(`xpath=//button[@data-pixel-component='MpPopoverListItem']//div[normalize-space()='Per Month']`);
    this.yearFilterApproval = page.locator(`xpath=//button[contains(@class,'mp-yearItem') and normalize-space()='2026']`);
    this.monthFilterApproval = page.locator(`xpath=//button[contains(@class,'mp-monthItem') and normalize-space()='February 2026']`);
    this.yearFilter2025 = page.locator(`xpath=//button[contains(@class,'mp-yearItem') and normalize-space()='2025']`);

    // Pagination
    this.paginationNext = page.locator('xpath=//button[@aria-label="Next page"]');
    this.paginationPrev = page.locator('xpath=//button[@aria-label="Previous page"]');
    this.rowsPerPageDropdown = page.locator('xpath=//select[contains(@class, "mp-select")]');

    // Navigation
    this.backButton = page.getByRole('button', { name: 'Cancel' });
    this.closeModalButton = page.locator('xpath=//button[@aria-label="Close" or contains(@class, "close")]');
    this.transactionSummaryModal = page.locator('text=Transaction summary');
  }

  // --- Navigation methods ---
  async navigateToApprovals(): Promise<void> {
    await this.approvalsMenu.click();
    await this.page.waitForTimeout(1000);
  }

  // --- Filter methods ---
  async filterByYear(): Promise<void> {
    await this.filterDateApproval.click();
    await expect(this.perYearFilterApproval).toBeVisible();
    await this.perYearFilterApproval.click();
    await this.yearFilterApproval.click();
    await this.page.waitForLoadState('networkidle');
    await this.transactionTable.waitFor({ state: 'visible' });
  }

  async filterByAwaitingApproval(): Promise<void> {
    await this.statusFilter.click();
    await this.page.waitForTimeout(500);
    await expect(this.checkboxAllStatus).toBeVisible({ timeout: 5000 });
    await this.checkboxAllStatus.click();
    await this.page.waitForTimeout(300);
    await this.checkboxAwaitingApprovalStatus.click();
    await this.page.click('body');
    await this.page.waitForTimeout(1000);
  }

  // --- Interaction methods ---
  async clickApproveTransaction(): Promise<void> {
    await this.approveTransactionAction.click();
  }

  async enterRejectReason(reason: string): Promise<void> {
    await this.rejectReasonInput.fill(reason);
  }

  // --- Verification methods ---
  async verifyConfirmationDialog(): Promise<void> {
    await expect(this.confirmationDialog).toBeVisible({ timeout: 5000 });
  }

  async verifyApprovalSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
```

## Key Patterns to Follow

1. **All locators are `public` properties** declared at class level
2. **Constructor receives `public page: Page`** — making page accessible as `this.page`
3. **Locators initialized in constructor only** — never inside methods
4. **Group locators by UI section** with comments
5. **Methods are `async` returning `Promise<type>`**
6. **Method names use verb prefixes**: navigate, filter, click, enter, verify, waitFor
7. **Use `expect` from `@playwright/test`** inside page objects for assertions
8. **Use `waitForLoadState('networkidle')` after navigations** that trigger API calls
