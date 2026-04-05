# Spec for Auth Forms

branch: claude/feature/auth-forms
figma_component (if used): N/A

## User Story

As a visitor, I want to log in or create an account using my email and password so that I can access the app.

## Trigger

User navigates to the login or signup page.

## Summary

Add functional authentication forms to the login and signup pages. Each form includes email and password fields, a toggle to show or hide the password, and a submit button. Users can navigate easily between the two forms via a link.

## Functional Requirements

- The login page renders a form with an email field, a password field, and a "Log In" button
- The signup page renders a form with an email field, a password field, and a "Sign Up" button
- The password field has a show/hide toggle icon — clicking it switches between showing and hiding the password characters
- Each form has a link to switch to the other form (login → signup, signup → login)
- On form submission, the entered values are captured (no navigation or page reload)
- Forms use existing project styles and theme tokens

## Figma Design Reference (only if referenced)

N/A

## Success Criteria

- A visitor can view and fill in the login form and submit it
- A visitor can view and fill in the signup form and submit it
- A visitor can toggle the password field between hidden and visible without losing the entered value
- A visitor can switch between the login and signup pages via the navigation link

## Edge Cases & Constraints

- User submits with empty fields — no validation required for this feature, just capture whatever is entered
- Rapidly toggling password visibility should not affect the field value
- Both forms are independent — no shared state between pages

## Acceptance Criteria

- Login page renders a form with email, password, and submit fields
- Signup page renders a form with email, password, and submit fields
- Password field has a visible show/hide toggle icon
- Toggling the icon switches the input between masked and unmasked characters
- Toggling does not clear or change the entered password value
- Each form has a link that navigates to the other form's page

## Open Questions

None.

## Testing Guidelines

Create a test file in ./tests for the new feature, covering the following cases:

- Login form renders email input, password input, and submit button
- Signup form renders email input, password input, and submit button
- Password toggle switches the input between masked and unmasked
- Toggling the password visibility does not clear the field value
