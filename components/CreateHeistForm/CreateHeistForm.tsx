"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/AuthContext";
import { COLLECTIONS } from "@/types/firestore";
import type { CreateHeistInput } from "@/types/firestore";
import styles from "./CreateHeistForm.module.css";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type FormValues = z.infer<typeof schema>;

type UserResult = { id: string; codename: string };

export default function CreateHeistForm() {
  const { user } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [assignee, setAssignee] = useState<UserResult | null>(null);
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const isFocusedRef = useRef(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function fetchUsers(searchTerm: string) {
    const trimmed = searchTerm.trim();
    const q = trimmed
      ? query(
          collection(db, COLLECTIONS.USERS),
          where("codename", ">=", trimmed),
          where("codename", "<=", trimmed + "\uf8ff"),
          orderBy("codename"),
          limit(50),
        )
      : query(
          collection(db, COLLECTIONS.USERS),
          orderBy("codename"),
          limit(50),
        );
    try {
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map((doc) => doc.data() as UserResult)
        .filter((u) => u.id !== user?.uid);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }

  useEffect(() => {
    if (!isFocusedRef.current) return;
    const timer = setTimeout(() => fetchUsers(assigneeQuery), 300);
    return () => clearTimeout(timer);
  }, [assigneeQuery, user?.uid]);

  function handleFocus() {
    isFocusedRef.current = true;
    setIsFocused(true);
    fetchUsers(assigneeQuery);
  }

  function handleBlur() {
    setTimeout(() => {
      isFocusedRef.current = false;
      setIsFocused(false);
      setSearchResults([]);
    }, 150);
  }

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const input: CreateHeistInput = {
      title: values.title.trim(),
      description: values.description.trim(),
      createdBy: user!.uid,
      createdByCodename: user!.displayName ?? "",
      assignedTo: assignee?.id ?? null,
      assignedToCodename: assignee?.codename ?? null,
      deadline: Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000)),
      finalStatus: null,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, COLLECTIONS.HEISTS), input);
      router.push("/heists");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  }

  function selectAssignee(result: UserResult) {
    setAssignee(result);
    setAssigneeQuery("");
    setSearchResults([]);
  }

  function clearAssignee() {
    setAssignee(null);
    setAssigneeQuery("");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h2 className="form-title">Create a New Heist</h2>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">
          Title
        </label>
        <input
          className={styles.input}
          id="title"
          type="text"
          {...register("title")}
        />
        {errors.title && <p className={styles.error}>{errors.title.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          Description
        </label>
        <textarea
          className={styles.input}
          id="description"
          rows={4}
          {...register("description")}
        />
        {errors.description && (
          <p className={styles.error}>{errors.description.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="assignee">
          Assignee
        </label>
        {assignee ? (
          <div className={styles.selectedAssignee}>
            <span>{assignee.codename}</span>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearAssignee}
              aria-label="Clear assignee"
            >
              ×
            </button>
          </div>
        ) : (
          <div className={styles.assigneeWrap}>
            <input
              className={styles.input}
              id="assignee"
              type="text"
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={assigneeQuery}
              onChange={(e) => setAssigneeQuery(e.target.value)}
              autoComplete="off"
              placeholder="Search by codename…"
            />
            {isFocused && searchResults.length > 0 && (
              <ul className={styles.dropdown}>
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => selectAssignee(result)}
                    >
                      {result.codename}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {submitError && <p className={styles.error}>{submitError}</p>}

      <button type="submit" className="btn" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Create Heist"}
      </button>
    </form>
  );
}
