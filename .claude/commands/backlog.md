---
description: Capture a deferred observation, inconsistency, or gap in the backlog
argument-hint: "[Brief description of the observation]"
allowed-tools: Read, Write, Glob, Bash(git status:*)
---

You are capturing a deferred observation into the project backlog. The backlog is not a task list — it is a deferred observation queue that informs future specs.

User input: $ARGUMENTS

## What the backlog is for

Create a backlog item when:
- A behavioural inconsistency is spotted in a related feature that is out of scope for current work
- Technical debt is noticed that can't be fixed right now
- A gap or improvement belongs to a future feature

Backlog items are for observations about *other* features or future needs. Open Questions in a spec are for unresolved decisions about *this* feature.

## Step 1. Understand the observation

If `$ARGUMENTS` is vague or incomplete, ask one clarifying question to understand:
- What was observed
- Why it matters
- Which feature, spec, or file it relates to

## Step 2. Determine the type

Classify as one of:
- `inconsistency` — two related features behave differently in a way that could confuse users or cause bugs
- `tech-debt` — a shortcut or pattern that should be improved but is out of scope now
- `improvement` — a gap or enhancement that belongs in a future feature

## Step 3. Generate the filename

Format: `yyyymmdd-<slug>.md` where today's date is used and the slug is a short kebab-case description of the observation.

Example: `20260405-signup-login-redirect-consistency.md`

## Step 4. Write the backlog file

Save to `_backlog/<filename>`.

Use this structure:

```
# <Title>

Type: <inconsistency | tech-debt | improvement>
Spotted during: <current feature or task name>
Related: <comma-separated list of spec files, component names, or feature areas>

## Observation

<What was observed — be specific enough that someone unfamiliar with the current work can understand it.>

## Why It Matters

<Why this is worth capturing — user impact, risk, or future complexity it could cause.>

## Possible Resolutions

<List 2–3 realistic options with brief trade-offs. This is not a spec — keep them brief.>
- Option A: ...
- Option B: ...
- Option C: ...
```

## Step 5. Confirm to the user

After saving, respond with:

```
Backlog item saved: _backlog/<filename>
Type: <type>
```
