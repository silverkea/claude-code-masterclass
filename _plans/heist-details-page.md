# Plan: Heist Details Page

## Context

The `/heists/[id]` page is a stub. This plan implements the full detail page — real-time heist data, a live visual countdown, a skeleton loader, a 404 state, and an assignment UI for unassigned heists.

Spec: `_specs/heist-details-page.md`

---

## Key Facts

- **Stub page**: `app/(dashboard)/heists/[id]/page.tsx` — renders a plain `<h2>` only
- **Next.js 16 params**: Route params are a `Promise` — the page must be an async server component using `await props.params`
- **Auth**: `useUser()` from `context/AuthContext.tsx` returns `{ user: User | null, loading: boolean }`. Dashboard layout guarantees `user` is non-null by render time
- **Firestore single-doc pattern**: `onSnapshot` on a `doc()` ref, same approach as `useHeists.ts` but for one document
- **Not-found**: Call `notFound()` from `next/navigation` in the client component when the snapshot has `!exists()` — triggers Next.js default 404 behaviour
- **Existing types**: `Heist`, `heistConverter`, `UpdateHeistInput` already exist in `types/firestore/heist.ts`. `UpdateHeistInput` already includes `assignedTo` and `assignedToCodename`
- **Assignment write**: `updateDoc(doc(db, COLLECTIONS.HEISTS, id), { assignedTo, assignedToCodename })`
- **User lookup**: Same debounced `getDocs` prefix-query pattern as `CreateHeistForm` — excludes current user's `uid` only (creator is NOT excluded, unlike `CreateHeistForm`)
- **Countdown**: `useState` + `setInterval(1000)` inside a dedicated component; clears interval on unmount
- **Skeleton pattern**: Follow `HeistCardSkeleton` — pulse animation keyframe, `#1e2939` placeholder blocks
- **CSS**: CSS Modules with `@reference "../../app/globals.css"` (or appropriate relative path); use `@apply` for multi-class combos, avoid bare utility classes in JSX
- **No new dependencies** — everything needed is already installed

---

## Files to Create / Modify

### 1. `hooks/useHeist.ts` — new single-doc real-time hook

```typescript
// Returns: { heist: Heist | null, loading: boolean, notFound: boolean, error: Error | null }
// Uses onSnapshot on doc(db, COLLECTIONS.HEISTS, id).withConverter(heistConverter)
// Sets notFound: true when snapshot.exists() === false
// Sets error when onSnapshot fires the error callback
// Cleans up subscription on unmount
```

**Interface:**
```typescript
export interface UseHeistResult {
  heist: Heist | null
  loading: boolean
  notFound: boolean
  error: Error | null
}
```

**Implementation sketch:**
```typescript
export function useHeist(id: string): UseHeistResult {
  const [heist, setHeist] = useState<Heist | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const ref = doc(db, COLLECTIONS.HEISTS, id).withConverter(heistConverter)
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setNotFound(true)
          setLoading(false)
        } else {
          setHeist(snapshot.data())
          setNotFound(false)
          setLoading(false)
        }
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [id])

  return { heist, loading, notFound, error }
}
```

---

### 2. `components/HeistCountdown/HeistCountdown.tsx` — live countdown display

**Props:** `{ deadline: Date }`

**Logic:**
```typescript
type TimeLeft = { days: number; hours: number; minutes: number; seconds: number } | null

function getTimeLeft(deadline: Date): TimeLeft {
  const msLeft = deadline.getTime() - Date.now()
  if (msLeft <= 0) return null
  const totalSeconds = Math.floor(msLeft / 1000)
  return {
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
```

**State + interval:**
```typescript
const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(deadline))

useEffect(() => {
  const id = setInterval(() => setTimeLeft(getTimeLeft(deadline)), 1000)
  return () => clearInterval(id)
}, [deadline])
```

**Render:**
- When `timeLeft` is null → render **Expired block**: large "EXPIRED" text styled in `--color-error`
- When `timeLeft` is set → render four digit blocks (D / H / M / S), each a dark panel with:
  - The number in large bold white/pink text
  - The unit label below in muted grey
- Wrap in an `aria-live="polite"` region; include a visually-hidden `<span>` giving the full time as text for screen readers (updated on each tick)
- The digit blocks should feel dramatic: large monospace font, subtle border, slight glow on the number using `text-shadow`

