// ============================================================
// OPERATION PACIFIC SHIELD — DATA MODULE
// All scenario content, ORBAT, and move scripts
// ============================================================

const ORBAT = {
  blue: [
    {id:"B-01",name:"USS Ronald Reagan (CVN-76)",type:"carrier",lat:23.0,lng:127.0,iconClass:"blue-carrier",label:"CVN",callsign:"REAGAN",speedKts:25,attackRangeNm:600},
    {id:"B-02",name:"USS Chancellorsville (CG-62)",type:"cruiser",lat:23.2,lng:126.8,iconClass:"blue-cruiser",label:"CG",callsign:"CHSVL",speedKts:30,attackRangeNm:150},
    {id:"B-03",name:"USS Benfold (DDG-65)",type:"destroyer",lat:22.8,lng:127.2,iconClass:"blue-destroyer",label:"DDG",callsign:"BENFOLD",speedKts:30,attackRangeNm:150},
    {id:"B-04",name:"USS Seawolf (SSN-21)",type:"submarine",lat:24.5,lng:123.0,iconClass:"blue-sub",label:"SSN",callsign:"SEAWOLF",speedKts:20,attackRangeNm:300},
    {id:"B-05",name:"P-8 Poseidon (VP-4)",type:"aircraft",lat:24.0,lng:125.0,iconClass:"blue-aircraft",label:"P-8",callsign:"NEPTUNE",speedKts:450,attackRangeNm:100},
    {id:"B-06",name:"Kadena AB (F-35/F-22)",type:"airbase",lat:26.356,lng:127.769,iconClass:"blue-airbase",label:"AB",callsign:"KADENA",speedKts:0,attackRangeNm:500},
    {id:"B-07",name:"B-21 Raiders (Andersen AFB)",type:"bomber",lat:13.584,lng:144.929,iconClass:"blue-bomber",label:"B-21",callsign:"RAIDER",speedKts:500,attackRangeNm:2000},
    {id:"B-08",name:"ROCN Fleet",type:"carrier",lat:25.0,lng:121.7,iconClass:"blue-allied",label:"ROC",callsign:"TAIWAN",speedKts:20,attackRangeNm:100}
  ],
  red: [
    {id:"R-01",name:"PLAN Shandong CSG (CV-17)",type:"carrier",lat:24.5,lng:119.5,iconClass:"red-carrier",label:"CV",hidden:false,speedKts:25,attackRangeNm:500},
    {id:"R-02",name:"Type 055 DDG Nanchang",type:"destroyer",lat:24.7,lng:119.3,iconClass:"red-destroyer",label:"DDG",hidden:false,speedKts:30,attackRangeNm:200},
    {id:"R-03",name:"Type 052D DDG x2",type:"destroyer",lat:24.0,lng:119.8,iconClass:"red-destroyer",label:"DDG",hidden:false,speedKts:30,attackRangeNm:200},
    {id:"R-04",name:"PLAN Fujian CSG (CV-18)",type:"carrier",lat:22.0,lng:119.0,iconClass:"red-carrier",label:"CV",hidden:false,speedKts:25,attackRangeNm:550},
    {id:"R-05",name:"CCG Haijing-3901 + escorts",type:"coastguard",lat:25.3,lng:121.2,iconClass:"red-ccg",label:"CCG",hidden:false,speedKts:18,attackRangeNm:12},
    {id:"R-06",name:"PAFMM Fleet (47 vessels)",type:"militia",lat:25.8,lng:121.0,iconClass:"red-militia",label:"MM",hidden:false,speedKts:12,attackRangeNm:5},
    {id:"R-07",name:"PLARF DF-21D (Yong'an)",type:"missile",lat:25.94,lng:117.37,iconClass:"red-missile",label:"DF-21",hidden:false,readiness:"STANDBY",speedKts:0,attackRangeNm:800},
    {id:"R-08",name:"PLARF DF-26 (Nanping) — 8 TELs",type:"missile",lat:26.64,lng:118.17,iconClass:"red-missile-hidden",label:"DF-26",hidden:true,revealOnMove:3,speedKts:0,attackRangeNm:1500},
    {id:"R-09",name:"PLAN Type 093 SSN x2",type:"submarine",lat:22.5,lng:121.5,iconClass:"red-sub-hidden",label:"SSN",hidden:true,revealOnMove:2,speedKts:20,attackRangeNm:200},
    {id:"R-10",name:"J-20 Stealth Fighter Wing",type:"aircraft",lat:26.0,lng:119.5,iconClass:"red-aircraft",label:"J-20",hidden:false,speedKts:1000,attackRangeNm:600},
    {id:"R-11",name:"H-6K Bomber Wing",type:"bomber",lat:25.5,lng:118.5,iconClass:"red-bomber",label:"H-6K",hidden:false,speedKts:450,attackRangeNm:800}
  ],
  neutral: [
    {id:"N-01",name:"LNG Tanker MV Pacific Jade",type:"merchant",lat:23.5,lng:122.5,iconClass:"neutral-merchant",label:"MV",speedKts:14},
    {id:"N-02",name:"Taiwan LNG Terminal (Taichung)",type:"infrastructure",lat:24.28,lng:120.53,iconClass:"neutral-port",label:"LNG",speedKts:0},
    {id:"N-03",name:"JS Onami (JMSDF)",type:"destroyer",lat:27.5,lng:128.0,iconClass:"blue-allied",label:"JMSDF",speedKts:30}
  ]
};

