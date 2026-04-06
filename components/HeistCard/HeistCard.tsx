"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import type { Heist } from "@/types/firestore/heist";
import styles from "./HeistCard.module.css";

type Props = { heist: Heist };

function formatDeadline(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeRemaining(deadline: Date): { hours: number; minutes: number } {
  const msLeft = deadline.getTime() - Date.now();
  const totalMinutes = Math.max(0, Math.floor(msLeft / (1000 * 60)));
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}

export default function HeistCard({ heist }: Props) {
  const { hours, minutes } = getTimeRemaining(heist.deadline);
  const isUrgent = hours < 4;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Link href={`/heists/${heist.id}`} className={styles.title}>
          {heist.title}
        </Link>
        <Clock
          size={18}
          aria-label="deadline timer"
          className={isUrgent ? styles.clockUrgent : styles.clock}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>To:</span>
        {heist.assignedToCodename ? (
          <span className={styles.assignee}>{heist.assignedToCodename}</span>
        ) : (
          <span className={styles.muted}>Unassigned</span>
        )}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>By:</span>
        <span className={styles.creator}>{heist.createdByCodename}</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.muted}>
          {formatDeadline(heist.deadline)} &bull; {hours}h {minutes}m left
        </span>
      </div>
    </div>
  );
}
