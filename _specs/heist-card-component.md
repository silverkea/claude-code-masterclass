# Spec for Heist Card Component

branch: claude/feature/heist-card-component
figma_component (if used): https://www.figma.com/design/vbXA4hxqLLquum7NAaYEPq/Pocket-Heist?node-id=14-23&m=dev

## User Story

As a logged-in user, I want to see my active and assigned heists displayed as cards on the heists dashboard so that I can quickly scan the status, assignee, and time remaining for each heist at a glance.

## Trigger

A logged-in user navigates to the heists dashboard page and their active or assigned heist data has loaded.

## Summary

Provide a reusable Heist Card component that displays the key details of a single heist — title, assignee, creator, deadline, and time remaining. Cards are shown on the heists dashboard in two sections (active and assigned), arranged in a responsive 3-column grid. Expired heists are never shown as cards. A Heist Card Skeleton component mirrors the card layout and is displayed in the same grid while data is being fetched. Each card is fully clickable and navigates to the heist detail page.

## Functional Requirements

- The card displays the following information for a single heist:
  - **Title** — displayed prominently at the top of the card
  - **To:** — the codename of the user the heist is assigned to; if no assignee has been set, shows a muted "Unassigned" placeholder
  - **By:** — the codename of the user who created the heist
  - **Deadline date and time** — shown in a human-readable format (e.g. "Dec 5, 05:00 PM")
  - **Time remaining** — shown inline after the date, separated by a `•`, e.g. `• 2h 30m left`
  - **Clock icon** — displayed in the top-right of the card; changes to the pink theme colour when fewer than 4 hours remain until the deadline; otherwise uses the default muted colour from the design
- The entire card is a clickable surface that navigates to the heist detail page (`/heists/:id`) when clicked
- The heist title within the card is also a semantic link to `/heists/:id` for accessibility
- The `/heists/:id` route must exist and be reachable, but no page content is required for this feature
- Cards are only shown for **active** and **assigned** heists — heists whose deadlines have passed (expired) are never rendered as cards by this component
- Cards are displayed in a responsive grid: 3 columns on desktop, 2 columns on tablet, 1 column on mobile
- A **Heist Card Skeleton** component is displayed in the same responsive grid layout while heist data is loading; it mirrors the card's visual structure with placeholder blocks in place of real content
- The skeleton is shown once per expected card slot during loading — the number of skeleton placeholders shown is fixed (e.g. 3 or 6) and does not depend on the eventual number of results

## Figma Design Reference

- File: Pocket Heist — https://www.figma.com/design/vbXA4hxqLLquum7NAaYEPq/Pocket-Heist?node-id=14-23&m=dev
- Component name: Heist Card (node 14:23)
- Key visual constraints:
  - Dark card surface (`#101828`) with rounded corners and a subtle dark border (`#1e2939`)
  - Title text: white, 16px Inter, multi-line capable
  - "To:" assignee value: purple (`#c27aff`); "By:" creator value: pink (`#fb64b6`)
  - Metadata row labels ("To:", "By:", date): muted grey (`#99a1af`), 14px Inter
  - Each metadata row uses a small icon (person, calendar) beside the label and value
  - Clock icon sits top-right of the title row; switches to pink theme colour when under 4 hours remain
  - Time remaining and status appear inline in the date row after a `•` separator
  - Only the default populated state is defined in Figma; hover, skeleton, and empty-assignee states require design decisions at implementation time
  - Icon-only elements (clock, person, calendar) must have accessible labels — contrast for muted and coloured text at 14px should be verified against WCAG AA

## Success Criteria

- A logged-in user visiting the heists dashboard sees their active heists and assigned heists rendered as cards in a responsive 3-column grid
- Each card shows the heist title, assignee (or "Unassigned"), creator, deadline, and time remaining
- Clicking anywhere on a card navigates to `/heists/:id`
- The clock icon on a card with fewer than 4 hours remaining is displayed in the pink theme colour; others display in the default muted colour
- While heist data is loading, Heist Card Skeleton components are shown in the same grid layout
- Expired heists are never shown as cards — only active and assigned heists appear
- On tablet, cards reflow to a 2-column grid; on mobile, a single-column layout

