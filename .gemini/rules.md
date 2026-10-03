# Antigravity AI Engineering Rules & Workflow Standards

## Core Coding Principles
- **Inspect Before Editing**: Always read and understand existing source code, signatures, and context before modifying files.
- **Architecture First**: Verify project design, folder structures, and existing utilities before introducing new patterns.
- **Small, Reversible Modifications**: Prefer targeted, atomic edits over wholesale rewrites.
- **Strict Verification**: Never claim tests or builds pass without running empirical terminal commands and inspecting outputs.
- **Secret Safety**: Never hardcode API keys, credentials, or tokens. Ensure sensitive values stay in `.env` (excluded by `.gitignore`).
- **User Confirmation**: Seek explicit approval before running destructive operations (e.g. deleting files, resetting git history, running unverified scripts).

---

## Standard Workflows

### 1. Feature Planning Workflow
- Review requirements and inspect existing codebase dependencies.
- Draft a step-by-step implementation plan breaking down tasks into modular components.
- Confirm design choices and architectural trade-offs with the user before writing code.

### 2. Implementation Workflow
- Work incrementally according to the approved plan.
- Maintain existing API contracts and docstrings unless explicit changes are required.
- Keep changes scoped to target components without causing side effects.

### 3. Debugging Workflow
- Always inspect raw runtime error logs and full tracebacks before making hypotheses.
- Address root causes directly rather than masking symptoms or swallowing exceptions.
- Re-run verification commands to confirm fixes.

### 4. Testing & Verification Workflow
- Execute unit and integration test suites using project test runners (`npm test`, `pytest`, etc.).
- Validate edge cases and failure modes explicitly.

### 5. Code Review Workflow
- Perform visual or automated code reviews using installed tools (e.g., CodeRabbit AI extension).
- Ensure code adheres to linting, formatting, and performance guidelines.

### 6. Security Check Workflow
- Audit dependencies for vulnerabilities (`npm audit`, `pip audit`).
- Ensure all input endpoints validate and sanitize parameters.
- Verify no secrets or credentials are leaked in commits or logs.

### 7. Commit Preparation Workflow
- Run `git status` and `git diff` to review all staged changes.
- Ensure temporary scratch files and non-essential logs are cleaned up.
- Write clear, standard conventional commit messages (`feat:`, `fix:`, `refactor:`, `docs:`).
