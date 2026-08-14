import React, { useState, useRef } from 'react';
import { Mic, Square, RefreshCw, Sparkles, Volume2 } from 'lucide-react';

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
    <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-neutral-200 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-black uppercase tracking-widest flex items-center space-x-1">
          <Mic className="w-3.5 h-3.5 text-black" />
          <span>Voice-Note Incident Recorder</span>
        </span>
        <span className="text-[10px] font-mono text-neutral-500 font-bold">Speak Pidgin or English</span>
      </div>

      {micError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{micError}</p>}

      {!audioUrl && !isRecording && (
        <div className="text-center py-4 space-y-3">
          <button
            type="button"
            onClick={startRecording}
            className="w-20 h-20 mx-auto rounded-full bg-black hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-white shadow-xl group"
          >
            <Mic className="w-9 h-9 group-hover:animate-bounce text-white" />
          </button>
          <p className="text-xs text-neutral-700 font-medium">
            Tap button & speak: <br />
            <em className="text-black font-bold">"Oga, water don full under bridge for Fadeyi o!"</em>
          </p>
        </div>
      )}

      {isRecording && (
        <div className="text-center py-4 space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
            <span className="text-base font-extrabold text-red-600 font-mono">
              00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </span>
          </div>

          <div className="flex justify-center items-center space-x-1 h-8">
            {[40, 70, 30, 90, 50, 80, 20, 60, 100, 40].map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-black rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black font-bold text-xs flex items-center justify-center space-x-2 mx-auto border border-neutral-300 shadow-sm"
          >
            <Square className="w-4 h-4 fill-current text-red-600" />
            <span>Stop Recording</span>
          </button>
        </div>
      )}

      {audioUrl && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-neutral-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-black" />
              <span className="text-xs font-bold text-black">Recorded Voice Note ({recordingSeconds}s)</span>
            </div>
            <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
            <button type="button" onClick={resetRecording} className="p-1.5 text-neutral-500 hover:text-black">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1 pt-2 border-t border-neutral-200">
        <label className="text-[11px] text-neutral-600 font-medium block">Or type incident note in Pidgin/English:</label>
        <input
          type="text"
          value={typedFallback}
          onChange={(e) => setTypedFallback(e.target.value)}
          placeholder="e.g. Agbero dey collect ticket for Ojota turning..."
          className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing || (!audioBase64 && !typedFallback.trim())}
        className="w-full py-2.5 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all"
      >
        <Sparkles className="w-4 h-4 text-white" />
        <span>{isProcessing ? 'Extracting Report Details...' : 'Process Report'}</span>
      </button>
    </div>
  );
};
