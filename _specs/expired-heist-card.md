# Spec for Expired Heist Card

branch: claude/feature/expired-heist-card
figma_component (if used): https://www.figma.com/design/vbXA4hxqLLquum7NAaYEPq/Pocket-Heist?node-id=14-251&m=dev

## User Story

As a logged-in user, I want to see my expired heists displayed as cards in a dedicated section on the heists dashboard so that I can review the outcome, who was involved, and when the deadline was for each completed or overdue heist.

## Trigger

A logged-in user navigates to the heists dashboard and the expired heists section has loaded its data.

## Summary

Provide a reusable Expired Heist Card component that displays the key details of a single expired heist — title, assigned-to codename, assigned-by codename, deadline date and time, and whether the outcome was a success or failure. The card is read-only and non-interactive. Cards appear in a full-width list inside the "Expired Heists" section of the heists dashboard, one card per row.

## Functional Requirements

- The card displays the following information for a single expired heist:
  - **Title** — displayed prominently at the top of the card
  - **To:** — the codename of the user the heist was assigned to; if no assignee was set, shows a muted "Unassigned" placeholder
  - **By:** — the codename of the user who created the heist
  - **Deadline** — the deadline date and time in a human-readable format (e.g. "Dec 5, 05:00 PM")
  - **Status badge** — a coloured badge showing either "SUCCESS" or "FAILURE" based on the heist's final status
- The card title is a link that navigates to the heist detail page (`/heists/:id`) when clicked
- The entire card surface is clickable and navigates to `/heists/:id` — consistent with the active HeistCard behaviour
- The card spans the full width of its containing section (one card per row)
- A heist is eligible to appear as an expired card when its `finalStatus` is non-null (either `"success"` or `"failure"`) — deadline elapsed alone does not determine card eligibility for this component; the data source (the existing heists hook in `expired` mode) is responsible for filtering
- The status badge uses distinct visual treatment for success and failure outcomes:
  - **Success**: green text, green-tinted border and background
  - **Failure**: red text, red-tinted border and background
- While expired heist data is loading, an **Expired Heist Card Skeleton** is displayed in place of real cards — it mirrors the card's two-row layout with placeholder blocks and a pulse animation, matching the visual shell of the real card
- The skeleton is shown a fixed number of times during loading (e.g. 3) and does not depend on the eventual number of results

## Figma Design Reference

- File: Pocket Heist — https://www.figma.com/design/vbXA4hxqLLquum7NAaYEPq/Pocket-Heist?node-id=14-251&m=dev
- Component name: HeistCard (expired variant, node 14:251)
- Key visual constraints:
  - Dark semi-transparent card surface with 10px rounded corners and a subtle dark border — matches the visual shell of the active HeistCard
  - Two-row layout: header row (title + deadline + status badge) and meta row (assignee + creator)
  - Title text: white, 16px medium weight; assignee codename: purple (`--color-primary`); creator codename: pink (`--color-secondary`)
  - Meta labels ("To:", "By:", deadline): muted grey (`--color-body`), 14px
  - Status badge: 12px uppercase text with coloured border and semi-transparent tinted background — green for SUCCESS, red for FAILURE
  - Decorative icons (completed-state icon, calendar, person): 12–16px, muted grey, no fill; all are `aria-hidden`
  - No new colour tokens required — all values map to existing `@theme` variables
  - The failure badge colours are inferred from `--color-error` following the same pattern as the success badge; confirm with designer if a dedicated failure Figma node exists

## Success Criteria

- A logged-in user visiting the heists dashboard sees expired heists displayed as full-width cards in the "Expired Heists" section
- Each card shows the heist title, "To:" (assignee codename or "Unassigned"), "By:" (creator codename), deadline date and time, and a SUCCESS or FAILURE badge
- The SUCCESS badge is visually distinct from the FAILURE badge using green and red treatments respectively
- The card has no interactive behaviour — clicking or hovering produces no response
- A heist with no assignee renders "Unassigned" in the "To:" field without error
- A heist with a very long title does not break the card layout
- While expired heist data is loading, skeleton placeholders are shown immediately — the section does not display a plain loading text message

## Out of Scope

- Filtering or sorting the expired list — handled by the data hook
- Any action on an expired heist (e.g. re-open, delete, archive)
- Determining whether a heist qualifies as expired — that logic belongs to the data layer

