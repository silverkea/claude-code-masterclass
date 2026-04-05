# Server-Side Firestore Access via Next.js Server Actions

**Type:** improvement

## Observation

The app currently accesses Firestore directly from the browser using the Firebase client SDK. Next.js App Router supports Server Actions — async functions that run on the server and are called directly from client components. This enables a more secure architecture where Firestore writes go through a trusted server-side boundary rather than the browser.

## Why It Matters

Client-side Firestore access means:
- The real system boundary is Firestore Security Rules (a Firebase console concern), not app code
- A malicious user can bypass all client-side validation (React Hook Form, Zod) and call Firestore directly
- Firebase credentials and collection structure are visible in the browser
- Validation in the browser is UX-only, not a security guarantee

With Server Actions + Firebase Admin SDK:
- Validation (Zod) runs on the server — it cannot be bypassed by the client
- The Admin SDK authenticates server-to-server — no client SDK credentials exposed
- Firestore writes are controlled entirely within trusted app code
- Aligns with CLAUDE.md's "input validation at system boundaries" requirement

## Which Specs / Files It Relates To

- `_specs/create-heist-form.md` — first feature to use client-side Firestore write
- `components/AuthForm/AuthForm.tsx` — existing signup flow writes to Firestore client-side
- `lib/firebase.ts` — client SDK initialisation; Admin SDK would live in a separate `lib/firebase-admin.ts`
- All future specs that involve writing to Firestore

## Possible Resolutions

1. **Migrate all Firestore writes to Server Actions** — introduce Firebase Admin SDK, add service account credentials to `.env.local`, refactor existing writes (signup, create heist, etc.) to use Server Actions. Full validation with Zod on both client (UX) and server (security). This is the intended long-term direction for the whole app.

2. **Incremental migration** — new features use Server Actions going forward; existing client-side writes (signup) are refactored separately. Lower risk than a big-bang rewrite.

3. **Firestore Security Rules** — harden the client-side architecture with strict rules on the Firebase console instead. Keeps the current pattern but moves the validation boundary into Firebase config rather than app code. Less maintainable and not visible in the codebase.

## Spotted During

`create-heist-form` spec and planning session (2026-04-05). Deferred because the current codebase is fully client-side and migrating is a cross-cutting concern beyond the scope of this feature.
