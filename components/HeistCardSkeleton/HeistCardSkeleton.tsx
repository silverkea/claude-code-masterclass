import styles from "./HeistCardSkeleton.module.css";

export default function HeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.lineTitle} />
        <div className={styles.iconBlock} />
      </div>
      <div className={styles.lineShort} />
      <div className={styles.lineMid} />
      <div className={styles.lineFull} />
    </div>
  );
}
