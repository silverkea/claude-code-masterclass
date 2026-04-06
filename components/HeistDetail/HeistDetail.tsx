"use client";

import { useState, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/AuthContext";
import { useHeist } from "@/hooks/useHeist";
import { COLLECTIONS } from "@/types/firestore";
import HeistCountdown from "@/components/HeistCountdown";
import HeistDetailSkeleton from "@/components/HeistDetailSkeleton";
import styles from "./HeistDetail.module.css";

type UserResult = { id: string; codename: string };

type Props = { id: string };

export default function HeistDetail({ id }: Props) {
  const { user } = useUser();
  const { heist, loading, notFound: isNotFound, error } = useHeist(id);

  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [pendingAssignee, setPendingAssignee] = useState<UserResult | null>(
    null,
  );
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const isFocusedRef = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

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
        .map((d) => d.data() as UserResult)
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

  async function confirmAssignment() {
    if (!pendingAssignee) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      await updateDoc(doc(db, COLLECTIONS.HEISTS, id), {
        assignedTo: pendingAssignee.id,
        assignedToCodename: pendingAssignee.codename,
      });
    } catch {
      setConfirmError("Something went wrong. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) return <HeistDetailSkeleton />;

  if (isNotFound) {
    notFound();
    return null;
  }

  if (error || !heist) {
    return (
      <p className={styles.error}>
        Could not load this heist. Please try again.
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{heist.title}</h1>
      <p className={styles.description}>{heist.description}</p>

      <div className={styles.meta}>
        <div className={styles.row}>
          <span className={styles.label}>By:</span>
          <span className={styles.creator}>{heist.createdByCodename}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>To:</span>
          {heist.assignedToCodename ? (
            <span className={styles.assignee}>{heist.assignedToCodename}</span>
          ) : pendingAssignee ? (
            <div className={styles.pendingWrap}>
              <div className={styles.selectedAssignee}>
                <span>{pendingAssignee.codename}</span>
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setPendingAssignee(null)}
                  aria-label="Clear selection"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                className="btn"
                onClick={confirmAssignment}
                disabled={confirming}
              >
                {confirming ? "Assigning…" : "Confirm Assignment"}
              </button>
              {confirmError && <p className={styles.error}>{confirmError}</p>}
            </div>
          ) : (
            <div className={styles.assigneeWrap}>
              <input
                className={styles.input}
                type="text"
                placeholder="Search by codename…"
                value={assigneeQuery}
                onChange={(e) => setAssigneeQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoComplete="off"
                aria-label="Search assignee by codename"
              />
              {isFocused && searchResults.length > 0 && (
                <ul className={styles.dropdown}>
                  {searchResults.map((result) => (
                    <li key={result.id}>
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => setPendingAssignee(result)}
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
      </div>

      <HeistCountdown deadline={heist.deadline} />
    </div>
  );
}
