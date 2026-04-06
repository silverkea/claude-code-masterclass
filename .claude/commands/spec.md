---
description: Create a feature spec file and branch from a short idea
argument-hint: "[Short feature description, optional: 'figma: <component-link>']"
allowed-tools: Read, Write, Glob, Grep, Bash(git switch:*), Bash(git status:*), Bash(git branch:*), Bash(git rm:*), Agent
---

You are helping to spin up a new feature spec for this application, from a short idea provided in the user input below. Always adhere to any rules or requirements set out in any CLAUDE.md files when responding.

User input: $ARGUMENTS

## High level behavior

Your job will be to turn the user input above into:

- A human friendly feature title in kebab-case (e.g. new-heist-form)
- A safe git branch name not already taken (e.g. claude/feature/new-heist-form)
- A detailed markdown spec file under the _specs/ directory
- An optional figma design note, if a figma design link is present

Then save the spec file to disk and print a short summary of what you did.

## Step 1. Check the current branch

Check the current Git branch, and abort this entire process if there are any uncommitted, unstaged, or untracked files in the working directory. Tell the user to commit or stash changes before proceeding, and DO NOT GO ANY FURTHER.

## Step 2. Parse the arguments

From `$ARGUMENTS`, extract:

1. `feature_title`  
   - A short, human readable title in Title Case.  
   - Example: "Card Component for Dashboard Stats".

2. `feature_slug`  
   - A git safe slug.  
   - Rules:  
     - Lowercase 
     - Kebab-case 
     - Only `a-z`, `0-9` and `-`  
     - Replace spaces and punctuation with `-`  
     - Collapse multiple `-` into one  
     - Trim `-` from start and end  
     - Maximum length 40 characters  
   - Example: `card-component` or `card-component-dashboard`.

3. `branch_name`  
   - Format: `claude/feature/<feature_slug>`  
   - Example: `claude/feature/card-component`.

4. `figma_hint` (optional)
   - If `$ARGUMENTS` contains the substring `figma:`
   - Then the text after `figma:` is the figma component link.
   - Trim whitespace.
   - Example input:
      - `/spec Card component, figma: https://www.figma.com/design/some-link`
      - `figma_hint` becomes `https://www.figma.com/design/some-link`


5. `backlog_ref` (optional)
   - If `$ARGUMENTS` references a file in `_backlog/` (e.g. "refer to _backlog/20260405-foo.md" or just a backlog filename), treat it as the source for this spec.
   - Read the backlog file and use its **Observation**, **Why It Matters**, and **Possible Resolutions** to pre-populate the spec context — these inform the clarification questions and the spec content.
   - Store the backlog file path so it can be deleted after the spec is saved.

If you cannot infer a sensible `feature_title` and `feature_slug`, ask the user to clarify instead of guessing.

## Step 3. Pull Figma context when needed

If `figma_hint` is present:

1. Launch the `figma-design-extractor` agent with the Figma link from `figma_hint` and the feature title as context. The agent will inspect the design and return a structured design brief.
2. From the brief returned by the agent, extract the key points relevant to the spec (dimensions, colour tokens, typography, states, accessibility notes) and include them as 3 to 8 concise bullet points in the spec's design reference section. Also record a link to the Figma component for future lookups.
3. If the agent fails or the design cannot be retrieved, record a note:
   - `"Design reference could not be retrieved. See Figma manually for details"`

Always summarise into human friendly notes — do not paste the raw agent output verbatim into the spec.

## Step 4. Clarification questions

Before writing anything, identify what is genuinely ambiguous or unknown about this feature and ask the user about those things — **one question at a time**. Wait for an answer before asking the next. Do not batch questions together.

Use judgment to decide which questions are worth asking. Skip anything already clearly answered by the user's input or obvious from the codebase context. Ask as many or as few questions as the feature warrants — some features need 2 questions, others may need 7 or more.

For each question, present **numbered options** the user can pick from, plus an explicit last option of "Other – type your own". Make the options feel specific and relevant to this feature, not generic. Where it makes sense, include a "Not sure / skip" option so the user can move on.

The following are **example question areas** to draw from — use whichever apply and add others that make sense for the feature:

