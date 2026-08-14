import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { SEEDED_CORRIDORS } from './src/data/corridors.js';
import { SEEDED_LANDMARKS } from './src/data/landmarks.js';
import { SEEDED_HAZARDS } from './src/data/hazards.js';
import { UserReport } from './src/types.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI (optional — the app degrades gracefully without a key)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'naijanav',
        },
      },
    })
  : null;

// In-memory store for crowdsourced user reports.
// NOTE: this resets on every server restart. Fine for a single-corridor
// MVP demo; swap for a real datastore (SQLite is enough to start) before
// putting this in front of real users, or reports will silently vanish.
const userReports: UserReport[] = [
  {
    id: 'rep-1',
    category: 'agbero_checkpoint',
    title: 'Union Collectors at Fadeyi Service Lane',
    description: 'Agbero stopping small buses asking for weekend levy.',
    pidginTranscription: 'Oga, agbero dey stand for Fadeyi service lane dey collect money from bus o.',
    severity: 'medium',
    corridorId: 'ikorodu-road',
    lat: 6.5235,
    lng: 3.3688,
    verifiedCount: 18,
    status: 'verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    reporterAlias: 'Driver_Chidi_99',
    reporterBadge: 'Chairman Driver',
  },
  {
    id: 'rep-2',
    category: 'bad_spot',
    title: 'Deep Hole Near Jakande First Bank',
    description: 'Fresh pothole caused by broken pipe.',
    pidginTranscription: 'Bad hole don open for right side after yellow umbrellas. Mind your tire!',
    severity: 'high',
    corridorId: 'lekki-epe',
    lat: 6.4355,
    lng: 3.4885,
    verifiedCount: 29,
    status: 'verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    reporterAlias: 'Lekki_Express_Guy',
    reporterBadge: 'Junction Master',
  },
];

// --- API ROUTES ---

app.get('/api/corridors', (_req, res) => {
  res.json({ success: true, corridors: SEEDED_CORRIDORS });
});

app.get('/api/landmarks', (req, res) => {
  const { corridorId } = req.query;
  if (corridorId) {
    const filtered = SEEDED_LANDMARKS.filter((l) => l.corridorId === corridorId);
    return res.json({ success: true, landmarks: filtered });
  }
  res.json({ success: true, landmarks: SEEDED_LANDMARKS });
});

app.get('/api/hazards', (req, res) => {
  const { corridorId } = req.query;
  if (corridorId) {
    const filtered = SEEDED_HAZARDS.filter((h) => h.corridorId === corridorId);
    return res.json({ success: true, hazards: filtered });
  }
  res.json({ success: true, hazards: SEEDED_HAZARDS });
});

app.get('/api/reports', (_req, res) => {
  res.json({ success: true, reports: userReports });
});

app.post('/api/reports', (req, res) => {
  const reportData = req.body || {};

  // Basic shape validation. This is a single-corridor MVP, not hardened
  // for public traffic — there's still no auth or rate limiting here.
  if (typeof reportData.lat !== 'number' || typeof reportData.lng !== 'number') {
    return res.status(400).json({ success: false, message: 'lat/lng are required numbers' });
  }

  const newReport: UserReport = {
    id: `rep-${Date.now()}`,
    category: reportData.category || 'bad_spot',
    title: reportData.title || 'Road Condition Report',
    description: reportData.description || 'Driver reported road condition',
    pidginTranscription: reportData.pidginTranscription || '',
    severity: reportData.severity || 'medium',
    corridorId: reportData.corridorId || 'ikorodu-road',
    lat: reportData.lat,
    lng: reportData.lng,
    verifiedCount: 1,
    status: 'verified',
    timestamp: new Date().toISOString(),
    reporterAlias: reportData.reporterAlias || 'Anonymous Driver',
    reporterBadge: reportData.reporterBadge || 'Road Scout',
  };

  userReports.unshift(newReport);
  res.json({ success: true, report: newReport });
});

app.post('/api/reports/:id/verify', (req, res) => {
  const { id } = req.params;
  const rep = userReports.find((r) => r.id === id);
  if (rep) {
    rep.verifiedCount += 1;
    return res.json({ success: true, report: rep });
  }
  res.status(404).json({ success: false, message: 'Report not found' });
});

