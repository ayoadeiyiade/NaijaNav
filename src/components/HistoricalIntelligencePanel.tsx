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
  CheckCircle2,
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
        return { label: 'Market day', icon: Calendar };
      case 'agbero_checkpoint':
        return { label: 'Agbero / ticket spot', icon: Octagon };
      case 'flood_zone':
        return { label: 'Flood zone', icon: Umbrella };
      case 'bad_spot':
        return { label: 'Pothole', icon: AlertTriangle };
      case 'gridlock':
        return { label: 'Gridlock', icon: Clock };
      default:
        return { label: 'Hazard', icon: ShieldAlert };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h2 className="font-display text-3xl text-parchment">Road intelligence</h2>
          <p className="text-sm text-parchment-dim">
            Standard maps only react once traffic has already jammed. This surfaces market day lockdowns,
            recurring checkpoints, flood dips and known craters ahead of time, seeded manually for now,
            growing from driver reports over time.
          </p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="px-4 py-2.5 rounded-md bg-rust hover:bg-rust/90 text-parchment font-semibold text-sm flex items-center space-x-1.5 flex-shrink-0"
        >
          <Mic className="w-4 h-4" />
          <span>Report matter</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-1 bg-asphalt-raised p-1 rounded-md">
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === 'historical' ? 'bg-danfo text-asphalt' : 'text-parchment-dim hover:text-parchment'
            }`}
          >
            Known hazards ({filteredHazards.length})
          </button>
          <button
            onClick={() => setActiveTab('live_crowdsourced')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === 'live_crowdsourced' ? 'bg-danfo text-asphalt' : 'text-parchment-dim hover:text-parchment'
            }`}
          >
            Driver reports ({reports.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'market_day', label: 'Market days' },
            { id: 'agbero_checkpoint', label: 'Agberos' },
            { id: 'flood_zone', label: 'Flooding' },
            { id: 'bad_spot', label: 'Potholes' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedCategory === cat.id ? 'bg-danfo text-asphalt' : 'bg-asphalt-raised text-parchment-dim hover:text-parchment'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'historical' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredHazards.length === 0 && (
            <p className="text-sm text-parchment-dim italic col-span-2">No hazards seeded for this corridor yet.</p>
          )}
          {filteredHazards.map((hz) => {
            const badge = getCategoryBadge(hz.category);
            const Icon = badge.icon;
            return (
              <div key={hz.id} className="bg-asphalt-raised rounded-md p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-xs font-medium text-danfo">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-xs text-parchment-dim">{hz.timePattern}</span>
                  </div>

                  <h3 className="text-base font-semibold text-parchment">{hz.title}</h3>
                  <p className="text-sm text-parchment-dim">{hz.description}</p>

                  <div className="bg-asphalt p-3 rounded">
                    <span className="text-xs text-danfo block mb-0.5">Pidgin warning</span>
                    <p className="text-sm text-parchment">{hz.pidginAlertText}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-asphalt-line flex items-center justify-between text-xs text-parchment-dim">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-leaf" />
                    <span>{hz.userRole || 'Route scout'}</span>
                  </div>
                  <button
                    onClick={() => onSelectHazardOnMap(hz)}
                    className="px-3 py-1.5 rounded bg-asphalt hover:bg-asphalt-line text-parchment font-medium flex items-center space-x-1 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View on map</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reports.length === 0 && (
            <p className="text-sm text-parchment-dim italic col-span-2">No driver reports for this corridor yet. Be the first.</p>
          )}
          {reports.map((rep) => (
            <div key={rep.id} className="bg-asphalt-raised rounded-md p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-danfo">{rep.category.replace('_', ' ')}</span>
                <span className="text-xs text-parchment-dim">{new Date(rep.timestamp).toLocaleString()}</span>
              </div>

              <h3 className="text-base font-semibold text-parchment">{rep.title}</h3>

              {rep.pidginTranscription && (
                <div className="bg-asphalt p-3 rounded">
                  <span className="text-xs text-danfo block mb-0.5">Voice note</span>
                  <p className="text-sm text-parchment">{rep.pidginTranscription}</p>
                </div>
              )}

              <p className="text-sm text-parchment-dim">{rep.description}</p>

              <div className="pt-3 border-t border-asphalt-line flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-parchment-dim">
                  <span className="text-parchment font-medium">{rep.reporterAlias}</span>
                  <span className="text-parchment-dim">{rep.reporterBadge}</span>
                </div>
                <button
                  onClick={() => onVerifyReport(rep.id)}
                  className="px-3 py-1.5 rounded bg-asphalt hover:bg-asphalt-line text-parchment font-medium flex items-center space-x-1.5 transition-colors"
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
