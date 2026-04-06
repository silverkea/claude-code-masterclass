# Security & Compliance Checklist

Use this checklist when writing Security Considerations in a spec or reviewing a plan.

## OWASP Top 10

Always consider during planning:

- **Injection** — SQL, command, template injection via user-controlled input
- **Broken authentication** — weak session management, credential exposure, missing auth checks
- **XSS** — reflected or stored cross-site scripting via unsanitised output
- **Insecure direct object references** — access to resources without authorisation check
- **Security misconfiguration** — default credentials, overly permissive settings, exposed error detail
- **Sensitive data exposure** — PII, tokens, or credentials transmitted or stored insecurely
- **CSRF** — state-changing requests that can be forged from a third-party origin
- **Using components with known vulnerabilities** — outdated or unpatched dependencies

Also consider **OWASP ASVS** for features with significant auth, data handling, or trust boundary concerns.

## Principles

- **Principle of least privilege** — users, services, and components should only have the access they actually need
- **Secure by default** — features should be locked down unless explicitly opened
- **Input validation at system boundaries** — validate and sanitise at every entry point; never trust user input, external services, or third-party systems
- **Dependency hygiene** — prefer well-maintained dependencies; be aware of CVEs

## Secrets & Credentials

Never include secrets in source code. This includes:
- API keys and tokens
- Passwords and passphrases
- Private keys and certificates
- Database connection strings
- Service account credentials
- Webhook signing secrets

Secrets must be stored in environment variables (e.g. `.env.local`) and accessed via `process.env`. Document new variable names (not values) in `.env.example`. If a secret is already committed, treat it as compromised and rotate immediately.

**Exception**: Firebase client config is intentionally public by design — see `lib/firebase.ts`.

## Data Privacy & Regional Regulations

When a feature collects, stores, transmits, or processes personal data, identify applicable regulations:

- **GDPR** (EU/EEA) — comprehensive baseline; good default even outside EU
- **CCPA/CPRA** (California) — similar rights and obligations to GDPR
- **LGPD** (Brazil) — closely modelled on GDPR
- **PIPEDA** (Canada)
- **APPI** (Japan)
- **Privacy Act** (Australia)
- **PCI-DSS** — global requirement wherever payment card data is handled
- **HIPAA** (USA) — health and medical data

If a feature touches personal data, the spec's Security Considerations section must identify which regulations are relevant and note any obligations (e.g. right to erasure, data minimisation, consent).
