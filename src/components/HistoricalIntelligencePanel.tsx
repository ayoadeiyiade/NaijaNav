import React, { useState } from 'react';
import { RoadHazard, UserReport, HazardCategory } from '../types';
import {
  ShieldAlert,
  Calendar,
  AlertTriangle,
  Umbrella,
  Octagon,
  Clock,
  ThumbsUp,
  Filter,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Mic,
} from 'lucide-react';

interface HistoricalIntelligencePanelProps {
  hazards: RoadHazard[];
  reports: UserReport[];
  onVerifyReport: (reportId: string) => void;
  onSelectHazardOnMap: (hazard: RoadHazard) => void;
  onOpenReportModal: () => void;
}

export const HistoricalIntelligencePanel: React.FC<HistoricalIntelligencePanelProps> = ({
  hazards,
  reports,
  onVerifyReport,
  onSelectHazardOnMap,
  onOpenReportModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'historical' | 'live_crowdsourced'>('historical');

  const filteredHazards = hazards.filter((h) => selectedCategory === 'all' || h.category === selectedCategory);

  const getCategoryBadge = (cat: HazardCategory) => {
    switch (cat) {
      case 'market_day':
        return { label: 'Market Day Lockdown', icon: Calendar, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'agbero_checkpoint':
        return { label: 'Agbero / Ticket Spot', icon: Octagon, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'flood_zone':
        return { label: 'Rainy Flood Zone', icon: Umbrella, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'bad_spot':
        return { label: 'Deep Pothole Crater', icon: AlertTriangle, color: 'bg-red-500/20 text-red-300 border-red-500/30' };
      case 'gridlock':
        return { label: 'Total Gridlock', icon: Clock, color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      default:
        return { label: 'Road Hazard', icon: ShieldAlert, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-black text-white flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Predictive Nigerian Road Intelligence</span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-black">Historical Road Patterns & Crowd Intelligence</h2>
          <p className="text-sm text-neutral-600">
            Standard maps only react once traffic has already jammed. This panel surfaces market day lockdowns,
            recurring agbero checkpoints, rainy season flood dips, and known road craters ahead of time, seeded
            manually for now, growing from driver reports over time.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="mt-4 sm:mt-0 sm:absolute sm:top-6 sm:right-6 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center space-x-1.5"
        >
          <Mic className="w-4 h-4" />
          <span>Report Matter Now</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'historical' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black bg-neutral-100'
            }`}
          >
            Historical & Predictive Hazards ({filteredHazards.length})
          </button>

          <button
            onClick={() => setActiveTab('live_crowdsourced')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'live_crowdsourced' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black bg-neutral-100'
            }`}
          >
            Driver Voice Reports ({reports.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-neutral-500 mr-1" />
          {[
            { id: 'all', label: 'All Intelligence' },
            { id: 'market_day', label: 'Market Days' },
            { id: 'agbero_checkpoint', label: 'Agberos' },
            { id: 'flood_zone', label: 'Flooding' },
            { id: 'bad_spot', label: 'Potholes' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat.id ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'historical' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHazards.length === 0 && (
            <p className="text-sm text-neutral-500 italic col-span-2">No hazards seeded for this corridor yet.</p>
          )}
          {filteredHazards.map((hz) => {
            const badge = getCategoryBadge(hz.category);
            const Icon = badge.icon;
            return (
              <div
                key={hz.id}
                className="bg-white border border-neutral-200 hover:border-black/30 rounded-2xl p-5 space-y-3 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border flex items-center space-x-1 ${badge.color}`}>
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                      {hz.timePattern}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-black">{hz.title}</h3>
                  <p className="text-xs text-neutral-700 leading-relaxed font-medium">{hz.description}</p>

                  <div className="bg-[#FAF9F6] p-3 rounded-xl border border-neutral-200">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-black block">Pidgin Driver Warning:</span>
                    <p className="text-xs font-bold text-neutral-900 italic">"{hz.pidginAlertText}"</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Scout: <strong className="text-black font-bold">{hz.userRole || 'Route Scout'}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectHazardOnMap(hz)}
                    className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center space-x-1 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    <span>View on Map</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.length === 0 && (
            <p className="text-sm text-neutral-500 italic col-span-2">No driver reports for this corridor yet. Be the first.</p>
          )}
          {reports.map((rep) => (
            <div key={rep.id} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black text-white">
                  {rep.category.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs font-mono text-neutral-500 font-bold">{new Date(rep.timestamp).toLocaleString()}</span>
              </div>

              <h3 className="text-base font-black text-black">{rep.title}</h3>

              {rep.pidginTranscription && (
                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-neutral-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-black block">Voice Note Transcription:</span>
                  <p className="text-xs font-medium text-neutral-900 italic">"{rep.pidginTranscription}"</p>
                </div>
              )}

              <p className="text-xs text-neutral-700 font-medium">{rep.description}</p>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-neutral-600">
                  <span className="font-bold text-black">{rep.reporterAlias}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-800 font-bold">{rep.reporterBadge}</span>
                </div>
                <button
                  onClick={() => onVerifyReport(rep.id)}
                  className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Verify ({rep.verifiedCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
