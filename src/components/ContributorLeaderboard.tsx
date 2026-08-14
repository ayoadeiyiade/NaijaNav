import React, { useMemo } from 'react';
import { UserReport } from '../types';
import { X, Trophy, Flame } from 'lucide-react';

interface ContributorLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  reports: UserReport[];
}

export const ContributorLeaderboard: React.FC<ContributorLeaderboardProps> = ({ isOpen, onClose, reports }) => {
  // Derived from actual submitted reports rather than a hardcoded fictional
  // roster, so counts only ever reflect what's really in the system.
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-black text-white">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Top Driver Scouts & Ranks</h3>
              <p className="text-xs text-neutral-500 font-medium">Ranked by total verifications on their reports</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-black rounded-xl bg-neutral-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {scouts.length === 0 && <p className="text-sm text-neutral-500 italic">No reports submitted yet — be the first scout.</p>}
          {scouts.map((scout, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={scout.alias}
                className="bg-[#FAF9F6] border border-neutral-200 p-4 rounded-2xl flex items-center justify-between hover:border-black/30 transition-all shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center font-mono ${
                      rank === 1 ? 'bg-black text-white' : rank === 2 ? 'bg-neutral-800 text-white' : rank === 3 ? 'bg-neutral-600 text-white' : 'bg-neutral-200 text-black'
                    }`}
                  >
                    #{rank}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-black text-sm">{scout.alias}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-neutral-100 text-black border border-neutral-300 uppercase tracking-wider">
                        {scout.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-700 block">{scout.reportsCount} Reports</span>
                  <span className="text-[10px] text-black font-bold flex items-center justify-end space-x-1 font-mono">
                    <Flame className="w-3 h-3 fill-current text-black" />
                    <span>{scout.verifiedTotal} verified</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
