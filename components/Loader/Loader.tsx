import styles from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={styles.loader} role="status" aria-label="Loading">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  );
}
