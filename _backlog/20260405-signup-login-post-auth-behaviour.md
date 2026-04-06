# Signup and Login Post-Authentication Behaviour Inconsistency

date: 2026-04-05
type: inconsistency
relates-to: signup-firebase-auth.md, login-form-authentication.md
spotted-during: login-form-authentication

## Observation

Signup and login handle post-authentication differently. After a successful signup, the user is redirected to the dashboard. After a successful login, an inline success message is shown and the user stays on the login page with no redirect. This was intentional at the time of the login spec — redirect was explicitly deferred — but the two flows are currently inconsistent.

## Why It Matters

Users who sign up land on the dashboard immediately. Users who log in see a success message but go nowhere. Once login redirect is implemented, the post-auth experience should feel the same regardless of whether the user is signing in for the first time or returning.

## Possible Resolutions

- **Align login to match signup** — implement a redirect to the dashboard on successful login (already noted as deferred in the login spec). The inline success message would no longer be needed.
- **Align signup to match login** — remove the signup redirect and show an inline success message instead, keeping the user on the page. Less likely given the signup redirect is already implemented and working.
- **Introduce a shared post-auth destination config** — define a single "after authentication" destination that both flows use, making it easy to change in one place in future. More robust but more complex.
- **Leave them different intentionally** — if the product decides signup and login should have distinct experiences (e.g. onboarding flow after signup), document that decision and close this item.

## Related Specs

- `_specs/signup-firebase-auth.md` — redirects to dashboard on success
- `_specs/login-form-authentication.md` — shows inline message, no redirect (intentionally deferred)
