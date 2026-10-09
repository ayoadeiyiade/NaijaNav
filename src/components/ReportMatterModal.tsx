import React, { useState } from 'react';
import { HazardCategory, HazardSeverity, UserReport } from '../types';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { X, Mic, AlertTriangle, Calendar, Umbrella, Octagon, Clock, Car, CheckCircle2, MapPin } from 'lucide-react';

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
    { id: 'bad_spot', label: 'Pothole', icon: AlertTriangle },
    { id: 'agbero_checkpoint', label: 'Checkpoint', icon: Octagon },
    { id: 'gridlock', label: 'Gridlock', icon: Clock },
    { id: 'flood_zone', label: 'Flooding', icon: Umbrella },
    { id: 'market_day', label: 'Market congestion', icon: Calendar },
    { id: 'accident', label: 'Accident', icon: Car },
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
      title: extractedResult?.title || `${selectedCategory.replace('_', ' ')} report`,
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
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-asphalt-raised rounded-md max-w-lg w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-asphalt-line pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-md bg-rust">
              <Mic className="w-5 h-5 text-parchment" />
            </div>
            <div>
              <h3 className="font-display text-lg text-parchment">Report matter</h3>
              <p className="text-xs text-parchment-dim">Log a condition while driving</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-parchment-dim hover:text-parchment rounded-md hover:bg-asphalt">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-parchment-dim bg-asphalt rounded-md px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-danfo flex-shrink-0" />
          <span>
            {locationIsPrecise
              ? 'Using your device location for this report.'
              : "Couldn't get your device location, this will drop a pin at the corridor's center instead."}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-parchment-dim block">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-md text-sm font-medium text-left transition-colors flex items-center space-x-2 ${
                    isSelected ? 'bg-danfo text-asphalt' : 'bg-asphalt text-parchment-dim hover:text-parchment'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-parchment-dim block">Voice note or text</label>
          <VoiceNoteRecorder onAudioCaptured={handleAudioCaptured} isProcessing={isProcessing} />
        </div>

        {extractedResult && (
          <div className="bg-asphalt rounded-md p-3 space-y-1">
            <span className="text-xs text-danfo block">Extracted details</span>
            <p className="text-sm font-semibold text-parchment">{extractedResult.title}</p>
            {extractedResult.pidginTranscription && (
              <p className="text-sm text-parchment-dim">{extractedResult.pidginTranscription}</p>
            )}
          </div>
        )}

        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-md bg-asphalt hover:bg-asphalt-line text-parchment font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitFinal}
            className="flex-1 py-3 rounded-md bg-danfo hover:bg-danfo-dim text-asphalt font-semibold text-sm flex items-center justify-center space-x-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
