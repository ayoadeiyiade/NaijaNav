/**
 * NaijaNav Audio Engine
 *
 * Honesty note for future maintainers: there is no production-grade
 * Nigerian Pidgin text-to-speech model available from any major TTS
 * provider. What this file does is a workaround, not real Pidgin voice
 * synthesis: it takes standard browser speech synthesis (whatever
 * English-ish voice the device has installed) and nudges its
 * pronunciation and pacing with light word substitutions and rate/pitch
 * tuning. That's a legitimate technique for an MVP, but don't let UI
 * copy or code comments oversell it as an "AI voice model" or "LLM
 * preset", it isn't one. See /api/pidgin-tts in server.ts for the
 * (optional, Gemini-backed) server-side half of this same workaround.
 */

import { VoiceStyle } from '../types';

// Web Audio Context Singleton
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a short chime for hazards/turns/report confirmations.
 */
export function playAlertChime(type: 'hazard' | 'turn' | 'report_success' = 'turn') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hazard') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'report_success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

/**
 * Light word-substitution pass to nudge a standard English voice toward
 * Pidgin cadence. Deliberately conservative: earlier revisions of this
 * function replaced "bridge" with "breeze", which silently corrupted
 * every bridge-based landmark cue in the app (the single most common
 * landmark type in the seed data). Do not add substitutions here
 * without checking them against every waypoint/hazard/landmark string
 * in src/data/.
 */
export function naturalizePidginPhonetics(text: string, accentMode: VoiceStyle = 'Lagos Standard'): string {
  let spoken = text;

  if (accentMode === 'Warri Sharp') {
    spoken = spoken.replace(/\bno follow\b/gi, 'abeg no follow');
    if (!/[.!?]\s*$/.test(spoken)) spoken += ' o!';
  } else if (accentMode === 'Gentle Uncle') {
    if (!spoken.toLowerCase().startsWith('oga driver')) spoken = `Oga driver, ${spoken}`;
  }

  spoken = spoken
    .replace(/\bthe\b/gi, 'de')
    .replace(/\bthat\b/gi, 'dat')
    .replace(/\bthis\b/gi, 'dis')
    .replace(/\bthere\b/gi, 'dere')
    .replace(/\bthem\b/gi, 'dem');

  // Small pause after punctuation for more natural phrasing.
  spoken = spoken.replace(/([,?!])/g, '$1 ');

  return spoken;
}

/**
 * Speak text using the browser's SpeechSynthesis API, tuned per voice style.
 */
export function speakPidginPhonetic(text: string, accentMode: VoiceStyle = 'Lagos Standard'): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const spokenText = naturalizePidginPhonetics(text, accentMode);
    const utterance = new SpeechSynthesisUtterance(spokenText);

    // No browser ships a real en-NG voice as of writing. We check for one
    // anyway in case that changes, then fall back through the closest
    // available English variants.
    const voices = window.speechSynthesis.getVoices();
    const ngVoice =
      voices.find((v) => v.lang.includes('en-NG') || v.name.toLowerCase().includes('nigeria')) ||
      voices.find((v) => v.lang.includes('en-GB')) ||
      voices.find((v) => v.lang.includes('en-US')) ||
      voices[0];

    if (ngVoice) utterance.voice = ngVoice;

    if (accentMode === 'Warri Sharp') {
      utterance.rate = 1.02;
      utterance.pitch = 1.15;
    } else if (accentMode === 'Gentle Uncle') {
      utterance.rate = 0.88;
      utterance.pitch = 0.92;
    } else {
      utterance.rate = 0.94;
      utterance.pitch = 1.02;
    }

    utterance.volume = 1.0;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Ask the server for a Gemini-naturalized phonetic respelling of the text,
 * then speak that respelling client-side. This is still browser TTS under
 * the hood. The server call only improves the *text* fed into it, it does
 * not produce audio itself. Returns false on any failure so the caller can
 * fall back to pure client-side naturalization.
 */
export async function fetchAndPlayServerTTS(text: string, voicePreset: string = 'Lagos Express'): Promise<boolean> {
  try {
    const res = await fetch('/api/pidgin-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voicePreset }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    if (data.phoneticScript) {
      await speakPidginPhonetic(data.phoneticScript);
      return true;
    }
  } catch (err) {
    console.warn('Server-side phonetic respelling unavailable, using client-only naturalization', err);
  }
  return false;
}

/**
 * Main entry point: play the turn chime, then speak the cue.
 */
export async function announcePidginCue(text: string, accentMode: VoiceStyle = 'Lagos Standard') {
  playAlertChime('turn');
  const serverSuccess = await fetchAndPlayServerTTS(text);
  if (!serverSuccess) {
    await speakPidginPhonetic(text, accentMode);
  }
}
