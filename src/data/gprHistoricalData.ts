export interface GprHistoricalPoint {
  month: string;          // e.g. "2024-09"
  displayMonth: string;   // e.g. "Sep '24"
  gpr: number;            // Geopolitical Risk Index benchmark (100 = historical mean)
  gprThreats: number;     // Geopolitical Risk Index: Threats (GPRT) - military buildup, threats of war
  gprActs: number;        // Geopolitical Risk Index: Acts (GPRA) - active kinetic attacks, strikes, war outbreak
  phase: "pre-war" | "war-escalation";
  isWarStart?: boolean;   // true for February 2026
  event: string;          // Specific geopolitical event trigger
  category: "Maritime" | "Kinetic" | "Sanctions" | "Diplomacy" | "Nuclear";
  brentPrice: number;     // $/bbl
  goldPrice: number;      // $/oz
  warRiskPremium: number; // $/bbl embedded adder
}

export const GPR_WAR_START_MONTH = "2026-02";
export const GPR_PRE_WAR_BASELINE_MONTH = "2026-01";

export const gpr24mHistoricalData: GprHistoricalPoint[] = [
  {
    month: "2024-09",
    displayMonth: "Sep '24",
    gpr: 148.5,
    gprThreats: 156.2,
    gprActs: 140.8,
    phase: "pre-war",
    category: "Maritime",
    event: "Red Sea commercial maritime security baseline; initial Houthi drone strikes on merchant shipping.",
    brentPrice: 74.20,
    goldPrice: 2518.60,
    warRiskPremium: 2.20
  },
  {
    month: "2024-10",
    displayMonth: "Oct '24",
    gpr: 162.0,
    gprThreats: 168.5,
    gprActs: 155.5,
    phase: "pre-war",
    category: "Kinetic",
    event: "Middle East ballistic missile exchanges; Persian Gulf surveillance radar alert triggered.",
    brentPrice: 77.80,
    goldPrice: 2640.00,
    warRiskPremium: 3.40
  },
  {
    month: "2024-11",
    displayMonth: "Nov '24",
    gpr: 158.4,
    gprThreats: 164.2,
    gprActs: 152.6,
    phase: "pre-war",
    category: "Maritime",
    event: "Temporary maritime corridor stabilization; US naval carrier strike group patrols Arabian Sea.",
    brentPrice: 75.10,
    goldPrice: 2680.50,
    warRiskPremium: 2.80
  },
  {
    month: "2024-12",
    displayMonth: "Dec '24",
    gpr: 169.2,
    gprThreats: 176.8,
    gprActs: 161.6,
    phase: "pre-war",
    category: "Maritime",
    event: "Cape of Good Hope rerouting reaches 60% of commercial container fleet; transit delays widen.",
    brentPrice: 76.50,
    goldPrice: 2740.00,
    warRiskPremium: 3.60
  },
  {
    month: "2025-01",
    displayMonth: "Jan '25",
    gpr: 175.0,
    gprThreats: 184.2,
    gprActs: 165.8,
    phase: "pre-war",
    category: "Sanctions",
    event: "Secondary energy sanctions enacted; Iranian dark fleet maritime tracking & interdiction intensifies.",
    brentPrice: 78.20,
    goldPrice: 2810.00,
    warRiskPremium: 4.10
  },
  {
    month: "2025-02",
    displayMonth: "Feb '25",
    gpr: 182.4,
    gprThreats: 191.6,
    gprActs: 173.2,
    phase: "pre-war",
    category: "Maritime",
    event: "Joint War Committee (JWC) expands Listed War-Risk Areas across southern Red Sea and Gulf of Aden.",
    brentPrice: 80.40,
    goldPrice: 2890.00,
    warRiskPremium: 4.80
  },
  {
    month: "2025-03",
    displayMonth: "Mar '25",
    gpr: 178.6,
    gprThreats: 186.4,
    gprActs: 170.8,
    phase: "pre-war",
    category: "Maritime",
    event: "Riau Archipelago & Karimun STS transshipment consolidation; Iranian crude bypass routes expand.",
    brentPrice: 79.10,
    goldPrice: 2945.00,
    warRiskPremium: 4.30
  },
  {
    month: "2025-04",
    displayMonth: "Apr '25",
    gpr: 189.5,
    gprThreats: 198.2,
    gprActs: 180.8,
    phase: "pre-war",
    category: "Kinetic",
    event: "Levant border artillery escalation; widespread electronic GPS spoofing reported across eastern Med.",
    brentPrice: 82.00,
    goldPrice: 3040.00,
    warRiskPremium: 5.20
  },
  {
    month: "2025-05",
    displayMonth: "May '25",
    gpr: 184.2,
    gprThreats: 191.8,
    gprActs: 176.6,
    phase: "pre-war",
    category: "Diplomacy",
    event: "Oman back-channel diplomatic discussions; brief risk compression as regional maritime pacts explored.",
    brentPrice: 80.50,
    goldPrice: 3080.00,
    warRiskPremium: 4.70
  },
  {
    month: "2025-06",
    displayMonth: "Jun '25",
    gpr: 196.8,
    gprThreats: 205.4,
    gprActs: 188.2,
    phase: "pre-war",
    category: "Maritime",
    event: "Commercial tanker boarding incident near Fujairah; IRGC fast attack craft aggressive approaches.",
    brentPrice: 83.40,
    goldPrice: 3190.00,
    warRiskPremium: 5.90
  },
  {
    month: "2025-07",
    displayMonth: "Jul '25",
    gpr: 192.3,
    gprThreats: 200.4,
    gprActs: 184.2,
    phase: "pre-war",
    category: "Sanctions",
    event: "Non-Western central banks accelerate gold reserve diversification to insulate from dollar clearing sanctions.",
    brentPrice: 82.10,
    goldPrice: 3260.00,
    warRiskPremium: 5.40
  },
  {
    month: "2025-08",
    displayMonth: "Aug '25",
    gpr: 198.0,
    gprThreats: 208.2,
    gprActs: 187.8,
    phase: "pre-war",
    category: "Nuclear",
    event: "IAEA report on high-enrichment centrifuge cascades triggers emergency diplomatic alerts.",
    brentPrice: 83.80,
    goldPrice: 3340.00,
    warRiskPremium: 6.10
  },
  {
    month: "2025-09",
    displayMonth: "Sep '25",
    gpr: 205.4,
    gprThreats: 216.5,
    gprActs: 194.3,
    phase: "pre-war",
    category: "Maritime",
    event: "12-Month mark: GPR decisively breaches 200 threshold; commercial war-risk breach surcharges rise.",
    brentPrice: 84.90,
    goldPrice: 3420.00,
    warRiskPremium: 6.80
  },
  {
    month: "2025-10",
    displayMonth: "Oct '25",
    gpr: 212.8,
    gprThreats: 224.2,
    gprActs: 201.4,
    phase: "pre-war",
    category: "Kinetic",
    event: "Coordinated drone swarm strikes on Red Sea merchant ships; Cape of Good Hope rerouting exceeds 70%.",
    brentPrice: 86.20,
    goldPrice: 3510.00,
    warRiskPremium: 7.40
  },
  {
    month: "2025-11",
    displayMonth: "Nov '25",
    gpr: 208.5,
    gprThreats: 218.8,
    gprActs: 198.2,
    phase: "pre-war",
    category: "Diplomacy",
    event: "UN Security Council emergency session; tactical de-escalation pause in Persian Gulf patrol lanes.",
    brentPrice: 84.60,
    goldPrice: 3590.00,
    warRiskPremium: 7.00
  },
  {
    month: "2025-12",
    displayMonth: "Dec '25",
    gpr: 216.0,
    gprThreats: 228.2,
    gprActs: 203.8,
    phase: "pre-war",
    category: "Maritime",
    event: "Lloyd's Market Association war-risk breach surcharges reach multi-year peak; tanker charterers reroute.",
    brentPrice: 85.80,
    goldPrice: 3680.00,
    warRiskPremium: 7.80
  },
  {
    month: "2026-01",
    displayMonth: "Jan '26",
    gpr: 224.5,
    gprThreats: 242.0,
    gprActs: 207.0,
    phase: "pre-war",
    category: "Kinetic",
    event: "Pre-war military buildup & ultimatums; US 5th Fleet and allied naval task force mobilization in Arabian Sea.",
    brentPrice: 86.50,
    goldPrice: 3780.00,
    warRiskPremium: 8.40
  },
  // --- WAR IN IRAN OUTBREAK (FEBRUARY 2026) ---
  {
    month: "2026-02",
    displayMonth: "Feb '26",
    gpr: 286.0,
    gprThreats: 258.0,
    gprActs: 314.0,
    phase: "war-escalation",
    isWarStart: true,
    category: "Kinetic",
    event: "OUTBREAK OF WAR IN IRAN: Direct kinetic strikes on Iranian military and nuclear facilities; ballistic missile salvos across Gulf corridor; GPR Acts surges +107 pts in 30 days.",
    brentPrice: 94.20,
    goldPrice: 3920.00,
    warRiskPremium: 14.80
  },
  {
    month: "2026-03",
    displayMonth: "Mar '26",
    gpr: 318.5,
    gprThreats: 282.0,
    gprActs: 355.0,
    phase: "war-escalation",
    category: "Maritime",
    event: "Strait of Hormuz mining threats; IRGC seizures of commercial tankers; Brent crude spikes above $96/bbl.",
    brentPrice: 96.80,
    goldPrice: 4020.00,
    warRiskPremium: 16.50
  },
  {
    month: "2026-04",
    displayMonth: "Apr '26",
    gpr: 332.0,
    gprThreats: 294.0,
    gprActs: 370.0,
    phase: "war-escalation",
    category: "Kinetic",
    event: "Retaliatory missile & drone exchanges; Gulf state air defenses engage incoming targets; GPR clears 330.",
    brentPrice: 93.50,
    goldPrice: 4080.00,
    warRiskPremium: 15.20
  },
  {
    month: "2026-05",
    displayMonth: "May '26",
    gpr: 345.8,
    gprThreats: 315.6,
    gprActs: 376.0,
    phase: "war-escalation",
    category: "Maritime",
    event: "Kharg Island export terminal blockade threatened; dark fleet AIS transponders severed en masse.",
    brentPrice: 91.00,
    goldPrice: 4120.00,
    warRiskPremium: 14.10
  },
  {
    month: "2026-06",
    displayMonth: "Jun '26",
    gpr: 352.4,
    gprThreats: 320.8,
    gprActs: 384.0,
    phase: "war-escalation",
    category: "Kinetic",
    event: "Persistent drone warfare on regional refining infrastructure; Cape rerouting reaches 74.8%.",
    brentPrice: 89.60,
    goldPrice: 4150.00,
    warRiskPremium: 13.50
  },
  {
    month: "2026-07",
    displayMonth: "Jul '26",
    gpr: 358.0,
    gprThreats: 328.0,
    gprActs: 388.0,
    phase: "war-escalation",
    category: "Maritime",
    event: "Protracted war of attrition; non-linear risk pricing embeds permanent insurance surcharges.",
    brentPrice: 88.70,
    goldPrice: 4172.00,
    warRiskPremium: 13.00
  },
  {
    month: "2026-08",
    displayMonth: "Aug '26",
    gpr: 362.2,
    gprThreats: 334.4,
    gprActs: 390.0,
    phase: "war-escalation",
    category: "Kinetic",
    event: "Joint maritime exclusion warnings; tanker hull insurance additions climb to +420 bps.",
    brentPrice: 87.90,
    goldPrice: 4180.00,
    warRiskPremium: 12.60
  },
  {
    month: "2026-09",
    displayMonth: "Sep '26",
    gpr: 364.5,
    gprThreats: 336.0,
    gprActs: 393.0,
    phase: "war-escalation",
    category: "Kinetic",
    event: "Current SMC desk benchmark: DEFCON 2 / Critical Threat (>360 Alert); all-time multi-year peak.",
    brentPrice: 105.25,
    goldPrice: 4185.60,
    warRiskPremium: 18.50
  }
];

