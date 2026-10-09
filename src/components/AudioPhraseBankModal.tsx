import React, { useState, useMemo } from 'react';
import { Landmark, RoadHazard } from '../types';
import { announcePidginCue } from '../lib/audioEngine';
import { X, Volume2 } from 'lucide-react';

interface AudioPhraseBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  landmarks: Landmark[];
  hazards: RoadHazard[];
}

export const AudioPhraseBankModal: React.FC<AudioPhraseBankModalProps> = ({ isOpen, onClose, landmarks, hazards }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Built from the actual seeded data for the active corridor, so this bank
  // always reflects real cues that exist in the app.
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
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-asphalt-raised rounded-md max-w-xl w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-asphalt-line pb-3">
          <div>
            <h3 className="font-display text-lg text-parchment">Phrase bank</h3>
            <p className="text-xs text-parchment-dim">Every cue seeded for this corridor, spoken by the browser voice</p>
          </div>
          <button onClick={onClose} className="p-2 text-parchment-dim hover:text-parchment rounded-md hover:bg-asphalt">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {phrases.length === 0 && <p className="text-sm text-parchment-dim italic">No cues seeded for this corridor yet.</p>}
          {phrases.map((ph) => {
            const isPlaying = playingId === ph.id;
            return (
              <div key={ph.id} className="bg-asphalt p-4 rounded-md flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs text-danfo">
                    {ph.context}, {ph.category}
                  </span>
                  <p className="text-sm text-parchment">{ph.pidginText}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayPhrase(ph.id, ph.pidginText)}
                  disabled={isPlaying}
                  className={`px-3.5 py-2 rounded-md font-semibold text-sm flex items-center space-x-1.5 transition-colors flex-shrink-0 ${
                    isPlaying ? 'bg-asphalt-line text-parchment-dim' : 'bg-danfo hover:bg-danfo-dim text-asphalt'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
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
