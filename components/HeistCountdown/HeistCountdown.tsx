"use client";

import { useState, useEffect } from "react";
import styles from "./HeistCountdown.module.css";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} | null;

function getTimeLeft(deadline: Date): TimeLeft {
  const msLeft = deadline.getTime() - Date.now();
  if (msLeft <= 0) return null;
  const totalSeconds = Math.floor(msLeft / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

type Props = { deadline: Date };

export default function HeistCountdown({ deadline }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(deadline),
  );

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (timeLeft === null) {
    return (
      <div className={styles.expiredWrap} role="status">
        <span className={styles.expired}>Expired</span>
      </div>
    );
  }

  const units: { label: string; value: number; ariaLabel: string }[] = [
    { label: "D", value: timeLeft.days, ariaLabel: "days" },
    { label: "H", value: timeLeft.hours, ariaLabel: "hours" },
    { label: "M", value: timeLeft.minutes, ariaLabel: "minutes" },
    { label: "S", value: timeLeft.seconds, ariaLabel: "seconds" },
  ];

  const srText = `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining`;

  return (
    <div className={styles.wrap} role="timer">
      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {srText}
      </span>
      {units.map(({ label, value, ariaLabel }) => (
        <div key={label} className={styles.unit}>
          <span className={styles.digit} aria-label={ariaLabel}>
            {String(value).padStart(2, "0")}
          </span>
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
}
