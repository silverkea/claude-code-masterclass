# Plan: Login Form Authentication

## Context
The login form currently submits but does nothing — `handleSubmit` only runs the signup branch (`if (!isLogin)`). This feature wires up real authentication for login mode: calls the sign-in service, shows an inline success message, clears the fields, and handles errors. Spec: `_specs/login-form-authentication.md`.

## Critical Files
- `tests/components/AuthForm.test.tsx` — add login submission tests
- `components/AuthForm/AuthForm.tsx` — implement login branch in handleSubmit, add success state, extend error handling
- `components/AuthForm/AuthForm.module.css` — add `.success` style

## Reuse Existing Patterns
- `submitting` state — already exists, already disables the button; reuse as-is for login
- `error` state + `getErrorMessage` — already exists; extend with login-specific error codes
- `try/catch/finally` pattern — identical to signup; login branch mirrors this structure
- `auth` export from `lib/firebase` — already imported

## TDD Order

### Step 1 — Extend mocks and add failing tests

The existing `vi.mock("firebase/auth")` only mocks `createUserWithEmailAndPassword` and `updateProfile`. Add `signInWithEmailAndPassword` to the mock factory.

```ts
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}))
```

Add to imports:
```ts
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth"
const mockSignIn = vi.mocked(signInWithEmailAndPassword)
```

Add a `fillAndSubmitLogin()` helper alongside the existing signup one:
```ts
function fillAndSubmitLogin() {
  render(<AuthForm mode="login" />)
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } })
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } })
  fireEvent.submit(screen.getByRole("button", { name: "Log In" }).closest("form")!)
}
```

**New `describe("AuthForm login")` block with these tests:**

1. Calls signInWithEmailAndPassword with entered credentials
2. Shows inline success message on successful login
3. Clears email and password fields on successful login
4. Shows specific error for invalid credentials (`auth/invalid-credential`)
5. Shows generic error for other failures
6. Disables submit button while login is in progress
7. Shows loading text on button while login is in progress

### Step 2 — Confirm tests fail, then implement

### Step 3 — `AuthForm.tsx` changes

**a) Add import:**
```ts
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth"
```

**b) Add success state** alongside existing error state:
```ts
const [success, setSuccess] = useState<string | null>(null)
```

**c) Extend `getErrorMessage`** with login-specific code:
```ts
function getErrorMessage(code: string): string {
  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists."
  }
  if (code === "auth/invalid-credential") {
    return "Incorrect email or password."
  }
  return "Something went wrong. Please try again."
}
```
Note: `auth/invalid-credential` is the Firebase v9+ code that covers wrong password and non-existent email in a single code — intentionally non-specific to avoid revealing whether the email is registered (OWASP).

**d) Implement login branch in handleSubmit:**
```ts
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  setError(null)
  setSuccess(null)
  setSubmitting(true)

  if (isLogin) {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setEmail("")
      setPassword("")
      setSuccess("You're logged in!")
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ""
      setError(getErrorMessage(code))
    } finally {
      setSubmitting(false)
    }
  } else {
    // ... existing signup logic unchanged
  }
}
```

**e) Add success message to JSX** (alongside existing error):
```tsx
{error && <p className={styles.error}>{error}</p>}
{success && <p className={styles.success}>{success}</p>}
```

**f) Add loading text to button** (already disabled via `submitting`):
```tsx
<button type="submit" className="btn" disabled={submitting}>
  {submitting
    ? isLogin ? "Logging in…" : "Signing up…"
    : isLogin ? "Log In" : "Sign Up"}
</button>
```

### Step 4 — `AuthForm.module.css`

Add one new class:
```css
.success {
  @apply text-success text-sm;
}
```
`text-success` maps to `--color-success: #05DF72` already defined in `globals.css`.

## Verification

```bash
npx vitest run tests/components/AuthForm.test.tsx   # all tests pass
npm test                                             # no regressions
```

Manual:
1. Sign in with valid credentials → success message appears, fields clear
2. Sign in with wrong password → "Incorrect email or password."
3. Sign in with network disconnected → generic error message
4. Confirm button shows "Logging in…" and is disabled during request
5. Confirm no redirect occurs on success
6. Confirm signup flow still works (no regression)
