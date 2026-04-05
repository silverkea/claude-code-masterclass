# Plan: Navbar Logout Button

## Context
The navbar currently has no auth awareness. This feature adds a logout button that only appears when a user is signed in, signs them out on click, and handles in-progress and failure states gracefully. No redirect on success — the navbar updates automatically via the existing auth context listener. Spec: `_specs/navbar-logout-button.md`.

## Critical Files
- `tests/components/Navbar.test.tsx` — add mocks and 6 new tests
- `components/Navbar/Navbar.tsx` — convert to client component, add auth + logout logic
- `components/Navbar/Navbar.module.css` — add `.logoutBtn` style and `ul` flex layout

## Approach

### Reuse existing patterns
- `useUser()` from `context/AuthContext.tsx` — provides `{ user, loading }`
- `auth` export from `lib/firebase.ts` — passed to `signOut()`
- Loading/disabled pattern from `AuthForm.tsx` — local `signingOut` state, try/finally, `disabled={signingOut}`

### TDD Order

**Step 1 — Write failing tests** (`tests/components/Navbar.test.tsx`)

Add mocks at top of file:
```ts
import { vi, beforeEach } from "vitest"
import userEvent from "@testing-library/user-event"
import { waitFor } from "@testing-library/react"
import { User } from "firebase/auth"
import { signOut } from "firebase/auth"
import { useUser } from "@/context/AuthContext"

vi.mock("@/lib/firebase", () => ({ auth: {} }))
vi.mock("firebase/auth", () => ({ signOut: vi.fn() }))
vi.mock("@/context/AuthContext", () => ({ useUser: vi.fn() }))

const mockUseUser = vi.mocked(useUser)
const mockSignOut = vi.mocked(signOut)

beforeEach(() => {
  vi.clearAllMocks()
  mockUseUser.mockReturnValue({ user: null, loading: false })
})
```

Six new tests:
1. Renders logout button when signed in
2. No logout button when signed out
3. No logout button while auth is loading
4. Click disables button and calls signOut
5. Button re-enabled if signOut fails
6. Button hidden after successful sign-out (rerender with user: null)

**Step 2 — Confirm tests fail**, then implement:

**Step 3 — `Navbar.tsx`**
- Add `"use client"` as first line
- Add imports: `useState`, `signOut` from `firebase/auth`, `auth` from `@/lib/firebase`, `useUser` from `@/context/AuthContext`
- Inside component: `const { user, loading } = useUser()` and `const [signingOut, setSigningOut] = useState(false)`
- Add handler:
```ts
async function handleLogout() {
  setSigningOut(true)
  try {
    await signOut(auth)
  } catch {
    // silently re-enable
  } finally {
    setSigningOut(false)
  }
}
```
- Add to JSX inside `<ul>`, before the Create Heist `<li>`:
```tsx
{!loading && user && (
  <li>
    <button
      className={styles.logoutBtn}
      onClick={handleLogout}
      disabled={signingOut}
    >
      {signingOut ? "Logging out…" : "Logout"}
    </button>
  </li>
)}
```

**Step 4 — `Navbar.module.css`**
```css
.siteNav ul {
  @apply flex items-center gap-3;
}

.logoutBtn {
  @apply bg-transparent text-white font-normal text-base
         border border-white rounded-[10px]
         inline-flex items-center justify-center
         cursor-pointer transition-opacity;
  width: 127px;
  height: 38px;
}

.logoutBtn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
```

## Verification

```bash
npx vitest run tests/components/Navbar.test.tsx  # all 8 tests pass
npm test                                          # no regressions
npx tsc --noEmit                                  # no type errors
```

Manual:
1. Signed out → no logout button
2. Sign in → logout button appears left of "Create Heist"
3. Click logout → button shows "Logging out…" and is disabled
4. Sign-out completes → button disappears, no redirect
5. Simulate failure → button re-enables silently
