import React from 'react';
import { RouteCorridor, Waypoint, RoadHazard, Landmark, VoiceStyle } from '../types';
import { announcePidginCue } from '../lib/audioEngine';
import { Volume2, VolumeX, Play, Pause, RotateCcw, ShieldAlert, Info } from 'lucide-react';

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
    <div className="w-full space-y-3">
      {/* Voice cue panel, styled like an overhead highway sign: condensed
          type, a yellow rule standing in for the panel edge instead of a
          rounded pill badge. */}
      <div className="bg-asphalt-raised rounded-md overflow-hidden">
        <div className="flex items-stretch">
          <div className="w-1.5 bg-danfo flex-shrink-0" />
          <div className="flex-1 p-5 sm:p-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-display text-xs tracking-wide text-danfo">
                Waypoint {currentWaypointIndex + 1} of {corridor.waypoints.length}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl text-parchment leading-[1.1] tracking-tight">
              {currentWaypoint.pidginInstruction}
            </h2>

            <button
              onClick={() => setShowStandardComparison(!showStandardComparison)}
              className="mt-3 text-sm text-parchment-dim hover:text-parchment flex items-center space-x-1.5"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showStandardComparison ? 'Hide standard GPS instruction' : 'Compare with standard GPS instruction'}</span>
            </button>

            {showStandardComparison && (
              <p className="mt-2 text-sm text-parchment-dim bg-asphalt p-2.5 rounded">
                Standard GPS: {currentWaypoint.standardInstruction}
              </p>
            )}

            <div className="mt-5 pt-4 border-t border-asphalt-line flex flex-wrap items-center gap-3">
              <button
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                className={`px-5 py-2.5 rounded-md font-semibold text-sm transition-colors flex items-center space-x-2 ${
                  isPlayingAudio ? 'bg-asphalt-line text-parchment-dim' : 'bg-danfo hover:bg-danfo-dim text-asphalt'
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                <span>{isPlayingAudio ? 'Speaking' : 'Play this cue'}</span>
              </button>

              <button
                onClick={onToggleVoice}
                className="p-2.5 rounded-md border border-asphalt-line text-parchment-dim hover:text-parchment transition-colors"
                title={voiceEnabled ? 'Auto voice on' : 'Voice muted'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <div className="flex items-center space-x-1.5 ml-auto text-sm">
                <span className="text-parchment-dim">Style</span>
                {(['Lagos Standard', 'Warri Sharp', 'Gentle Uncle'] as const).map((accent) => (
                  <button
                    key={accent}
                    onClick={() => onChangeAccent(accent)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      pidginVoiceAccent === accent ? 'bg-danfo text-asphalt' : 'bg-asphalt text-parchment-dim hover:text-parchment'
                    }`}
                  >
                    {accent}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-asphalt-raised rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-parchment">Route playback</span>
            <span className="text-xs text-parchment-dim">{isSimulating ? 'Playing' : 'Paused'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleSimulate}
              className="flex-1 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center space-x-2 bg-danfo hover:bg-danfo-dim text-asphalt transition-colors"
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isSimulating ? 'Pause' : 'Start'}</span>
            </button>
            <button
              onClick={onResetSimulation}
              title="Reset position"
              className="p-2.5 bg-asphalt text-parchment-dim hover:text-parchment rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-parchment-dim">
              <span>Speed</span>
              <span>{simSpeedMultiplier}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={simSpeedMultiplier}
              onChange={(e) => onChangeSimSpeed(Number(e.target.value))}
              className="w-full accent-danfo cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-asphalt-raised rounded-md p-4 flex flex-col justify-between">
          <span className="text-sm font-medium text-parchment">Progress</span>
          <div className="grid grid-cols-2 gap-2 my-3">
            <div>
              <span className="text-[11px] text-parchment-dim block">Waypoint</span>
              <span className="font-display text-2xl text-parchment">
                {currentWaypointIndex + 1}/{corridor.waypoints.length}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-parchment-dim block">Next landmark</span>
              <span className="font-display text-2xl text-parchment">{currentWaypoint.distanceToNextMeters}m</span>
            </div>
          </div>
          <div className="w-full bg-asphalt rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-danfo h-full transition-all duration-300"
              style={{ width: `${((currentWaypointIndex + 1) / corridor.waypoints.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-asphalt-raised rounded-md p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-parchment flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-rust" />
              <span>Road intel</span>
            </span>
          </div>

          {currentHazard ? (
            <div className="my-2 space-y-1">
              <h4 className="text-sm font-semibold text-parchment line-clamp-1">{currentHazard.title}</h4>
              <p className="text-xs text-parchment-dim line-clamp-2">{currentHazard.pidginAlertText}</p>
              <div className="text-[11px] text-parchment-dim flex items-center justify-between pt-1 border-t border-asphalt-line">
                <span>{currentHazard.timePattern}</span>
                <span className="text-danfo">{currentHazard.verifyCount} verified</span>
              </div>
            </div>
          ) : (
            <div className="my-auto py-2 text-sm text-parchment-dim">
              Clear road ahead for this segment.
            </div>
          )}
        </div>
      </div>

      {nearestLandmark && (
        <p className="text-xs text-parchment-dim px-1">
          Reference landmark: <span className="text-parchment">{nearestLandmark.name}</span>
        </p>
      )}
    </div>
  );
};
