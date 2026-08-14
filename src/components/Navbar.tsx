import React from 'react';
import { Navigation, Mic, ShieldAlert, Volume2, Key, ListFilter, Trophy } from 'lucide-react';

interface NavbarProps {
  activeCorridorName: string;
  onOpenReportModal: () => void;
  onOpenPhraseBankModal: () => void;
  onOpenLeaderboardModal: () => void;
  onOpenKeyModal: () => void;
  hasValidMapKey: boolean;
  activeTab: 'map' | 'hazards' | 'corridors';
  setActiveTab: (tab: 'map' | 'hazards' | 'corridors') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCorridorName,
  onOpenReportModal,
  onOpenPhraseBankModal,
  onOpenLeaderboardModal,
  onOpenKeyModal,
  hasValidMapKey,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-[#FAF9F6] border-b border-neutral-200 text-neutral-900 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
              <div className="w-5 h-5 border-2 border-white rotate-45 flex items-center justify-center">
                <Navigation className="w-3.5 h-3.5 text-white transform -rotate-45" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-black text-xl tracking-tight text-black">
                  Naija<span className="text-neutral-500">Nav</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-black text-white rounded-md">
                  PIDGIN & LANDMARKS
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 hidden sm:block">
                Corridor: <span className="text-black font-bold">{activeCorridorName}</span>
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-white p-1 rounded-xl border border-neutral-200 shadow-sm">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'map' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Live Nav & Map</span>
            </button>

            <button
              onClick={() => setActiveTab('hazards')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'hazards' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Road Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTab('corridors')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'corridors' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Route Corridors</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenPhraseBankModal}
              title="Test Pidgin Phrase Bank"
              className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 transition-all text-xs flex items-center space-x-1 shadow-sm"
            >
              <Volume2 className="w-4 h-4 text-black" />
              <span className="hidden lg:inline font-bold text-xs">Phrase Bank</span>
            </button>

            <button
              onClick={onOpenLeaderboardModal}
              title="Driver Contributor Ranks"
              className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 transition-all text-xs flex items-center space-x-1 shadow-sm"
            >
              <Trophy className="w-4 h-4 text-black" />
              <span className="hidden lg:inline font-bold text-xs">Scouts</span>
            </button>

            <button
              onClick={onOpenKeyModal}
              className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1 shadow-sm ${
                hasValidMapKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-neutral-100 text-black border-neutral-300 hover:bg-neutral-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{hasValidMapKey ? 'GMP Active' : 'Set Key'}</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center space-x-1.5 transform active:scale-95 transition-all"
            >
              <Mic className="w-4 h-4 text-white" />
              <span>Report Matter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden flex items-center justify-around border-t border-neutral-200 bg-[#FAF9F6] py-2 px-2 text-xs">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${activeTab === 'map' ? 'bg-black text-white font-bold' : 'text-neutral-600'}`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Nav Map</span>
        </button>
        <button
          onClick={() => setActiveTab('hazards')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${activeTab === 'hazards' ? 'bg-black text-white font-bold' : 'text-neutral-600'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Hazards</span>
        </button>
        <button
          onClick={() => setActiveTab('corridors')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${activeTab === 'corridors' ? 'bg-black text-white font-bold' : 'text-neutral-600'}`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Corridors</span>
        </button>
      </div>
    </header>
  );
};
