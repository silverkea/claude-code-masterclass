# Plan: Heist Card Component

## Context

The heists dashboard currently renders plain `<p>` tags for each heist title. This plan implements the `HeistCard` and `HeistCardSkeleton` components from `_specs/heist-card-component.md`, and wires them into the active and assigned sections of the heists page in a responsive 3-column grid. The expired section is out of scope and unchanged.

---

## Implementation Order

TDD: tests first, then components, then page update.

### 1. `tests/components/HeistCard.test.tsx` — write failing tests

**Setup:**
- `vi.mock("next/link", ...)` — render as plain `<a href={href}>{children}</a>` so link assertions work without a router
- `vi.useFakeTimers()` in `beforeEach`, `vi.useRealTimers()` in `afterEach`
- Define `const NOW = new Date("2026-01-01T12:00:00Z").getTime()` and call `vi.setSystemTime(NOW)` in `beforeEach`
- `makeHeist(overrides?)` factory returning a valid `Heist` object; set deadline to `new Date(NOW + N * 60 * 60 * 1000)` to control urgency

**Test cases:**
- Renders heist title
- Renders assignee codename when `assignedToCodename` is set
- Renders `"Unassigned"` when `assignedToCodename` is `null`
- Renders creator codename
- Renders a formatted date substring (e.g. `"Jan 1"`)
- Renders time remaining (e.g. `"left"` substring)
- Clock icon does NOT have `clockUrgent` class when deadline ≥ 4 hours away
- Clock icon DOES have `clockUrgent` class when deadline < 4 hours away
- Card contains a link (`<a>`) with `href="/heists/test-id"`

**Note on CSS class assertions:** Use `container.querySelector("[class*='clockUrgent']")` — jsdom does not process CSS, class names are the raw CSS module keys.

---

### 2. `tests/components/HeistCardSkeleton.test.tsx` — write failing tests

**Test cases:**
- Renders without throwing
- Renders a card element with a class containing `"card"`
- Renders at least 3 placeholder line elements (e.g. `[class*='line']`)

---

### 3. `components/HeistCard/HeistCard.tsx`

```
"use client"

import Link from "next/link"
import { Clock } from "lucide-react"
import type { Heist } from "@/types/firestore/heist"
import styles from "./HeistCard.module.css"

type Props = { heist: Heist }

function formatDeadline(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function getTimeRemaining(deadline: Date): { hours: number; minutes: number } {
  const msLeft = deadline.getTime() - Date.now()
  const totalMinutes = Math.max(0, Math.floor(msLeft / (1000 * 60)))
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 }
}

export default function HeistCard({ heist }: Props) {
  const { hours, minutes } = getTimeRemaining(heist.deadline)
  const isUrgent = hours < 4

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Link href={`/heists/${heist.id}`} className={styles.title}>
          {heist.title}
        </Link>
        <Clock size={18} className={isUrgent ? styles.clockUrgent : styles.clock} aria-label="deadline timer" />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>To:</span>
        {heist.assignedToCodename
          ? <span className={styles.assignee}>{heist.assignedToCodename}</span>
          : <span className={styles.muted}>Unassigned</span>}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>By:</span>
        <span className={styles.creator}>{heist.createdByCodename}</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.muted}>{formatDeadline(heist.deadline)} &bull; {hours}h {minutes}m left</span>
      </div>
    </div>
  )
}
```

---

### 4. `components/HeistCard/HeistCard.module.css`

Key rules:
- `.card` — `position: relative`, `bg-lighter` (`#101828`), `rounded-[10px]`, `border-color: #1e2939`, `flex flex-col gap-3 p-4`
- `.title` — white heading text; `::after { content: ""; position: absolute; inset: 0; }` (stretched-link pattern makes full card clickable)
- `.clock` — `color: var(--color-body)` (muted grey)
- `.clockUrgent` — `color: var(--color-secondary)` (pink `#FB64B6`)
- `.assignee` — `color: var(--color-primary)` (purple `#C27AFF`)
- `.creator` — `color: var(--color-secondary)` (pink)
- `.label`, `.muted` — `color: var(--color-body)`, small text