// Analytical Metrics Computations
export interface GprAnalyticsSummary {
  currentGpr: number;
  currentGprThreats: number;
  currentGprActs: number;
  startGpr24m: number;
  growth24mPts: number;
  growth24mPct: number;
  preWarBaselineGpr: number;
  warOutbreakGpr: number;
  growthSinceWarStartPts: number;
  growthSinceWarStartPct: number;
  growthSincePreWarPts: number;
  growthSincePreWarPct: number;
  // Acts growth (kinetic outbreak)
  actsGrowthSincePreWarPts: number;
  actsGrowthSincePreWarPct: number;
  // Threats growth
  threatsGrowthSincePreWarPts: number;
  threatsGrowthSincePreWarPct: number;
  warShareOfTotalGrowthPct: number;
  preWarMonthlyRate: number;
  postWarMonthlyRate: number;
  accelerationFactor: number;
}

export function computeGprAnalytics(currentLiveGpr: number = 364.5): GprAnalyticsSummary {
  const startGpr = gpr24mHistoricalData[0].gpr; // Sep 2024 (148.5)
  const preWarPoint = gpr24mHistoricalData.find(p => p.month === GPR_PRE_WAR_BASELINE_MONTH) || {
    gpr: 224.5,
    gprThreats: 242.0,
    gprActs: 207.0
  };
  const warStartPoint = gpr24mHistoricalData.find(p => p.month === GPR_WAR_START_MONTH) || {
    gpr: 286.0,
    gprThreats: 258.0,
    gprActs: 314.0
  };

  const currentGpr = currentLiveGpr || 364.5;
  const latestItem = gpr24mHistoricalData[gpr24mHistoricalData.length - 1];
  const currentGprThreats = latestItem.gprThreats;
  const currentGprActs = latestItem.gprActs;

  const growth24mPts = Number((currentGpr - startGpr).toFixed(1));
  const growth24mPct = Number(((growth24mPts / startGpr) * 100).toFixed(1));

  const growthSincePreWarPts = Number((currentGpr - preWarPoint.gpr).toFixed(1));
  const growthSincePreWarPct = Number(((growthSincePreWarPts / preWarPoint.gpr) * 100).toFixed(1));

  const growthSinceWarStartPts = Number((currentGpr - warStartPoint.gpr).toFixed(1));
  const growthSinceWarStartPct = Number(((growthSinceWarStartPts / warStartPoint.gpr) * 100).toFixed(1));

  // Acts surge since pre-war
  const actsGrowthSincePreWarPts = Number((currentGprActs - preWarPoint.gprActs).toFixed(1));
  const actsGrowthSincePreWarPct = Number(((actsGrowthSincePreWarPts / preWarPoint.gprActs) * 100).toFixed(1));

  // Threats surge since pre-war
  const threatsGrowthSincePreWarPts = Number((currentGprThreats - preWarPoint.gprThreats).toFixed(1));
  const threatsGrowthSincePreWarPct = Number(((threatsGrowthSincePreWarPts / preWarPoint.gprThreats) * 100).toFixed(1));

  const warShareOfTotalGrowthPct = Number(((growthSincePreWarPts / growth24mPts) * 100).toFixed(1));

  // 17 months pre-war (Sep '24 to Jan '26), 8 months war escalation (Jan '26 to Sep '26)
  const preWarMonthlyRate = Number(((preWarPoint.gpr - startGpr) / 16).toFixed(2));
  const postWarMonthlyRate = Number((growthSincePreWarPts / 8).toFixed(2));
  const accelerationFactor = Number((postWarMonthlyRate / (preWarMonthlyRate || 1)).toFixed(1));

  return {
    currentGpr,
    currentGprThreats,
    currentGprActs,
    startGpr24m: startGpr,
    growth24mPts,
    growth24mPct,
    preWarBaselineGpr: preWarPoint.gpr,
    warOutbreakGpr: warStartPoint.gpr,
    growthSinceWarStartPts,
    growthSinceWarStartPct,
    growthSincePreWarPts,
    growthSincePreWarPct,
    actsGrowthSincePreWarPts,
    actsGrowthSincePreWarPct,
    threatsGrowthSincePreWarPts,
    threatsGrowthSincePreWarPct,
    warShareOfTotalGrowthPct,
    preWarMonthlyRate,
    postWarMonthlyRate,
    accelerationFactor
  };
}

