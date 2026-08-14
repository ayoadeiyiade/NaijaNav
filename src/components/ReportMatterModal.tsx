import React, { useState } from 'react';
import { HazardCategory, HazardSeverity, UserReport } from '../types';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { X, Mic, AlertTriangle, Calendar, Umbrella, Octagon, Clock, Car, CheckCircle2, Sparkles, MapPin } from 'lucide-react';

interface ExtractedReport {
  category?: HazardCategory;
  title?: string;
  description?: string;
  pidginTranscription?: string;
  severity?: HazardSeverity;
  landmarkName?: string;
}

interface ReportMatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCorridorId: string;
  /** Real device location if geolocation was granted, else falls back to the corridor's center point. */
  reportLocation: { lat: number; lng: number };
  locationIsPrecise: boolean;
  onAddReport: (report: Partial<UserReport>) => void;
}

export const ReportMatterModal: React.FC<ReportMatterModalProps> = ({
  isOpen,
  onClose,
  activeCorridorId,
  reportLocation,
  locationIsPrecise,
  onAddReport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HazardCategory>('bad_spot');
  const [selectedSeverity, setSelectedSeverity] = useState<HazardSeverity>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedReport | null>(null);

  if (!isOpen) return null;

  const categories: { id: HazardCategory; label: string; icon: any }[] = [
    { id: 'bad_spot', label: 'Pothole / Bad Spot', icon: AlertTriangle },
    { id: 'agbero_checkpoint', label: 'Checkpoint / Agbero', icon: Octagon },
    { id: 'gridlock', label: 'Standstill Gridlock', icon: Clock },
    { id: 'flood_zone', label: 'Flooding / Deep Water', icon: Umbrella },
    { id: 'market_day', label: 'Market Congestion', icon: Calendar },
    { id: 'accident', label: 'Accident / Breakdown', icon: Car },
  ];

  const handleAudioCaptured = async (audioBase64: string, mimeType: string, textFallback?: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/report-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType, textInput: textFallback, corridorId: activeCorridorId }),
      });

      const data = await res.json();
      if (data.success && data.extracted) {
        setExtractedResult(data.extracted);
        if (data.extracted.category) setSelectedCategory(data.extracted.category);
        if (data.extracted.severity) setSelectedSeverity(data.extracted.severity);
      }
    } catch (err) {
      console.warn('Voice processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitFinal = () => {
    const finalReport: Partial<UserReport> = {
      category: selectedCategory,
      title: extractedResult?.title || `${selectedCategory.replace('_', ' ')} Report`,
      description: extractedResult?.description || 'Reported by active driver via NaijaNav',
      pidginTranscription: extractedResult?.pidginTranscription || '',
      severity: selectedSeverity,
      corridorId: activeCorridorId,
      lat: reportLocation.lat,
      lng: reportLocation.lng,
      reporterAlias: 'Scout_Driver_Lagos',
      reporterBadge: 'Chairman Driver',
    };

    onAddReport(finalReport);
    setExtractedResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-black text-white">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Report Matter (Log Condition)</h3>
              <p className="text-xs text-neutral-500 font-medium">Minimal friction crowdsourcing while driving</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-black rounded-xl bg-neutral-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-neutral-600 bg-[#FAF9F6] border border-neutral-200 rounded-xl px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-black flex-shrink-0" />
          <span>
            {locationIsPrecise
              ? 'Using your device location for this report.'
              : "Couldn't get your device location — this will drop a pin at the corridor's center instead. Enable location access for accurate pins."}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest block">1. Select Category (1-Tap):</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center space-x-2 ${
                    isSelected ? 'bg-black border-black text-white shadow-md' : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-black'}`} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest block">2. Voice Note or Text Note:</label>
          <VoiceNoteRecorder onAudioCaptured={handleAudioCaptured} isProcessing={isProcessing} />
        </div>

        {extractedResult && (
          <div className="bg-[#FAF9F6] border border-neutral-300 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-black flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Extracted Report Details:</span>
            </span>
            <p className="text-xs font-black text-black">{extractedResult.title}</p>
            {extractedResult.pidginTranscription && (
              <p className="text-xs text-neutral-800 italic font-medium">"{extractedResult.pidginTranscription}"</p>
            )}
          </div>
        )}

        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black font-bold text-xs border border-neutral-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitFinal}
            className="flex-1 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Publish Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
