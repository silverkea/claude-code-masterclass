# Plan: Firestore Heist Document Types

## Context

The `heists` Firestore collection has no canonical TypeScript contract. Any future feature that reads or writes heist documents will need to define its own ad-hoc shape, leading to inconsistency and fragility. This plan establishes the shared type layer — `Heist`, `CreateHeistInput`, `UpdateHeistInput`, a Firestore converter, and the `COLLECTIONS` constant — following the pattern defined in the `firestore-schemas` skill.

Spec: `_specs/firestore-heist-types.md`

---

## Key Facts

- Firebase version: `12.11.0`
- Firestore instance: `db` exported from `lib/firebase.ts:17`
- No `types/` directory exists yet — needs to be created
- Only existing Firestore usage: `AuthForm/AuthForm.tsx:69-72` — an ad-hoc `setDoc` to a `users` collection (no converter, no types). This is not changed by this plan.
- Test pattern: `tests/` mirrors source structure; uses Vitest + jsdom

---

## Files to Create

### 1. `types/firestore/heist.ts`

Types and converter for the `heists` collection.

**`Heist`** — full document shape after conversion:
```
id: string
title: string
description: string
createdBy: string          // uid
createdByCodename: string
assignedTo: string | null
assignedToCodename: string | null
deadline: Date
finalStatus: null | 'success' | 'failure'
createdAt: Date
```

**`CreateHeistInput`** — passed to `addDoc`:
```
title: string
description: string
createdBy: string
createdByCodename: string
assignedTo?: string | null
assignedToCodename?: string | null
deadline: Timestamp         // Timestamp.fromDate(new Date(Date.now() + 48h))
finalStatus: null           // always null at creation
createdAt: FieldValue       // serverTimestamp()
```

**`UpdateHeistInput`** — passed to `updateDoc` (all optional, no `createdAt`):
```
title?: string
description?: string
assignedTo?: string | null
assignedToCodename?: string | null
deadline?: Timestamp
finalStatus?: null | 'success' | 'failure'
```

**`heistConverter`**:
- `toFirestore`: returns data as-is (`Partial<Heist>`)
- `fromFirestore`: maps snapshot to `Heist`, calling `.toDate()` on `createdAt` and `deadline`; handles absent `assignedTo`/`assignedToCodename` safely (defaults to `null`)

Imports needed: `FieldValue`, `Timestamp`, `DocumentData`, `QueryDocumentSnapshot` from `'firebase/firestore'`

---

### 2. `types/firestore/index.ts`

Barrel export + collections constant:

```typescript
export * from './heist'

export const COLLECTIONS = {
  HEISTS: 'heists',
} as const
```

Note: `USERS` is intentionally omitted — no User type exists yet (see `_backlog/20260405-firestore-user-document-type.md`).

---

### 3. `tests/firestore/heist.test.ts`

Tests for the converter only (types are compile-time, not runtime-testable).

Helper: a `makeSnapshot(data, id)` factory that returns a minimal `QueryDocumentSnapshot` mock with `snapshot.data()` returning `data` and `snapshot.id` returning `id`. The `createdAt` and `deadline` fields in mock data should be mock Firestore `Timestamp` objects (with a `.toDate()` method returning a `Date`).

Test cases (per spec acceptance criteria):
1. `fromFirestore` returns `createdAt` as a `Date` instance
2. `fromFirestore` returns `deadline` as a `Date` instance
3. `fromFirestore` maps `id` from `snapshot.id`, not from `snapshot.data().id`
4. `fromFirestore` does not throw when `assignedTo` and `assignedToCodename` are absent
5. `fromFirestore` defaults absent `assignedTo` to `null`
6. `fromFirestore` defaults absent `assignedToCodename` to `null`

---

## Implementation Order

1. Create `types/firestore/heist.ts`
2. Create `types/firestore/index.ts`
3. Create `tests/firestore/heist.test.ts`
4. Run `npx vitest run tests/firestore/heist.test.ts` — all tests must pass

---

## Verification

```bash
npx vitest run tests/firestore/heist.test.ts
npm run build   # confirm no TypeScript errors
```
