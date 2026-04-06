# Plan: Auth State Management

## Context
The app has Firebase Auth configured but no way to access the current user in components. We need a global, realtime auth listener exposed via a `useUser` hook so any page or component can read auth state without prop drilling. This also unblocks the splash page redirect and Navbar user display.

---

## Files to Create

### `context/AuthContext.tsx` (new)
- Mark `"use client"` at the top
- Create a `AuthContext` with `createContext<{ user: User | null, loading: boolean }>`
- `AuthProvider` component: uses `useState` for `user` and `loading`, sets up `onAuthStateChanged(auth, ...)` in a `useEffect`, unsubscribes on unmount
- `useUser` hook: calls `useContext(AuthContext)`, throws a descriptive error if used outside provider
- Imports `auth` from `@/lib/firebase`

---

## Files to Modify

### `app/layout.tsx`
- Import `AuthProvider` from `@/context/AuthContext`
- Wrap `{children}` with `<AuthProvider>` inside `<body>`
- Layout stays a server component — `AuthProvider` is the client boundary

### `app/(public)/page.tsx`
- Add `"use client"` directive (currently a server component, needs hooks)
- Import `useUser` from `@/context/AuthContext`
- Import `useRouter` from `next/navigation`
- In a `useEffect`, once `loading` is false: redirect to `/heists` if `user` is set, `/login` if not
- Render existing splash content while loading resolves

### `components/Navbar/Navbar.tsx`
- Add `"use client"` directive
- Import `useUser` from `@/context/AuthContext`
- Import `Avatar` from `@/components/Avatar`
- Import `Skeleton` from `@/components/Skeleton`
- When `loading` is true: render `<Skeleton>` in the user slot
- When `loading` is false and `user` is set: render `<Avatar name={user.displayName ?? user.email ?? ''} />`
- When `loading` is false and `user` is null: render nothing in the user slot

---

## Files to Create (Tests)

### `tests/components/AuthContext.test.tsx` (new)
Test cases (using Vitest + React Testing Library, matching existing patterns):
- `useUser` throws a descriptive error when used outside `AuthProvider`
- `useUser` returns `{ user: null, loading: false }` after auth resolves to no user (mock `onAuthStateChanged` to immediately call back with `null`)
- `useUser` returns `{ user: mockUser, loading: false }` after auth resolves to a user (mock `onAuthStateChanged` to call back with a mock user object)
- `loading` is `true` before the first `onAuthStateChanged` callback fires (mock `onAuthStateChanged` to never call back)

Mock strategy: `vi.mock('@/lib/firebase', ...)` to control `onAuthStateChanged` behaviour in tests.

---

## Verification
1. Run `npx vitest run` — all tests pass including new AuthContext tests
2. Run `npm run dev` and open the app — splash page redirects to `/login` when not signed in
3. Navbar renders no user slot when logged out, shows Avatar when logged in

## Out of Scope
These are explicitly NOT included:
- Login/signup/logout flow implementation
- Firebase auth integration in LoginForm/SignupForm
- Logout button or user menu
- DO not use the hook anywhere in the application yet.