- **User Story** — Who is the human user this feature adds value to, what do they want to do, and why? Use the format: "As a [user], I want [action] so that [value]." The user is always a person (e.g. logged-in user, guest, admin) — even if the feature is triggered by a system or scheduled process, write the story from the perspective of the human who benefits.
- **Happy path outcome** — What does success look like from the user's perspective?
- **Out of scope** — What should this feature explicitly NOT do?
- **Error & edge cases** — What failure states or validation rules are already known?
- **Existing patterns to follow** — Which components, hooks, or flows should this reuse or be consistent with?
- **Trigger** — What initiates this feature? Describe it in plain, non-technical language. Examples: "User clicks the save button", "Nightly scheduled job at 2am", "Payment provider sends a completed payment notification". Avoid technical terms like "cron", "webhook", "event listener", "API call" — describe the real-world action instead.
- **Data involved** — What data does this feature read or write, and where does it come from?
- **Permissions or auth requirements** — Does this feature behave differently depending on auth state?
- **Destruction or irreversibility** — Does this feature delete or mutate anything that can't be undone?
- **Dependencies or blockers** — Does this depend on another feature being built first?

After all answers are collected, proceed to Step 5.

## Step 5. Switch to a new Git branch

Before making any content, switch to a new Git branch using the `branch_name` derived from the `$ARGUMENTS`. If the branch name is already taken, then append a version number to it: e.g. `claude/feature/card-component-01`

## Step 6. Draft the spec content

**6a. Read existing specs for consistency and overlap**
Read the existing files in `_specs/` to:
- Calibrate the tone, depth, and level of detail used in this project — match that style in the new spec
- Check whether any existing spec covers behaviour that overlaps with or is superseded by this new feature. If so, note this explicitly in the new spec under a `## Related Specs` section, and flag to the user in the final output that those specs may need updating.
- Look for **behavioural inconsistencies** between related features that are *not* being changed by this feature. For each inconsistency spotted, ask the user **one at a time** with a question that includes: what the inconsistency is, why it could matter, and what the suggested resolution might be. If the user wants to capture it, create a backlog file following the format in @.claude/commands/backlog.md. If no, move on.

**6b. Write the draft**
Create a markdown spec document using the exact structure defined in: @.claude/references/spec-template.md

When populating **Security Considerations**, use: @.claude/references/security-checklist.md
When populating **Observability**, use: @.claude/references/observability-checklist.md

The spec must stay at the **functional and non-functional requirements** level — it describes *what* the feature does and *why*, from a user and product perspective. It is not a technical document.

Specifically:
- Do NOT reference specific function names, API calls, SDK methods, file paths, component names, or implementation details — this includes the `trigger` field: describe the real-world action, not the technical mechanism (e.g. "Nightly scheduled job at 2am" not "cron job", "Payment provider sends a completed payment notification" not "webhook")
- DO describe user-facing behaviour, business rules, constraints, and acceptance criteria in plain language
- A passing test for this: could a non-developer product manager read this spec and fully understand what needs to be built?

Use the answers from the clarification questions to populate the spec sections. Any question the user skipped or answered with uncertainty (e.g. "not sure", "none known yet") should be carried forward into the **Open Questions** section so unresolved decisions are explicitly documented.

**6c. Self-check before saving**
Before writing the file to disk, review the draft and verify:
- No section is left as `...` or contains only a single vague line
- Acceptance Criteria has at least 3 specific, independently testable statements
- Open Questions captures anything genuinely unresolved
- The spec contains no technical implementation details (function names, file paths, SDK references)

Fix any gaps before saving.

**6d. Delete the backlog item if applicable**
If this spec was created from a `backlog_ref`, delete the backlog file using `git rm` once the spec file has been successfully saved. The spec supersedes it — the backlog item no longer needs to exist.

## Step 7. Final output to the user

After the file is saved, respond to the user with a short summary in this exact format:

Branch: <branch_name>
Spec file: _specs/<feature_slug>.md
Title: <feature_title>
Related specs: <comma-separated list of affected spec files, or "None">
Backlog item removed: <backlog filename, or "N/A">

If any related specs were identified, add a short note below the summary listing which specs may need updating before implementation begins.

Do not repeat the full spec in the chat output unless the user explicitly asks to see it. The main goal is to save the spec file and report where it lives and what branch name to use.
