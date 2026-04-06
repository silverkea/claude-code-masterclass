# Spec for useHeists Data Hook

branch: claude/feature/use-heists-data-hook
figma_component (if used): N/A

## User Story

As a logged-in user, I want the heists dashboard to show me my active heists, heists I've assigned to others, and all expired heists in real time so that I always see an up-to-date picture of heist activity without needing to refresh the page.

## Trigger

A logged-in user navigates to the heists dashboard page.

## Summary

Provide a reusable data hook that retrieves heist documents from the Firestore heists collection in real time. The hook accepts a mode argument — `active`, `assigned`, or `expired` — and returns the appropriate filtered and ordered set of heist documents alongside loading and error states. The hook is used three times on the heists dashboard page to drive each of its three sections.

## Functional Requirements

- The hook accepts a single mode argument with one of three values: `active`, `assigned`, or `expired`
- The hook returns three values: an array of heist objects, a boolean loading state, and a nullable error value
- The hook subscribes to real-time updates — any change to matching documents in Firestore is reflected automatically without user interaction
- The subscription is cleaned up automatically when the component using the hook unmounts
- **`active` mode** — returns all heists where the current user is the assignee and the deadline has not yet passed
- **`assigned` mode** — returns all heists where the current user is the creator and the deadline has not yet passed, regardless of whether those heists have an assignee
- **`expired` mode** — returns all heists where the deadline has passed and the deadline field is not null, regardless of which user created or was assigned to the heist; results are ordered by deadline descending (most recently expired first) and capped at 50 documents
- If the hook is called in `active` or `assigned` mode and no user is authenticated, it returns an error state with an empty heists array and `loading` set to `false`
- While the Firestore subscription is being established, `loading` is `true` and the heists array is empty
- Once the first snapshot is received (even if empty), `loading` becomes `false`
- If the Firestore subscription emits an error, the error state is populated and the heists array remains as its last known value (or empty if no snapshot was ever received)
- The hook is used on the heists dashboard page three times — once per mode — to populate each section

## Success Criteria

- A logged-in user visiting the heists dashboard sees their active heists, their assigned heists, and expired heists each displayed in their own section
- Changes to heist documents in Firestore (e.g. a deadline passing, a new heist being created) are reflected on the page without a reload
- Each section shows a loading state while its data is being fetched
- If a query fails, the affected section shows an error state rather than crashing the page

## Out of Scope

- Pagination beyond the 50-document cap for `expired` results — this can be added as a future improvement
- Filtering or sorting options exposed to the user — the ordering and limits are fixed by this feature
- Creating, updating, or deleting heist documents — the hook is read-only
- Displaying heist details beyond titles on the heists page — the page will initially render only titles per section
- A combined or multi-mode hook call — each mode is queried independently

## Non-Functional Requirements

- Performance: the hook must not open more than one active Firestore subscription per instance; it must clean up the previous subscription if the mode argument changes
- Reliability: a failure in one mode's subscription must not affect the other two sections on the page — each hook instance is independent
- The hook must be usable as a standard React hook — it must follow the rules of hooks and be safe to call from any functional component

## Security Considerations

- All Firestore queries are executed client-side and are subject to Firestore security rules — the rules must enforce that users can only read documents they are permitted to see
- The `active` and `assigned` queries use the current user's ID to scope results — this ID must come from the authenticated session, not from any user-supplied input
- No PII beyond user IDs and codenames (already stored in heist documents) is read or transmitted by this feature
- No new secrets or credentials are introduced
- User-facing error messages must not expose Firestore collection names, query details, or internal error messages (OWASP: information disclosure)

## Edge Cases & Constraints

- If the `active` or `assigned` query returns zero results for the current user, the heists array is empty and no error is raised
- If the `expired` query returns zero results, the same applies
- If a heist's deadline field is `null`, it must be excluded from the `expired` result set — only heists with a non-null deadline that has passed are included
- If the mode argument passed to the hook changes between renders, the hook must unsubscribe from the previous query and subscribe to the new one
- A heist created by the current user and also assigned to the current user (which the create form prevents but cannot be ruled out in Firestore directly) may appear in both `active` and `assigned` results — this is an acceptable edge case for now

## Acceptance Criteria

- Given a logged-in user has heists assigned to them with non-expired deadlines, when the heists page loads in `active` mode, those heist titles appear in the active section
- Given a logged-in user has created heists (with or without assignees) with non-expired deadlines, when the heists page loads in `assigned` mode, those heist titles appear in the assigned section
- Given heists exist in Firestore with non-null deadlines that have passed, when the heists page loads in `expired` mode, those heist titles appear in the expired section, ordered by most recently expired first, up to 50 results
- Given no user is authenticated and the hook is called in `active` or `assigned` mode, the hook returns an error state and an empty heists array
- Given the Firestore subscription is being established, the loading state is `true` and the heists array is empty
- Given the Firestore subscription emits an error, the error state is populated and the page does not crash
- Given a new heist document is written to Firestore that matches the active query, the active section updates automatically without a page reload

## Observability

- Firestore subscription errors should be logged with the mode that was active at the time, so failures can be diagnosed without reproducing the query
- Logs must not include user IDs, document contents, or any personally identifiable information
- Silent failures are not acceptable — subscription errors must surface as error state to the component, not be swallowed

## Related Specs

- `firestore-heist-types.md` — defines the `Heist` type and Firestore converter that this hook will use when reading documents; must remain consistent
- `create-heist-form.md` — writes the heist documents that this hook reads; the field names used in queries (`assignedTo`, `createdBy`, `deadline`) must match what the form writes

## Open Questions

None.

## Testing Guidelines

Create a test file in `./tests` for the new hook, covering the following cases:

- Returns `loading: true` and an empty array on initial render before the subscription resolves
- Returns heist documents and `loading: false` once the Firestore subscription emits a snapshot
- Returns an error state when the Firestore subscription emits an error
- Returns an error state and empty array when called in `active` or `assigned` mode with no authenticated user
- In `expired` mode, returns results ordered by deadline descending
- Cleans up the Firestore subscription when the component unmounts
- Subscribes to a new query when the mode argument changes between renders
