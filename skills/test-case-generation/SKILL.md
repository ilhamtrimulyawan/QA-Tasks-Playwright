---
name: test-case-generation
description: "Generate comprehensive test cases in CSV format from PRD documents. Use when: creating test plans, generating test cases from Confluence PRD, building QA test suites, writing test scenarios from product requirements."
argument-hint: "Provide Confluence page URL or PRD title to generate test cases from"
---

# Test Case Generation from PRD

## Resources

- [CSV Template](./assets/csv-template.csv) — Sample CSV with correct format and columns
- [CSV Format Rules](./references/csv-format-rules.md) — Column definitions, escaping rules, priority/tag guidelines
- [Coverage Checklist](./references/coverage-checklist.md) — Validation checklist before finalizing test plan

## When to Use

- Generate test cases from a PRD (Product Requirements Document)
- Create test plans from Confluence pages shared via Atlassian MCP
- Build comprehensive QA test suites from feature specifications
- Convert user stories and acceptance criteria into structured test cases

## Prerequisites

- PRD document accessible via Atlassian Confluence MCP or provided as text
- Understanding of the feature domain and user roles

## Procedure

### Step 1: Retrieve the PRD

Use one of these methods to obtain the PRD content:

1. **Confluence MCP** (preferred): Use `getConfluencePage` to fetch the PRD from Confluence
2. **URL**: Fetch the page content from the provided URL
3. **Inline**: Read the PRD content provided directly in the prompt

### Step 2: Analyze the PRD

Extract and catalog:

- **Functional requirements**: Every feature, flow, and behavior described
- **User roles**: All user types mentioned (admin, user, viewer, etc.)
- **User flows**: Step-by-step paths users take through the feature
- **Business rules**: Validation rules, constraints, conditions
- **API contracts**: Endpoints, request/response schemas (if present)
- **Edge cases**: Boundary conditions, error states, empty states
- **Dependencies**: Integrations, prerequisites, external systems

**IMPORTANT**: Do not assume requirements beyond what is stated in the PRD. Only infer edge cases and error scenarios that are logically derivable.

### Step 3: Design Test Scenarios

Create test cases covering these categories:

| Category | Description | Priority |
|----------|-------------|----------|
| **Happy Path** | Normal user behavior, expected flows | P0 |
| **Validation & Error Handling** | Invalid inputs, boundary values, error states | P0-P1 |
| **Edge Cases** | Boundary conditions, empty states, max limits | P1 |
| **Role-based Access** | Different user permissions and restrictions | P1 |
| **Negative Testing** | Unexpected inputs, system failures | P1-P2 |
| **API Testing** | Endpoint validation, request/response (if API contract exists) | P0-P1 |
| **UI/UX** | Visual elements, responsive behavior, accessibility | P2 |

**Priority Definitions:**
- **P0 (High)**: Critical functionality — app is unusable without it
- **P1 (Medium)**: Important features that enhance experience but are not blockers
- **P2 (Low)**: Nice-to-have, minor edge cases with low impact

### Step 4: Write Test Cases

Each test case must include:

- **Clear title**: Descriptive, action-oriented
- **Preconditions**: Starting state and setup requirements (always assume fresh/blank state)
- **Steps**: Written in Gherkin format (Given/When/Then), specific enough for any tester
- **Expected Results**: Concrete, verifiable outcomes
- **Independence**: Each test case can run in any order without dependency on others

**Gherkin Format Reference:**
```gherkin
Given I am logged in as <role>
And I am on the <page> page
When I <action>
Then I should see <expected result>
```

### Step 5: Output as CSV

Save the test cases as a CSV file with these exact columns:

| Column | Description |
|--------|-------------|
| `Case ID` | Unique identifier (e.g., `TC-001`) |
| `Title` | Descriptive test case title |
| `Preconditions` | Setup requirements and starting state |
| `Steps` | Step-by-step instructions in Gherkin format |
| `Expected Results` | Verifiable expected outcomes |
| `Priority` | P0, P1, or P2 |
| `Tags` | Test type: Functional, UI, API, Negative, Performance, Security |
| `Platform` | WEB, API, or Mobile |
| `AI Generated` | Always `true` |

**File Naming Convention:**
```
test_plan_<feature_name>_<YYYYMMDD>.csv
```

Save to the project root or a designated output folder.

### Step 6: Validate Coverage

Before finalizing, verify:

- [ ] Every requirement in the PRD has at least one test case
- [ ] Every user flow has happy path + error path coverage
- [ ] Every user role mentioned is covered
- [ ] API contracts have request/response validation test cases (if applicable)
- [ ] Negative scenarios exist for all input fields
- [ ] Edge cases for boundary values are included
- [ ] Test cases are independent and can run in any order

## CSV Format Example

Refer to [CSV Format Rules](./references/csv-format-rules.md) for escaping rules and column guidelines.
Refer to [CSV Template](./assets/csv-template.csv) for a working sample.

```csv
Case ID,Title,Preconditions,Steps,Expected Results,Priority,Tags,Platform,AI Generated
TC-001,Verify successful login with valid credentials,"User has a valid account, Browser is open","Given I am on the login page
When I enter valid email and password
And I click the Login button
Then I should be redirected to the dashboard","User is redirected to dashboard and sees welcome message",P0,Functional,WEB,true
TC-002,Verify error message for invalid password,"User has a valid account, Browser is open","Given I am on the login page
When I enter valid email and invalid password
And I click the Login button
Then I should see an error message","Error message 'Invalid credentials' is displayed and user remains on login page",P0,Negative,WEB,true
```

## Notes

- Use double quotes around CSV fields that contain commas or newlines
- Escape internal double quotes by doubling them (`""`)
- Ensure Gherkin steps use line breaks within the quoted field
