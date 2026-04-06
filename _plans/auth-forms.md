# Plan: Authentication Forms

## Context

The `/login` and `/signup` pages currently have only a heading and no form functionality. This plan implements the forms described in `_specs/auth-forms.md`: email + password fields, a show/hide password toggle using lucide-react icons, a submit button that logs to the console, and a navigation link to switch between forms.

---

## Approach

Create a single reusable `AuthForm` component that accepts a `mode` prop (`"login" | "signup"`). Both pages are nearly identical — only the title, button label, and switch link differ — so one component avoids duplication.

---

## Files to Create / Modify

### New files
- `components/AuthForm/AuthForm.tsx` — reusable form component with `mode` prop
- `components/AuthForm/AuthForm.module.css` — scoped styles for inputs, labels, toggle icon
- `components/AuthForm/index.ts` — barrel export
- `tests/components/AuthForm.test.tsx` — component tests

### Modified files
- `app/(public)/login/page.tsx` — render `<AuthForm mode="login" />`
- `app/(public)/signup/page.tsx` — render `<AuthForm mode="signup" />`, fix heading from `h2` → `h1`

---

## Component Design

### `AuthForm` props
```
type AuthFormProps = {
  mode: "login" | "signup"
}
```

### State
- `email: string`
- `password: string`
- `showPassword: boolean`

### Behaviour
- Password field `type` toggles between `"password"` and `"text"` via `showPassword` state
- Toggle icon: `Eye` (password hidden) / `EyeOff` (password visible) from `lucide-react`
- `onSubmit`: `e.preventDefault()` then `console.log({ email, password })`
- Switch link: plain `<Link>` anchor to the other route

### Reuse existing
- `.btn` class from `globals.css` for the submit button
- `.form-title` for the heading
- `.center-content` + `.page-content` remain on the page wrapper (already in place)
- `lucide-react` (already a dependency) for `Eye` / `EyeOff` icons

### CSS Module classes needed
- `.form` — stacked flex column with gap
- `.field` — label + input wrapper
- `.label` — small, muted label text
- `.inputWrap` — relative container for input + toggle icon
- `.input` — styled text input using `bg-lighter` theme token
- `.toggle` — absolutely positioned icon button (no background, no border)
- `.switchLink` — muted small text below the submit button

---

## Tests (`tests/components/AuthForm.test.tsx`)

1. Login mode renders email input, password input, and "Log In" button
2. Signup mode renders email input, password input, and "Sign Up" button
3. Password toggle button changes input type from `"password"` to `"text"`
4. Toggling password visibility does not clear the password field value

---

## Verification

1. `npx vitest run tests/components/AuthForm.test.tsx` — all tests pass
2. `npm run dev` → visit `/login`: form renders, submit logs `{ email, password }` to console, link navigates to `/signup`
3. Visit `/signup`: same behaviour, link navigates back to `/login`
4. Eye icon toggles password visibility without clearing the field
