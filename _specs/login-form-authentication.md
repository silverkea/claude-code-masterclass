# Spec for Login Form Authentication

branch: claude/feature/login-form-authentication
figma_component (if used): N/A

## User Story

As a registered user, I want to log in with my email and password so that I can access my account.

## Trigger

User submits the login form.

## Summary

Wire the existing login form to the authentication backend. When a registered user submits valid credentials, they are signed in and an inline success message is shown within the form. The form fields clear on success. If credentials are invalid or the request fails, a clear error message is shown inline. The route protection layer (see `route-protection.md`) automatically redirects the newly-signed-in user to the dashboard once auth state updates.

## Functional Requirements

- Submitting the login form with a valid email and password signs the user in
- On successful login, an inline success message is shown within the form (e.g. "You're logged in!")
- On successful login, both the email and password fields are cleared
- If the credentials are incorrect, a specific error message is shown inline (e.g. "Incorrect email or password")
- If login fails for any other reason (e.g. a network or service issue), a generic error message is shown inline
- The submit button is disabled and shows a loading indicator while the login request is in progress, to prevent duplicate submissions
- After a successful login, the route protection layer automatically redirects the user to the dashboard — no explicit redirect is performed by the login form itself

## Figma Design Reference (only if referenced)

N/A

## Success Criteria

- A registered user can submit their credentials and see a success message within the form
- The email and password fields are empty after a successful login
- A user who enters incorrect credentials sees a specific, helpful error message
- A user cannot submit the form twice while a login is in progress

## Non-Functional Requirements

- The loading state must appear immediately on submit — no perceptible delay before the button disables
- Error and success messages must be clearly visible within the form without requiring the user to scroll
- The form must be consistent in behaviour and visual style with the existing signup form

## Security Considerations

- Failed login attempts must not reveal whether the email address is registered — the error message should be the same regardless of whether the email exists or the password is wrong
- No credentials or authentication tokens should be logged
- OWASP risk: credential stuffing — the authentication service should be the sole gatekeeper; no client-side credential logic

## Observability

- Login failures should be logged internally for diagnostics (without logging credentials)
- The user-facing error messages must not expose internal error details, service names, or stack traces

## Edge Cases & Constraints

- If both fields are empty on submit, the authentication service will reject the request — the generic error message covers this case; no separate client-side validation is required for this feature
- If the login request succeeds but the auth state takes a moment to propagate, the success message should appear immediately without waiting for the global auth state to update
- Rapidly clicking the submit button before it disables must not trigger multiple login attempts

## Acceptance Criteria

- Given valid credentials, when the user submits the login form, a success message is shown inline and both fields are cleared
- Given invalid credentials, when the user submits the login form, a specific error message is shown inline
- Given a non-credential failure (e.g. service unavailable), a generic error message is shown inline
- Given a login is in progress, the submit button is disabled and shows a loading indicator
- Given a successful login, the user is redirected to the dashboard by the route protection layer

## Related Specs

- `auth-forms.md` — describes the login form UI that this feature wires up. That spec should be updated to note that the form is now connected to real authentication.

## Open Questions

None.

## Testing Guidelines

Create a test file in ./tests for the new feature, covering the following cases:

- Submitting with valid credentials signs the user in and shows a success message
- Both fields are cleared after a successful login
- Submitting with invalid credentials shows a specific error message
- Submitting when the service fails shows a generic error message
- The submit button is disabled and shows a loading indicator while login is in progress