const MOVES = {
  1: {
    title: "DETERRENCE POSTURE",
    escStart: 2, escEnd: 4, escLabel: "ELEVATED TENSION",
    playerMove: `Commander INDOPACOM authorizes:\n- Reagan CSG holds 200nm east of Taiwan as the principal deterrent mass.\n- P-8 Poseidon begins persistent ISR over the central Strait.\n- MMCA contact is prepared, but Blue does not force the line yet.`,
    whiteCell: `WHITE CELL // MOVE 1 ADJUDICATION
TIMESTAMP: 15 APR 2026 — 0600Z (D+0)

RULING
Blue establishes a credible deterrent posture. The move does not break the quarantine, but it forces Beijing to account for immediate U.S. intervention.

TRANSIT CALCULUS
- Reagan CSG: Yokosuka to 23.0°N/127.0°E = 1,190 NM at 25 KTS = 47.6 HRS transit.
  Departed 0800Z 13 APR. On station 0600Z 15 APR. Transit complete.
- P-8 Poseidon: Kadena to ISR orbit 24.5°N/125.0°E = 312 NM at 450 KTS = 0.7 HRS.
  First patrol pass 0430Z 15 APR. Persistent ISR coverage established.
- LNG reserves: 8 days at peacetime consumption. Degradation rate: 0.5 days/24 HRS under partial blockade.
- CCG Haijing-3901 boarding cordon established at 25.3°N/121.2°E — Blue must transit 241 NM from Reagan position to breach.

BASIS
- Reagan east of Taiwan is visible, disciplined force signaling.
- P-8 coverage improves maritime picture and warning time for any convoy attempt.
- Blue stays outside the tightest PLA surface engagement geometry, preserving options per JP 3-0 standoff deterrence principles.

IMMEDIATE EFFECT
- PRC sees resolve, not yet a rollback attempt.
- Boarding pressure continues under closer ISR scrutiny.
- Taiwan gains time, not access.

NEXT RISK
If Blue escorts a merchant through the cordon, Red will likely respond with submarine shadowing, missile readiness, and deniable coercion.

ESCALATION
2 -> 4 / 10`,
    redTeam: `RED CELL // EASTERN THEATER COMMAND

ASSESSMENT
Blue is signaling willingness to intervene, but it is still avoiding a direct breach of the quarantine.

INTENT
Keep the quarantine credible, test U.S. thresholds in alignment with the 'Science of Military Strategy' doctrine of Active Defense, and preserve the political narrative that China is conducting internal maritime control.

ACTIONS
- Haijing-3901 tightens the boarding line north of Taiwan.
- Maritime militia disperses east and south to create layered ambiguity.
- Shandong CSG remains west of the median line but holds ready to surge.
- DF-21D brigade shifts from standby to AMBER readiness.

MESSAGE
"Foreign military presence does not alter Chinese sovereignty."

NEXT IF BLUE PRESSES
Convoy escort or strike prep will trigger submerged trailing units and a sharper missile posture.`,

    resources: { lrasm: 450, sm6: 1500, mk48: "100%", lng: 8, coal: 38, oil: 143, casualties: 0, japan: "UNKNOWN", df21: "AMBER", df26: "UNDETECTED", domains: { link16: "OPTIMAL", cyber: "100%", radar: "ACTIVE" }, environment: { seaState: "3 (MODERATE)", vis: "CLEAR", typhoon: "LOW" } }
  },
  2: {
    title: "CONVOY ESCORT + FOG OF WAR",
    escStart: 4, escEnd: 7, escLabel: "LIMITED CONFLICT",
    playerMove: `Commander INDOPACOM authorizes:\n- USS Benfold escorts MV Pacific Jade through the quarantine seam.\n- P-8 remains overhead to maintain ISR and legal visibility.\n- USS Seawolf enters the Strait to hold PLA surface forces at risk.\n- Tokyo is asked to clear Kadena access for follow-on sorties.`,
    whiteCell: `WHITE CELL // MOVE 2 ADJUDICATION
TIMESTAMP: 16 APR 2026 — 0340Z (D+1)

RULING
Escort is feasible, but Blue now enters a tightened PLA kill chain. The mission buys time for Taiwan at real cost.

TRANSIT CALCULUS
- Benfold departs holding position 23.0°N/127.0°E at 0300Z 16 APR.
  To quarantine seam [25.3°N, 121.2°E]: 281 NM at 20 KTS = 14.1 HRS.
  ETA cordon: 1715Z 16 APR.
- Pacific Jade (LNG tanker): departs 23.5°N/122.5°E at 0300Z 16 APR.
  To Taichung terminal [24.28°N, 120.53°E]: 124 NM at 14 KTS = 8.9 HRS.
  ETA port: 1154Z 16 APR (if cordon cleared).
- Seawolf SSN: transits to strait at 20 KTS submerged. Entry point 24.2°N/121.8°E.
  Transit from holding: 90 NM at 20 KTS = 4.5 HRS. On station: 0730Z 16 APR.
- INTEL FLASH: Type 093 SSN contact established at 0340Z — T+0.7 HRS into Benfold transit.
  SSN trailing at ~8 NM on convoy axis. Passive targeting in development.
  Margin before intercept geometry closes: <38 MIN at current closure rate.

BASIS
- Protecting merchant traffic in international waters is lawful under UNCLOS and NWP 3-56 (Composite Warfare Commander) doctrine.
- Benfold is exposed inside the DF-21D threat envelope (range 1,500 km, targeting on Reagan at RED).
- Subsurface play is strong: Seawolf is one of the few assets that can complicate PLA confidence inside the Strait.

IMMEDIATE EFFECT
- LNG collapse is delayed, but not solved.
- Blue surface survivability declines.
- PRC now has enough evidence to justify a sharper military response.

FOG-OF-WAR UPDATE
PLAN Type 093 SSNs detected trailing convoy axis. Red has prepared an underwater pressure layer previously masked.

NEXT RISK
Any mainland strike or aggressive Reagan advance can trigger Guam-facing coercion and wider war signaling.

ESCALATION
4 -> 7 / 10`,
    redTeam: `RED CELL // EASTERN THEATER COMMAND

ASSESSMENT
Blue is attempting a limited breakout under legal cover, not full offensive rollback.

INTENT
Preserve quarantine credibility, bleed Blue confidence, and expose U.S. escorts to layered pressure without losing escalation control, adhering to System Destruction Warfare principles to isolate the escort.

ACTIONS
- Type 093 SSNs shadow the convoy track and begin passive targeting development.
- DF-21D targeting quality on Reagan improves to RED.
- J-20 patrols cross deeper into the ADIZ to force decision fatigue.
- Shandong closes range to compress Blue reaction time.
- Coast Guard units "escort" the convoy to keep the sovereignty narrative alive on camera.

MESSAGE
"American interference has militarized a lawful Chinese enforcement action."

NEXT IF BLUE PRESSES
Mainland strike preparations or deeper carrier advance will unlock DF-26 signaling and broader theater retaliation planning.`,

    resources: { lrasm: 450, sm6: 1420, mk48: "85%", lng: 5, coal: 35, oil: 140, casualties: 1200, japan: "PENDING", df21: "RED", df26: "UNDETECTED", domains: { link16: "DEGRADED", cyber: "85%", radar: "ACTIVE" }, environment: { seaState: "4 (ROUGH)", vis: "DEGRADED", typhoon: "ELEVATED" } }
  },
  3: {
    title: "B-21 STRIKES + DF-26 REVEAL",
    escStart: 7, escPeak: 9, escEnd: 7, escLabel: "LIMITED CONFLICT",
    playerMove: `Commander INDOPACOM authorizes:\n- B-21 Raiders launch a limited LRASM strike against Zhoushan naval infrastructure.\n- Reagan CSG edges closer to tighten recovery and deterrence geometry.\n- MMCA hotline is activated with a humanitarian corridor proposal to create an off-ramp.`,
    whiteCell: `WHITE CELL // MOVE 3 ADJUDICATION
TIMESTAMP: 17 APR 2026 — 0215Z (D+2)

RULING
Blue achieves tactical effect but crosses the threshold into wider-war signaling. The strike works because diplomacy is turned on at the exact moment military pressure peaks. Escalation stabilizes at Level 7 (Limited Conflict) after a peak of 9.

STRIKE CALCULUS
- B-21 Raiders depart Andersen AFB 232°T: Distance to Zhoushan [30.02°N, 122.11°E] = 1,644 NM.
  Transit at 500 KTS = 3.29 HRS. Wheels up 2300Z 16 APR. Weapons release 0215Z 17 APR.
  Pre-dawn strike window selected per AFDP 3-0 strike doctrine (reduced IADS alertness).
- 24x LRASM expended. Zhoushan naval basin and fueling infrastructure struck.
  Assessed: 2x PLAN destroyers damaged, 1x submarine tender mission-killed.
  Strike success probability: ~85% per CSIS First Battle (2023), p.11.
- Reagan CSG advances: 127.0°E to 125.0°E = 120 NM at 25 KTS = 4.8 HRS.
  New position 0200Z 17 APR. Now 150 NM east of Taiwan.

CRITICAL REVEAL
PLARF DF-26 brigade at Nanping [26.64°N, 118.17°E] enters the picture.
8 TELs. Range 3,000-4,000 km. Andersen AFB at 2,820 km. WITHIN ENGAGEMENT ENVELOPE.
DF-26 flight time to Andersen: ~14 MIN after launch. Warning margin: ZERO.

BASIS
- B-21 + LRASM executes long-range standoff punitive action per AFDP 3-0 and Navy DMO concepts.
- Mainland strike creates acute regime-perception risk for Beijing.
- Hotline gives Red a face-saving channel. MMCA hotline activated 0220Z 17 APR.

IMMEDIATE EFFECT
- Zhoushan absorbs meaningful operational disruption.
- Red compelled to respond, but not yet authorized to fire on Guam.
- Humanitarian access becomes negotiable. Both sides see the cliff edge.

NEXT RISK
Another mainland strike, or hotline collapse, converts coercive signaling into open theater retaliation.

ESCALATION
7 -> 9 -> 7 / 10`,
    redTeam: `RED CELL // EASTERN THEATER COMMAND

ASSESSMENT
Blue has chosen a limited mainland strike while simultaneously offering an off-ramp. Beijing reads this as punishment, not yet a regime-change campaign.

INTENT
Restore deterrence, demonstrate range to Guam, and compel operational caution without triggering uncontrolled escalation, executing Anti-Access/Area Denial (A2/AD) "Counter-Intervention" readiness.

ACTIONS
- DF-26 brigade deploys to mountain launch positions and exposes launch credibility.
- Shandong holds, rather than surges, to keep escalation pressure on Blue decision-makers.
- Coast Guard and militia units are reordered to support a humanitarian corridor narrative under Chinese terms.
- Red strategic messaging shifts from denial to conditional restraint.

MESSAGE
"Further attacks on PRC territory will be met with equivalent action against forward U.S. military infrastructure."

NEXT IF BLUE PRESSES
Any second mainland strike will reopen the question of Guam, Japan, and theater-wide retaliation.`,

    resources: { lrasm: 378, sm6: 1350, mk48: "85%", lng: "STABLE", coal: 32, oil: 137, casualties: 5200, japan: "APPROVED", df21: "RED", df26: "ACTIVE", domains: { link16: "DEGRADED", cyber: "100%", radar: "ACTIVE" }, environment: { seaState: "5 (VERY ROUGH)", vis: "POOR", typhoon: "ACTIVE" } }
  }
};

