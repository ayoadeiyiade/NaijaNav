import React from 'react';
import { Navigation, Mic, ShieldAlert, Volume2, ListFilter, Trophy } from 'lucide-react';

interface NavbarProps {
  activeCorridorName: string;
  onOpenReportModal: () => void;
  onOpenPhraseBankModal: () => void;
  onOpenLeaderboardModal: () => void;
  activeTab: 'map' | 'hazards' | 'corridors';
  setActiveTab: (tab: 'map' | 'hazards' | 'corridors') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCorridorName,
  onOpenReportModal,
  onOpenPhraseBankModal,
  onOpenLeaderboardModal,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-asphalt border-b-2 border-danfo sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-danfo rounded-md flex items-center justify-center">
              <Navigation className="w-5 h-5 text-asphalt" />
            </div>
            <div>
              <h1 className="font-display text-2xl tracking-tight text-parchment leading-none">
                Naija<span className="text-danfo">Nav</span>
              </h1>
              <p className="text-[11px] text-parchment-dim hidden sm:block mt-0.5">
                On {activeCorridorName}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-asphalt-raised p-1 rounded-md border border-asphalt-line">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'map' ? 'bg-danfo text-asphalt' : 'text-parchment-dim hover:text-parchment'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>

            <button
              onClick={() => setActiveTab('hazards')}
              className={`px-3.5 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'hazards' ? 'bg-danfo text-asphalt' : 'text-parchment-dim hover:text-parchment'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Road intel</span>
            </button>

            <button
              onClick={() => setActiveTab('corridors')}
              className={`px-3.5 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'corridors' ? 'bg-danfo text-asphalt' : 'text-parchment-dim hover:text-parchment'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Corridors</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenPhraseBankModal}
              title="Phrase bank"
              className="p-2 rounded-md text-parchment-dim hover:text-parchment hover:bg-asphalt-raised transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenLeaderboardModal}
              title="Scouts"
              className="p-2 rounded-md text-parchment-dim hover:text-parchment hover:bg-asphalt-raised transition-colors"
            >
              <Trophy className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 rounded-md bg-rust hover:bg-rust/90 text-parchment font-semibold text-sm flex items-center space-x-1.5 transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Report matter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden flex items-center justify-around border-t border-asphalt-line py-2 px-2 text-xs">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center space-x-1 px-3 py-1 rounded ${activeTab === 'map' ? 'text-danfo font-semibold' : 'text-parchment-dim'}`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => setActiveTab('hazards')}
          className={`flex items-center space-x-1 px-3 py-1 rounded ${activeTab === 'hazards' ? 'text-danfo font-semibold' : 'text-parchment-dim'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Hazards</span>
        </button>
        <button
          onClick={() => setActiveTab('corridors')}
          className={`flex items-center space-x-1 px-3 py-1 rounded ${activeTab === 'corridors' ? 'text-danfo font-semibold' : 'text-parchment-dim'}`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Corridors</span>
        </button>
      </div>
    </header>
  );
};
