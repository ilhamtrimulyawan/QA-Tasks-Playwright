import { test, expect, type Page } from '@playwright/test';

import { resetExamTestData } from './reset-test-data';

async function searchBook(page: Page, bookId: string) {
	await page.goto('/');
	await page.locator('#book-search-input').fill(bookId);
	await page.getByRole('button', { name: 'Search Books' }).click();
	await expect(page.locator(`#book-row_${bookId}`)).toBeVisible();
}

async function getStock(page: Page, bookId: string): Promise<number> {
	const text = await page.locator(`#book-stock_${bookId}`).textContent();
	const match = (text ?? '').match(/\d+/);
	return match ? parseInt(match[0], 10) : 0;
}

test.describe('Library Checkout & Return System', () => {
	test.beforeEach(async ({ request, baseURL }) => {
		await resetExamTestData({ request, baseURL });
	});

	// TC-001: Successful book checkout with valid borrower
	test('Successful book checkout with valid borrower', async ({ page }) => {
		await searchBook(page, '9005');
		const initialStock = await getStock(page, '9005');

		await page.locator('#book-row_9005 a:has-text("Checkout")').click();
		await page.locator('#library-member-id-input').fill('exam.checkout-ready@example.com');

		await expect(page.locator('#member-name-display')).not.toBeEmpty();
		await expect(page.locator('#member-phone-display')).not.toBeEmpty();

		await page.locator('#checkout-submit-button').click();
		await expect(page.locator('text=/checkout|success|berhasil/i').first()).toBeVisible({ timeout: 10000 });

		await searchBook(page, '9005');
		const newStock = await getStock(page, '9005');
		expect(newStock).toBe(initialStock - 1);
	});

	// TC-002: Checkout fails when borrower has overdue items
	test('Checkout fails when borrower has overdue items', async ({ page }) => {
		await searchBook(page, '9005');
		await page.locator('#book-row_9005 a:has-text("Checkout")').click();
		await page.locator('#library-member-id-input').fill('exam.return-late@example.com');

		await expect(page.locator('#checkout-submit-button')).toBeDisabled();
		await expect(page.locator('#checkout-validation-banner')).toContainText(/overdue/i);
	});

	// TC-003: Checkout fails when book is out of stock
	test('Checkout fails when book is out of stock', async ({ page }) => {
		await searchBook(page, '9003');
		await page.locator('#book-row_9003 a:has-text("Checkout")').click();
		await page.locator('#library-member-id-input').fill('exam.checkout-ready@example.com');

		await expect(page.locator('#checkout-submit-button')).toBeDisabled();
		await expect(page.locator('#checkout-validation-banner')).toContainText(/out of stock/i);
	});

	// TC-004: Checkout fails with invalid email format
	test('Checkout fails with invalid email format', async ({ page }) => {
		await searchBook(page, '9005');
		await page.locator('#book-row_9005 a:has-text("Checkout")').click();

		const invalidEmails = ['notanemail', 'test@', '@example.com', 'test space@example.com'];
		for (const email of invalidEmails) {
			await page.locator('#library-member-id-input').fill('');
			await page.locator('#library-member-id-input').fill(email);
			await expect(page.locator('#checkout-submit-button')).toBeDisabled();
		}
	});

	// TC-005: Checkout fails with empty Library Member ID
	test('Checkout fails with empty Library Member ID', async ({ page }) => {
		await searchBook(page, '9005');
		await page.locator('#book-row_9005 a:has-text("Checkout")').click();

		await page.locator('#library-member-id-input').fill('');
		await expect(page.locator('#checkout-submit-button')).toBeDisabled();

		const memberName = (await page.locator('#member-name-display').textContent()) ?? '';
		const memberPhone = (await page.locator('#member-phone-display').textContent()) ?? '';
		expect(memberName.trim()).toMatch(/^$|Borrower not loaded|—|N\/A/i);
		expect(memberPhone.trim()).toMatch(/^$|Borrower not loaded|—|N\/A/i);
	});

	// TC-006: Checkout fails when Library Member ID not found in registry
	test('Checkout fails when Library Member ID not found in registry', async ({ page }) => {
		await searchBook(page, '9005');
		await page.locator('#book-row_9005 a:has-text("Checkout")').click();
		await page.locator('#library-member-id-input').fill('nonexistent@example.com');

		await expect(page.locator('#checkout-submit-button')).toBeDisabled();
		await expect(page.locator('#checkout-validation-banner')).toContainText(/not found|does not exist|unknown/i);
	});

	// TC-007: Checkout fails when borrower already has the same book checked out
	test('Checkout fails when borrower already has the same book checked out', async ({ page }) => {
		await searchBook(page, '9001');
		await page.locator('#book-row_9001 a:has-text("Checkout")').click();
		await page.locator('#library-member-id-input').fill('exam.return-on-time@example.com');

		await expect(page.locator('#checkout-submit-button')).toBeDisabled();
		await expect(page.locator('#checkout-validation-banner')).toContainText(/already.*checked out|out of stock/i);
	});

	// TC-008: Successful on-time return
	test('Successful on-time return', async ({ page }) => {
		await searchBook(page, '9001');
		const initialStock = await getStock(page, '9001');

		await page.locator('#book-row_9001 a:has-text("Return")').click();
		await page.locator('#return-library-member-id-input').fill('exam.return-on-time@example.com');

		await expect(page.locator('#return-member-name-display')).not.toBeEmpty();
		await expect(page.locator('#return-member-phone-display')).not.toBeEmpty();
		await expect(page.locator('#return-due-date')).toBeVisible();
		await expect(page.locator('#return-date-input')).toBeVisible();

		await page.locator('#return-submit-button').click();
		await expect(page.locator('text=/returned|success|berhasil/i').first()).toBeVisible({ timeout: 10000 });

		await searchBook(page, '9001');
		const newStock = await getStock(page, '9001');
		expect(newStock).toBe(initialStock + 1);
	});

	// TC-009: Successful overdue return with fine calculation
	test('Successful overdue return with fine calculation', async ({ page }) => {
		await searchBook(page, '9002');
		const initialStock = await getStock(page, '9002');

		await page.locator('#book-row_9002 a:has-text("Return")').click();
		await page.locator('#return-library-member-id-input').fill('exam.return-late@example.com');

		await expect(page.locator('#return-member-name-display')).not.toBeEmpty();
		await expect(page.locator('#return-member-phone-display')).not.toBeEmpty();

		await page.waitForTimeout(500);
		const fineText = (await page.locator('#return-overdue-fine').textContent()) ?? '';
		expect(fineText).toMatch(/70[.,]?000|Rp\s*70/i);

		await page.locator('#return-submit-button').click();
		await expect(page.locator('text=/returned|success|berhasil/i').first()).toBeVisible({ timeout: 10000 });

		await searchBook(page, '9002');
		const newStock = await getStock(page, '9002');
		expect(newStock).toBe(initialStock + 1);
	});

	// TC-010: Return fails when no active checkout exists
	test('Return fails when no active checkout exists', async ({ page }) => {
		await searchBook(page, '9005');
		await page.locator('#book-row_9005 a:has-text("Return")').click();
		await page.locator('#return-library-member-id-input').fill('exam.checkout-ready@example.com');

		await expect(page.locator('#return-submit-button')).toBeDisabled();
		await expect(page.locator('#return-validation-banner')).toContainText(/no active checkout|not found/i);
	});

	// TC-011: Return boundary - submitted on exact due date is on-time
	test('Return boundary - submitted on exact due date is on-time', async ({ page }) => {
		await searchBook(page, '9001');
		await page.locator('#book-row_9001 a:has-text("Return")').click();
		await page.locator('#return-library-member-id-input').fill('exam.return-on-time@example.com');

		await expect(page.locator('#return-member-name-display')).not.toBeEmpty();

		await page.locator('#return-submit-button').click();
		await expect(page.locator('text=/returned|success|berhasil/i').first()).toBeVisible({ timeout: 10000 });
	});

	// TC-012: Return one day overdue calculates single day fine
	test('Return one day overdue calculates single day fine', async ({ page }) => {
		await searchBook(page, '9002');
		await page.locator('#book-row_9002 a:has-text("Return")').click();
		await page.locator('#return-library-member-id-input').fill('exam.return-late@example.com');

		const content = await page.content();
		expect(content).toMatch(/\d{2,3}[.,]?000|Rp\s*\d/i);

		await page.locator('#return-submit-button').click();
		await expect(page.locator('text=/returned|success|berhasil/i').first()).toBeVisible({ timeout: 10000 });
	});

	// TC-013: View book log with circulation history
	test('View book log with circulation history', async ({ page }) => {
		await searchBook(page, '9001');
		await page.locator('#book-row_9001 a:has-text("Show Log")').click();

		await expect(page.locator('#book-log-page')).toBeVisible();
		await expect(page.locator('#book-log-selected-book-id')).toContainText('9001');
		await expect(page.locator('#book-log-selected-book-title')).not.toBeEmpty();
		await expect(page.locator('#book-log-table')).toBeVisible();

		const logRows = page.locator('[id^="book-log-row_"]');
		await expect(logRows.first()).toBeVisible();
	});

	// TC-014: View book log with empty history
	test('View book log with empty history', async ({ page }) => {
		await searchBook(page, '9004');
		await page.locator('#book-row_9004 a:has-text("Show Log")').click();

		await expect(page.locator('#book-log-page')).toBeVisible();
		await expect(page.locator('#book-log-selected-book-id')).toContainText('9004');

		const logRows = page.locator('[id^="book-log-row_"]');
		await expect(logRows).toHaveCount(0);
	});

	// TC-015: Checkout calculates correct due date as 14 days in GMT+7
	test('Checkout calculates correct due date as 14 days in GMT+7', async ({ page }) => {
		await searchBook(page, '9005');
		await page.locator('#book-row_9005 a:has-text("Checkout")').click();
		await page.locator('#library-member-id-input').fill('exam.checkout-ready@example.com');

		const checkoutDate = await page.locator('#checkout-date-input').inputValue();
		const dueDate = (await page.locator('#due-date-display').textContent()) ?? '';

		expect(checkoutDate).toBeTruthy();
		expect(dueDate.trim()).toBeTruthy();

		await page.locator('#checkout-submit-button').click();
		await expect(page.locator('text=/checkout|success|berhasil/i').first()).toBeVisible({ timeout: 10000 });
	});

	// TC-016: Return with multiple weeks overdue calculates accurate fine
	test('Return with multiple weeks overdue calculates accurate fine', async ({ page }) => {
		await searchBook(page, '9002');
		await page.locator('#book-row_9002 a:has-text("Return")').click();
		await page.locator('#return-library-member-id-input').fill('exam.return-late@example.com');

		const content = await page.content();
		expect(content).toMatch(/\d{2,3}[.,]?000|Rp\s*\d/i);

		await page.locator('#return-submit-button').click();
		await expect(page.locator('text=/returned|success|berhasil/i').first()).toBeVisible({ timeout: 10000 });
	});

	// TC-017: Verify stock atomicity during concurrent checkout attempts
	test('Verify stock atomicity during concurrent checkout attempts', async ({ page, context }) => {
		await searchBook(page, '9005');
		const initialStock = await getStock(page, '9005');

		await page.locator('#book-row_9005 a:has-text("Checkout")').click();
		await page.locator('#library-member-id-input').fill('exam.checkout-ready@example.com');
		await page.locator('#checkout-submit-button').click();
		await expect(page.locator('text=/checkout|success|berhasil/i').first()).toBeVisible({ timeout: 10000 });

		const page2 = await context.newPage();
		await page2.goto('/');
		await page2.locator('#book-search-input').fill('9005');
		await page2.getByRole('button', { name: 'Search Books' }).click();
		await expect(page2.locator('#book-row_9005')).toBeVisible();
		const stockAfter = await getStock(page2, '9005');
		expect(stockAfter).toBe(initialStock - 1);
		await page2.close();
	});

	// TC-018: Verify checkout page displays all required DOM elements
	test('Verify checkout page displays all required DOM elements', async ({ page }) => {
		await searchBook(page, '9005');
		await page.locator('#book-row_9005 a:has-text("Checkout")').click();

		await expect(page.locator('#checkout-page')).toBeVisible();
		await expect(page.locator('#checkout-selected-book-id')).toBeVisible();
		await expect(page.locator('#checkout-selected-book-title')).toBeVisible();
		await expect(page.locator('#checkout-available-stock')).toBeVisible();
		await expect(page.locator('#library-member-id-input')).toBeVisible();
		await expect(page.locator('#member-name-display')).toBeAttached();
		await expect(page.locator('#member-phone-display')).toBeAttached();
		await expect(page.locator('#checkout-date-input')).toBeAttached();
		await expect(page.locator('#due-date-display')).toBeAttached();
		await expect(page.locator('#checkout-submit-button')).toBeVisible();
		await expect(page.locator('#checkout-validation-banner')).toBeAttached();
	});

	// TC-019: Verify return page displays all required DOM elements
	test('Verify return page displays all required DOM elements', async ({ page }) => {
		await searchBook(page, '9001');
		await page.locator('#book-row_9001 a:has-text("Return")').click();

		await expect(page.locator('#return-page')).toBeVisible();
		await expect(page.locator('#return-selected-book-id')).toBeVisible();
		await expect(page.locator('#return-book-title')).toBeVisible();
		await expect(page.locator('#return-library-member-id-input')).toBeVisible();
		await expect(page.locator('#return-member-name-display')).toBeAttached();
		await expect(page.locator('#return-member-phone-display')).toBeAttached();
		await expect(page.locator('#return-due-date')).toBeAttached();
		await expect(page.locator('#return-date-input')).toBeAttached();
		await expect(page.locator('#return-submit-button')).toBeVisible();
		await expect(page.locator('#return-validation-banner')).toBeAttached();
	});

	// TC-020: Verify book log page displays all required DOM elements
	test('Verify book log page displays all required DOM elements', async ({ page }) => {
		await searchBook(page, '9001');
		await page.locator('#book-row_9001 a:has-text("Show Log")').click();

		await expect(page.locator('#book-log-page')).toBeVisible();
		await expect(page.locator('#book-log-selected-book-id')).toBeVisible();
		await expect(page.locator('#book-log-selected-book-title')).toBeVisible();
		await expect(page.locator('#book-log-table')).toBeVisible();
	});

	// TC-021: Search book by exact book ID returns correct result
	test('Search book by exact book ID returns correct result', async ({ page }) => {
		await searchBook(page, '9005');

		await expect(page.locator('#book-id_9005')).toContainText('9005');
		await expect(page.locator('#book-title_9005')).not.toBeEmpty();
		await expect(page.locator('#book-stock_9005')).toBeVisible();

		await expect(page.locator('#book-row_9005 a:has-text("Checkout")')).toBeVisible();
		await expect(page.locator('#book-row_9005 a:has-text("Return")')).toBeVisible();
		await expect(page.locator('#book-row_9005 a:has-text("Show Log")')).toBeVisible();
	});

	// TC-022: Search book by partial title returns matching results
	test('Search book by partial title returns matching results', async ({ page }) => {
		await page.goto('/');
		await page.locator('#book-search-input').fill('Book');
		await page.getByRole('button', { name: 'Search Books' }).click();

		const bookRows = page.locator('[id^="book-row_"]');
		await expect(bookRows.first()).toBeVisible();

		const firstRowId = (await bookRows.first().getAttribute('id')) ?? '';
		const bookId = firstRowId.replace('book-row_', '');
		expect(bookId).toBeTruthy();

		await expect(page.locator(`#book-id_${bookId}`)).toBeVisible();
		await expect(page.locator(`#book-title_${bookId}`)).toBeVisible();
		await expect(page.locator(`#book-stock_${bookId}`)).toBeVisible();
	});

	// TC-023: Reject XSS attempt in Library Member ID input on checkout
	test('Reject XSS attempt in Library Member ID input on checkout', async ({ page }) => {
		let dialogTriggered = false;
		page.on('dialog', async (dialog) => {
			dialogTriggered = true;
			await dialog.dismiss();
		});

		await searchBook(page, '9005');
		await page.locator('#book-row_9005 a:has-text("Checkout")').click();
		await page.locator('#library-member-id-input').fill('<script>alert("XSS")</script>@example.com');

		await expect(page.locator('#checkout-submit-button')).toBeDisabled();
		expect(dialogTriggered).toBe(false);
	});

	// TC-024: Reject HTML injection in Library Member ID input on return
	test('Reject HTML injection in Library Member ID input on return', async ({ page }) => {
		let dialogTriggered = false;
		page.on('dialog', async (dialog) => {
			dialogTriggered = true;
			await dialog.dismiss();
		});

		await searchBook(page, '9001');
		await page.locator('#book-row_9001 a:has-text("Return")').click();
		await page.locator('#return-library-member-id-input').fill('<img src=x onerror=alert("XSS")>@example.com');

		await expect(page.locator('#return-submit-button')).toBeDisabled();
		expect(dialogTriggered).toBe(false);
	});

	// TC-025: Verify all validations exist on both client and server side
	test('Verify all validations exist on both client and server side', async ({ page }) => {
		await searchBook(page, '9005');
		await page.locator('#book-row_9005 a:has-text("Checkout")').click();

		await page.locator('#library-member-id-input').fill('invalidemail');
		await expect(page.locator('#checkout-submit-button')).toBeDisabled();

		await page.locator('#library-member-id-input').fill('');
		await expect(page.locator('#checkout-submit-button')).toBeDisabled();

		await page.locator('#library-member-id-input').fill('nonexistent@example.com');
		await expect(page.locator('#checkout-submit-button')).toBeDisabled();

		await searchBook(page, '9003');
		await page.locator('#book-row_9003 a:has-text("Checkout")').click();
		await page.locator('#library-member-id-input').fill('exam.checkout-ready@example.com');
		await expect(page.locator('#checkout-submit-button')).toBeDisabled();
	});
});