Note: `border-color: #1e2939` is not a Tailwind token — use raw CSS for this value.

---

### 5. `components/HeistCard/index.ts`

```
export { default } from "./HeistCard"
```

---

### 6. `components/HeistCardSkeleton/HeistCardSkeleton.tsx`

```
import styles from "./HeistCardSkeleton.module.css"

export default function HeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.lineTitle} />
        <div className={styles.iconBlock} />
      </div>
      <div className={styles.lineShort} />
      <div className={styles.lineMid} />
      <div className={styles.lineFull} />
    </div>
  )
}
```

---

### 7. `components/HeistCardSkeleton/HeistCardSkeleton.module.css`

Mirror the existing `Skeleton.module.css` pattern:
- `.card` — same shape as HeistCard (`bg-lighter`, `rounded-[10px]`, `border-color: #1e2939`, `p-4 flex flex-col gap-3`)
- `.lineTitle`, `.lineShort`, `.lineMid`, `.lineFull` — `background-color: #1e2939`, `height: 0.75rem`, `border-radius` — with widths 80%, 55%, 45%, 100%
- `.iconBlock` — `background-color: #1e2939`, `border-radius: 50%`, `18×18px`
- `@keyframes pulse` — `opacity` 1→0.4→1, 1.5s, ease-in-out, applied to all placeholder elements

---

### 8. `components/HeistCardSkeleton/index.ts`

```
export { default } from "./HeistCardSkeleton"
```

---

### 9. `app/(dashboard)/heists/page.tsx` — update active and assigned sections

Add imports for `HeistCard` and `HeistCardSkeleton`. Replace the active and assigned section bodies:

**Before (active):**
```tsx
{activeLoading && <p>Loading…</p>}
{activeError && <p>Could not load active heists.</p>}
{activeHeists.map((h) => <p key={h.id}>{h.title}</p>)}
```

**After (active):**
```tsx
{activeError && <p>Could not load active heists.</p>}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {activeLoading
    ? Array.from({ length: 3 }, (_, i) => <HeistCardSkeleton key={i} />)
    : activeHeists.map((h) => <HeistCard key={h.id} heist={h} />)}
</div>
```

Apply the same pattern to the assigned section. The expired section is unchanged.

The grid uses 4 Tailwind utilities on a single wrapper div — this is acceptable for a pure layout wrapper with no semantic content. No CSS module needed for this.

---

## Files Modified / Created

| Action | Path |
|--------|------|
| Create | `tests/components/HeistCard.test.tsx` |
| Create | `tests/components/HeistCardSkeleton.test.tsx` |
| Create | `components/HeistCard/HeistCard.tsx` |
| Create | `components/HeistCard/HeistCard.module.css` |
| Create | `components/HeistCard/index.ts` |
| Create | `components/HeistCardSkeleton/HeistCardSkeleton.tsx` |
| Create | `components/HeistCardSkeleton/HeistCardSkeleton.module.css` |
| Create | `components/HeistCardSkeleton/index.ts` |
| Modify | `app/(dashboard)/heists/page.tsx` |

---

## Verification

1. After writing tests (steps 1–2): run `npx vitest run tests/components/HeistCard.test.tsx tests/components/HeistCardSkeleton.test.tsx` — all tests must fail (red)
2. After implementing components (steps 3–8): run same command — all tests must pass (green)
3. After updating the page (step 9): run `npm run dev` and visit `http://localhost:3000/heists` — verify card grid renders, skeleton shows during load, clock turns pink on cards under 4h, clicking a card navigates to `/heists/:id`
4. Run `npm run lint` — no errors
5. Run `npx vitest run` — full test suite passes
