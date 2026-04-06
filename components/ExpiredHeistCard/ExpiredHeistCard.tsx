"use client";

import Link from "next/link";
import { CheckCircle, XCircle, Calendar, User } from "lucide-react";
import type { SettledHeist } from "@/types/firestore/heist";
import styles from "./ExpiredHeistCard.module.css";

type Props = { heist: SettledHeist };

function formatDeadline(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ExpiredHeistCard({ heist }: Props) {
  const isSuccess = heist.finalStatus === "success";
  const StatusIcon = isSuccess ? CheckCircle : XCircle;
  const badgeClass = isSuccess ? styles.successBadge : styles.failureBadge;
  const titleId = `heist-title-${heist.id}`;

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <StatusIcon
            size={16}
            aria-hidden="true"
            className={styles.statusIcon}
          />
          <Link
            id={titleId}
            href={`/heists/${heist.id}`}
            className={styles.title}
          >
            {heist.title}
          </Link>
        </div>
        <div className={styles.metaRight}>
          <span className={styles.deadline}>
            <Calendar size={12} aria-hidden="true" />
            {formatDeadline(heist.deadline)}
          </span>
          <span className={badgeClass}>{heist.finalStatus}</span>
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.person}>
          <User size={12} aria-hidden="true" />
          <span className={styles.label}>To:</span>
          {heist.assignedToCodename ? (
            <span className={styles.assignee}>{heist.assignedToCodename}</span>
          ) : (
            <span className={styles.label}>Unassigned</span>
          )}
        </span>
        <span className={styles.person}>
          <User size={12} aria-hidden="true" />
          <span className={styles.label}>By:</span>
          <span className={styles.creator}>{heist.createdByCodename}</span>
        </span>
      </div>
    </article>
  );
}
