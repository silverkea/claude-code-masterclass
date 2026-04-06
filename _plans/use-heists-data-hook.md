# Plan: useHeists Data Hook

## Context

The heists dashboard page (`app/(dashboard)/heists/page.tsx`) is currently a stub with three empty sections. This plan implements the `useHeists` hook that queries the Firestore `heists` collection in real time, and wires it into the page to display heist titles across the three sections.

The hook accepts a mode (`active` | `assigned` | `expired`) and returns `{ heists, loading, error }`. The page calls it three times — once per section.

---

## TDD Approach

Per project convention: write tests first, confirm they fail, then implement.

---

## Step 1 — Write tests (`tests/hooks/useHeists.test.ts`)

Create a new file. Use `renderHook` from `@testing-library/react`.

**Mocks needed** (same pattern as `CreateHeistForm.test.tsx`):

```ts
vi.mock('@/lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: { fromDate: vi.fn((d: Date) => d) },
}))
vi.mock('@/context/AuthContext', () => ({ useUser: vi.fn() }))
vi.mock('@/types/firestore/heist', () => ({
  heistConverter: {},
  COLLECTIONS: { HEISTS: 'heists' },
}))
```

**Test cases:**

1. Returns `loading: true` and empty array on initial render (before `onSnapshot` calls back)
2. Returns heist documents and `loading: false` once `onSnapshot` emits a snapshot
3. Returns `error` state and `loading: false` when `onSnapshot` calls the error handler
4. Returns `error` state and empty array when called in `active` mode with no authenticated user
5. Returns `error` state and empty array when called in `assigned` mode with no authenticated user
6. In `expired` mode — calls `orderBy('deadline', 'desc')` and `limit(50)`
7. Calls the unsubscribe function returned by `onSnapshot` when the component unmounts
8. Re-subscribes (new `onSnapshot` call) when mode changes between renders

**`onSnapshot` mock pattern:**

```ts
// Simulate immediate snapshot emission:
mockOnSnapshot.mockImplementation((_q, onNext) => {
  onNext({ docs: [{ data: () => mockHeist }] })
  return vi.fn() // unsubscribe
})

// Simulate error:
mockOnSnapshot.mockImplementation((_q, _onNext, onError) => {
  onError(new Error('Firestore error'))
  return vi.fn()
})

// Simulate no callback yet (loading state):
mockOnSnapshot.mockImplementation(() => vi.fn()) // never calls back
```

---

## Step 2 — Run tests and confirm they fail

```bash
npx vitest run tests/hooks/useHeists.test.ts
```

---

## Step 3 — Create the hook (`hooks/useHeists.ts`)

New file. No barrel export needed — single file is sufficient.

```ts
import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/context/AuthContext'
import { Heist, heistConverter, COLLECTIONS } from '@/types/firestore/heist'

export type HeistMode = 'active' | 'assigned' | 'expired'

export interface UseHeistsResult {
  heists: Heist[]
  loading: boolean
  error: Error | null
}

export function useHeists(mode: HeistMode): UseHeistsResult {
  const { user } = useUser()
  const [heists, setHeists] = useState<Heist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (mode !== 'expired' && !user) {
      setHeists([])
      setLoading(false)
      setError(new Error('User not authenticated'))
      return
    }

    setLoading(true)
    setError(null)

    const now = Timestamp.fromDate(new Date())
    const ref = collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)

    const q =
      mode === 'active'
        ? query(ref, where('assignedTo', '==', user!.uid), where('deadline', '>', now))
        : mode === 'assigned'
          ? query(ref, where('createdBy', '==', user!.uid), where('deadline', '>', now))
          : query(ref, where('deadline', '<', now), orderBy('deadline', 'desc'), limit(50))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setHeists(snapshot.docs.map((doc) => doc.data()))
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [mode, user?.uid])

  return { heists, loading, error }
}
```

**Key notes:**
- `expired` uses `where('deadline', '<', now)` — Firestore inequality filters already exclude `null` deadline documents, satisfying the spec requirement
- `active`/`assigned` queries combine an equality filter with an inequality filter — Firestore will need composite indexes for these (noted below)
- The effect re-runs when `mode` or `user?.uid` changes, ensuring a fresh subscription

---

## Step 4 — Update the heists page (`app/(dashboard)/heists/page.tsx`)

Add `'use client'` (required to call hooks). Wire up three hook calls. Show titles only.

```tsx
'use client'

import { useHeists } from '@/hooks/useHeists'

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading, error: activeError } = useHeists('active')
  const { heists: assignedHeists, loading: assignedLoading, error: assignedError } = useHeists('assigned')
  const { heists: expiredHeists, loading: expiredLoading, error: expiredError } = useHeists('expired')

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        {activeLoading && <p>Loading…</p>}
        {activeError && <p>Could not load active heists.</p>}
        {activeHeists.map((h) => <p key={h.id}>{h.title}</p>)}
      </div>
      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        {assignedLoading && <p>Loading…</p>}
        {assignedError && <p>Could not load assigned heists.</p>}
        {assignedHeists.map((h) => <p key={h.id}>{h.title}</p>)}
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expiredLoading && <p>Loading…</p>}
        {expiredError && <p>Could not load expired heists.</p>}
        {expiredHeists.map((h) => <p key={h.id}>{h.title}</p>)}
      </div>
    </div>
  )
}
```

---

## Step 5 — Run all tests green

```bash
npx vitest run
```

---

## Critical files

| File | Action |
|------|--------|
| `hooks/useHeists.ts` | Create |
| `tests/hooks/useHeists.test.ts` | Create |
| `app/(dashboard)/heists/page.tsx` | Modify (add `'use client'`, wire hook) |

**Referenced without modification:**
- `types/firestore/heist.ts` — provides `Heist`, `heistConverter`, `COLLECTIONS`
- `context/AuthContext.tsx` — provides `useUser()`
- `lib/firebase.ts` — provides `db`

---

## Firestore indexes note

The `active` and `assigned` queries combine an equality filter with an inequality filter on different fields — Firestore requires composite indexes for these. They will fail in production until the following indexes are created in the Firebase console or `firestore.indexes.json`:

- Collection: `heists` | Fields: `assignedTo ASC, deadline ASC`
- Collection: `heists` | Fields: `createdBy ASC, deadline ASC`

The `expired` query (`deadline` only) uses a single-field index that Firestore creates automatically.

---

## Verification

1. `npx vitest run tests/hooks/useHeists.test.ts` — all 8 test cases pass
2. `npx vitest run` — full suite stays green
3. `npm run build` — no TypeScript errors
4. Manually visit `/heists` in the browser with seeded Firestore data to confirm titles render in each section and update in real time
