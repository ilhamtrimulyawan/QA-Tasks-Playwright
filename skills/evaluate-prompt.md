## SCORING BREAKDOWN

### Test Results Score: 0-40 points (ALREADY CALCULATED)

**This score is already calculated algorithmically. Copy it from test_results.txt.**

The test_results_score is calculated as:
**(tests_passed / tests_total) × 40**
Examples:
  - 0/5 tests pass = 0 points
  - 3/5 tests pass = 24 points
  - 4/5 tests pass = 32 points
  - 5/5 tests pass = 40 points

You must simply copy this value into your JSON response.

---

## PROMPT QUALITY SCORE: 0-40 points (YOU EVALUATE THIS)

Evaluate the **prompt.md** file based on these criteria:

### 1. Prompt & Content Existence (0 or automatic deductions)
**Missing prompt.md entirely**: 0 points for entire Prompt Quality category
**Empty prompt.md (0 bytes)**: 0 points for entire Prompt Quality category
**Placeholder prompt.md which contains only template/structure without any non-placeholder prompt and results**: 0 points for entire Prompt Quality category

### 2. Prompt Clarity & Specificity (0-20 points)
**Excellent (20)**: Complete and extensive instructions which clearly specifies the tasks. Contains details such as acceptance criteria and expected I/O with no ambiguity.
**Good (16)**: Clear goals with minor ambiguities, mostly specific requirements.
**Fair (12)**: General direction provided but lacks specifics, some ambiguous elements.
**Poor (8)**: Vague/very high level instructions which left a lot of aspects ambiguous. Missing key information.
**No prompt (0)**: No prompt at all.

### 3. Prompt Additional Context Completeness (0-4 points)
**Additional context exist (4)**: Additional context such as the file to be edited is specified along with the main prompt
**No additional context (0)**: No additional context beside the main prompt

### 4. File Content Completeness (0-8 points)
**Complete content (8)**: Complete sections (the instruction prompt, AI response, and analysis) for all tasks.
**Partially complete content (4)**: File contains the main instructions prompt for each task, but missing AI response and Analysis section. Or it contains complete content for some of the task, but missing content for other tasks.
**Empty/placeholder content (0)**: 0 points as explained on #1

### 5. Analysis Quality (0-8 points)
**Good analysis about the prompt result (8)**: Contains decent amount of analysis regarding the prompt output and whether or not a follow up prompt is needed.
**Little analysis about the prompt result (4)**: Very short/shallow analysis about the prompt result. No insight on whether follow up is needed or not.
**No analysis about the prompt result (0)**: Empty or placeholder analysis about the prompt result.

**Total Prompt Quality: 40 points maximum**