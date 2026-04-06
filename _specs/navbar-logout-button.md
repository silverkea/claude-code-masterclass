# Spec for Navbar Logout Button

branch: claude/feature/navbar-logout-button
figma_component: LogoutButton — https://www.figma.com/design/vbXA4hxqLLquum7NAaYEPq/Pocket-Heist?node-id=57-18&m=dev

## User Story

As a logged-in user, I want a logout button in the navbar so that I can end my session and return to a signed-out state.

## Trigger

User clicks the logout button in the navbar.

## Summary

Add a logout button to the right side of the navbar that is only visible when a user is signed in. Clicking it signs the user out. The button shows a loading state while the sign-out is in progress and disables itself to prevent duplicate actions. No redirect occurs on logout — that behaviour is out of scope for this feature.

## Functional Requirements

- The logout button is displayed in the navbar, right-aligned
- The button is only visible when a user is signed in — it must not appear to guests or unauthenticated visitors
- Clicking the button initiates the sign-out process
- While sign-out is in progress, the button is disabled and shows a loading indicator so the user knows the action is being handled
- If sign-out fails, the button is silently re-enabled — no error message is shown to the user
- No redirect occurs after logout — the navbar and page simply update to reflect the signed-out state

## Figma Design Reference

- File: Pocket Heist — https://www.figma.com/design/vbXA4hxqLLquum7NAaYEPq/Pocket-Heist?node-id=57-18&m=dev
- Component name: LogoutButton
- Key visual constraints:
  - Outlined button style: transparent fill, white border, ~10px border radius
  - White "Logout" label, centred, 16px regular weight
  - Fixed size: approximately 127×38px
  - Positioned right of centre in the navbar, to the left of the "Create New Heist" button
  - App title "Pocket Heist" is left-aligned; logout and create actions are right-aligned as a group
  - No icon

## Success Criteria

- A logged-in user can see the logout button in the top-right area of the navbar
- Clicking the button signs the user out and the navbar updates to reflect the signed-out state
- The button is visibly disabled and shows a loading indicator while sign-out is in progress
- A guest or unauthenticated visitor sees no logout button in the navbar

## Non-Functional Requirements

- The button must respond to a click within normal interactive latency — no perceptible delay before the loading state appears
- The button must be accessible: keyboard focusable, with a clear label, and disabled state communicated to assistive technologies
- The visual style must match the Figma design reference and be consistent with existing navbar elements

## Security Considerations

- Signing out must fully terminate the user's session — not just update local UI state
- The button must not be rendered or accessible in the DOM when the user is signed out, to prevent any client-side manipulation exposing the action
- No PII or session data is logged as part of the sign-out action

## Observability

- Sign-out failures should be logged internally for diagnostics, even though no error is surfaced to the user
- No user-facing error message is shown on failure — the button is silently re-enabled

## Edge Cases & Constraints

- If sign-out fails, the user remains signed in — the button re-enables and the UI remains unchanged
- The button must not appear briefly during the auth loading state before sign-in status is confirmed — it should only render once auth state is known
- Rapidly clicking the button before it disables must not trigger multiple sign-out attempts

## Acceptance Criteria

- Given the user is signed in, the logout button is visible and right-aligned in the navbar
- Given the user is signed out, no logout button is present in the navbar
- Given the user clicks logout, the button becomes disabled and shows a loading indicator immediately
- Given sign-out completes successfully, the navbar updates to the signed-out state with no redirect
- Given sign-out fails, the button is re-enabled silently and the user remains signed in
- Given the page is loading and auth state is not yet known, the logout button is not shown

## Related Specs

- `auth-state-management.md` — this feature extends the navbar behaviour described there (displaying user identity). The auth state management spec should be updated to reference the logout button as part of the navbar's signed-in state.

## Open Questions

None.

## Testing Guidelines

Create a test file in ./tests for the new feature, covering the following cases:

- Logout button is rendered when a user is signed in
- Logout button is not rendered when no user is signed in
- Logout button is not rendered while auth state is still loading
- Clicking the button disables it and triggers the sign-out action
- Button is re-enabled if sign-out fails
- Button is not rendered after successful sign-out