// Move 3 BAD variant — no diplomacy, catastrophic escalation
const MOVE3_BAD = {
  title: "B-21 STRIKES — NO OFF-RAMP",
  escStart: 7, escEnd: 10, escLabel: "NUCLEAR THRESHOLD",
  playerMove: `Commander INDOPACOM authorizes:\n- B-21 Raiders strike Zhoushan.\n- Reagan CSG advances aggressively.\n- No diplomatic channel is activated.`,
  whiteCell: `WHITE CELL // MOVE 3 ADJUDICATION — NO OFF-RAMP VARIANT
TIMESTAMP: 17 APR 2026 — 0215Z (D+2)

RULING
Blue achieves tactical strike success and strategic failure. The action is read as an open mainland attack without an off-ramp.

STRIKE CALCULUS
- B-21 Raiders: Andersen AFB to Zhoushan = 1,644 NM at 500 KTS = 3.29 HRS. Weapons release 0215Z.
- Strike effective. ~85% success probability per CSIS First Battle (2023), p.11.
- Reagan CSG at 125.0°E. Now within DF-21D kill chain: 12-MIN flight time from Yong'an.
- NO MMCA HOTLINE ACTIVATED. No back-channel exists.

CRITICAL FAILURE: NO OFF-RAMP ESTABLISHED
Without a concurrent hotline or humanitarian proposal, PRC leadership cannot distinguish a limited punitive strike from the opening phase of a regime-change campaign.

CRITICAL REVEAL
Nanping DF-26 brigade activated. 8 TELs dispersed to mountain launch sites.
DF-26 flight time to Andersen AFB: ~14 MIN. Warning margin: ZERO.
Warhead status: DUAL-CAPABLE. Conventional/nuclear ambiguity is now the dominant escalation driver.

BASIS
- Zhoushan can be hit effectively by B-21 + LRASM.
- Without concurrent diplomacy, PRC cannot limit its response per JP 3-0 limited objective frameworks.
- Dual-capable DF-26 signaling is maximally dangerous under ambiguity.

IMMEDIATE EFFECT
- Red gains justification for major retaliation.
- Blue forward bases and escorts move into immediate theater jeopardy.
- Escalation control breaks down.

WARNING
The next exchange may not remain conventional.

ESCALATION
7 -> 10 / 10`,
  redTeam: `RED CELL // EASTERN THEATER COMMAND

ASSESSMENT
Blue has struck the mainland without preserving a diplomatic off-ramp. Beijing now treats the move as the opening of a broader campaign.

INTENT
Restore deterrence by imposing immediate cost and signaling readiness for horizontal escalation, adhering to Science of Military Strategy principles of decisive counter-attack.

ACTIONS
- DF-26 brigade disperses to launch sites with dual-capable ambiguity intact.
- DF-21D salvo fires at Reagan escort geometry.
- J-20 and H-6K sorties expand against Okinawa-facing military targets.
- MMCA channel is left unanswered because no off-ramp framework exists.

MESSAGE
"Attacks on sovereign Chinese territory will be answered with all necessary means."

STATUS
Uncontrolled escalation. Nuclear use probability elevated.`,

  resources: { lrasm: 378, sm6: 1100, mk48: "70%", lng: 3, coal: 33, oil: 138, casualties: 5587, japan: "UNDER ATTACK", df21: "RED", df26: "NUCLEAR-READY", domains: { link16: "DENIED", cyber: "BLACKOUT", radar: "BLINDED" }, environment: { seaState: "6 (HIGH)", vis: "ZERO", typhoon: "SEVERE" } }
};

