# Spec for Auth Forms

branch: claude/feature/auth-forms
figma_component (if used): N/A

## Summary

Add functional authentication forms to the `/login` and `/signup` pages. Each form includes email and password fields, a toggle to show/hide the password, and a submit button. On submission, form data is logged to the console. Users can navigate easily between the two forms via a link.

## Functional Requirements

- The `/login` page renders a login form with:
  - An email input field
  - A password input field with a show/hide toggle icon
  - A "Log In" submit button
  - A link to the `/signup` page ("Don't have an account? Sign up")
- The `/signup` page renders a signup form with:
  - An email input field
  - A password input field with a show/hide toggle icon
  - A "Sign Up" submit button
  - A link to the `/login` page ("Already have an account? Log in")
- Clicking the show/hide icon toggles the password field between `type="password"` and `type="text"`
- On form submission, log the email and password values to the browser console
- Form submission does not navigate away or reload the page

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- User submits with empty fields — no validation required for now, just log whatever is entered
- User rapidly toggles password visibility — should not affect field value
- Both forms should be independently functional (no shared state between pages)

## Acceptance Criteria

- `/login` renders a form with email, password, and submit fields
- `/signup` renders a form with email, password, and submit fields
- Password field has a visible show/hide toggle icon
- Toggling the icon switches the input between masked and unmasked
- Submitting either form logs `{ email, password }` to the console
- Each form has a link that navigates to the other form's page
- Forms use existing project styles (CSS Modules, `.form-title`, theme tokens)

## Open Questions

- Should the show/hide icon use an existing icon from the `lucide-react` package already in the project? Yes
- Should the "switch form" link be styled as a plain anchor or a button? anchor

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Login form renders email input, password input, and submit button
- Signup form renders email input, password input, and submit button
- Password toggle changes input type between "password" and "text"
- Clicking the toggle does not clear the password field value
