# Changes from the original AI Studio scaffold

## Bugs fixed
- `audioEngine.ts`: removed an unconditional `bridge -> breeze` text
  replacement that ran on every voice cue. Bridges are the most common
  landmark type in the seed data ("no follow the up bridge o..."), so this
  silently turned the app's core landmark cues into nonsense.
- `ReportMatterModal.tsx`: report submissions used a hardcoded coordinate
  around Ikorodu Road regardless of which corridor was active. Now uses real
  device geolocation when granted, falling back to the active corridor's
  center point (not always Ikorodu) when it isn't.
- `App.tsx`: `handleVerifyReport` only caught network-level failures: a 404
  from the server (e.g. bad report id) was silently ignored instead of
  surfacing anything. Now checks `res.ok`.

## Honesty / labeling fixes
- Deleted `/api/pidgin-models` entirely. It listed four fabricated "models"
  (e.g. "Warri Sharp Regional LLM", "AfroPhonetic Natural Voice Engine")
  that don't exist and weren't backed by anything real.
- `NavigationHUD.tsx`: renamed "Pidgin LLM Preset" to "Voice Style", the
  accent picker is a browser-speech-synthesis tuning preset (word swaps +
  pitch/rate), not a distinct AI voice model, and shouldn't be labeled as one.
- `/api/pidgin-tts`: renamed/commented to make clear it returns a phonetic
  *text* respelling, not audio. The actual speech still comes from the
  browser's `speechSynthesis` API.
- `NavigationHUD.tsx`: removed a random `Math.floor(35 + Math.random() * 15)`
  "Est. Speed" readout and a hardcoded "TRAFFIC: 1.4x" label that had no data
  behind them and would have misled anyone reading the dashboard as real.
- `CorridorSelector.tsx`: corrected copy that claimed "50-100 landmarks per
  corridor" when the seed data has 2-5 per corridor.

## Made fake data real
- `ContributorLeaderboard.tsx`: was a hardcoded fictional roster with
  invented report counts. Now aggregates real submitted reports by
  `reporterAlias`.
- `AudioPhraseBankModal.tsx`: was a separate hand-picked array of 7 phrases
  disconnected from the actual app data. Now built from the active
  corridor's real seeded landmark and hazard cues.

## Not changed (still true of this build, flagged for visibility)
- Route "simulation" is scripted waypoint playback, not live GPS navigation.
- In-memory report store, no auth/rate limiting, no persistence.
- Simulated vehicle position is straight-line interpolation, not road-snapped.

## Map and UI redesign
- Map runs on Leaflet with standard OpenStreetMap tiles, darkened with a CSS filter. No API key, no billing account. (CARTO dark tiles were tried first but now require a key.)
- Removed the Google Maps dependency, key modal, and canvas fallback.
- Visual redesign: dark asphalt base, danfo yellow accent, rust red for alerts, green for verified.
  Oswald for headlines and numbers, Work Sans for body text.
- Dropped the uppercase tracked labels, monospace digits, and identical rounded shadow cards.
- Removed every em dash from UI copy, comments, and docs.
