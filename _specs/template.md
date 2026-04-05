# Spec for <feature-name>

branch: claude/feature/<feature-name>
figma_component (if used): <figma-component-name>

## User Story
<!-- Complete this sentence: "As a [user], I want [action] so that [value]."
     The user is always a human whose experience this feature improves (e.g. logged-in user, guest, admin).
     Even if the feature is triggered by a system or scheduled process, the story should be written
     from the perspective of the person who ultimately benefits. -->

## Trigger
<!-- What initiates this feature, in plain language — e.g: 
    "User submits the signup form", 
    "Nightly scheduled job at 2am", 
    "Payment provider sends a completed payment notification" -->

## Summary
<!-- 2–4 sentences. What is this feature, who is it for, and why does it exist?
     Be specific enough that someone unfamiliar with the idea can understand the intent. -->

## Functional Requirements
<!-- List the concrete behaviours this feature must have.
     Each bullet should be specific and testable — avoid vague language like "should work well".
     Aim for at least 4–6 requirements. -->
- ...

## Figma Design Reference (only if referenced)
- File: ...
- Component name: ...
- Key visual constraints: ...

## Success Criteria
<!-- What does "done" look like from the user's perspective?
     Describe the happy-path outcome in observable terms.
     e.g. "User sees a confirmation message and is redirected to /heists" -->
- ...

## Out of Scope
<!-- What does this feature explicitly NOT do?
     This prevents scope creep and clarifies implementation boundaries.
     e.g. "Password reset is not part of this feature" -->
- ...

## Non-Functional Requirements
<!-- Requirements that describe how the feature performs, not what it does.
     Only include what is relevant — omit sections that don't apply.
     - Performance: e.g. "Page loads within 2 seconds on a standard connection"
     - Accessibility: e.g. "Form is navigable by keyboard and compatible with screen readers (WCAG 2.1 AA)"
     - Browser/device support: e.g. "Works on modern evergreen browsers and mobile viewports"
     - Reliability: e.g. "Failure of this feature must not crash unrelated parts of the app" -->
- ...

## Security Considerations
<!-- Identify any security concerns relevant to this feature.
     Consider OWASP Top 10 risks (injection, broken auth, XSS, insecure data exposure, etc.).
     Consider data privacy obligations for the users this feature affects:
     - Personal data handling: is any PII collected, stored, or transmitted?
     - Regional regulations: GDPR (EU), CCPA (California), LGPD (Brazil), PIPEDA (Canada), APPI (Japan), Privacy Act (Australia)
     - Industry-specific: PCI-DSS for payment data, HIPAA for health data
     - Secrets: does this feature require any new credentials, API keys, or secrets?
       If so, note that they must be stored in environment variables, never in source code.
     If no security considerations apply, state "None identified" rather than leaving this blank. -->
- ...

## Edge Cases & Constraints
<!-- Known failure states, validation rules, or constraints.
     e.g. "Email already in use returns a specific error", "Password must be ≥6 chars" -->
- ...

## Acceptance Criteria
<!-- Precise, testable statements that define when this feature is complete.
     Each item should be independently verifiable — written as "Given/When/Then" or similar.
     Aim for at least 3 criteria. -->
- ...

## Observability
<!-- Consider logging, monitoring, and error handling for this feature.
     
     Logging: What events or outcomes are worth logging? (e.g. "Failed login attempts should be logged")
     Never log sensitive data — passwords, tokens, PII, payment details.
     
     Monitoring: Are there outcomes that should be observable or alertable in production?
     (e.g. "A spike in failed signups may indicate a credential stuffing attack")
     
     Error handling: How should failures be surfaced to the user?
     User-facing errors must be clear and actionable but must never expose internal details —
     no stack traces, service names, database errors, or implementation specifics.
     If no specific requirements apply, state "Standard error handling applies" rather than leaving blank. -->
- ...

## Related Specs
<!-- List any existing specs that overlap with or are affected by this feature.
     If this feature changes behaviour described elsewhere, those specs should be updated
     before implementation begins. Omit this section if there are no related specs. -->

## Open Questions
<!-- Unresolved decisions, unknowns, or deferred choices that need answers before or during implementation.
     Anything the team is unsure about should live here rather than be silently omitted.
     e.g. "Should the codename be editable after signup?" -->
- ...

## Testing Guidelines
<!-- Describe what should be tested, not how. Cover:
     - The happy path (feature works as expected)
     - Key error states (e.g. invalid input, failed API call)
     - Any edge cases listed above that are worth asserting
     Keep tests focused — don't go overboard. -->
Create test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases:
- ...
