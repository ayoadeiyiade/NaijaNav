import React, { useState, useMemo } from 'react';
import { Landmark, RoadHazard } from '../types';
import { announcePidginCue } from '../lib/audioEngine';
import { X, Volume2, Radio } from 'lucide-react';

interface AudioPhraseBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  landmarks: Landmark[];
  hazards: RoadHazard[];
}

export const AudioPhraseBankModal: React.FC<AudioPhraseBankModalProps> = ({ isOpen, onClose, landmarks, hazards }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Built from the actual seeded data for the active corridor, rather than a
  // separate hand-picked list — so this bank always reflects real cues that
  // exist in the app, not a curated highlight reel.
  const phrases = useMemo(() => {
    const fromLandmarks = landmarks.map((lm) => ({
      id: lm.id,
      category: lm.name,
      pidginText: lm.localPhraseCue,
      context: 'Landmark cue',
    }));
    const fromHazards = hazards.map((hz) => ({
      id: hz.id,
      category: hz.title,
      pidginText: hz.pidginAlertText,
      context: 'Hazard alert',
    }));
    return [...fromLandmarks, ...fromHazards];
  }, [landmarks, hazards]);

  if (!isOpen) return null;

  const handlePlayPhrase = async (id: string, text: string) => {
    setPlayingId(id);
    await announcePidginCue(text, 'Lagos Standard');
    setPlayingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-black text-white">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Voice Cue Phrase Bank</h3>
              <p className="text-xs text-neutral-500 font-medium">
                Every landmark & hazard cue seeded for this corridor, spoken with the browser voice engine
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-black rounded-xl bg-neutral-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {phrases.length === 0 && <p className="text-sm text-neutral-500 italic">No cues seeded for this corridor yet.</p>}
          {phrases.map((ph) => {
            const isPlaying = playingId === ph.id;
            return (
              <div
                key={ph.id}
                className="bg-[#FAF9F6] border border-neutral-200 p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-black/30 transition-all shadow-sm"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-black bg-neutral-200 px-2 py-0.5 rounded">
                    {ph.category}
                  </span>
                  <p className="text-sm font-bold text-black">"{ph.pidginText}"</p>
                  <p className="text-[11px] text-neutral-600 italic font-medium">{ph.context}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayPhrase(ph.id, ph.pidginText)}
                  disabled={isPlaying}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md transition-all flex-shrink-0 ${
                    isPlaying ? 'bg-neutral-800 text-white animate-pulse' : 'bg-black hover:bg-neutral-800 text-white active:scale-95'
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-white" />
                  <span>{isPlaying ? 'Playing' : 'Listen'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
