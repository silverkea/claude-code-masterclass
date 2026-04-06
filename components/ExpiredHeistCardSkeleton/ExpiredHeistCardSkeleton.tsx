import styles from "./ExpiredHeistCardSkeleton.module.css";

export default function ExpiredHeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.lineTitle} />
        <div className={styles.lineBadge} />
      </div>
      <div className={styles.row}>
        <div className={styles.lineShort} />
        <div className={styles.lineShort} />
      </div>
    </div>
  );
}
