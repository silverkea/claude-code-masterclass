# Plan: Expired Heist Card Component

## Context

The `ExpiredHeistCard` component and its integration into the heists dashboard have been implemented. Two additions are now in scope following a spec update:

1. **Skeleton loading state** — replace the `aria-live` loading paragraph in the expired section with an `ExpiredHeistCardSkeleton` component, matching the pattern used by the active and assigned sections
2. **Navigation** — make the expired card clickable, navigating to `/heists/:id`, consistent with the active `HeistCard`

The `SettledHeist` type, `isSettled` predicate, `heist-list` CSS class, empty state, and `aria-labelledby` are already implemented.

---

## Remaining Implementation Steps

### Step 1 — Add navigation to ExpiredHeistCard

File: `components/ExpiredHeistCard/ExpiredHeistCard.tsx`

The active `HeistCard` wraps the title in a `<Link href={/heists/${heist.id}}>` and uses a `::after` pseudo-element on the title class to expand the click target to the full card. Follow the same pattern:

1. Import `Link` from `next/link`
2. Wrap `<h3>` title in `<Link href={/heists/${heist.id}} className={styles.title}>`
3. Remove the standalone `<h3>` — the `<Link>` renders the title text directly
4. Add `.title::after` pseudo-element to `ExpiredHeistCard.module.css` (copy from `HeistCard.module.css:17-21`):

```css
.title::after {
  content: "";
  position: absolute;
  inset: 0;
}
```

Note: `id` attribute for `aria-labelledby` must move from the `<h3>` onto the `<Link>` element (or wrap the Link in a span with the id). The simplest approach: keep `id={titleId}` on the wrapping `<Link>` element — browsers accept `id` on anchor elements.

Update tests to assert:
- Card contains a link to `/heists/:id`
- next/link mock must be added (copy from `tests/components/HeistCard.test.tsx:6-20`)

---

### Step 2 — Create ExpiredHeistCardSkeleton component

Files to create:
- `components/ExpiredHeistCardSkeleton/ExpiredHeistCardSkeleton.tsx`
- `components/ExpiredHeistCardSkeleton/ExpiredHeistCardSkeleton.module.css`
- `components/ExpiredHeistCardSkeleton/index.ts`

The skeleton mirrors the two-row layout of `ExpiredHeistCard`:
- Row 1 (header): wide title placeholder (~70%) + right-side block for badge area
- Row 2 (meta): two shorter placeholder blocks side by side (for To/By)

CSS follows `HeistCardSkeleton.module.css` exactly — same `@keyframes pulse`, same placeholder background (`#1e2939`), same card shell.

```tsx
// ExpiredHeistCardSkeleton.tsx
import styles from "./ExpiredHeistCardSkeleton.module.css"

export default function ExpiredHeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.lineTitle} />
        <div className={styles.lineBadge} />
      </div>
      <div className={styles.row}>
        <div className={styles.lineShort} />
        <div className={styles.lineShort} />
      </div>
    </div>
  )
}
```

```css
/* ExpiredHeistCardSkeleton.module.css */
@reference "../../app/globals.css";

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.card {
  @apply bg-lighter rounded-[10px] border p-4 flex flex-col gap-2;
  border-color: #1e2939;
}

.header {
  @apply flex items-start justify-between gap-2;
}

.lineTitle, .lineBadge, .lineShort {
  border-radius: 0.375rem;
  background-color: #1e2939;
  height: 0.75rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.lineTitle { width: 70%; height: 0.875rem; }
.lineBadge { width: 4rem; height: 1.25rem; border-radius: 0.25rem; flex-shrink: 0; }

.row {
  @apply flex items-center gap-4;
}

.lineShort { width: 35%; }
```

Barrel: `export { default } from "./ExpiredHeistCardSkeleton"`

Add a smoke test: skeleton renders without error.

---

### Step 3 — Wire skeleton into the dashboard page

File: `app/(dashboard)/heists/page.tsx`

1. Import `ExpiredHeistCardSkeleton`
2. Replace the `aria-live` loading paragraph:

```tsx
// Before:
{expiredLoading && (
  <p aria-live="polite" aria-atomic="true">Loading…</p>
)}

// After (inside the heist-list div, consistent with active/assigned pattern):
<div className="heist-list">
  {expiredLoading
    ? Array.from({ length: 3 }, (_, i) => <ExpiredHeistCardSkeleton key={i} />)
    : settledHeists.length === 0
      ? <p>No expired heists yet.</p>
      : settledHeists.map((h) => <ExpiredHeistCard key={h.id} heist={h} />)}
</div>
```

Remove the now-redundant `{expiredLoading && <p>...</p>}` line entirely.

---

### Step 4 — Run tests and confirm green

```bash
npx vitest run
```

All tests should pass. Key new assertions to verify:
- `ExpiredHeistCard` tests: link to `/heists/:id` navigates correctly
- `ExpiredHeistCardSkeleton` test: renders without error

---

## Critical Files

| File | Change |
|---|---|
| `components/ExpiredHeistCard/ExpiredHeistCard.tsx` | **Edit** — add Link navigation, update title |
| `components/ExpiredHeistCard/ExpiredHeistCard.module.css` | **Edit** — add `.title::after` pseudo-element |
| `tests/components/ExpiredHeistCard.test.tsx` | **Edit** — add next/link mock + navigation test |
| `components/ExpiredHeistCardSkeleton/ExpiredHeistCardSkeleton.tsx` | **Create** |
| `components/ExpiredHeistCardSkeleton/ExpiredHeistCardSkeleton.module.css` | **Create** |
| `components/ExpiredHeistCardSkeleton/index.ts` | **Create** |
| `app/(dashboard)/heists/page.tsx` | **Edit** — swap loading paragraph for skeleton |

## Existing Patterns to Reuse

| Pattern | Source |
|---|---|
| Link + `::after` full-card click target | `components/HeistCard/HeistCard.tsx:32-33`, `HeistCard.module.css:17-21` |
| Skeleton structure and CSS | `components/HeistCardSkeleton/` — copy `@keyframes pulse`, card shell, placeholder class pattern |
| `next/link` mock in tests | `tests/components/HeistCard.test.tsx:6-20` |
| Skeleton loading pattern in page | `app/(dashboard)/heists/page.tsx:31-33` — `Array.from({ length: 3 }, ...)` |

## Verification

1. `npx vitest run` — all tests green, no regressions
2. `npm run lint` — no lint errors
3. `npm run dev` → `/heists` — expired section shows skeletons while loading, cards after load; clicking a card navigates to `/heists/:id`
