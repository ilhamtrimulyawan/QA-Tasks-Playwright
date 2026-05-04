# Gap Analysis Checklist

Use this checklist to systematically identify missing test coverage in existing automation.

## 1. Page Object vs Spec Cross-Reference

- [ ] **List all locators** defined in the page object constructor
- [ ] **List all methods** defined in the page object class
- [ ] **List all tests** in the spec file and which methods each test calls
- [ ] **Flag unused locators** — defined but never used in any test
- [ ] **Flag unused methods** — defined but never called from any test
- [ ] **Flag locators used only in methods but not exercised by tests** — method exists but no test invokes it

## 2. Flow Coverage

- [ ] **Happy path**: Is every core user flow tested end-to-end?
- [ ] **Error path**: For each happy path, is there a corresponding negative/error test?
- [ ] **Cancel/abort path**: Are cancel, close, and back-out flows tested?
- [ ] **Empty state**: What happens when there is no data? Is it tested?
- [ ] **Boundary values**: Are min/max/limit scenarios covered?

## 3. Assertion Coverage

- [ ] **Every test has at least one assertion** (`expect(...)` or `verify*()` call)
- [ ] **Assertions are meaningful** — not just "page loaded" but verifying the actual expected behavior
- [ ] **Status changes are verified** — after an action, is the resulting state checked?
- [ ] **Error messages are verified** — negative tests assert the correct error message text
- [ ] **Navigation is verified** — after redirects, is the URL or page heading checked?

## 4. Role Coverage

- [ ] **List all user roles** relevant to the feature (admin, user, viewer, etc.)
- [ ] **Each role is tested** — at minimum, happy path per role
- [ ] **Permission-denied scenarios** — users without access get proper error handling
- [ ] **Role-specific UI** — features visible/hidden based on role are tested

## 5. Filter / Search / Pagination

- [ ] **Each filter option tested** — all dropdown/checkbox values exercised
- [ ] **Combined filters** — multiple filters applied simultaneously
- [ ] **Filter reset / clear** — clearing filters returns to default view
- [ ] **Search functionality** — exact match, partial match, no results
- [ ] **Pagination** — next/prev page, rows per page, last page behavior

## 6. CRUD Operations

- [ ] **Create** — valid creation with all required fields
- [ ] **Read** — viewing details, list views, detail views
- [ ] **Update** — modifying existing records
- [ ] **Delete** — removing records, confirmation dialogs
- [ ] **Create with invalid data** — validation errors for each field
- [ ] **Create with duplicate data** — uniqueness constraint testing

## 7. UI State Verification

- [ ] **Loading states** — spinners, skeletons during data fetch
- [ ] **Success feedback** — toast messages, success banners after actions
- [ ] **Error feedback** — error toasts, inline error messages
- [ ] **Modal/dialog behavior** — open, close, overlay click, escape key
- [ ] **Form state** — disabled buttons, required field indicators

## 8. Data Integrity

- [ ] **Displayed data matches source** — values shown on screen match expected data
- [ ] **Sort order** — if sortable, is the correct order verified?
- [ ] **Date/time formatting** — dates display in expected format
- [ ] **Number formatting** — currency, decimals, thousand separators

## How to Use

1. Go through each section in order
2. For each unchecked item, determine if it applies to the feature under test
3. If it applies and is not covered by existing tests, mark it as a gap
4. Create a new test case for each identified gap
5. Prioritize: P0 for core functionality gaps, P1 for secondary, P2 for edge cases
