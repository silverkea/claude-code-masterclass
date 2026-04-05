# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server at http://localhost:3000
npm run build     # Production build
npm run lint      # Run ESLint
npm run test      # Run all tests (Vitest, watch mode)
npx vitest run    # Run tests once (no watch)
npx vitest run tests/components/Navbar.test.tsx  # Run a single test file
```

## Packages
All packages MUST be referenced as specific pinned versions.

## Architecture

**Pocket Heist** is a Next.js 16 app (App Router) with React 19 and Tailwind CSS v4.

### Route structure

Two route groups divide the app:

- `app/(public)/` — Unauthenticated pages (splash, login, signup, preview). No persistent layout.
- `app/(dashboard)/` — Authenticated pages (heists list, detail, create). Wrapped by a layout that renders `<Navbar>` above `<main>`.

The root `app/layout.tsx` only sets global metadata and imports global CSS — it renders no UI itself.

### Styling

Tailwind v4 is configured via PostCSS. Global theme tokens (colors, etc.) live in `app/globals.css` under the `@theme` directive. Component-scoped styles use CSS Modules (e.g. `Navbar.module.css`) and reference the global theme with `@reference`.

`globals.css` also defines shared layout/utility classes (`.page-content`, `.center-content`, `.form-title`, `.public`) — check there before creating new ones.

### Path aliases

`@/` resolves to the project root (configured in `tsconfig.json` and picked up by `vite-tsconfig-paths` for tests).

### Components

Reusable components live in `components/<ComponentName>/` with an `index.ts` barrel export. Import as `@/components/Navbar`.

## Code Preferences

- No semicolons in JS/TS files.
- Avoid Tailwind utility classes directly in component templates. If an element needs more than one class, combine them into a named class using `@apply` in a CSS Module. A single utility class inline is acceptable.
- Prefer solving problems with existing dependencies before adding new ones.
- Use `git switch -c <branch>` to create and switch to new branches, not `git checkout -b`.

### Testing

Tests live in `tests/` and mirror the `components/` structure. Uses Vitest + React Testing Library with `jsdom`. Test globals (`describe`, `it`, `expect`) are enabled — no explicit imports needed for those. Page-level tests are not currently in scope — tests cover reusable components only.

### Test-Driven Development

Follow TDD when implementing new features:

1. Write tests based on the spec's acceptance criteria and testing guidelines before writing implementation code
2. Run the tests and confirm they fail for the right reasons
3. Write the minimum implementation code to make the tests pass
4. Refactor if needed, keeping tests green

This applies to all new components, hooks, and utility functions.

## Specs

### Spec-Driven Development

**No feature may be implemented without both a spec and a plan. This is mandatory and cannot be skipped.**

The following are exempt from this rule:
- **Bug fixes and minor corrections** — small, isolated fixes that do not add or change behaviour (roughly under 10 lines)
- **Refactoring** — restructuring existing code without adding or removing any functionality. If a refactor adds or changes behaviour in any way, it requires a spec and plan
- **Discussion** — talking through ideas, reviewing code, or asking questions does not require a spec

For everything else — new features, changes to existing behaviour, non-trivial additions — the process is:
1. Create a spec with `/spec` first
2. Enter plan mode, produce a plan from the spec, then offer to save it to `_plans/<feature-slug>.md`
3. Implement against the plan

### Saving Plans

When a plan has been presented in plan mode, always offer the user the option to save it to `_plans/<feature-slug>.md` before implementation begins. The plan file is the technical complement to the spec — where the spec describes what and why, the plan describes how. Saved plans can be referred back to during implementation without repeating context.

### Keeping Specs Up To Date

Specs should reflect current intended behaviour, not just historical intent. To prevent drift:

- **Before planning any change**, scan `_specs/` for specs that cover the affected area. If the planned work changes or extends behaviour described in an existing spec, updating that spec must be the first step of the plan — before any implementation steps.
- **When creating a new spec**, check whether it overlaps with or supersedes any existing specs and note this explicitly.

## Observability

### Logging

- Log enough to diagnose problems in production — key events, outcomes, and errors should always be traceable
- **Never log sensitive data**: passwords, authentication tokens, session IDs, PII, or payment details
- Use structured logging (key/value pairs) over freeform strings — structured logs are searchable and parseable
- Use appropriate log levels: `info` for normal significant events, `warn` for recoverable unexpected states, `error` for failures that need attention
- Log errors with full context (what was happening, relevant IDs) so they can be diagnosed without reproducing the issue

### Monitoring

- When planning features, consider whether there are outcomes worth monitoring or alerting on in production
- Silent failures are worse than noisy ones — if something can fail without anyone noticing, it should be made observable
- Examples worth considering: repeated auth failures (may indicate an attack), payment failures, background job failures, third-party service errors

### Error & Exception Handling

- **User-facing errors** must be clear and actionable but must never expose internal details — no stack traces, database error messages, service names, file paths, or any other implementation specifics. Raw error messages are an OWASP information disclosure risk.
- Provide a generic user-facing message for unexpected errors. Where helpful, include a reference code the user can quote for support.
- **Internal errors** must be caught, logged with full context, and must not be allowed to crash unrelated parts of the app
- Handle errors at the appropriate level — don't swallow exceptions silently, and don't let low-level errors bubble up raw to the UI

## Security & Compliance

When planning or implementing any feature, security and compliance must be considered — not treated as an afterthought. This applies to all features, not just those that appear security-sensitive on the surface.

### Security Standards

Always consider the following during planning:

- **OWASP Top 10** — the baseline checklist for web application security risks: injection, broken authentication, XSS, insecure direct object references, security misconfiguration, and others. Consult it whenever a feature handles user input, authentication, sessions, or data access.
- **OWASP ASVS** (Application Security Verification Standard) — a more structured framework for verifying security requirements. Useful when planning features with significant auth, data handling, or trust boundary concerns.
- **Principle of least privilege** — users, services, and components should only have the access they actually need. Question any design that grants broader access for convenience.
- **Secure by default** — features should be locked down unless explicitly opened, not the reverse.
- **Input validation at system boundaries** — never trust data from users, external services, or third-party systems. Validate and sanitise at every entry point.
- **Dependency hygiene** — prefer well-maintained dependencies, keep them updated, and be aware of known vulnerabilities (CVEs).

### Secrets & Credentials

Never include secrets, credentials, or sensitive configuration in source code unless it is explicitly safe to do so (e.g. Firebase client config, which is intentionally public by design — see `lib/firebase.ts`).

This includes:
- API keys and tokens
- Passwords and passphrases
- Private keys and certificates
- Database connection strings
- Service account credentials
- Webhook signing secrets

Secrets must be stored in environment variables (e.g. `.env.local`) and accessed via `process.env`. Environment files containing secrets must never be committed — ensure they are listed in `.gitignore`. When adding a new secret, document the variable name (but not the value) in a `.env.example` file so other developers know what is required.

If you encounter a secret already committed to source control, treat it as compromised — it should be rotated immediately, not just removed from history.

### Data Privacy & Regional Regulations

Whenever a feature collects, stores, transmits, or processes personal data, identify which regulations apply based on the users it affects:

- **GDPR** (EU/EEA) — the most comprehensive and widely adopted baseline; a good default reference even outside the EU
- **CCPA/CPRA** (California, USA) — similar rights and obligations to GDPR
- **LGPD** (Brazil) — closely modelled on GDPR
- **PIPEDA** (Canada) — Personal Information Protection and Electronic Documents Act
- **APPI** (Japan) — Act on the Protection of Personal Information
- **Privacy Act** (Australia) — covers Australian Privacy Principles
- **PCI-DSS** — applies globally wherever payment card data is handled, regardless of region
- **HIPAA** (USA) — applies to health and medical data

If a feature touches personal data, the spec's Security Considerations section must identify which regulations are relevant and note any obligations (e.g. right to erasure, data minimisation, consent).

## Checking Documentation 

- **IMPORTANT:** When implementing any library or framework specific features, ALWAYS check the appropriate library or framework documentation using the Context7 MCP Server before writing any code.
