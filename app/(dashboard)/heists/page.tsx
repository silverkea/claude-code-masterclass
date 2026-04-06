"use client";

import { useHeists } from "@/hooks/useHeists";
import { type Heist, type SettledHeist } from "@/types/firestore/heist";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";
import ExpiredHeistCard from "@/components/ExpiredHeistCard";
import ExpiredHeistCardSkeleton from "@/components/ExpiredHeistCardSkeleton";

function isSettled(h: Heist): h is SettledHeist {
  return h.finalStatus !== null;
}

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

  const settledHeists = expiredHeists.filter(isSettled);

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        {activeError && <p>Could not load active heists.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeLoading
            ? Array.from({ length: 3 }, (_, i) => <HeistCardSkeleton key={i} />)
            : activeHeists.map((h) => <HeistCard key={h.id} heist={h} />)}
        </div>
      </div>
      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        {assignedError && <p>Could not load assigned heists.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedLoading
            ? Array.from({ length: 3 }, (_, i) => <HeistCardSkeleton key={i} />)
            : assignedHeists.map((h) => <HeistCard key={h.id} heist={h} />)}
        </div>
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expiredError && <p>Could not load expired heists.</p>}
        <div className="heist-list">
          {expiredLoading ? (
            Array.from({ length: 3 }, (_, i) => (
              <ExpiredHeistCardSkeleton key={i} />
            ))
          ) : settledHeists.length === 0 ? (
            <p>No expired heists yet.</p>
          ) : (
            settledHeists.map((h) => <ExpiredHeistCard key={h.id} heist={h} />)
          )}
        </div>
      </div>
    </div>
  );
}
