# Spec for Route Protection

branch: claude/feature/route-protection
figma_component (if used): N/A

## User Story

As a user, I want the app to automatically send me to the right place based on whether I'm signed in, so that I never accidentally land on a page that isn't meant for me.

## Trigger

User navigates to any page within the app — whether by typing a URL directly, following a link, or being redirected from another part of the app.

## Summary

Protect the two route groups with auth-aware guards at the layout level. Pages in the dashboard area are only accessible to signed-in users — anyone else is sent to the home page. Pages in the public area (login, signup, home) are only accessible to signed-out users — anyone already signed in is sent to the dashboard. While the app is determining whether a user is signed in, a branded loading screen is shown in place of the page content so users never see a flash of the wrong page. The preview page is exempt and remains accessible to everyone.

## Functional Requirements

- Any signed-out user who navigates to a dashboard page is immediately redirected to the home page
- Any signed-in user who navigates to a public page (login, signup, or home) is immediately redirected to the dashboard
- The `/preview` page is exempt from all auth-based redirects and remains accessible to both signed-in and signed-out users
- While the app is determining the user's auth status, the page content is not shown — a loading screen is displayed in its place
- Once auth status is known, the loading screen disappears: the user either sees the page they requested or is redirected
- Both the public and dashboard route groups show the same loading screen design during the auth check

## Loading Screen Design

- Three dots displayed in a horizontal row, pulsing in sequence (left to right, repeating)
- Dots are a generous size — large enough to be clearly visible without dominating the screen
- Dots use the brand's primary purple and secondary pink colours
- The loading screen is centred on the page, vertically and horizontally
- The loading screen has no text — the animation alone communicates that something is happening

## Figma Design Reference (only if referenced)

N/A

## Success Criteria

- A signed-out user who manually navigates to a dashboard URL lands on the home page, not the dashboard
- A signed-in user who navigates to `/login` or `/signup` is taken directly to the dashboard without seeing the form
- The loading screen appears briefly on first load and disappears once auth status is known
- The `/preview` page loads normally regardless of whether the user is signed in or out

## Out of Scope

- The `/preview` page is not protected and requires no auth-related changes
- Custom error pages or "access denied" messages — users are simply redirected, not shown an error
- Any changes to how the auth state itself is tracked or stored — this feature consumes the existing auth state, it does not change how it works

## Non-Functional Requirements

- The loading screen must appear immediately — there must be no flash of the protected page content before the redirect happens
- The redirect must feel instantaneous to the user — no visible delay between the loading screen disappearing and the destination page appearing
- The loading animation must be smooth and consistent across modern evergreen browsers

## Security Considerations

- Route protection at the layout level is a user experience safeguard, not a security boundary — actual data access control must be enforced server-side and via database security rules
- The loading screen must never reveal whether a protected page exists or what its content is
- No authentication tokens or session data should be exposed in redirect URLs or error states

## Observability

- Standard error handling applies — if the auth state check fails unexpectedly, the app should degrade gracefully rather than showing a broken loading state indefinitely
- No specific logging requirements beyond what the auth state management layer already provides

## Edge Cases & Constraints

- If auth state takes an unusually long time to resolve, the loading screen must continue showing rather than defaulting to showing or hiding the page — the resolution must complete before anything is shown
- Navigating directly to a dashboard URL while signed out must redirect cleanly, with no flash of dashboard content
- Navigating directly to a public URL while signed in must redirect cleanly, with no flash of the public page

## Acceptance Criteria

- Given a signed-out user navigates to any dashboard page, they are redirected to the home page (`/`)
- Given a signed-in user navigates to `/login`, `/signup`, or `/` (home), they are redirected to `/heists`
- Given auth status is still loading, neither the page content nor a redirect is shown — only the loading screen
- Given auth status resolves and the user is allowed on the page, the loading screen disappears and the page is shown
- Given a user (signed in or out) navigates to `/preview`, the page loads normally with no redirect
- Given the app is fully loaded and a signed-in user signs out, navigating to a dashboard page sends them to the home page

## Open Questions

None.

## Testing Guidelines

Create test files in ./tests for the new feature, covering the following cases:

**Public layout guard:**
- Shows the loading screen while auth status is loading
- Redirects a signed-in user to `/heists`
- Renders page content for a signed-out user

**Dashboard layout guard:**
- Shows the loading screen while auth status is loading
- Redirects a signed-out user to `/`
- Renders page content for a signed-in user

**Loading screen component:**
- Renders three dots
- Dots are visible and centred on the page
