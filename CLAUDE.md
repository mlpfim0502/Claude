# CLAUDE.md

This file provides guidance for AI assistants (Claude Code and similar tools) working in this repository.

## Repository Status

This repository is currently **empty** — it has been initialized with Git but contains no source code, configuration, or documentation beyond this file. All conventions below are established as a foundation for future development.

---

## Git Workflow

### Branch Naming
- Feature branches: `feature/<short-description>`
- Bug fix branches: `fix/<short-description>`
- AI-assisted branches: `claude/<task-id>` (managed automatically by Claude Code)
- Never commit directly to `main` or `master`

### Commit Messages
Use the conventional commits format:
```
<type>(<scope>): <short summary>

[optional body]
[optional footer]
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(auth): add JWT token validation
fix(api): handle null response from upstream
docs: update CLAUDE.md with project structure
```

### Push Workflow
Always push with upstream tracking:
```bash
git push -u origin <branch-name>
```

---

## Development Conventions

### General Principles
- Keep changes minimal and focused — only modify what is directly requested
- Prefer editing existing files over creating new ones
- Do not add comments, docstrings, or type annotations to code you didn't change
- Avoid over-engineering: no feature flags, no backwards-compatibility shims, no premature abstractions
- Trust internal framework guarantees; only validate at system boundaries (user input, external APIs)

### Security
- Never commit secrets, credentials, `.env` files, or API keys
- Validate and sanitize all user input at system boundaries
- Avoid OWASP Top 10 vulnerabilities (XSS, SQL injection, command injection, etc.)

---

## AI Assistant Guidelines

### Before Making Changes
1. Read the relevant files before modifying them
2. Understand existing code and patterns before suggesting changes
3. For broad exploration, use file search tools rather than guessing paths

### Risky Actions — Always Confirm First
The following require explicit user confirmation before proceeding:
- Deleting files, branches, or database tables
- Force-pushing (`git push --force`)
- Hard resets (`git reset --hard`)
- Modifying CI/CD pipelines or shared infrastructure
- Creating or closing PRs/issues
- Running destructive migrations

### What AI Assistants Should NOT Do
- Skip pre-commit hooks (`--no-verify`)
- Amend published commits (create a new commit instead)
- Push to a branch other than the one specified for the task
- Add unnecessary boilerplate, error handling for impossible states, or helper abstractions for one-off operations
- Brute-force retry a failing command — diagnose the root cause instead

---

## Adding a New Project

When source code is added to this repository, update this CLAUDE.md with:

1. **Project type and purpose** — language, framework, what the project does
2. **Directory structure** — describe each top-level directory
3. **Setup instructions** — how to install dependencies and run the project locally
4. **Build commands** — the exact commands to build/compile
5. **Test commands** — how to run the test suite
6. **Linting/formatting** — tools used and how to run them
7. **CI/CD** — what pipelines exist and what they check
8. **Environment variables** — which env vars are required (never their values)
9. **Database/infrastructure** — any setup steps for data stores or external services

---

## File Structure (Current)

```
Claude/
└── CLAUDE.md          # This file — AI assistant guidance
```

Update this section as the project grows.
