---
description: Enter plan mode and produce an implementation plan from a spec
argument-hint: "[feature-slug matching a file in _specs/]"
allowed-tools: Read, Glob, ExitPlanMode
---

A feature spec exists at `$ARGUMENTS`. Enter plan mode and produce a detailed implementation plan for it.

## Instructions

1. Read `$ARGUMENTS.md` fully before doing anything else
2. Explore the codebase as needed to understand the implementation context
3. Produce a complete implementation plan and exit plan mode
4. Save the plan to `_plans/` using the same file name as from `$ARGUMENTS` — this is mandatory

**DO NOT START IMPLEMENTING - ALLOW THE USER TIME TO REVIEW AND GIVE FEEDBACK**

The plan file is the technical complement to the spec: where the spec describes *what* and *why*, the plan describes *how*. Saved plans can be referred back to during implementation without repeating context.
