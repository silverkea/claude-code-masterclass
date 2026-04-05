# Plan: Create Heist Form

## Context

The `/heists/create` page is a stub. This plan implements the full form for creating a new heist document in Firestore — with title, description, and optional assignee (debounced server-side search), following the existing `CreateHeistInput` type contract.

Spec: `_specs/create-heist-form.md`

---

## Key Facts

- **Stub page**: `app/(dashboard)/heists/create/page.tsx` — just a title, no form
- **Auth**: `useUser()` from `context/AuthContext.tsx` returns `{ user: User | null, loading: boolean }`. Dashboard layout guarantees `user` is non-null by the time the page renders
- **Validation**: React Hook Form + Zod + `@hookform/resolvers` — new pinned dependencies to install
- **Form pattern**: React Hook Form's `useForm` replaces manual useState for fields; `handleSubmit` wraps submit; per-field Zod errors displayed inline; `isSubmitting` from RHF replaces manual submitting state
- **Types**: `CreateHeistInput` in `types/firestore/heist.ts` — `createdAt: FieldValue`, `deadline: Timestamp`, `finalStatus: null`
- **Collections**: `COLLECTIONS.HEISTS` exists; `COLLECTIONS.USERS` needs to be added to `types/firestore/index.ts`
- **Users shape** (from `AuthForm` signup): `{ id: string, codename: string }` written to `"users"` collection
- **No existing Firestore query utilities** — write inline in component
- **No debounce library** — implement with `useEffect` cleanup (`setTimeout`/`clearTimeout`)
- **Testing**: `vi.mock` for Firebase/navigation/context, `waitFor` for async, `vi.useFakeTimers` for debounce

---

## Files to Create / Modify

### 1. `types/firestore/index.ts` — add USERS collection constant

```typescript
export const COLLECTIONS = {
  HEISTS: 'heists',
  USERS: 'users',
} as const
```

---

### 0. Install dependencies

```bash
npm install react-hook-form@<latest> zod@<latest> @hookform/resolvers@<latest>
```

Pin exact versions in `package.json` per CLAUDE.md.

---

### 2. `components/CreateHeistForm/CreateHeistForm.tsx` — new client component

**Zod schema:**
```typescript
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})
type FormValues = z.infer<typeof schema>
```

**React Hook Form setup:**
```typescript
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
  resolver: zodResolver(schema),
})
```

**Additional state (assignee is outside the RHF schema):**
```
assigneeQuery: string
assignee: { id: string, codename: string } | null
searchResults: { id: string, codename: string }[]
searching: boolean
submitError: string | null
```

**Assignee search (debounced, 300ms):**
- `useEffect` on `assigneeQuery` — clears previous timeout, sets new one
- On fire: if empty, clear results; else query Firestore users collection
- Firestore query: prefix match on codename (`>=` searchTerm, `<=` searchTerm + `\uf8ff`), `orderBy('codename')`, `limit(50)`
- After fetch: filter out current user's uid client-side (avoids composite index requirement)

**Submit handler** (passed to RHF's `handleSubmit` — only called when Zod validation passes):
- Build and write `CreateHeistInput` via `addDoc`
- `isSubmitting` from RHF handles button disabled state automatically
- On success: `router.push('/heists')`
- On failure: set `submitError`; form values preserved (RHF does not reset on error)

**Button label:** "Create Heist" → "Submitting…" (+ `disabled`) while `isSubmitting`

**Error display:**
- Per-field: inline below each input from `errors.title.message` / `errors.description.message`
- Submission error: inline below the button from `submitError`

---

### 3. `components/CreateHeistForm/CreateHeistForm.module.css` — styles

Follow `AuthForm.module.css` pattern with `@reference "../../app/globals.css"`. Classes needed: `.form`, `.field`, `.label`, `.input`, `.assigneeWrap`, `.dropdown`, `.dropdownItem`, `.selectedAssignee`, `.clearBtn`, `.error`

---

### 4. `components/CreateHeistForm/index.ts` — barrel export

```typescript
export { default } from './CreateHeistForm'
```

---

### 5. `app/(dashboard)/heists/create/page.tsx` — render the form

```typescript
import CreateHeistForm from '@/components/CreateHeistForm'

export default function CreateHeistPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <CreateHeistForm />
      </div>
    </div>
  )
}
```

---

### 6. `tests/components/CreateHeistForm.test.tsx` — TDD tests

**Mocks needed:**
```typescript
vi.mock('@/lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(),
  Timestamp: { fromDate: vi.fn((d) => d) },
}))
vi.mock('@/context/AuthContext', () => ({ useUser: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: vi.fn() }))
```

**Test cases:**
1. Renders title input, description input, assignee search field, and "Create Heist" button
2. Submitting with empty title is blocked (button remains enabled but form doesn't call `addDoc`)
3. Submitting with empty description is blocked
4. Submit button shows "Submitting…" and is disabled while `addDoc` is pending
5. On successful save, `router.push('/heists')` is called
6. On save failure, error message is shown and title/description values are preserved
7. Typing in assignee field (after fake timer advance past debounce) calls Firestore query
8. Selecting a result from the dropdown sets the assignee display and clears the search input
9. Clearing the selected assignee resets it; form submits without assignee (`addDoc` called with `assignedTo: null`)

**Debounce testing:** `vi.useFakeTimers()` / `vi.runAllTimers()` / `vi.useRealTimers()`

---

## Implementation Order (TDD)

1. Install `react-hook-form`, `zod`, `@hookform/resolvers` as pinned versions
2. Add `USERS` to `COLLECTIONS` in `types/firestore/index.ts`
3. Write `tests/components/CreateHeistForm.test.tsx` — all tests, confirm they fail
4. Create `components/CreateHeistForm/CreateHeistForm.tsx` — implement component
4. Create `components/CreateHeistForm/CreateHeistForm.module.css`
5. Create `components/CreateHeistForm/index.ts`
6. Update `app/(dashboard)/heists/create/page.tsx`
7. Run tests — all pass
8. Run `npm run build` — no type errors

---

## Verification

```bash
npx vitest run tests/components/CreateHeistForm.test.tsx
npm run build
```

Manual: `npm run dev` → sign in → navigate to `/heists/create` → fill form → submit → confirm redirect to `/heists` and document appears in Firebase console.
