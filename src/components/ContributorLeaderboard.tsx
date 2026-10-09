import React, { useMemo } from 'react';
import { UserReport } from '../types';
import { X } from 'lucide-react';

interface ContributorLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  reports: UserReport[];
}

export const ContributorLeaderboard: React.FC<ContributorLeaderboardProps> = ({ isOpen, onClose, reports }) => {
  // Derived from actual submitted reports, so counts only reflect what is
  // really in the system.
  const scouts = useMemo(() => {
    const byAlias = new Map<string, { alias: string; badge: string; reportsCount: number; verifiedTotal: number }>();
    for (const r of reports) {
      const existing = byAlias.get(r.reporterAlias);
      if (existing) {
        existing.reportsCount += 1;
        existing.verifiedTotal += r.verifiedCount;
      } else {
        byAlias.set(r.reporterAlias, {
          alias: r.reporterAlias,
          badge: r.reporterBadge,
          reportsCount: 1,
          verifiedTotal: r.verifiedCount,
        });
      }
    }
    return Array.from(byAlias.values()).sort((a, b) => b.verifiedTotal - a.verifiedTotal);
  }, [reports]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-asphalt-raised rounded-md max-w-lg w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-asphalt-line pb-3">
          <div>
            <h3 className="font-display text-lg text-parchment">Top scouts</h3>
            <p className="text-xs text-parchment-dim">Ranked by verifications on their reports</p>
          </div>
          <button onClick={onClose} className="p-2 text-parchment-dim hover:text-parchment rounded-md hover:bg-asphalt">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {scouts.length === 0 && <p className="text-sm text-parchment-dim italic">No reports yet. Be the first scout.</p>}
          {scouts.map((scout, idx) => (
            <div key={scout.alias} className="bg-asphalt p-4 rounded-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`font-display text-2xl w-8 ${idx === 0 ? 'text-danfo' : 'text-parchment-dim'}`}>{idx + 1}</span>
                <div>
                  <span className="text-sm font-medium text-parchment block">{scout.alias}</span>
                  <span className="text-xs text-parchment-dim">{scout.badge}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm text-parchment block">{scout.reportsCount} reports</span>
                <span className="text-xs text-leaf">{scout.verifiedTotal} verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
