// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react";

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />
          cket Heist
        </h1>
        <div>Your office. Their problem.</div>
        <p>
          Welcome to Pocket Heist — the app where small acts of workplace chaos
          become legendary tales. Recruit your crew, plan your moves, and pull
          off the perfect office heist. No vaults required.
        </p>
      </div>
    </div>
  );
}
