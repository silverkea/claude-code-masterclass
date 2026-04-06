import styles from "./HeistDetailSkeleton.module.css";

export default function HeistDetailSkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.titleBlock} />
      <div className={styles.descBlock} />
      <div className={styles.metaRows}>
        <div className={styles.row}>
          <div className={styles.labelStub} />
          <div className={styles.valueStub} />
        </div>
        <div className={styles.row}>
          <div className={styles.labelStub} />
          <div className={styles.valueStub} />
        </div>
      </div>
      <div className={styles.countdownBlock}>
        <div className={styles.unitStub} />
        <div className={styles.unitStub} />
        <div className={styles.unitStub} />
        <div className={styles.unitStub} />
      </div>
    </div>
  );
}
