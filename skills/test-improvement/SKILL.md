---
name: test-improvement
description: "Analyze existing Playwright automation tests, identify missing test coverage, and generate new test cases + automation code. Use when: improving test coverage, finding uncovered test cases, auditing existing automation, adding missing tests to existing spec files, gap analysis on test suites."
argument-hint: "Provide the spec file path or feature name to analyze and improve"
---

# Test Improvement & Gap Analysis

## Resources

- [Gap Analysis Checklist](./references/gap-analysis-checklist.md) — What to look for when identifying missing test coverage
- [Improvement CSV Template](./assets/improvement-csv-template.csv) — CSV format with Source column (existing/new)
- [CSV Format Rules](../test-case-generation/references/csv-format-rules.md) — Column definitions, escaping rules (shared)
- [Page Object Example](../test-code-generation/references/page-object-example.md) — POM pattern reference (shared)
- [Test Spec Example](../test-code-generation/references/test-spec-example.md) — Spec file pattern reference (shared)
- [Framework Files](../test-code-generation/references/framework-files.md) — hook.ts, setup.ts, pageInitializer.ts (shared)

## When to Use

- Audit existing automation for gaps and missing coverage
- Add missing test cases to an existing spec file
- Improve test coverage for a feature that already has partial automation
- Identify untested scenarios in current test suites
- Generate both a test plan CSV and automation code for uncovered cases

## Prerequisites

- Existing spec file(s) and corresponding page object(s) to analyze
- (Optional) PRD or Confluence page for the feature — provides authoritative requirements to compare against
- (Optional) Staging URL — allows crawling the actual page to discover UI elements not covered by existing tests

## Procedure

### Step 1: Read Existing Automation

Read all relevant source files for the feature under analysis:

1. **Spec file** (`tests/<FeatureName>.spec.ts`) — extract every `test(...)` block
2. **Page object** (`pages/<featureName>.page.ts`) — extract all locators and methods
3. **PageInitializer** (`helper/pageInitializer.ts`) — confirm the page is registered
4. **Test data** (`data/testData.json`, `credentials/user.json`) — understand available data

For each existing test, record:
- Test title and case IDs (parsed from `'caseId1,caseId2-description'` format)
- What user flow it exercises (login → navigate → action → assertion)
- Which page object methods it calls
- Which user role it uses

### Step 2: Extract Existing Test Cases

Convert each existing `test(...)` block into a structured test case record:

| Field | How to Extract |
|-------|---------------|
| Case ID | From test title prefix (e.g., `438105` from `'438105,438107-admin can approve'`) |
| Title | From test title description after the hyphen |
| Preconditions | From `test.beforeEach` block (login role, starting page) |
| Steps | Convert page object method calls to Gherkin (Given/When/Then) |
| Expected Results | From `expect(...)` assertions and `verify*()` method calls |
| Priority | P0 for happy path / core flows, P1 for filters / secondary, P2 for edge cases |
| Tags | Infer from test type: Functional, Negative, UI, etc. |
| Platform | WEB (default for Playwright browser tests) |
| Source | `existing` |

### Step 3: Identify Coverage Gaps

Analyze the existing tests against these coverage dimensions:

#### 3a. From Code Analysis (always do this)

Cross-reference page object locators and methods against spec usage:

- **Unused locators**: Locators defined in the page object but never referenced in tests
- **Unused methods**: Page object methods never called from any test
- **Missing assertions**: Tests that perform actions but have no `expect(...)` or `verify*()` calls
- **Single-path coverage**: Features tested only for happy path, missing negative/error scenarios
- **Missing role coverage**: Tests only run as one user role when the feature has role-based behavior

Refer to the [Gap Analysis Checklist](./references/gap-analysis-checklist.md) for systematic validation.

#### 3b. From PRD (if available)

If a PRD or Confluence page is provided:

- Compare each PRD requirement against existing test cases
- Flag requirements with ZERO test coverage
- Flag requirements with partial coverage (only happy path, no error path)

#### 3c. From Staging Page (if available)

If a staging URL is provided:

- Crawl the page to discover interactive elements
- Compare discovered elements against page object locators
- Identify UI elements not covered by any locator or test

### Step 4: Generate New Test Cases

For each identified gap, create a new test case following the same format as Step 2, with:

- **Source**: `new`
- **Case ID**: Continue sequential numbering after the last existing case (e.g., if existing ends at TC-010, new starts at TC-011)
- **Steps**: Gherkin format, specific enough to be automated
- **Priority**: Assign based on impact (P0 = core functionality gap, P1 = secondary, P2 = edge case)