// Voice note / text report -> structured incident data, via Gemini when a
// key is configured. Falls back to an honest passthrough stub otherwise.
app.post('/api/report-voice', async (req, res) => {
  try {
    const { audioBase64, mimeType, textInput, corridorId } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        extracted: {
          category: 'bad_spot',
          title: textInput ? textInput.slice(0, 60) : 'Reported Road Incident',
          description: textInput || 'Driver-submitted report (no AI key configured to parse audio).',
          pidginTranscription: textInput || '',
          severity: 'medium',
          landmarkName: '',
        },
      });
    }

    const systemInstruction = `You are a Nigerian road-incident report parser.
Analyze the driver's voice note or text report, spoken in Nigerian Pidgin or English.
Extract structured incident info into JSON:
- category: one of ["market_day", "agbero_checkpoint", "flood_zone", "bad_spot", "gridlock", "accident"]
- title: concise title (max 6 words)
- description: clear English description
- pidginTranscription: verbatim or lightly cleaned-up Pidgin statement suitable for display
- severity: one of ["low", "medium", "high", "critical"]
- landmarkName: likely nearby landmark, if mentioned or inferable, else empty string`;

    const parts: any[] = [];
    if (audioBase64) {
      parts.push({ inlineData: { mimeType: mimeType || 'audio/webm', data: audioBase64 } });
    }
    if (textInput) {
      parts.push({ text: `Driver report: "${textInput}"` });
    }
    if (!audioBase64 && !textInput) {
      return res.status(400).json({ success: false, message: 'audioBase64 or textInput is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            pidginTranscription: { type: Type.STRING },
            severity: { type: Type.STRING },
            landmarkName: { type: Type.STRING },
          },
          required: ['category', 'title', 'description', 'pidginTranscription', 'severity'],
        },
      },
    });

    const extracted = JSON.parse(response.text || '{}');
    res.json({ success: true, extracted });
  } catch (error) {
    console.error('Error processing voice report:', error);
    res.status(500).json({ success: false, error: 'Failed to process voice report' });
  }
});

// Landmark-based Pidgin phrasing for a standard turn instruction, via Gemini
// when a key is configured; simple template fallback otherwise.
app.post('/api/generate-pidgin-guidance', async (req, res) => {
  try {
    const { standardInstruction, landmarkName } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        pidginInstruction: landmarkName
          ? `You see that ${landmarkName} for front? Turn after am!`
          : 'Slow down for front, turn carefully make you no miss am!',
      });
    }

    const prompt = `Convert this instruction: "${standardInstruction}"
Reference landmark: "${landmarkName || 'a nearby local landmark'}"
Output natural Nigerian Pidgin navigation guidance framed around the landmark.
Keep it under 2 sentences. Do not invent a landmark that wasn't given.`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });

    res.json({ success: true, pidginInstruction: response.text?.trim() || standardInstruction });
  } catch (err) {
    console.error('Error generating pidgin guidance:', err);
    res.status(500).json({ success: false, error: 'Failed to generate guidance' });
  }
});

// Phonetic respelling helper used by the client's speech-synthesis fallback.
// IMPORTANT: this does NOT produce audio. It returns a respelled text string
// meant to nudge the browser's built-in voice toward Pidgin cadence. There is
// no real Nigerian Pidgin voice model behind this — see audioEngine.ts.
app.post('/api/pidgin-tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'text is required' });

    if (!ai) {
      return res.status(400).json({ success: false, message: 'No API key configured for phonetic respelling' });
    }

    const prompt = `Respell this Nigerian Pidgin text so a standard English text-to-speech
engine pronounces it more naturally. Keep meaning identical, only adjust spelling/spacing
for pronunciation. Do not add new content.
Text: "${text}"
Output JSON: { "phoneticScript": "<respelled text for TTS>" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const data = JSON.parse(response.text || '{}');
    res.json({ success: true, phoneticScript: data.phoneticScript || text });
  } catch (err) {
    console.error('Error generating phonetic script:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// --- VITE & STATIC SERVING ---
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NaijaNav server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
