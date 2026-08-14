import React from 'react';
import { RouteCorridor, Waypoint, RoadHazard, Landmark, VoiceStyle } from '../types';
import { announcePidginCue } from '../lib/audioEngine';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Navigation, ShieldAlert, Zap, Info, Radio, Sparkles } from 'lucide-react';

interface NavigationHUDProps {
  corridor: RouteCorridor;
  currentWaypointIndex: number;
  currentWaypoint: Waypoint;
  nextWaypoint?: Waypoint;
  currentHazard?: RoadHazard;
  nearestLandmark?: Landmark;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetSimulation: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  pidginVoiceAccent: VoiceStyle;
  onChangeAccent: (accent: VoiceStyle) => void;
  simSpeedMultiplier: number;
  onChangeSimSpeed: (speed: number) => void;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  corridor,
  currentWaypointIndex,
  currentWaypoint,
  currentHazard,
  nearestLandmark,
  isSimulating,
  onToggleSimulate,
  onResetSimulation,
  voiceEnabled,
  onToggleVoice,
  pidginVoiceAccent,
  onChangeAccent,
  simSpeedMultiplier,
  onChangeSimSpeed,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [showStandardComparison, setShowStandardComparison] = React.useState(false);

  const handlePlayAudio = async () => {
    setIsPlayingAudio(true);
    await announcePidginCue(currentWaypoint.pidginInstruction, pidginVoiceAccent);
    setIsPlayingAudio(false);
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-black text-white flex items-center space-x-1">
                <Radio className="w-3 h-3 animate-pulse text-white" />
                <span>Landmark Pidgin Cue</span>
              </span>
              <span className="text-xs text-neutral-500 font-mono font-bold">
                STEP {currentWaypointIndex + 1} OF {corridor.waypoints.length}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-black uppercase italic leading-tight tracking-tight">
              "{currentWaypoint.pidginInstruction}"
            </h2>

            <div className="pt-1">
              <button
                onClick={() => setShowStandardComparison(!showStandardComparison)}
                className="text-xs text-neutral-700 hover:text-black font-bold underline underline-offset-4 flex items-center space-x-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showStandardComparison ? 'Hide standard GPS instruction' : 'Compare with standard GPS instruction'}</span>
              </button>

              {showStandardComparison && (
                <p className="mt-2 text-xs text-neutral-700 italic bg-[#FAF9F6] p-2.5 rounded-xl border border-neutral-200">
                  Standard GPS: "{currentWaypoint.standardInstruction}"
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={handlePlayAudio}
              disabled={isPlayingAudio}
              className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center space-x-2 ${
                isPlayingAudio ? 'bg-neutral-800 text-white animate-pulse' : 'bg-black hover:bg-neutral-800 text-white active:scale-95'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span>{isPlayingAudio ? 'Speaking...' : 'Play Audio Cue'}</span>
            </button>

            <button
              onClick={onToggleVoice}
              className={`p-3 rounded-xl border transition-all ${
                voiceEnabled ? 'bg-neutral-100 text-black border-neutral-300 hover:bg-neutral-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}
              title={voiceEnabled ? 'Auto-Voice Enabled' : 'Voice Muted'}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5 text-black" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Voice style is a browser-speech-synthesis tuning preset (word
            swaps + pitch/rate), not a distinct AI voice model — labeled
            plainly so the UI doesn't overstate what's happening. */}
        <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-900">Voice Style:</span>
            {(['Lagos Standard', 'Warri Sharp', 'Gentle Uncle'] as const).map((accent) => (
              <button
                key={accent}
                onClick={() => onChangeAccent(accent)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  pidginVoiceAccent === accent ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {accent}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 text-neutral-600">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>
              Target Landmark: <strong className="text-black">{nearestLandmark?.name || 'Seeded Road Point'}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-500 flex items-center space-x-1">
              <Navigation className="w-3.5 h-3.5 text-black" />
              <span>Route Simulation</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-black border border-neutral-300">
              {isSimulating ? 'PLAYING' : 'PAUSED'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleSimulate}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-95 ${
                isSimulating ? 'bg-neutral-800 text-white hover:bg-black' : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isSimulating ? 'Pause' : 'Start Simulation'}</span>
            </button>
            <button
              onClick={onResetSimulation}
              title="Reset Route Position"
              className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-xl border border-neutral-300 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-neutral-600 font-medium">
              <span>Playback Speed:</span>
              <span className="text-black font-mono font-bold">{simSpeedMultiplier}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={simSpeedMultiplier}
              onChange={(e) => onChangeSimSpeed(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-500 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-black" />
              <span>Route Progress</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block tracking-wider">Waypoint</span>
              <span className="text-xl font-mono font-black text-black">
                {currentWaypointIndex + 1}/{corridor.waypoints.length}
              </span>
            </div>
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block tracking-wider">Next Landmark</span>
              <span className="text-xl font-mono font-black text-black">{currentWaypoint.distanceToNextMeters}m</span>
            </div>
          </div>

          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-300"
              style={{ width: `${((currentWaypointIndex + 1) / corridor.waypoints.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-700 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-black" />
              <span>Road Intelligence</span>
            </span>
            {currentHazard && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-white">
                {currentHazard.category.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>

          {currentHazard ? (
            <div className="my-2 space-y-1">
              <h4 className="text-xs font-black text-black line-clamp-1">{currentHazard.title}</h4>
              <p className="text-xs text-neutral-800 italic font-medium line-clamp-2">"{currentHazard.pidginAlertText}"</p>
              <div className="text-[10px] text-neutral-500 flex items-center justify-between pt-1 border-t border-neutral-200">
                <span>Pattern: {currentHazard.timePattern}</span>
                <span className="text-black font-mono font-bold">{currentHazard.verifyCount} verified</span>
              </div>
            </div>
          ) : (
            <div className="my-auto py-2 text-center text-xs text-neutral-500 italic">
              No active hazard flags reported for this immediate segment. Clear road ahead!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
