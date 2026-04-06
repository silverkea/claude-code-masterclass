# Spec for Heist Details Page

branch: claude/heist-details-page-JlKBK
figma_component (if used): N/A

## User Story

As a logged-in user, I want to open a heist and see its full details — including who it's assigned to, who created it, and how long remains — so that I can quickly understand the heist's status and urgency at a glance. If the heist has no assignee, I want to be able to assign it to another user.

## Trigger

A logged-in user clicks on a heist card from the heists dashboard, which navigates them to the heist detail page for that specific heist.

## Summary

Provide a dedicated detail page for a single heist, accessible to any authenticated user. The page displays the heist's title, description, creator, assignee, and a live visual countdown to the deadline. If the heist has no assignee, any authenticated user (except the currently logged-in user) can be assigned via a searchable user lookup with a confirm button — once assigned, the assignee is permanent and cannot be changed from this page. If the heist's deadline has already passed, the countdown is replaced with an "Expired" indicator. If the heist ID in the URL does not correspond to any known heist, a standard 404 page is shown.

## Functional Requirements

- The page loads the heist document matching the ID in the URL from the data store in real time
- The following heist fields are displayed on the page:
  - **Title** — displayed prominently at the top of the page
  - **Details / Description** — the full heist description text
  - **Assigned to** — the codename of the user the heist is assigned to; if no assignee is set, shows the assignment UI (see below)
  - **Created by** — the codename of the user who created the heist
  - **Time remaining** — a live countdown that ticks down in real time while the user is on the page
- The live countdown displays days, hours, minutes, and seconds remaining until the deadline and updates every second
- The countdown is visually impressive — it must feel urgent and dramatic, not a plain text string
- If the heist's deadline has already passed, the countdown area is replaced with a clearly styled "Expired" indicator rather than a negative countdown
- If no heist document exists for the given ID, the page renders a standard 404 experience
- The page is accessible to any authenticated user regardless of whether they created or were assigned to the heist
- The page subscribes to real-time updates — if the heist document changes while the user is on the page, the displayed data updates automatically without a reload
- While the heist data is loading, a skeleton version of the page is displayed that mirrors the layout of the loaded state — placeholder blocks replace the title, description, metadata fields, and countdown area

### Assignment UI (unassigned heists only)

- When a heist has no assignee, the assigned-to area shows a searchable user lookup input in place of the "Unassigned" placeholder
- As the user types, a filtered list of up to 50 matching users is fetched from the users collection using a server-side prefix search on codename; the search is debounced to avoid unnecessary requests on every keystroke
- The lookup results exclude the currently logged-in user — a user cannot assign a heist to themselves
- Unlike the create heist form, the heist creator **is** included in the results — the creator may be assigned to their own heist from this page
- Selecting a user from the dropdown shows their codename as the pending selection alongside a "Confirm Assignment" button; the heist is not yet updated at this point
- The user may clear their selection and choose a different user before confirming
- Clicking "Confirm Assignment" writes the selected user's ID and codename to the heist document
- While the assignment is being saved, the confirm button is disabled and shows a saving state to prevent double-submission
- Once the assignment is saved successfully, the page transitions to showing the assigned user's codename as static text — the assignment UI is no longer shown
- If saving the assignment fails, a non-technical error message is shown and the selection is preserved so the user can try again
- After a heist has been assigned (via this page or any other means), the assignment UI is never shown — the assigned codename is displayed as read-only text with no option to edit or reassign

## Success Criteria

- A logged-in user who clicks a heist card is taken to the detail page and sees the heist title, description, assignee (or the assignment UI if unassigned), creator, and a live countdown ticking down in real time
- The countdown is visually striking and clearly communicates urgency
- When the deadline has passed, the countdown area shows "Expired" instead of a negative or zero value
- If the user navigates to a URL with a non-existent heist ID, a 404 page is displayed
- While data is loading, a skeleton layout is displayed that matches the structure of the loaded page
- If the heist data changes in the background (e.g. an assignee is added), the page reflects the update without requiring a reload
- A logged-in user can search for another user by codename, select them, and confirm the assignment — after which the page shows the assigned codename as static text and the assignment UI disappears

## Out of Scope

- Reassigning or removing an assignee after one has been set — assignment is permanent from this page
- Marking a heist as complete, editing, or deleting
- Access control beyond authentication — any logged-in user can view any heist
- Assigning a heist to yourself — the current user is always excluded from the lookup results
- Comments, activity history, or audit trails
- Sharing or exporting heist details
- Pagination or navigation between heists (next/previous)

## Non-Functional Requirements

- **Performance**: the page must begin rendering a loading state immediately; the heist data should appear as soon as the real-time subscription delivers the first snapshot; the user lookup is fetched on demand as the user types and is debounced to avoid excessive requests
- **Accessibility**: the page must be navigable by keyboard; the countdown must include an accessible text alternative for screen readers (WCAG 2.1 AA target); colour alone must not be the sole indicator of urgency; the assignee dropdown must be usable without a mouse; all interactive elements must have accessible labels
- **Responsiveness**: the page must display correctly on mobile, tablet, and desktop viewports
- **Reliability**: a failure to load the heist document must surface a clear error message rather than silently showing a blank page; the countdown failing must not crash the rest of the page; a failed assignment save must not crash the page

