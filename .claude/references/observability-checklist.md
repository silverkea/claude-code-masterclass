# Observability Checklist

Use this checklist when writing the Observability section of a spec or reviewing a plan.

## Logging

- Log key events, outcomes, and errors so problems in production are always traceable
- **Never log sensitive data**: passwords, authentication tokens, session IDs, PII, or payment details
- Use structured logging (key/value pairs) over freeform strings — structured logs are searchable and parseable
- Use appropriate log levels:
  - `info` — normal significant events
  - `warn` — recoverable unexpected states
  - `error` — failures that need attention
- Log errors with full context (what was happening, relevant IDs) so they can be diagnosed without reproducing the issue

## Monitoring

- Consider whether there are outcomes worth monitoring or alerting on in production
- Silent failures are worse than noisy ones — if something can fail without anyone noticing, make it observable
- Examples worth considering: repeated auth failures (may indicate an attack), payment failures, background job failures, third-party service errors

## Error & Exception Handling

- **User-facing errors** must be clear and actionable but must never expose internal details — no stack traces, database error messages, service names, file paths, or implementation specifics. Raw error messages are an OWASP information disclosure risk.
- Provide a generic user-facing message for unexpected errors. Where helpful, include a reference code the user can quote for support.
- **Internal errors** must be caught, logged with full context, and must not crash unrelated parts of the app
- Handle errors at the appropriate level — don't swallow exceptions silently, and don't let low-level errors bubble up raw to the UI