**CSS tokens to use:** `--color-secondary` (#FB64B6) for the digit numbers; `--color-body` for unit labels; `--color-error` (#FF6467) for Expired; `--color-lighter` / `--color-light` for panel backgrounds

---

### 3. `components/HeistCountdown/HeistCountdown.module.css`

```css
@reference "../../../app/globals.css";

.wrap { /* flex row, gap, centered */ }
.unit { /* dark panel bg-lighter, border, rounded, padding, flex col, min-width */ }
.digit { /* large font ~3rem, bold, color --color-secondary, font-variant-numeric tabular-nums */ }
.label { /* small text-body uppercase tracking-widest */ }
.expired { /* large bold text, color --color-error, letter-spacing, text-transform uppercase */ }
.srOnly { /* visually hidden for screen readers */ }
```

---

### 4. `components/HeistCountdown/index.ts` — barrel export

```typescript
export { default } from './HeistCountdown'
```

---

### 5. `components/HeistDetailSkeleton/HeistDetailSkeleton.tsx` — skeleton loader

Mirrors the detail page layout with pulse animation blocks:

```
[ title block — wide, tall ]
[ description block — full width, shorter ]
[ row: label stub + value stub ]  ← creator
[ row: label stub + value stub ]  ← assignee
[ countdown block — 4 units side by side ]
```

Use the same `@keyframes pulse` pattern as `HeistCardSkeleton.module.css` — copy the keyframe, use `#1e2939` placeholder color.

---

### 6. `components/HeistDetailSkeleton/HeistDetailSkeleton.module.css`

```css
@reference "../../../app/globals.css";

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.wrap { /* flex col gap matching detail page */ }
.titleBlock { /* wide, ~1.5rem tall, rounded, background #1e2939, pulse */ }
.descBlock { /* full width, ~4rem tall */ }
.row { /* flex row, gap */ }
.labelStub { /* short ~3rem wide */ }
.valueStub { /* medium ~8rem wide */ }
.countdownBlock { /* flex row, 4 unit placeholders each ~4rem × 5rem */ }
```

---

### 7. `components/HeistDetailSkeleton/index.ts` — barrel export

```typescript
export { default } from './HeistDetailSkeleton'
```

---

### 8. `components/HeistDetail/HeistDetail.tsx` — main client component

**Props:** `{ id: string }`

**Imports:** `useHeist`, `useUser`, `HeistCountdown`, `HeistDetailSkeleton`, `notFound` from `next/navigation`, `updateDoc`, `doc`, `getDocs`, `collection`, `query`, `where`, `orderBy`, `limit` from `firebase/firestore`, `db`, `COLLECTIONS`

**State:**
```typescript
// assignment UI
const [assigneeQuery, setAssigneeQuery] = useState('')
const [pendingAssignee, setPendingAssignee] = useState<{ id: string; codename: string } | null>(null)
const [searchResults, setSearchResults] = useState<{ id: string; codename: string }[]>([])
const [isFocused, setIsFocused] = useState(false)
const isFocusedRef = useRef(false)
const [confirming, setConfirming] = useState(false)
const [confirmError, setConfirmError] = useState<string | null>(null)
```

**Render logic:**
1. If `loading` → return `<HeistDetailSkeleton />`
2. If `notFound` → call `notFound()` (import from `next/navigation`)
3. If `error` → return error message block
4. Render heist details:
   - `<h1>` — heist title
   - Description paragraph
   - Metadata rows: **By:** creator codename (pink), **To:** assignee or assignment UI
   - `<HeistCountdown deadline={heist.deadline} />`

**Assignment UI block** (shown only when `heist.assignedToCodename === null`):

```
if assigned → <span className={styles.assignee}>{heist.assignedToCodename}</span>
if not assigned and pendingAssignee →
  <div>
    <span>{pendingAssignee.codename}</span>
    <button onClick={clearPending}>×</button>
    <button onClick={confirmAssignment} disabled={confirming}>
      {confirming ? 'Assigning…' : 'Confirm Assignment'}
    </button>
    {confirmError && <p className={styles.error}>{confirmError}</p>}
  </div>
if not assigned and no pending →
  <div className={styles.assigneeWrap}>
    <input onFocus={handleFocus} onBlur={handleBlur} value={assigneeQuery} onChange=... placeholder="Search by codename…" />
    {isFocused && searchResults.length > 0 && (
      <ul className={styles.dropdown}>
        {searchResults.map(r => <li><button onClick={() => setPendingAssignee(r)}>{r.codename}</button></li>)}
      </ul>
    )}
  </div>
```

**`fetchUsers` function** — identical to `CreateHeistForm` **except** no creator exclusion — only filters out `user?.uid`:
```typescript
async function fetchUsers(searchTerm: string) {
  // same prefix query pattern
  // filter: u.id !== user?.uid   (current user excluded, creator not excluded)
}
```

**Debounce** — same `useEffect` on `assigneeQuery` with 300ms `setTimeout`/`clearTimeout`

**`confirmAssignment`:**
```typescript
async function confirmAssignment() {
  if (!pendingAssignee) return
  setConfirming(true)
  setConfirmError(null)
  try {
    await updateDoc(doc(db, COLLECTIONS.HEISTS, id), {
      assignedTo: pendingAssignee.id,
      assignedToCodename: pendingAssignee.codename,
    })
    // real-time subscription will update heist automatically; no local state reset needed
  } catch {
    setConfirmError('Something went wrong. Please try again.')
  } finally {
    setConfirming(false)
  }
}
```

Note: after a successful write, the `onSnapshot` in `useHeist` will fire automatically with the updated document, setting `heist.assignedToCodename` — the assignment UI will disappear reactively without manual state cleanup.

---

### 9. `components/HeistDetail/HeistDetail.module.css`

```css
@reference "../../../app/globals.css";

.wrap       { /* flex col gap, page-content width */ }
.title      { /* large text, text-heading, font-bold */ }
.description { /* text-body, leading-relaxed, whitespace-pre-wrap */ }
.meta       { /* flex col gap-2 */ }
.row        { /* flex items-center gap-2 text-sm */ }
.label      { /* text-body */ }
.assignee   { /* color --color-primary */ }
.creator    { /* color --color-secondary */ }
.error      { /* text-error text-sm */ }
/* assigneeWrap, dropdown, dropdownItem, selectedAssignee, clearBtn — same as CreateHeistForm.module.css */
```

---

### 10. `components/HeistDetail/index.ts` — barrel export

```typescript
export { default } from './HeistDetail'
```

---

### 11. `app/(dashboard)/heists/[id]/page.tsx` — updated page

```typescript
import HeistDetail from '@/components/HeistDetail'

export default async function HeistDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <div className="page-content">
      <HeistDetail id={id} />
    </div>
  )
}
```

---

### 12. `tests/hooks/useHeist.test.ts`

**Mocks:** same pattern as `useHeists.test.ts` — mock `@/lib/firebase`, `firebase/firestore` (`doc`, `onSnapshot`), `@/types/firestore/heist` (converter)

**Test cases:**
1. Returns `loading: true`, `heist: null`, `notFound: false` before subscription resolves
2. Returns `heist` and `loading: false` once snapshot emits with `exists: true`
3. Sets `notFound: true` and `loading: false` when snapshot emits with `exists: false`
4. Sets `error` and `loading: false` when `onSnapshot` emits an error
5. Calls unsubscribe on unmount

---

### 13. `tests/components/HeistDetail.test.tsx`

**Mocks:**
```typescript
vi.mock('@/lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
}))
vi.mock('@/context/AuthContext', () => ({ useUser: vi.fn() }))
vi.mock('next/navigation', () => ({ notFound: vi.fn() }))
vi.mock('@/hooks/useHeist', () => ({ useHeist: vi.fn() }))
```

Mock `useHeist` at the hook level — avoids re-testing Firestore subscription mechanics.

**Test cases:**
1. Renders title, description, creator codename, assignee codename when heist is assigned
2. Renders assignment UI (search input) when heist has no assignee
3. Does NOT render the search input when heist has an assignee
4. Calls `notFound()` when `useHeist` returns `notFound: true`
5. Renders `HeistDetailSkeleton` while loading (mock `useHeist` returning `loading: true`)
6. Typing in assignee field triggers debounced `getDocs` call
7. Current user's uid does NOT appear in dropdown results
8. Selecting a user shows their codename + Confirm Assignment button
9. Clicking Confirm Assignment calls `updateDoc` with correct fields
10. Confirm button is disabled while `confirming`
11. On `updateDoc` failure, error message shown and pending selection preserved
12. Renders error state when `useHeist` returns an error

**Debounce tests:** use `vi.useFakeTimers()` / `vi.runAllTimersAsync()`

---

### 14. `tests/components/HeistCountdown.test.tsx`

**Test cases:**
1. Renders digit blocks (D / H / M / S) when deadline is in the future
2. Renders "EXPIRED" when deadline is in the past
3. Updates the countdown after 1 second passes (`vi.useFakeTimers`, `vi.advanceTimersByTime(1000)`)
4. Transitions to "EXPIRED" when deadline passes while component is mounted
5. Clears the interval on unmount (no memory leak — check interval is cleared)

---

### 15. `tests/components/HeistDetailSkeleton.test.tsx`

Single smoke test: renders without error.

---

## Implementation Order (TDD)

1. Write `tests/hooks/useHeist.test.ts` — confirm tests fail
2. Implement `hooks/useHeist.ts` — tests pass
3. Write `tests/components/HeistCountdown.test.tsx` — confirm fail
4. Implement `components/HeistCountdown/` (tsx + css + index) — tests pass
5. Write `tests/components/HeistDetailSkeleton.test.tsx` — confirm fail
6. Implement `components/HeistDetailSkeleton/` (tsx + css + index) — tests pass
7. Write `tests/components/HeistDetail.test.tsx` — confirm fail
8. Implement `components/HeistDetail/` (tsx + css + index) — tests pass
9. Update `app/(dashboard)/heists/[id]/page.tsx`
10. `npx vitest run` — all tests pass
11. `npm run build` — no type errors

---

## Verification

```bash
npx vitest run tests/hooks/useHeist.test.ts
npx vitest run tests/components/HeistCountdown.test.tsx
npx vitest run tests/components/HeistDetailSkeleton.test.tsx
npx vitest run tests/components/HeistDetail.test.tsx
npm run build
```

Manual: `npm run dev` → sign in → navigate to `/heists` → click a heist card → verify full details, countdown ticking, skeleton on load, assignment UI for unassigned heists → confirm assignment → verify UI switches to static text → navigate to `/heists/nonexistent` → verify 404.
