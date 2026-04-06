---
description: Enter plan mode and produce an implementation plan from a spec
argument-hint: "[feature-slug matching a file in _specs/]"
allowed-tools: Read, Glob
---

A feature spec exists at `_specs/$ARGUMENTS.md`. Enter plan mode and produce a detailed implementation plan for it.

## Instructions

1. Read `_specs/$ARGUMENTS.md` fully before doing anything else
2. Explore the codebase as needed to understand the implementation context
3. Produce a complete implementation plan
4. Save the plan to `_plans/$ARGUMENTS.md` before exiting plan mode — this is mandatory

The plan file is the technical complement to the spec: where the spec describes *what* and *why*, the plan describes *how*. Saved plans can be referred back to during implementation without repeating context.