## Security Considerations

- The heist ID is taken directly from the URL — the data layer must treat it as untrusted input and use it only as a document lookup key; it must not be interpolated into queries in a way that enables injection
- All data is read from and written to Firestore client-side and is subject to Firestore security rules — rules must enforce that only authenticated users can read heist documents and write the assignedTo fields (insecure direct object reference: any authenticated user may assign any unassigned heist, which is intentional per this spec)
- The assignee ID written to the heist document must come from the authenticated users collection lookup — it must not be a user-supplied value passed directly to Firestore
- Heist titles, descriptions, and codenames are user-generated content rendered into the DOM — they must be rendered safely to prevent XSS; React's default rendering provides sufficient protection; no raw HTML must be injected
- No PII beyond codenames (already stored in heist documents) is displayed
- No new secrets or credentials are introduced by this feature
- User-facing error messages must not expose Firestore collection names, document IDs, or internal error details (OWASP: information disclosure)

## Edge Cases & Constraints

- A heist with no assignee must show the assignment UI — it must not show a blank space or "Unassigned" static text
- A heist that receives an assignee while the user is on the page (real-time update) must transition from the assignment UI to static assigned text without a page reload or crash
- A heist whose deadline passes while the user is on the page must transition the countdown to the "Expired" indicator without a page reload or crash
- A very long heist title or description must not break the page layout — text must wrap rather than overflow
- If the real-time subscription emits an error after data has already been shown, the existing data should remain visible and an error notice should appear rather than the page going blank
- The page must handle the brief moment between navigation and first data snapshot gracefully — a skeleton is shown until data arrives
- If the user lookup returns no results (no matching codenames or the users collection is empty), the dropdown shows no results and the confirm button remains unavailable
- If the user lookup request fails, the dropdown degrades gracefully — no results are shown and no error crashes the page

## Acceptance Criteria

- Given the heist data is still loading, the page displays a skeleton layout that mirrors the structure of the loaded page
- Given a logged-in user navigates to `/heists/:id` for a valid heist, the page displays the heist's title, description, creator codename, and either the assignee codename or the assignment UI
- Given the heist's deadline is in the future, the page shows a live countdown that visibly ticks down every second
- Given the heist's deadline is in the past, the page shows an "Expired" indicator in place of the countdown
- Given the heist already has an assignee, the page shows the assigned codename as static text and the assignment UI is not shown
- Given the heist has no assignee, the page shows the assignment UI — a searchable user lookup and confirm button — in the assigned-to area
- Given a user types in the assignee search field, a debounced lookup fetches up to 50 matching codenames from the users collection, excluding the currently logged-in user
- Given a user selects a codename from the dropdown and clicks "Confirm Assignment", the heist document is updated with that user's ID and codename
- Given the assignment is saved successfully, the page transitions to showing the assigned codename as static text and the assignment UI disappears
- Given the assignment save fails, a non-technical error message is shown and the selection is preserved
- Given a logged-in user navigates to `/heists/nonexistent-id`, the page renders a 404 experience
- Given the heist document is updated in the data store while the user is on the page, the page reflects the updated data without a reload
- Given the heist's deadline passes while the user is viewing the countdown, the countdown transitions to the "Expired" state without a page reload or crash

## Observability

- If the real-time data subscription fails, the error must be surfaced to the user as a clear, non-technical message — it must not be swallowed silently
- If saving an assignment fails, the error must be surfaced to the user and must not be swallowed silently
- Errors must not expose Firestore error messages, collection paths, or document IDs to the user
- Standard error handling applies for rendering failures — a localised error state must not crash the surrounding layout

## Related Specs

- `heist-card-component.md` — defines the card that links to this page; the "Out of Scope" section of that spec explicitly defers this page's content to a future feature
- `use-heists-data-hook.md` — defines the real-time data hook pattern and the `Heist` data shape that this page will consume
- `firestore-heist-types.md` — defines the `Heist` type whose fields (`title`, `description`, `assignedToCodename`, `createdByCodename`, `deadline`) this page renders
- `create-heist-form.md` — defines the assignee lookup pattern (debounced server-side search, up to 50 results, current user excluded) that this page reuses; the key difference is that the creator is **not** excluded here

## Open Questions

None.

## Testing Guidelines

Create test file(s) in `./tests` for the new page and any new components, covering the following cases:

- Page renders the heist title, description, assignee codename, and creator codename when data is available and the heist is assigned
- Page renders the assignment UI (search input and confirm button) when the heist has no assignee
- Page does not render the assignment UI when the heist has an assignee
- Typing in the assignee search field triggers a debounced lookup and shows matching codenames in the dropdown
- The currently logged-in user does not appear in the dropdown results
- Selecting a codename from the dropdown and clicking "Confirm Assignment" writes the assignment to Firestore
- While the assignment is saving, the confirm button is disabled
- On successful assignment save, the assignment UI is replaced with the assigned codename as static text
- On assignment save failure, an error message is shown and the selection is preserved
- Countdown is rendered when the deadline is in the future
- "Expired" indicator is rendered when the deadline is in the past
- Countdown transitions to "Expired" when the deadline passes during a live session (time-based test)
- A skeleton layout matching the page structure is shown before the data subscription resolves
- A 404 experience is shown when the heist document does not exist
