# useHeists Query Definitions Don't Reflect True Heist Lifecycle

Type: inconsistency
Spotted during: expired-heist-card spec
Related: use-heists-data-hook.md, hooks/useHeists.ts

## Observation

The `useHeists` hook uses deadline alone to classify heists across all three modes:

- `expired` mode: `deadline < now` — catches overdue heists but misses heists resolved early (where `finalStatus` is `"success"` or `"failure"` before the deadline elapsed)
- `active` mode: `assignedTo == uid AND deadline > now` — does not exclude heists that have already been marked success/failure, so resolved heists can keep appearing in the active section until their deadline passes
- `assigned` mode: `createdBy == uid AND deadline > now` — same issue

A heist resolved early (e.g. marked `"success"` two days before its deadline) will continue to appear in the active and/or assigned sections, and will never appear in the expired section until the deadline clock runs out.

## Why It Matters

Users will see completed heists in their active workload, making the dashboard misleading. The expired section will silently miss recently resolved heists, undermining trust in the UI. As heists accumulate, ghost-active heists become increasingly disruptive.

## Possible Resolutions

- **Option A: Firestore OR query** — Use Firestore's composite `Query.or()` to combine `finalStatus != null` and `deadline < now` for the expired query; add `finalStatus == null` filter to active and assigned queries. Requires Firestore SDK support for OR queries and a composite index. Most accurate.
- **Option B: Client-side merge** — Run two separate Firestore queries for expired (one for overdue, one for non-null finalStatus), deduplicate, and merge client-side. Simpler to implement but doubles subscription count for that mode.
- **Option C: Always-set finalStatus** — Treat `finalStatus` as always required by the deadline job (i.e. a background process marks overdue heists failed automatically). Then expired = `finalStatus != null` becomes a single, clean query. Requires a background process and changes the data contract.
