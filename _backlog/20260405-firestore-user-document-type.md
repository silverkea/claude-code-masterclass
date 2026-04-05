# Firestore User Document Type

**Type:** improvement

## Observation

The `signup-firebase-auth` spec states that a user's identifier and codename are stored "so the app can retrieve them later", but no Firestore `User` document type has been defined. The data shape, collection name, and converter for user documents remain informal.

## Why It Matters

Without a canonical `User` type, any feature that reads or writes user profile data from Firestore will define its own ad-hoc shape — creating inconsistency and making it harder to refactor later. This was deferred during the `firestore-heist-types` spec because no feature currently requires reading user documents.

## Which Specs / Files It Relates To

- `_specs/signup-firebase-auth.md` — implies a stored user profile exists
- `_specs/firestore-heist-types.md` — established the pattern this would follow
- `types/firestore/` — where the User type would live

## Possible Resolutions

1. **Add `User` type alongside `Heist`** — extend `types/firestore/` with a `user.ts` file following the same pattern. Simple, low-risk, and unblocks future features immediately.
2. **Defer until a feature needs it** — only define the User type when a concrete feature (e.g. profile page, assignee lookup) requires it. Avoids speculative work but risks inconsistency if multiple features define their own shapes first.
3. **Infer from Auth + Firestore** — keep user identity in Firebase Auth only and avoid a Firestore user document altogether, relying on `displayName` from the Auth profile. Only viable if no extra user data beyond the codename is ever needed.

## Spotted During

`firestore-heist-types` spec creation (2026-04-05)
