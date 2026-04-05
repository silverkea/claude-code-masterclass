# Spec for Signup Firebase Auth

branch: claude/feature/signup-firebase-auth
figma_component (if used): N/A

## User Story

As a visitor, I want to create an account using my email and password so that I can access the app as a registered user.

## Trigger

User submits the signup form.

## Summary

Wire the signup form to a real authentication backend. When a visitor submits the form, an account is created for them. They are given a randomly generated display name (a heist-themed codename) rather than exposing their email as their identity. On success, they are taken to the dashboard. On failure, a clear error message is shown.

## Functional Requirements

- Submitting the signup form with an email and password creates a new account
- A randomly generated heist-themed codename is assigned as the new user's display name — it is composed of three words joined together (e.g. "SwiftFoxVault")
- The codename is the user's identity within the app — their email is never used as a display name or stored alongside their profile
- The new user's account identifier and codename are stored so the app can retrieve them later
- On successful signup, the user is taken to the dashboard
- If signup fails because the email is already registered, a clear and specific error message is shown in the form
- If signup fails for any other reason, a generic error message is shown
- The submit button is disabled while the signup request is in progress to prevent duplicate submissions
- The codename generator is a standalone utility — it is not embedded directly in the form

## Success Criteria

- A visitor can complete the signup form and land on the dashboard as a logged-in user
- The logged-in user's display name is a heist-themed codename, not their email address
- A visitor who tries to sign up with an already-registered email sees a specific, helpful error message
- The submit button cannot be clicked twice while a signup is in progress

## Edge Cases & Constraints

- If the account is created but the display name or profile storage step fails, the app should not crash — the error should be caught gracefully
- The codename generator must always produce a non-empty result, even if its word lists are misconfigured
- Weak or invalid passwords are rejected by the authentication service and surfaced to the user

## Acceptance Criteria

- Given a valid email and password, when the user submits the form, an account is created and they are redirected to the dashboard
- Given the submitted email is already registered, when the user submits the form, an error message specific to that situation is shown
- Given signup is in progress, the submit button is disabled
- Given signup succeeds, the user's display name is a non-empty PascalCase codename composed of exactly three words
- The user's email is not stored as part of their visible profile

## Open Questions

None. *(Resolved: successful signup redirects to the dashboard.)*

## Testing Guidelines

Create test files in ./tests for the new feature, covering the following cases:

- Submitting the form with valid credentials creates an account and redirects to the dashboard
- The user's display name is set to a generated codename after signup
- A profile record is saved with the user's identifier and codename — not their email
- An error message is shown when signup fails due to an already-registered email
- The submit button is disabled while signup is in progress
- The codename generator always returns a non-empty string composed of exactly three capitalised words
- The codename generator can return different values on successive calls
