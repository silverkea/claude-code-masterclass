# Spec for signup-firebase-auth

branch: claude/feature/signup-firebase-auth
figma_component (if used): N/A

## Summary

Hook the existing signup form (`app/(public)/signup`) to Firebase Authentication using the `auth` and `db` exports from `lib/firebase.ts`. On successful account creation, generate a random PascalCase codename for the user's `displayName` and create a document in the Firestore `users` collection storing their `id` and `codename` (not their email).

## Functional Requirements

- The `AuthForm` component's `handleSubmit` in signup mode should call `createUserWithEmailAndPassword` from the Firebase web SDK using the `auth` export from `lib/firebase.ts`
- On successful signup, generate a random codename by picking one word from each of three distinct word lists and joining them in PascalCase (e.g. `SwiftBoldPenguin`)
- Call `updateProfile` on the newly created user to set their `displayName` to the generated codename
- Write a document to the Firestore `users` collection (using the `db` export from `lib/firebase.ts`) with the following fields only:
  - `id` — the Firebase user's `uid`
  - `codename` — the generated PascalCase codename
- The email address must NOT be stored in Firestore
- The word lists should each contain a set of unique, thematically appropriate words (e.g. adjectives, nouns, verbs) — at least 20 words per list
- The word lists should be defined as a standalone utility (not inline in the component) to keep the component clean
- On signup error, display a user-facing error message within the form
- While the signup request is in flight, the submit button should be disabled to prevent duplicate submissions

## Possible Edge Cases

- Firebase may reject the signup if the email is already in use — the error should be caught and shown to the user
- `updateProfile` and the Firestore write happen after account creation — if either fails, the user account still exists; errors should be caught and not crash the app
- The codename generator should never produce an empty string, even if a word list is accidentally empty (guard against this)

## Acceptance Criteria

- Submitting the signup form with a valid email and password creates a Firebase Auth user
- The created user's `displayName` is set to a randomly generated PascalCase codename
- A document exists in the `users` Firestore collection with the user's `uid` and `codename`, and no email field
- An error message is shown in the form if signup fails (e.g. email already in use, weak password)
- The submit button is disabled while the request is in flight
- The codename is always a non-empty PascalCase string composed of exactly three words

## Open Questions

- Where should the user be redirected after a successful signup?

## Testing Guidelines

Create test files in `./tests` covering the following without going too heavy:

- The codename generator always returns a non-empty PascalCase string
- The codename is composed of exactly three capitalised words joined together
- Each call to the generator can return a different result (non-deterministic output)
- `AuthForm` in signup mode calls `createUserWithEmailAndPassword` on submit with the entered email and password
- A Firestore document is written with `id` and `codename` after successful signup
- An error message is rendered when `createUserWithEmailAndPassword` rejects
- The submit button is disabled while signup is in progress