## Out of Scope

- Content on the `/heists/:id` detail page — the route is created but the page is left empty for now
- Cards for expired heists — the expired section on the heists dashboard is a separate concern
- Any action buttons on the card (e.g. assign, complete, delete)
- Pagination or load-more for cards — the existing data hook's result set applies
- Editing heist details from the card

## Non-Functional Requirements

- Accessibility: the card must be navigable by keyboard; the clickable card surface must have an appropriate ARIA role; icon-only elements must have accessible labels; the title link must be meaningful to screen readers (WCAG 2.1 AA target)
- Responsiveness: the grid must reflow correctly at standard breakpoints — 3 columns on desktop (≥1024px), 2 columns on tablet (≥640px), 1 column on mobile
- Reliability: a rendering failure in a single card must not crash the surrounding page or other cards
- Performance: the skeleton must appear immediately on load — it must not wait for any data before rendering

## Security Considerations

- The card renders data retrieved from Firestore via the existing data hook — no new data access is introduced by this component
- Heist titles and codenames are user-generated content rendered into the DOM; they must be rendered safely to prevent XSS — framework-level escaping (React's default rendering) is sufficient; no raw HTML injection
- The `/heists/:id` route includes a user-controlled ID in the URL — the detail page (when built) must validate access server-side; this component only navigates to the route and is not responsible for authorisation
- No PII beyond codenames (already in the heist document) is displayed
- No new secrets or credentials are introduced

## Edge Cases & Constraints

- A heist with no assignee must render the "Unassigned" placeholder in the "To:" row — it must not throw or show a blank space
- A heist title that is very long must not break the card layout — the title should wrap to a second line, not overflow
- If the time remaining calculation results in a negative value (e.g. a race condition where an active heist's deadline passes between data fetch and render), the card should still render without crashing — showing the date is sufficient fallback
- The number of skeleton placeholders is fixed and does not need to match the eventual number of real cards

## Acceptance Criteria

- Given a logged-in user has active heists, when the heists page loads and data is available, each active heist is rendered as a card showing its title, "To:" (assignee or "Unassigned"), "By:" (creator), and deadline with time remaining
- Given a logged-in user has assigned heists (heists they created), those heists are rendered as cards in the assigned section under the same rules
- Given an active heist has fewer than 4 hours until its deadline, its clock icon is rendered in the pink theme colour
- Given an active heist has 4 or more hours until its deadline, its clock icon is rendered in the default muted colour
- Given heist data is still loading, Heist Card Skeleton components are displayed in the grid in place of real cards
- Given a user clicks anywhere on a heist card, they are navigated to `/heists/:id` for that heist
- Given a heist has no assignee set, the card shows "Unassigned" in the "To:" row rather than a blank or error
- Given the viewport is tablet width, the grid renders 2 columns; given mobile width, 1 column

## Observability

- Standard error handling applies — the card component renders data passed to it and has no async operations of its own
- If a card fails to render due to unexpected data shape, the error must not crash the page; a React error boundary at the grid level is appropriate
- No sensitive data is rendered by this component — no special logging considerations apply

## Related Specs

- `use-heists-data-hook.md` — provides the active and assigned heist data that populates the cards; the card must handle the data shape this hook returns
- `firestore-heist-types.md` — defines the `Heist` type whose fields (`title`, `assignedToCodename`, `createdByCodename`, `deadline`, `id`) the card renders
- `create-heist-form.md` — writes the heist documents that the card displays; field names must remain consistent

## Open Questions

None.

## Testing Guidelines

Create test file(s) in `./tests` for the new components, covering the following cases:

- Card renders heist title, assignee codename, creator codename, and deadline
- Card renders "Unassigned" in the "To:" row when no assignee is set
- Card clock icon has the pink colour class applied when the deadline is fewer than 4 hours away
- Card clock icon does not have the pink colour class when the deadline is 4 or more hours away
- Clicking the card triggers navigation to `/heists/:id`
- Heist Card Skeleton renders without error and matches the card's structural layout
- Expired heists are not rendered (the component only accepts active/assigned heists — verify it renders correctly given valid data, and that the parent page does not pass expired heists)