## Non-Functional Requirements

- Accessibility: the card must be navigable by keyboard; the clickable card surface must have an appropriate role; the title link must be meaningful to screen readers; decorative icons must be hidden from assistive technology; the status badge text must be visible (not icon-only); colour must not be the sole means of conveying the success/failure outcome (the text label in the badge satisfies this); the component must meet WCAG 2.1 AA contrast standards
- Reliability: a rendering failure in a single card must not crash the surrounding section or other cards
- Responsiveness: the card is full-width at all viewport sizes — no grid breakpoints required for this component itself

## Security Considerations

- The card renders data retrieved from Firestore via the existing heists hook — no new data access is introduced by this component
- Heist titles and codenames are user-generated content rendered into the DOM; they must be rendered safely to prevent XSS — React's default rendering provides sufficient escaping; no raw HTML injection is used
- No PII beyond codenames (already stored in heist documents) is displayed
- No new secrets or credentials are introduced

## Edge Cases & Constraints

- A heist with no assignee must render "Unassigned" in the "To:" row — it must not throw or display a blank
- A heist title that is very long must not overflow or break the card layout — truncation or wrapping is acceptable, consistent with the active HeistCard behaviour
- The component should only receive heists with a non-null `finalStatus` — if `finalStatus` is `null`, the component should not render (guard at the call site or within the component)
- The Figma source only shows the success state; the failure visual treatment is inferred from the design system — flag to designer if a dedicated failure variant is needed

## Acceptance Criteria

- Given an expired heist with `finalStatus: "success"`, when the card renders, it displays the title, assignee codename (or "Unassigned"), creator codename, deadline, and a SUCCESS badge in green
- Given an expired heist with `finalStatus: "failure"`, when the card renders, it displays the same fields with a FAILURE badge in red
- Given an expired heist with no `assignedToCodename`, the "To:" row shows "Unassigned" without throwing an error
- Given a long heist title, the card does not overflow or break its container
- Given a user clicks anywhere on an expired heist card, they are navigated to `/heists/:id` for that heist
- Given the status badge is visible, its label ("SUCCESS" or "FAILURE") is present as visible text — colour alone is not the only indicator of outcome
- Given expired heist data is loading, skeleton placeholders are displayed in the expired section immediately — no plain "Loading…" text is shown

## Observability

- Standard error handling applies — the card component renders data passed to it and has no async operations of its own
- If a card fails to render due to unexpected data shape, the error must not crash the surrounding section; a React error boundary at the section level is appropriate
- No sensitive data is rendered — no special logging considerations apply

## Related Specs

- `heist-card-component.md` — the active HeistCard that shares the same visual shell; the expired card should remain visually consistent with it (same card surface, border, corner radius, typography scale, and icon style)
- `use-heists-data-hook.md` — provides the expired heist data that populates this component via the `expired` mode; the component relies on the data shape this hook returns
- `firestore-heist-types.md` — defines the `Heist` type whose fields (`title`, `assignedToCodename`, `createdByCodename`, `deadline`, `finalStatus`) this component renders; `finalStatus` must be `"success"` or `"failure"` (non-null) for a heist to be shown by this component

## Open Questions

- Should the component silently skip rendering (return null) when `finalStatus` is null, or should the call site be responsible for only passing heists with a non-null `finalStatus`? Either is defensible — align with the pattern used for similar guards in the codebase.
- Does a dedicated Figma node exist for the failure badge variant, or should the red colour treatment be considered confirmed from the design system tokens?

## Testing Guidelines

Create test file(s) in `./tests` for the new component, covering the following cases:

- Card renders heist title, assignee codename, creator codename, and deadline date/time
- Card renders "Unassigned" in the "To:" row when `assignedToCodename` is null or absent
- Card renders a SUCCESS badge (with visible "success" text) when `finalStatus` is `"success"`
- Card renders a FAILURE badge (with visible "failure" text) when `finalStatus` is `"failure"`
- Card applies the success colour treatment to the SUCCESS badge and failure colour treatment to the FAILURE badge
- Card does not render any interactive elements (no links, no buttons)
- Card does not crash when given a very long title
- Skeleton renders without error and visually mirrors the card's two-row structure with placeholder blocks