// ---------------------------------------------------------------------------
// GEOPOLITICAL CONTEXT: IRANIAN ESCALATION EVENTS & NEWS WIRE ARCHIVE
// ---------------------------------------------------------------------------

export interface IranianEscalationEvent {
  id: string;
  month: string;           // Matches GprHistoricalPoint.month, e.g. "2026-02"
  displayMonth: string;    // e.g. "Feb '26"
  exactDate: string;       // e.g. "February 12, 2026"
  title: string;
  severity: "CRITICAL" | "SEVERE" | "ELEVATED";
  phase: "pre-war" | "war-outbreak" | "war-attrition";
  gprLevel: number;
  gprDelta: string;
  gprActsLevel: number;
  gprThreatsLevel: number;
  source: string;          // e.g. "Reuters International Wire", "Bloomberg Energy Desk"
  dateline: string;        // e.g. "TEHRAN/WASHINGTON"
  timestamp: string;       // e.g. "04:15 UTC"
  headline: string;
  newsSnippet: string;
  strategicSignificance: string;
  marketImpactSummary: string;
  brentAtEvent: number;
  goldAtEvent: number;
  warRiskAdder: number;
  tags: string[];
}

export const iranianEscalationEvents: IranianEscalationEvent[] = [
  {
    id: "escalation-2024-10",
    month: "2024-10",
    displayMonth: "Oct '24",
    exactDate: "October 1, 2024",
    title: "IRGC Ballistic Missile Salvo; Persian Gulf Energy Corridors on Red Alert",
    severity: "SEVERE",
    phase: "pre-war",
    gprLevel: 162.0,
    gprDelta: "+13.5 pts (+9.1%)",
    gprActsLevel: 155.5,
    gprThreatsLevel: 168.5,
    source: "Reuters International Wire",
    dateline: "TEHRAN/WASHINGTON",
    timestamp: "19:42 UTC",
    headline: "IRAN LAUNCHES OVER 180 BALLISTIC MISSILES IN MASSIVE RETALIATORY BARRAGE; GULF SURVEILLANCE RADAR TRIGGERS COMMERCIAL TANKER PAUSE",
    newsSnippet: "The Islamic Revolutionary Guard Corps (IRGC) fired an estimated 180 ballistic missiles across the Levant and Middle Eastern airspace, forcing civilian aviation corridors to shutter and prompting naval task forces in the Persian Gulf to elevate readiness to Battle Condition II. Tanker charterers in Fujairah halted westbound transits as London maritime underwriters placed the eastern Arabian Sea on war-risk watchlist.",
    strategicSignificance: "First direct strategic missile exchange demonstrating Iranian willingness to engage state-level ballistic capabilities beyond asymmetric proxy action.",
    marketImpactSummary: "Brent crude surged +$3.60/bbl to $77.80/bbl; tanker hull war risk insurance rates doubled within 48 hours.",
    brentAtEvent: 77.80,
    goldAtEvent: 2640.00,
    warRiskAdder: 3.40,
    tags: ["Ballistic Missiles", "IRGC", "Air Defense", "Persian Gulf"]
  },
  {
    id: "escalation-2025-01",
    month: "2025-01",
    displayMonth: "Jan '25",
    exactDate: "January 18, 2025",
    title: "Shadow Fleet Secondary Energy Sanctions & Iranian Interdiction Threats",
    severity: "ELEVATED",
    phase: "pre-war",
    gprLevel: 175.0,
    gprDelta: "+5.8 pts (+3.4%)",
    gprActsLevel: 165.8,
    gprThreatsLevel: 184.2,
    source: "Bloomberg Commodities",
    dateline: "WASHINGTON/DUBAI",
    timestamp: "14:10 UTC",
    headline: "U.S. ENFORCES SWEEPING CRACKDOWN ON IRANIAN 'DARK FLEET' CRUDE TANKERS; TEHRAN WARNS OF RECIPROCAL MARITIME INSPECTIONS",
    newsSnippet: "The U.S. Department of the Treasury announced sanctions on 35 specialized maritime front companies and shadow tankers moving sanctioned Iranian crude to Asian refineries. Within hours, Iranian state television broadcast remarks from IRGC naval commanders threatening immediate boarding and seizure of unflagged or uncooperative vessels transiting Iranian sovereign waters.",
    strategicSignificance: "Economic warfare escalated to maritime logistics enforcement, prompting Iranian forces to heighten physical harassment of passing merchant shipping.",
    marketImpactSummary: "Dark fleet crude spreads widened by $7/bbl; war-risk premium on commercial charters climbed to $4.10/bbl.",
    brentAtEvent: 78.20,
    goldAtEvent: 2810.00,
    warRiskAdder: 4.10,
    tags: ["Sanctions", "Dark Fleet", "Tanker Seizure", "Treasury"]
  },
  {
    id: "escalation-2025-04",
    month: "2025-04",
    displayMonth: "Apr '25",
    exactDate: "April 14, 2025",
    title: "High-Power GPS Spoofing Grid Paralyzes Strait of Hormuz Chokepoint",
    severity: "ELEVATED",
    phase: "pre-war",
    gprLevel: 189.5,
    gprDelta: "+7.1 pts (+3.9%)",
    gprActsLevel: 178.6,
    gprThreatsLevel: 198.4,
    source: "Lloyd's List Maritime Intelligence",
    dateline: "LONDON/DUBAI",
    timestamp: "08:30 UTC",
    headline: "WIDESPREAD ELECTRONIC WARFARE AND PHANTOM RADAR SPOOFING BLIND COMMERCIAL TANKERS IN HORMUZ TRAFFIC LANES",
    newsSnippet: "UKMTO confirmed over 45 merchant vessels experienced electronic warfare jamming and false GPS telemetry broadcast from Iranian coastal positions near Qeshm and Bandar Abbas. Automated ship navigation systems placed tankers up to 25 nautical miles inland, creating near-collision emergencies in the Strait's narrow separation scheme.",
    strategicSignificance: "Demonstrated Iran's asymmetric electronic warfare grid capability to sever navigation and situational awareness without firing a physical shot.",
    marketImpactSummary: "Tanker captains demanded 24-hour visual pilot escorts; GPR Threats breached the 198-point threshold.",
    brentAtEvent: 82.10,
    goldAtEvent: 2975.00,
    warRiskAdder: 5.40,
    tags: ["Electronic Warfare", "GPS Spoofing", "Strait of Hormuz", "Navigation"]
  },
  {
    id: "escalation-2025-06",
    month: "2025-06",
    displayMonth: "Jun '25",
    exactDate: "June 22, 2025",
    title: "IRGC Fast Attack Craft Intercept VLCCs off UAE Anchorage",
    severity: "SEVERE",
    phase: "pre-war",
    gprLevel: 196.2,
    gprDelta: "+6.7 pts (+3.5%)",
    gprActsLevel: 186.2,
    gprThreatsLevel: 206.5,
    source: "S&P Global Commodity Insights",
    dateline: "SINGAPORE/LONDON",
    timestamp: "11:55 UTC",
    headline: "IRGC FAST ATTACK CRAFT PERFORM HOSTILE SWARMING RUNS ON FULLY LADEN VLCC TANKERS 15 NM OFF FUJAIRAH",
    newsSnippet: "Armed Iranian fast patrol craft equipped with twin heavy machine guns and anti-ship missile canisters encircled two Greek-managed crude supertankers awaiting bunker fuel off Fujairah. The hostile maneuvers compelled allied warships to scramble airborne maritime patrol aircraft, forcing the IRGC flotilla to break contact.",
    strategicSignificance: "Direct show of force outside the Persian Gulf, pushing the kinetic confrontation directly into the Gulf of Oman loading zones.",
    marketImpactSummary: "London Joint War Committee widened Listed Areas; Brent crude crossed $83/bbl with war risk adder exceeding $5.90/bbl.",
    brentAtEvent: 83.40,
    goldAtEvent: 3120.00,
    warRiskAdder: 5.90,
    tags: ["IRGC Navy", "Fast Attack Boats", "Fujairah", "Tanker Swarms"]
  },
  {
    id: "escalation-2025-08",
    month: "2025-08",
    displayMonth: "Aug '25",
    exactDate: "August 19, 2025",
    title: "IAEA Emergency Alert: 84% Uranium Enrichment Cascades at Fordow",
    severity: "SEVERE",
    phase: "pre-war",
    gprLevel: 204.0,
    gprDelta: "+7.8 pts (+4.0%)",
    gprActsLevel: 191.0,
    gprThreatsLevel: 212.0,
    source: "Associated Press Diplomatic Desk",
    dateline: "VIENNA/WASHINGTON",
    timestamp: "16:20 UTC",
    headline: "IAEA EMERGENCY DOSSIER CONFIRMS HIGHLY ENRICHED URANIUM AT DEEP-BUNKER SITE; TEHRAN THREATENS PERMANENT STRAIT CLOSURE IF ATTACKED",
    newsSnippet: "A confidential IAEA report circulated to the UN Security Council revealed that Iranian technicians at the subterranean Fordow fuel enrichment plant activated modified IR-6 centrifuge cascades, yielding sample purities of 83.7%—perilously close to weapons-grade 90%. Iranian military officials warned that any military preemptive strike would result in the 'immediate and total sealing' of Hormuz.",
    strategicSignificance: "Nuclear breakout timeline compressed to under 14 days, crossing allied diplomatic redlines and accelerating unilateral military contingency plans.",
    marketImpactSummary: "Gold rallied +$65/oz on safe-haven demand; 12-month GPR index decisively breached the 200 peacetime ceiling.",
    brentAtEvent: 84.50,
    goldAtEvent: 3340.00,
    warRiskAdder: 6.50,
    tags: ["Nuclear Enrichment", "IAEA", "Fordow", "Blockade Threat"]
  },
  {
    id: "escalation-2026-01",
    month: "2026-01",
    displayMonth: "Jan '26",
    exactDate: "January 22, 2026",
    title: "Iranian Naval Exclusion Ultimatum & Pre-War Mobilization Peak",
    severity: "SEVERE",
    phase: "pre-war",
    gprLevel: 224.5,
    gprDelta: "+8.5 pts (+3.9%)",
    gprActsLevel: 207.0,
    gprThreatsLevel: 242.0,
    source: "Financial Times Energy & Defense",
    dateline: "DUBAI/LONDON",
    timestamp: "09:15 UTC",
    headline: "TEHRAN DECLARES LIVE-FIRE NAVAL EXCLUSION ZONES IN HORMUZ; US 5TH FLEET MOVES CARRIER BATTLE GROUP INTO STRIKE POSITIONS",
    newsSnippet: "Iran announced an indefinite live-fire naval missile exercise spanning the entire width of the Strait of Hormuz, ordering international maritime vessels to vacate the area. The Pentagon ordered the USS Abraham Lincoln Carrier Strike Group and allied guided-missile cruisers into the northern Arabian Sea as eleventh-hour diplomatic backchannels collapsed.",
    strategicSignificance: "The final pre-war flashpoint: GPR Threats hit 242.0 pts as both sides reached full strategic mobilization with war initiation imminent.",
    marketImpactSummary: "Brent settled at $86.50/bbl with $8.40/bbl war risk premium; tanker hull insurance additions surged +180 bps.",
    brentAtEvent: 86.50,
    goldAtEvent: 3780.00,
    warRiskAdder: 8.40,
    tags: ["Ultimatum", "5th Fleet", "Pre-War Peak", "Naval Mobilization"]
  },
  {
    id: "escalation-2026-02",
    month: "2026-02",
    displayMonth: "Feb '26",
    exactDate: "February 12, 2026",
    title: "OUTBREAK OF WAR IN IRAN: Direct Kinetic Strikes & Ballistic Missile Salvo",
    severity: "CRITICAL",
    phase: "war-outbreak",
    gprLevel: 286.0,
    gprDelta: "+61.5 pts (+27.4%)",
    gprActsLevel: 314.0,
    gprThreatsLevel: 258.0,
    source: "Reuters Global Breaking Wire",
    dateline: "TEHRAN/WASHINGTON",
    timestamp: "04:15 UTC",
    headline: "WAR IN IRAN ERUPTS: ALLIED PRECISION STRIKES HIT STRATEGIC SITES; IRGC LAUNCHES MASSIVE CRUISE & BALLISTIC COUNTER-ATTACK",
    newsSnippet: "Coordinated coalition strikes targeted Iranian air defense radars, missile production silos, and uranium enrichment infrastructure across central Iran. Tehran immediately launched retaliatory barrages of Fateh-110 ballistic missiles and Shahed attack drones against regional staging bases and energy transit infrastructure. Over 68% of commercial tanker traffic through Hormuz came to an immediate halt.",
    strategicSignificance: "Official commencement of active interstate warfare. GPR Acts exploded +107 pts in a single 30-day window (207 → 314 pts), completely reversing the peacetime Threats/Acts balance.",
    marketImpactSummary: "Brent exploded to $94.20/bbl (+$7.70 in 48 hrs); War risk premium jumped from $8.40 to $14.80/bbl; Gold surged to $3,920/oz.",
    brentAtEvent: 94.20,
    goldAtEvent: 3920.00,
    warRiskAdder: 14.80,
    tags: ["War Outbreak", "Kinetic Strike", "Air Campaign", "Missile Volley"]
  },
  {
    id: "escalation-2026-03",
    month: "2026-03",
    displayMonth: "Mar '26",
    exactDate: "March 18, 2026",
    title: "Hormuz Sea-Mining Campaign & IRGC Tanker Seizures",
    severity: "CRITICAL",
    phase: "war-outbreak",
    gprLevel: 318.5,
    gprDelta: "+32.5 pts (+11.4%)",
    gprActsLevel: 355.0,
    gprThreatsLevel: 282.0,
    source: "Bloomberg Terminal Flash",
    dateline: "LONDON/DUBAI",
    timestamp: "07:45 UTC",
    headline: "IRGC FORCES BOARD TWO COMMERCIAL CRUDE CARRIERS; DRIFTING NAVAL MINES CONFIRMED IN DEEP-WATER SHIPPING CANALS",
    newsSnippet: "UK Maritime Trade Operations issued emergency warnings after an international VLCC struck a bottom-influence sea mine in the inbound traffic separation lane. Concurrently, IRGC helicopter assault teams boarded and redirected two foreign-flagged oil tankers into Iranian territorial waters off Bandar Abbas. Commercial hull insurers canceled standard coverage policies across the entire Gulf basin.",
    strategicSignificance: "Physical chokepoint interdiction executed: maritime war risk premium touched all-time record of $16.50/bbl.",
    marketImpactSummary: "Brent peaked at $96.80/bbl; Cape of Good Hope rerouting surged past 70% of global Asia-Europe container vessels.",
    brentAtEvent: 96.80,
    goldAtEvent: 4020.00,
    warRiskAdder: 16.50,
    tags: ["Sea Mines", "Chokepoint Closure", "Tanker Seizure", "UKMTO"]
  },
  {
    id: "escalation-2026-05",
    month: "2026-05",
    displayMonth: "May '26",
    exactDate: "May 09, 2026",
    title: "Kharg Island Terminal Blockade Threats & Regional Refinery Targeting",
    severity: "CRITICAL",
    phase: "war-attrition",
    gprLevel: 345.8,
    gprDelta: "+13.8 pts (+4.2%)",
    gprActsLevel: 376.0,
    gprThreatsLevel: 315.6,
    source: "Lloyd's List Intelligence Daily",
    dateline: "MANAMA/LONDON",
    timestamp: "12:30 UTC",
    headline: "IRANIAN DRONE SWARMS DAMAGE RAS TANURA OFFSHORE PIERS; TEHRAN WARNS ALL GULF ENERGY EXPORTS WILL CEASE IF KHARG HIT",
    newsSnippet: "Low-altitude Shahed-136 suicide drones struck auxiliary loading manifolds at the Ras Tanura offshore crude terminal, causing containment fires. Tehran issued an ultimatum stating that if coalition naval forces quarantine or bombard Kharg Island, every oil export facility between Kuwait and Oman will be treated as a legitimate target.",
    strategicSignificance: "Shift to full infrastructure attrition warfare: GPR cleared 345 points as structural supply destruction became a core probability.",
    marketImpactSummary: "Over 90% of regional tankers turned off AIS transponders; Gold crossed $4,120/oz.",
    brentAtEvent: 91.00,
    goldAtEvent: 4120.00,
    warRiskAdder: 14.10,
    tags: ["Drone Warfare", "Kharg Island", "Refinery Strikes", "Infrastructure"]
  },
  {
    id: "escalation-2026-08",
    month: "2026-08",
    displayMonth: "Aug '26",
    exactDate: "August 24, 2026",
    title: "Unilateral 200-Nautical-Mile War Hazard Zone Enforced by Tehran",
    severity: "CRITICAL",
    phase: "war-attrition",
    gprLevel: 362.2,
    gprDelta: "+4.2 pts (+1.2%)",
    gprActsLevel: 390.0,
    gprThreatsLevel: 334.4,
    source: "Defense & Energy Intelligence Bulletin",
    dateline: "DOHA/WASHINGTON",
    timestamp: "18:05 UTC",
    headline: "IRAN DECLARES 200-NAUTICAL-MILE TOTAL WAR EXCLUSION ZONE; TANKER HULL WAR INSURANCE ADDERS SURGE TO +420 BASIS POINTS",
    newsSnippet: "The Iranian High Security Council announced a unilateral military exclusion zone encompassing the entire Persian Gulf and Gulf of Oman. Underwriters at Lloyd's of London mandated breach surcharges exceeding 4.2% of total insured ship hull value per transit, rendering unescorted commercial voyages financially unviable.",
    strategicSignificance: "Institutionalization of the war economy: geopolitical risk transformed into a permanent baseline surcharge rather than temporary volatility spike.",
    marketImpactSummary: "GPR breached the critical >360 alert threshold; commercial container vessels permanently altered standard sailing schedules.",
    brentAtEvent: 87.90,
    goldAtEvent: 4180.00,
    warRiskAdder: 12.60,
    tags: ["Exclusion Zone", "Insurance Adder", "DEFCON Alert", "Attrition"]
  },
  {
    id: "escalation-2026-09",
    month: "2026-09",
    displayMonth: "Sep '26",
    exactDate: "September 3, 2026",
    title: "DEFCON 2 Multi-Year Peak: GPR Reaches 364.5 Benchmark",
    severity: "CRITICAL",
    phase: "war-attrition",
    gprLevel: 364.5,
    gprDelta: "+2.3 pts (+0.6%)",
    gprActsLevel: 393.0,
    gprThreatsLevel: 336.0,
    source: "SMC War Risk Desk / Global Wire",
    dateline: "LONDON/NEW YORK",
    timestamp: "06:00 UTC",
    headline: "SMC WAR DESK BENCHMARK CONFIRMS ALL-TIME GPR RECORD OF 364.5 PTS; +65% WAR-PERIOD SURGE INTACT AS CEASEFIRE TALKS STALL",
    newsSnippet: "The Caldara-Iacoviello Geopolitical Risk Index benchmark monitored by the SMC Desk has registered an all-time multi-year peak of 364.5 points, representing a +145% increase over peacetime baselines. Kinetic Acts sit at 393.0 points with persistent war-risk insurance premia embedded across spot energy and global precious metals pricing.",
    strategicSignificance: "Current live desk benchmark: war in Iran represents the largest systemic geopolitical supply shock to the global energy system since the 1979 revolution.",
    marketImpactSummary: "Brent maintains structural $18.50/bbl war risk premium, surging past $100 at $105.25/bbl; Gold solid at $4,185.60/oz.",
    brentAtEvent: 105.25,
    goldAtEvent: 4185.60,
    warRiskAdder: 18.50,
    tags: ["DEFCON 2", "Peak Benchmark", "Kinetic Shock", "Energy Market"]
  }
];

export function getIranianEscalationForMonth(month: string): IranianEscalationEvent | undefined {
  return iranianEscalationEvents.find(e => e.month === month || e.displayMonth === month);
}

