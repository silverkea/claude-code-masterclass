---
name: Pocket Heist Design System Tokens
description: Colour tokens, typography, icon conventions, and recurring patterns extracted from globals.css and Figma inspections
type: project
---

## Colour Tokens (app/globals.css @theme)

| Token | Hex | Role |
|---|---|---|
| --color-primary | #C27AFF | Assignee codenames, purple accent |
| --color-secondary | #FB64B6 | Creator codenames, pink/magenta accent |
| --color-dark | #030712 | Page background |
| --color-light | #0A101D | — |
| --color-lighter | #101828 | Card backgrounds |
| --color-success | #05DF72 | Success state text/borders |
| --color-error | #FF6467 | Error/failure state text/borders |
| --color-heading | white | Heading text |
| --color-body | #99A1AF | Muted/secondary text |
| --font-sans | Inter | Primary font throughout |

## Card Border Convention
Cards use `border-color: #1e2939` (a semi-transparent dark blue, not in @theme).
Background is `rgba(16,24,40,0.5)` (maps approximately to --color-lighter with opacity).
Border is `rgba(30,41,57,0.5)` at 0.833px.

## Success Badge (from ExpiredHeistCard Figma)
- Background: rgba(5,223,114,0.05) — success colour at 5% opacity
- Border: rgba(5,223,114,0.2) at 0.833px — success colour at 20% opacity
- Text: #05DF72 (--color-success), 12px, uppercase, tracking 0.6px, Inter Regular

## Failure Badge (inferred from design system — not directly confirmed in Figma node 14:251)
- Background: rgba(255,100,103,0.05) — error colour at 5% opacity
- Border: rgba(255,100,103,0.2) at 0.833px — error colour at 20% opacity
- Text: #FF6467 (--color-error), 12px, uppercase, tracking 0.6px, Inter Regular

## Typography Scale (observed)
- Card title: Inter Medium 16px, line-height 24px, letter-spacing -0.3125px, white
- Meta / label text: Inter Regular 14px, line-height 20px, letter-spacing -0.1504px, #99A1AF
- Codename (assignee): Inter Regular 14px, --color-primary (#C27AFF)
- Codename (creator): Inter Regular 14px, --color-secondary (#FB64B6)
- Badge text: Inter Regular 12px, uppercase, tracking 0.6px

## Icon Library
- lucide-react is the project's icon library
- Icons used: Clock, Clock8, Plus, Eye, EyeOff
- In Figma, calendar icon precedes deadline, person icon precedes To/By rows
- Lucide equivalents: Calendar (deadline), User (person/assignee/creator)
- Icon sizes in cards: ~12px (inline meta icons), ~16px (title-row icon)

## Shared Utility Classes (globals.css)
- .page-content — page container with max-width
- .center-content — flex column, centered, full viewport height
- .form-title — centered bold heading
- .preview-grid — auto-fill grid for card lists
- .btn — gradient CTA button (purple-to-pink)

## HeistCard Patterns
- Card shell: bg-lighter, rounded-[10px], border, p-4, flex flex-col gap-3
- Header row: flex items-start justify-between gap-2
- Assignee/creator rows: flex items-center gap-1, text-sm
- "To:" / "By:" labels: text-body class
- Codenames: assignee = color-primary, creator = color-secondary
- Icon imports from lucide-react, size prop set numerically
- Component lives in components/HeistCard/ with index.ts barrel

**Why:** Extracted during ExpiredHeistCard Figma spec session (2026-04-06).
**How to apply:** Use these tokens and patterns when speccing or implementing any card-type component in Pocket Heist.
