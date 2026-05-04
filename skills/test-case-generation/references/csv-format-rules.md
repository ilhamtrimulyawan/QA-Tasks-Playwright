# CSV Formatting Rules

## Column Definitions

| # | Column | Required | Description |
|---|--------|----------|-------------|
| 1 | `Case ID` | Yes | Unique ID using format `TC-001`, `TC-002`, etc. Sequential numbering. |
| 2 | `Title` | Yes | Descriptive, action-oriented title. Start with a verb (Verify, Check, Validate). |
| 3 | `Preconditions` | Yes | Starting state. Assume fresh/blank state. Comma-separated conditions. |
| 4 | `Steps` | Yes | Gherkin format (Given/When/Then). Use line breaks within the quoted field. |
| 5 | `Expected Results` | Yes | Concrete, verifiable outcomes. What the tester should observe. |
| 6 | `Priority` | Yes | `P0` (High/Critical), `P1` (Medium/Important), `P2` (Low/Nice-to-have) |
| 7 | `Tags` | Yes | Test type(s): `Functional`, `UI`, `API`, `Negative`, `Performance`, `Security`, `Boundary` |
| 8 | `Platform` | Yes | `WEB`, `API`, or `Mobile` |
| 9 | `AI Generated` | Yes | Always `true` |

## CSV Escaping Rules

1. **Wrap fields in double quotes** when they contain commas, newlines, or double quotes
2. **Escape double quotes** by doubling them: `""` inside a quoted field
3. **Multiline steps**: Use actual line breaks within double-quoted fields — do NOT use `\n` literal
4. **No trailing commas** on any row
5. **UTF-8 encoding** — no BOM

### Correct Example

```csv
TC-001,"Verify login with valid credentials","User has valid account","Given I am on the login page
When I enter valid email ""admin@test.com""
And I click Login
Then I should see the dashboard","Dashboard is displayed with welcome message",P0,Functional,WEB,true
```

### Incorrect Example

```csv
TC-001,Verify login with valid credentials,User has valid account,Given I am on the login page\nWhen I enter valid email,Dashboard is displayed,P0,Functional,WEB,true
```
(Missing quotes around fields with commas/newlines, using `\n` literal instead of real newlines)

## Priority Guidelines

| Priority | When to Use | Example |
|----------|-------------|---------|
| **P0** | App is unusable without this feature working. Core business flow. | Login, transaction submission, payment processing |
| **P1** | Important for user experience but not a blocker. Secondary flows. | Filtering, search, pagination, role-based visibility |
| **P2** | Edge cases, cosmetic, rarely triggered scenarios. | Tooltip text, empty state messages, very long input |

## Tags Guidelines

| Tag | When to Use |
|-----|-------------|
| `Functional` | Core feature behavior, CRUD operations, business logic |
| `UI` | Visual elements, layout, responsive design, accessibility |
| `API` | Backend endpoint testing, request/response validation |
| `Negative` | Invalid inputs, error handling, unauthorized access |
| `Performance` | Load time, response time, concurrent users (only if asked) |
| `Security` | Auth bypass, XSS, injection, permission escalation (only if asked) |
| `Boundary` | Min/max values, empty states, character limits |

## Gherkin Step Writing Rules

1. **Given** — Describe the precondition/starting state
2. **And** — Additional conditions (use after Given, When, or Then)
3. **When** — The action being performed
4. **Then** — The expected outcome

### Do:
- Use specific UI element names: "When I click the 'Submit' button"
- Include data values: "When I enter 'admin@test.com' in the email field"
- Be explicit about location: "Then I should see 'Success' toast message"

### Don't:
- Be vague: "When I do something" ❌
- Skip verification: Steps without a Then clause ❌
- Assume dependencies: "Given the previous test passed" ❌
