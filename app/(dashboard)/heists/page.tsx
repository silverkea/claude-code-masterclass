"use client";

import { useHeists } from "@/hooks/useHeists";

export default function HeistsPage() {
  const {
    heists: activeHeists,
    loading: activeLoading,
    error: activeError,
  } = useHeists("active");
  const {
    heists: assignedHeists,
    loading: assignedLoading,
    error: assignedError,
  } = useHeists("assigned");
  const {
    heists: expiredHeists,
    loading: expiredLoading,
    error: expiredError,
  } = useHeists("expired");

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        {activeLoading && <p>Loading…</p>}
        {activeError && <p>Could not load active heists.</p>}
        {activeHeists.map((h) => (
          <p key={h.id}>{h.title}</p>
        ))}
      </div>
      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        {assignedLoading && <p>Loading…</p>}
        {assignedError && <p>Could not load assigned heists.</p>}
        {assignedHeists.map((h) => (
          <p key={h.id}>{h.title}</p>
        ))}
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expiredLoading && <p>Loading…</p>}
        {expiredError && <p>Could not load expired heists.</p>}
        {expiredHeists.map((h) => (
          <p key={h.id}>{h.title}</p>
        ))}
      </div>
    </div>
  );
}