**Categorize new test cases by gap type:**

| Gap Type | Description | Typical Priority |
|----------|-------------|-----------------|
| Missing happy path | Core flow not tested at all | P0 |
| Missing error handling | No negative test for a feature | P0-P1 |
| Missing validation | Input validation not tested | P1 |
| Missing role coverage | Feature not tested with all relevant roles | P1 |
| Unused page object capability | Locator/method exists but no test uses it | P1 |
| Missing boundary test | Edge cases, limits, empty states | P1-P2 |
| Missing UI verification | Visual state not asserted | P2 |

### Step 5: Export Combined CSV

Generate a single CSV file containing **all** test cases (existing + new):

#### CSV Columns

| Column | Description |
|--------|-------------|
| `Case ID` | Unique identifier (e.g., `TC-001`) |
| `Title` | Descriptive test case title |
| `Preconditions` | Setup requirements and starting state |
| `Steps` | Step-by-step instructions in Gherkin format |
| `Expected Results` | Verifiable expected outcomes |
| `Priority` | P0, P1, or P2 |
| `Tags` | Functional, UI, API, Negative, Boundary, etc. |
| `Platform` | WEB, API, or Mobile |
| `Source` | `existing` or `new` — distinguishes current vs gap test cases |
| `AI Generated` | `false` for existing, `true` for new |

**File Naming Convention:**
```
test_improvement_<feature_name>_<YYYYMMDD>.csv
```

**Ordering Rules:**
1. List all `existing` test cases first, preserving their original order from the spec file
2. List all `new` test cases after, ordered by priority (P0 → P1 → P2)

### Step 6: Generate Automation Code

For each `new` test case, generate Playwright automation code following project conventions:

#### 6a. Update Page Object (if needed)

If new tests require interactions not covered by existing page object methods:

1. Add new locators to the constructor (follow [locator strategy priority](../test-code-generation/SKILL.md))
2. Add new action/verification methods
3. Group new locators with a comment indicating they were added for coverage improvement

```typescript
// --- Added for coverage improvement ---
public newElement: Locator;
```

#### 6b. Add New Tests to Spec File

Append new test blocks to the existing `test.describe` block:

```typescript
// --- Coverage improvement: new test cases ---
test('TC-011-description of new test', async ({ page }) => {
  // Arrange
  await featurePage.navigateToFeature();

  // Act
  await featurePage.performNewAction();

  // Assert
  await featurePage.verifyNewExpectedState();
});
```

**Rules for new test code:**
- Follow all conventions from the [test-code-generation skill](../test-code-generation/SKILL.md)
- Reuse existing page object methods wherever possible
- Only create new methods when the interaction doesn't exist yet
- New tests must be independent — no dependency on other tests
- Use the same `test.beforeEach` login/setup as existing tests

#### 6c. Register in PageInitializer (if new page object created)

If a new page object file was created, add it to `helper/pageInitializer.ts`.

### Step 7: Summary Report

After completing all steps, provide a summary:

```
## Test Improvement Summary

**Feature**: <feature name>
**Spec File**: <path to spec file>
**Page Object**: <path to page object>

### Coverage Before
- Existing test cases: <count>
- Covered flows: <list>

### Gaps Identified
- <gap 1 description> (Priority: P0)
- <gap 2 description> (Priority: P1)
- ...

### Coverage After
- Total test cases: <existing + new count>
- New test cases added: <count>
- New page object methods: <count>

### Files Modified
- `tests/<FeatureName>.spec.ts` — added <N> new tests
- `pages/<featureName>.page.ts` — added <N> new locators, <N> new methods
- `test_improvement_<feature>_<date>.csv` — exported combined test plan
```

## Rules

1. **Never delete or modify existing tests** — only add new ones
2. **Preserve existing test order** — append new tests at the end of the describe block
3. **Existing test cases go first in CSV** — new cases come after, clearly marked
4. **Reuse existing page object methods** — don't duplicate what already exists
5. **Follow all conventions from test-code-generation skill** — file naming, imports, patterns
6. **Follow CSV format from test-case-generation skill** — escaping, Gherkin, columns
7. **Source field is mandatory** — every row must be `existing` or `new`
8. **AI Generated field reflects origin** — `false` for existing human-written tests, `true` for new AI-generated ones
9. **Don't invent requirements** — only add test cases for genuinely missing scenarios derivable from code analysis or PRD
10. **Independent tests** — every new test must work in isolation without depending on other tests