const AAR_CONTENT = `CLASSIFICATION: UNCLASSIFIED // EXERCISE ONLY
OPERATION PACIFIC SHIELD — AFTER-ACTION REVIEW
AI Wargame Adjudication System v1.0
Exercise Date: 15 APR 2026 (FICTIONAL SCENARIO)
Prepared for: INDOPACOM J7 Wargaming Division
══════════════════════════════════════════════════

SECTION 1: EXECUTIVE SUMMARY

Operation Pacific Shield simulated a Chinese maritime
quarantine of Taiwan beginning 15 April 2026. Across
3 game turns, the crisis traversed from CSIS Level 1x1
(CCG Boarding) to near-threshold Level 9/10 before
stabilizing at Level 7/10. Taiwan's autonomous status
preserved. Humanitarian LNG corridor established.

SECTION 2: TURN-BY-TURN ASSESSMENT

Turn  Action                        Escalation
1     Deterrence Posture             2 → 4
2     Convoy Escort + Fog of War     4 → 7
3     B-21 Strikes / DF-26 Reveal    7 → 9 → 7

SECTION 3: DOCTRINE FINDINGS

1. JAPAN BASES ARE THE LINCHPIN.
   CSIS "First Battle" (2023), p. 10: "Without the
   use of U.S. bases in Japan, U.S. fighter/attack
   aircraft cannot effectively participate."
   Recommendation: pre-negotiate access agreements.

2. ENERGY IS THE CLOCK.
   CSIS "Lights Out?" (2025), p. XII: "Natural gas
   ran out in about 10 days."
   Recommendation: pre-contract LNG tankers into
   VISA program.

3. HIDDEN ASSETS CREATE IRREVERSIBLE PRESSURE.
   DF-26 at Nanping means any mainland strike triggers
   Guam counter-threat. DOD 2025: dual-capable warheads.
   Recommendation: harden Andersen AFB per CSIS (2023).

4. OFF-RAMPS ARE ESSENTIAL.
   CSIS "Lights Out?" (2025), p. XVI: "Total victory
   is unachievable when both sides have nuclear weapons."
   CSIS-MIT "Confronting Armageddon" (2024): diplomacy
   more important than nuclear brinksmanship.
   Recommendation: maintain MMCA hotline infrastructure.

5. WHITE CELL BOTTLENECK IS SOLVABLE.
   Traditional adjudication: 45-90 minutes per move.
   This system: <3 seconds, 8+ doctrine citations/turn.

SECTION 4: POLICY RECOMMENDATIONS
(CSIS cross-project synthesis — 70+ wargame iterations)

▸ Pre-contract LNG tankers into VISA program
▸ Rebuild convoy escort skills (Navy out of practice)
▸ Make joint plans with Japan before crisis
▸ Harden Andersen AFB against DF-26 envelope
▸ Maintain MMCA hotline for de-escalation
▸ Off-ramps are essential — total victory is impossible
  when adversary has nuclear weapons

CLASSIFICATION: UNCLASSIFIED // EXERCISE ONLY`;
