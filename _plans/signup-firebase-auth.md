# Plan: Signup Firebase Auth Integration

## Context
The signup form (`AuthForm` in signup mode) currently only logs to the console. This plan wires it up to Firebase Authentication, generates a random PascalCase codename as the user's `displayName`, and writes a `users` Firestore document with `id` and `codename` (no email). On success the user is redirected to `/heists`.

---

## Files to Create

### `lib/codename.ts` (new)
- Three word lists (20+ unique words each): adjectives, animals (or nouns), verbs — thematically heist-flavoured
- `generateCodename()` function: picks one random word from each list, capitalises first letter of each, joins them — returns a non-empty PascalCase string (e.g. `SwiftBoldPenguin`)
- Guard: if any list is empty, fall back to a default word so the result is never an empty string

### `tests/lib/codename.test.ts` (new)
Using Vitest (no React Testing Library needed — pure function):
- Returns a non-empty string
- Result is composed of exactly three PascalCase words (regex: `/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/` or split by capital letters)
- Two successive calls can return different values (run several times, assert at least one differs)

---

## Files to Modify

### `components/AuthForm/AuthForm.tsx`
Add two new state values: `error: string | null` and `submitting: boolean`.

In `handleSubmit`, for signup mode only:
1. Set `submitting = true`, clear `error`
2. Call `createUserWithEmailAndPassword(auth, email, password)` — import from `firebase/auth`, use `auth` from `@/lib/firebase`
3. Generate a codename via `generateCodename()` — import from `@/lib/codename`
4. Call `updateProfile(userCredential.user, { displayName: codename })` — import `updateProfile` from `firebase/auth`
5. Call `setDoc(doc(db, 'users', userCredential.user.uid), { id: userCredential.user.uid, codename })` — import `setDoc`, `doc` from `firebase/firestore`, use `db` from `@/lib/firebase`
6. Call `router.push('/heists')` — import `useRouter` from `next/navigation`
7. On any error: set `error` to a human-readable message (handle `auth/email-already-in-use` specifically; fall back to a generic message)
8. In `finally`: set `submitting = false`

Render changes:
- Add an error message element below the password field when `error` is set, using a new `styles.error` CSS class
- Add `disabled={submitting}` to the submit button

### `components/AuthForm/AuthForm.module.css`
Add a `.error` class — check `globals.css` for a danger/error colour token first; fall back to `text-red-500` if none exists.

### `tests/components/AuthForm.test.tsx`
Add new `describe` block for signup-specific behaviour (keep existing tests untouched).

Mock strategy — same pattern as `AuthContext.test.tsx`:
- `vi.mock('@/lib/firebase', () => ({ auth: {}, db: {} }))`
- `vi.mock('firebase/auth', () => ({ createUserWithEmailAndPassword: vi.fn(), updateProfile: vi.fn() }))`
- `vi.mock('firebase/firestore', () => ({ setDoc: vi.fn(), doc: vi.fn() }))`
- `vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))`
- `vi.mock('@/lib/codename', () => ({ generateCodename: () => 'SwiftBoldPenguin' }))`

New tests:
- Calls `createUserWithEmailAndPassword` with the entered email and password on submit
- Writes a Firestore doc with `id` and `codename` after successful signup (no `email` field)
- Renders an error message when `createUserWithEmailAndPassword` rejects
- Submit button is disabled while signup is in progress

---

## Verification
1. `npx vitest run` — all tests pass including new codename and AuthForm signup tests
2. `npm run dev` — submit the signup form with a new email; confirm redirect to `/heists`, user appears in Firebase Console Auth, and `users` Firestore collection has a doc with `id` and `codename` but no email
