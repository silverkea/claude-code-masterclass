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

Follow TDD: write tests from the spec's acceptance criteria first, confirm they fail, implement to pass, refactor green.

## Spec-Driven Development

**No feature may be implemented without both a spec and a plan. This is mandatory and cannot be skipped.**

Exempt: bug fixes under ~10 lines, refactoring without behaviour change, discussion.

Workflow:
1. `/spec <idea>` — creates the spec file and switches to a feature branch
2. `/plan <feature-slug>` — enters plan mode, produces a plan, saves it to `_plans/<feature-slug>.md`
3. Implement against the plan

Before planning any change, scan `_specs/` for specs that cover the affected area. If the planned work changes behaviour described in an existing spec, updating that spec is the first step of the plan.

Backlog items (deferred observations about other features) go in `_backlog/`. Use `/backlog <observation>` to create one.

## Checking Documentation

**IMPORTANT:** When implementing any library or framework specific features, ALWAYS check the appropriate library or framework documentation using the Context7 MCP Server before writing any code.
