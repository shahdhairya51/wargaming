# Operation Pacific Shield
## SCSP Hackathon 2026 — Wargaming Track

### What We Built
An AI-adjudicated crisis escalation simulator for a Chinese maritime
quarantine of Taiwan (CSIS "Lights Out?" scenario, July 2025). The system
eliminates the White Cell bottleneck — replacing hours of expert adjudication
with doctrine-grounded AI rulings in seconds.

Three roles: Human Blue Commander (INDOPACOM), AI Red Team (PLA Eastern
Theater Command following 联合封锁战役 doctrine), AI White Cell (adjudicates
against JP 3-0, CSIS wargame findings, DOD China Military Power Report 2025).

Features:
- Live Leaflet.js map with animated unit movements
- Fog-of-war hidden asset system (DF-26 "Guam Killer" reveal)
- Resource tracker (Taiwan LNG countdown — CSIS: runs out in 10 days)
- Dynamic escalation meter (0-10 scale)
- Structured After-Action Report generation

### Datasets & APIs Used
- GDELT 2.0 (scenario seeding, CAMEO event codes)
- OpenStreetMap / CartoDB (dark map tiles)
- CSIS "Lights Out?" July 2025 (escalation matrix, doctrine)
- CSIS "First Battle of the Next War" 2023 (force recommendations)
- DOD China Military Power Report 2025 (DF-26 specs)
- Global Taiwan Institute Jan 2026 (PLARF coordinates)
- JP 3-0 Joint Operations doctrine
- FAS Nuclear Notebook March 2025
- Taiwan MND public data (Justice Mission 2025)

### How to Run
1. Clone repo
2. Open index.html in any modern browser (Chrome/Firefox/Edge)
3. No server required — all data is bundled
4. Click "MOVE 1" to begin scenario
5. Click through moves in sequence

### Architecture
Single-page HTML application. Leaflet.js for mapping (CDN).
Hardcoded scenario data with typewriter streaming animation for
AI adjudication realism. No backend required, no API keys needed.
