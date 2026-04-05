# Spec for auth-state-management

branch: claude/feature/auth-state-management
figma_component (if used): N/A

## Summary

Add a global, realtime Firebase auth state listener that exposes the current authenticated user (or `null` if logged out) through a `useUser` hook. The hook should be available to any page or component in the app without prop drilling.

## Functional Requirements

- Create an `AuthProvider` React context provider that sets up a single `onAuthStateChanged` Firebase listener on mount and tears it down on unmount
- The provider should hold the current `User | null` value and a `loading` boolean that is `true` until the first auth state is resolved
- Create a `useUser` hook that reads from the `AuthProvider` context and returns `{ user, loading }`
- Mount `AuthProvider` in the root layout (`app/layout.tsx`) so it wraps the entire app
- Update `Navbar` to consume `useUser` — display the logged-in user's display name or email when a user is present (no login/logout actions required yet)
- Update the splash page (`app/(public)/page.tsx`) to consume `useUser` — redirect to `/heists` if a user is present, or `/login` if not, once loading is resolved

## Possible Edge Cases

- The auth state is asynchronous on first load — components must handle the `loading` state and not render user-dependent UI until it resolves
- `AuthProvider` must be a client component since it uses Firebase and React state, but `app/layout.tsx` is a server component — the provider must be extracted into its own client component file and imported into the layout
- `onAuthStateChanged` returns an unsubscribe function — it must be called on unmount to prevent memory leaks

## Acceptance Criteria

- `useUser` returns `{ user: null, loading: false }` when no user is signed in
- `useUser` returns `{ user: User, loading: false }` when a user is signed in
- `useUser` returns `{ loading: true }` before the first auth state event fires
- `AuthProvider` is mounted once at the app root and does not cause re-renders of unrelated components on auth state changes
- `Navbar` renders the user's display name or email when logged in, and nothing user-specific when logged out
- Splash page redirects correctly based on auth state once loading is complete
- Calling `useUser` outside of `AuthProvider` throws a descriptive error

## Open Questions

- Should `loading` state in `Navbar` show a skeleton/placeholder, or simply render nothing until resolved? skeleton/placeholder 

## Testing Guidelines

Create a test file in `./tests` for the new feature, covering the following cases without going too heavy:

- `useUser` throws when used outside of `AuthProvider`
- `useUser` returns `{ user: null, loading: false }` when auth state resolves to no user
- `useUser` returns `{ user: mockUser, loading: false }` when auth state resolves to a signed-in user
- `loading` is `true` before the first `onAuthStateChanged` callback fires
