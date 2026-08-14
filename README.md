# NaijaNav

Localized Nigerian turn-by-turn navigation concept: landmark-based, Pidgin-flavored
voice cues over a small set of manually seeded road corridors, plus crowd-sourced
road intelligence (market days, checkpoints, flood zones, potholes).

This is a rebuild of an AI Studio-generated scaffold. See CHANGES.md for exactly
what was fixed and why, and read it before treating any of this as more capable
than it actually is.

## Run locally

Prerequisites: Node.js 18+

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in what you have:
   - `GEMINI_API_KEY` — optional. Powers AI voice-note parsing and the
     phonetic-respelling helper. The app runs without it.
   - `GOOGLE_MAPS_PLATFORM_KEY` — optional. Without it, a built-in canvas
     renderer is used instead of live Google Maps tiles.
3. `npm run dev`

## What's real vs. not (read this before demoing)

- **Map rendering**: real, either Google Maps JS SDK or the canvas fallback.
- **Voice note recording**: real, uses `getUserMedia` + `MediaRecorder`.
- **"Pidgin voice"**: NOT a real Nigerian Pidgin TTS model — none exist from
  major providers as of writing. It's the browser's standard speech synthesis
  with word substitutions and pitch/rate tuning. Labeled "Voice Style" in the
  UI, not "AI voice" or "LLM preset", on purpose.
- **Route simulation**: scripted playback through hand-authored waypoints, not
  live GPS tracking. There's no `navigator.geolocation`-driven turn-by-turn yet
  — geolocation is only used to place report pins accurately.
- **Landmark/hazard data**: manually seeded for 4 Lagos-area corridors (a
  handful of waypoints each), not crowdsourced or comprehensive. Framed as an
  MVP test set in the UI, not "50-100 landmarks per corridor" like an earlier
  draft claimed.
- **Leaderboard & phrase bank**: now derived from real submitted reports and
  real seeded landmark/hazard data, not a hardcoded fictional roster.

## Known limitations worth fixing next

- In-memory report store — resets on every server restart. Fine for a demo,
  needs a real datastore before real users touch it.
- No auth or rate limiting on report submission.
- Simulated vehicle position is straight-line interpolation between waypoints,
  not snapped to roads.
