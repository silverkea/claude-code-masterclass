# Spec for Auth State Management

branch: claude/feature/auth-state-management
figma_component (if used): N/A

## User Story

As a logged-in user, I want the app to know I'm signed in as I move between pages so that I don't have to keep authenticating and see the right content for my account.

## Trigger

User opens or navigates within the app.

## Summary

Make the current user's authentication state available across the entire app in real time. Any page or component can know whether a user is logged in, who they are, and whether that information is still loading. The navbar reflects the logged-in user's identity. Auth-based page redirects are handled by the route protection layer — see `route-protection.md`.

## Functional Requirements

- The app tracks whether a user is logged in across all pages without requiring each page to independently check
- Any page or component can access the current logged-in user and whether auth state has finished loading
- While the auth state is being determined on load, a loading indicator is shown in place of user-specific content
- The navbar displays the logged-in user's name or identifier when a user is signed in, and shows nothing user-specific when signed out
- When auth state changes (e.g. user signs in or out), all affected parts of the app update automatically

## Success Criteria

- The navbar shows the logged-in user's name or identifier while signed in
- The navbar shows nothing user-specific while signed out
- A brief loading state is shown while the app determines auth status on first load

## Edge Cases & Constraints

- Auth state is not immediately known on first load — user-specific UI must not be rendered until it is resolved to avoid incorrect content flashing
- Signing in or out must update all relevant parts of the app without requiring a page reload
- Memory must not leak if the user navigates away before auth state resolves

## Acceptance Criteria

- Given auth state is still loading, user-specific UI shows a placeholder rather than incorrect content
- Given the user is signed in, the navbar displays their name or identifier
- Given the user is signed out, the navbar displays no user-specific content
- Accessing the auth state outside of the auth provider throws a descriptive error

## Open Questions

- Should the loading placeholder in the navbar be a skeleton element or simply empty space? **Decision: skeleton/placeholder**

## Testing Guidelines

Create a test file in ./tests for the new feature, covering the following cases:

- Accessing auth state outside the provider throws a descriptive error
- Auth state returns no user when signed out
- Auth state returns the correct user when signed in
- Loading state is true before auth state has been resolved
