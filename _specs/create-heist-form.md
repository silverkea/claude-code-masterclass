# Spec for Create Heist Form

branch: claude/feature/create-heist-form
figma_component (if used): N/A

## User Story

As a logged-in user, I want to create a new heist by filling in a form so that I can plan and assign work within the app.

## Trigger

User submits the Create Heist form.

## Summary

Provide a form on the Create Heist page that allows a logged-in user to define a new heist with a title, description, and an optional assignee. On successful submission, a heist document is saved and the user is taken to the heists list. If saving fails, an error message is shown and the form retains its contents. The form uses the established heist document contract for its field shape.

## Functional Requirements

- The form presents three user-facing fields: title (required), description (required), and assignee (optional)
- Title and description must be non-empty for the form to be submittable
- The assignee field is a searchable input with a dropdown of results; as the user types, a filtered list of up to 50 matching users is fetched from the users collection, excluding the currently logged-in user
- The dropdown search is debounced — the lookup is triggered after a short pause in typing to avoid excessive requests
- Selecting a user from the dropdown sets both their user ID and codename on the heist
- The assignee field can be left blank — a heist does not require an assignee at creation
- The following fields are set automatically and are not shown to the user:
  - Creator's user ID and codename — taken from the currently logged-in user
  - Creation timestamp — the server time at the moment the document is saved (UTC)
  - Deadline — 48 hours after the creation timestamp (UTC)
  - Final status — always `null` at creation
- While the form is being saved, the submit button is disabled and its label changes to "Submitting…" to give the user clear feedback that the action is in progress
- On successful save, the user is redirected to the heists list
- If saving fails, a generic error message is shown inline on the form and the form retains all previously entered values
- The error message must not expose internal details such as database error messages or service names

## Success Criteria

- A logged-in user can fill in the title and description, leave the assignee blank, and be redirected to the heists list after submission
- A logged-in user can search for and select an assignee from the dropdown before submitting
- The submit button cannot be clicked a second time while a save is in progress
- If saving fails, the user sees an error message and their title, description, and assignee selection are preserved in the form

## Out of Scope

- Editing an existing heist — this form is for creation only
- Changing the deadline manually — it is always computed as 48 hours from creation
- Setting the final status at creation — it is always null
- Pagination of the users list — each search returns up to 50 results; browsing beyond that is not supported
- Assigning a heist to someone who is not in the users collection
- Assigning a heist to yourself — the current user is excluded from the assignee list

## Non-Functional Requirements

- Performance: the users list is fetched on demand as the user types, not on page load; requests are debounced to avoid unnecessary lookups on every keystroke; each response returns up to 50 matching results
- Accessibility: all form fields must have visible labels and be keyboard-navigable; the assignee dropdown must be usable without a mouse
- The form must not crash or behave unexpectedly if the users collection returns zero results

## Security Considerations

- Only authenticated users can access this page — unauthenticated access is already blocked by the existing route protection
- The creator's user ID and codename are sourced from the current authenticated session, not from form input — they cannot be spoofed by the user
- No sensitive data (passwords, tokens, PII beyond codename) is written to the heist document
- User-facing error messages must not expose Firestore error details, collection names, or stack traces (OWASP: information disclosure)
- This feature does not introduce new secrets or credentials

## Edge Cases & Constraints

- If the users collection returns no results (empty collection or no matches), the assignee field shows an empty dropdown and the form remains submittable without an assignee
- If the user lookup request fails, the dropdown should degrade gracefully — show no results rather than crashing the form
- Submitting with title or description empty is prevented — the form should not be submittable in this state
- If the user clears a previously selected assignee, the heist is saved without one
- Rapid typing in the assignee search field should not cause visual jank — debounce prevents excessive filtering

## Acceptance Criteria

- Given title and description are filled in and no assignee is selected, when the user submits, a heist document is created and the user lands on the heists list
- Given title and description are filled in and an assignee is selected from the dropdown, when the user submits, the heist document includes the assignee's user ID and codename
- Given the form is submitted with an empty title or description, the submission is blocked
- Given saving succeeds, the created heist document has a deadline set to 48 hours after the creation timestamp
- Given saving succeeds, the heist document's final status is null and its creator fields match the logged-in user
- Given saving fails, an error message is shown and the form fields retain their values
- Given saving is in progress, the submit button is disabled and labelled "Submitting…"
- Given the user types in the assignee search field, a debounced lookup retrieves up to 50 matching codenames from the users collection and displays them in the dropdown

## Observability

- A failed heist creation attempt should be logged with context (what went wrong) so it can be diagnosed without reproducing the issue — but the log must not include the user's input content
- Silent failures are not acceptable — if saving fails, the user must always be informed
- Standard error handling applies for all other cases

## Related Specs

- `firestore-heist-types.md` — defines the `CreateHeistInput` type and field contract this form writes against; must remain consistent
- `signup-firebase-auth.md` — establishes that user codename and ID are stored in a users collection at signup; this form reads from that collection to populate the assignee list

## Open Questions

None.

## Testing Guidelines

Create a test file in `./tests` for the new feature, covering the following cases:

- Form renders title, description, and assignee fields with a submit button
- Submitting with an empty title is blocked
- Submitting with an empty description is blocked
- Submit button is disabled while saving is in progress
- On successful save, the user is redirected to the heists list
- On save failure, an error message is shown and form values are preserved
- Typing in the assignee field filters the dropdown to matching codenames
- Selecting a user from the dropdown populates the assignee selection
- Clearing the assignee field results in the heist being saved without an assignee
