# Plan: Route Protection

## Context
Both route group layouts currently render their content unconditionally — no auth checks, no redirects. This feature adds auth-aware guards to the `(public)` and `(dashboard)` layout files so users always land on the right page. It also introduces a branded three-dot pulsing loading screen shown while Firebase resolves the initial auth state, preventing any flash of wrong content. Spec: `_specs/route-protection.md`.

## Critical Files

**Modify:**
- `app/(public)/layout.tsx` — convert to client component, add auth guard (redirect signed-in users to `/heists`, exempt `/preview`)
- `app/(dashboard)/layout.tsx` — convert to client component, add auth guard (redirect signed-out users to `/`)

**Create:**
- `components/Loader/Loader.tsx` — three-dot pulse animation component
- `components/Loader/Loader.module.css` — dot styles and keyframe animation
- `components/Loader/index.ts` — barrel export
- `tests/components/Loader.test.tsx`
- `tests/components/PublicLayout.test.tsx`
- `tests/components/DashboardLayout.test.tsx`

## Reuse Existing Patterns
- `useUser()` from `context/AuthContext.tsx` — provides `{ user, loading }` (same pattern as `Navbar.tsx`)
- `vi.mock("@/context/AuthContext")` + `mockUseUser.mockReturnValue(...)` — established test pattern from `Navbar.test.tsx`
- `vi.mock("next/navigation")` — established pattern from `AuthForm.test.tsx`

## TDD Order

### Step 1 — `Loader` component (no deps, easiest first)

**Test** (`tests/components/Loader.test.tsx`):
```ts
import { render, screen } from "@testing-library/react"
import Loader from "@/components/Loader"

describe("Loader", () => {
  it("renders three dots", () => {
    render(<Loader />)
    expect(document.querySelectorAll("[class*='dot']")).toHaveLength(3)
  })

  it("is wrapped in a container with a role or testid", () => {
    render(<Loader />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })
})
```

**Implementation** (`components/Loader/Loader.tsx`):
```tsx
import styles from "./Loader.module.css"

export default function Loader() {
  return (
    <div className={styles.loader} role="status" aria-label="Loading">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  )
}
```

**CSS** (`components/Loader/Loader.module.css`):
```css
@reference "../../app/globals.css";

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.loader {
  @apply flex items-center justify-center gap-4 min-h-lvh;
}

.dot {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--color-primary);
  animation: pulse 1.4s ease-in-out infinite;
}

.dot:nth-child(2) {
  background-color: var(--color-secondary);
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}
```

**Barrel** (`components/Loader/index.ts`):
```ts
export { default } from "./Loader"
```

### Step 2 — Public layout guard

**Test** (`tests/components/PublicLayout.test.tsx`):

Mocks needed:
```ts
vi.mock("@/context/AuthContext", () => ({ useUser: vi.fn() }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: vi.fn(),
}))
vi.mock("@/components/Loader", () => ({
  default: () => <div data-testid="loader" />,
}))

const mockUseUser = vi.mocked(useUser)
const mockUsePathname = vi.mocked(usePathname)
let mockReplace: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  mockReplace = vi.fn()
  vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as never)
  mockUsePathname.mockReturnValue("/login")
  mockUseUser.mockReturnValue({ user: null, loading: false })
})
```

Tests:
1. Shows loader while auth is loading
2. Renders children for a signed-out user
3. Shows loader (not children) for a signed-in user and calls `router.replace("/heists")`
4. Renders children for a signed-in user on `/preview` (exempt route)

**Implementation** (`app/(public)/layout.tsx`):
```tsx
"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/context/AuthContext"
import Loader from "@/components/Loader"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const isExempt = pathname === "/preview"

  useEffect(() => {
    if (!loading && user && !isExempt) {
      router.replace("/heists")
    }
  }, [loading, user, isExempt, router])

  if (loading || (user && !isExempt)) return <Loader />

  return <main className="public">{children}</main>
}
```

### Step 3 — Dashboard layout guard

**Test** (`tests/components/DashboardLayout.test.tsx`):

Mocks needed:
```ts
vi.mock("@/context/AuthContext", () => ({ useUser: vi.fn() }))
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}))
vi.mock("@/components/Navbar", () => ({ default: () => <nav data-testid="navbar" /> }))
vi.mock("@/components/Loader", () => ({
  default: () => <div data-testid="loader" />,
}))

const mockUseUser = vi.mocked(useUser)
let mockReplace: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  mockReplace = vi.fn()
  vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as never)
  mockUseUser.mockReturnValue({ user: null, loading: false })
})
```

Tests:
1. Shows loader while auth is loading
2. Shows loader (not children) for a signed-out user and calls `router.replace("/")`
3. Renders navbar and children for a signed-in user

**Implementation** (`app/(dashboard)/layout.tsx`):
```tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/AuthContext"
import Navbar from "@/components/Navbar"
import Loader from "@/components/Loader"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
    }
  }, [loading, user, router])

  if (loading || !user) return <Loader />

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
```

## Verification

```bash
npx vitest run tests/components/Loader.test.tsx
npx vitest run tests/components/PublicLayout.test.tsx
npx vitest run tests/components/DashboardLayout.test.tsx
npx vitest run   # full suite — no regressions
npx tsc --noEmit # no type errors
```

Manual:
1. Signed out → navigate to `/heists` → redirected to `/`
2. Signed in → navigate to `/login` → redirected to `/heists`
3. Either state → navigate to `/preview` → page loads normally
4. On first load → loading dots appear briefly before content or redirect
