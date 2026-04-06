"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { generateCodename } from "@/lib/codename";
import styles from "./AuthForm.module.css";

type AuthFormProps = {
  mode: "login" | "signup";
};

function getErrorMessage(code: string): string {
  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists.";
  }
  if (code === "auth/invalid-credential") {
    return "Incorrect email or password.";
  }
  return "Something went wrong. Please try again.";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (isLogin) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setEmail("");
        setPassword("");
        setSuccess("You're logged in!");
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? "";
        setError(getErrorMessage(code));
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const codename = generateCodename();
        await updateProfile(credential.user, { displayName: codename });
        await setDoc(doc(db, "users", credential.user.uid), {
          id: credential.user.uid,
          codename,
        });
        router.push("/heists");
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? "";
        setError(getErrorMessage(code));
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className="form-title">
        {isLogin ? "Log in to Your Account" : "Sign Up for an Account"}
      </h1>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input
          className={styles.input}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Password
        </label>
        <div className={styles.inputWrap}>
          <input
            className={styles.input}
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <button type="submit" className="btn" disabled={submitting}>
        {submitting
          ? isLogin
            ? "Logging in…"
            : "Signing up…"
          : isLogin
            ? "Log In"
            : "Sign Up"}
      </button>

      <Link href={isLogin ? "/signup" : "/login"} className={styles.switchLink}>
        {isLogin
          ? "Don't have an account? Sign up"
          : "Already have an account? Log in"}
      </Link>
    </form>
  );
}
