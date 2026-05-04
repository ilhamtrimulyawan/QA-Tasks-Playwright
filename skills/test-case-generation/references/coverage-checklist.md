# Coverage Checklist

Use this checklist to validate test plan completeness before finalizing.

## Requirement Coverage

- [ ] Every functional requirement in the PRD has at least one test case
- [ ] Every user story/acceptance criteria has corresponding test cases
- [ ] Every user flow has both happy path AND error path coverage
- [ ] Every mentioned user role has at least one test case
- [ ] API contracts have request/response validation (if applicable)
- [ ] Business rules and validation logic are explicitly tested

## Scenario Diversity

- [ ] **Happy path** (P0): Normal expected usage for each feature
- [ ] **Negative testing** (P0-P1): Invalid inputs for all input fields
- [ ] **Boundary values** (P1): Min, max, empty, one-over-limit for each constraint
- [ ] **Error states** (P1): Network errors, timeout, server errors (where applicable)
- [ ] **Empty states** (P1-P2): No data, first-time user, cleared filters
- [ ] **Role-based** (P1): Each role's permissions and restrictions tested
- [ ] **Concurrent/conflicting actions** (P2): If relevant to the feature

## Test Independence

- [ ] Each test case can run in any order
- [ ] Each test case starts from a fresh/blank state
- [ ] No test case depends on the result of another test case
- [ ] Preconditions are explicitly stated (not assumed from prior tests)

## Quality Checks

- [ ] Titles are descriptive and action-oriented (start with a verb)
- [ ] Steps use Gherkin format (Given/When/Then)
- [ ] Expected results are concrete and verifiable
- [ ] Priority assignments match the guidelines (P0/P1/P2)
- [ ] Tags accurately reflect test type
- [ ] Platform field is correct (WEB/API/Mobile)
- [ ] No duplicate test cases covering the exact same scenario
