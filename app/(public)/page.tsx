// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import Link from "next/link";
import { Clock8 } from "lucide-react";
import styles from "./SplashPage.module.css";

export default function Home() {
  return (
    <div className={styles.splash}>
      <div className={styles.glow} />
      <div className={styles.content}>
        <h1 className={styles.wordmark}>
          P<Clock8 className={styles.logoIcon} strokeWidth={2.75} />
          cket Heist
        </h1>
        <p className={styles.tagline}>Your office. Their problem.</p>
        <p className={styles.description}>
          Recruit your crew, plan your moves, and pull off the perfect office
          heist. No vaults required.
        </p>
        <div className={styles.actions}>
          <Link href="/signup" className={styles.joinBtn}>
            Join the crew
          </Link>
          <Link href="/login" className={styles.loginBtn}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
