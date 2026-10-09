import React, { useState, useRef } from 'react';
import { Mic, Square, RefreshCw, Volume2 } from 'lucide-react';

interface VoiceNoteRecorderProps {
  onAudioCaptured: (audioBase64: string, mimeType: string, textFallback?: string) => void;
  isProcessing: boolean;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({ onAudioCaptured, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('audio/webm');
  const [typedFallback, setTypedFallback] = useState<string>('');
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? { mimeType: 'audio/mp4' }
        : {};

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      setMimeType(recorder.mimeType || 'audio/webm');

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          setAudioBase64(base64data);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access unavailable or denied:', err);
      setMicError('Could not access the microphone. You can still type a note below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingSeconds(0);
    setTypedFallback('');
  };

  const handleSubmit = () => {
    if (audioBase64) {
      onAudioCaptured(audioBase64, mimeType, typedFallback);
    } else if (typedFallback.trim()) {
      onAudioCaptured('', 'text/plain', typedFallback);
    }
  };

  return (
    <div className="bg-asphalt p-4 rounded-md space-y-4">
      <div className="flex items-center justify-between text-xs text-parchment-dim">
        <span>Speak Pidgin or English</span>
      </div>

      {micError && <p className="text-xs text-rust bg-rust/10 rounded px-3 py-2">{micError}</p>}

      {!audioUrl && !isRecording && (
        <div className="text-center py-4 space-y-3">
          <button
            type="button"
            onClick={startRecording}
            className="w-20 h-20 mx-auto rounded-full bg-danfo hover:bg-danfo-dim transition-colors flex items-center justify-center text-asphalt"
          >
            <Mic className="w-9 h-9" />
          </button>
          <p className="text-sm text-parchment-dim">
            Tap and speak, for example<br />
            <em className="text-parchment not-italic font-medium">Oga, water don full under bridge for Fadeyi o</em>
          </p>
        </div>
      )}

      {isRecording && (
        <div className="text-center py-4 space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rust animate-pulse" />
            <span className="text-base font-medium text-rust">
              00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </span>
          </div>

          <div className="flex justify-center items-center space-x-1 h-8">
            {[40, 70, 30, 90, 50, 80, 20, 60, 100, 40].map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-danfo rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-5 py-2 rounded-md bg-asphalt-raised hover:bg-asphalt-line text-parchment font-medium text-sm flex items-center justify-center space-x-2 mx-auto"
          >
            <Square className="w-4 h-4 fill-current text-rust" />
            <span>Stop recording</span>
          </button>
        </div>
      )}

      {audioUrl && (
        <div className="bg-asphalt-raised p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-danfo" />
            <span className="text-sm text-parchment">Recorded ({recordingSeconds}s)</span>
          </div>
          <audio src={audioUrl} controls className="h-8 max-w-[180px]" />
          <button type="button" onClick={resetRecording} className="p-1.5 text-parchment-dim hover:text-parchment">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-1 pt-2 border-t border-asphalt-line">
        <label className="text-xs text-parchment-dim block">Or type a note in Pidgin or English</label>
        <input
          type="text"
          value={typedFallback}
          onChange={(e) => setTypedFallback(e.target.value)}
          placeholder="Agbero dey collect ticket for Ojota turning"
          className="w-full bg-asphalt-raised rounded-md px-3 py-2 text-sm text-parchment placeholder:text-parchment-dim focus:outline-none focus:ring-1 focus:ring-danfo"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing || (!audioBase64 && !typedFallback.trim())}
        className="w-full py-2.5 rounded-md bg-danfo hover:bg-danfo-dim disabled:opacity-40 disabled:hover:bg-danfo text-asphalt font-semibold text-sm transition-colors"
      >
        {isProcessing ? 'Extracting report details' : 'Process report'}
      </button>
    </div>
  );
};
