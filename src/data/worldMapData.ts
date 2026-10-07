// Simplified GeoJSON FeatureCollection representing world landmasses
// Built for fast, zero-dependency offline D3 geographical projection

export interface GeoChokepoint {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  baseRisk: number; // 0-100
  threatLevel: "CRITICAL RED" | "HIGH ELEVATED" | "MEDIUM WATCH" | "STABLE FLOW";
  riskHistory7d: number[]; // 7-day risk score progression [T-6, T-5, T-4, T-3, T-2, T-1, T-0]
  baselineFlowBpd: string; // Nominal capacity when fully operational
  activeFlowBpd: string;   // Current estimated transiting volume under active conditions
  flowStatusNote: string;  // Delta / status context
  flowBpd: string;         // Compact composite string for backward compatibility
  globalSharePct: string;
  status: string;
  threatDetails: string;
  rerouteImpact: string;
  insuranceSurcharge: string;
  primaryCommodity: string;
  category: "Persian Gulf" | "Red Sea & Suez" | "Indo-Pacific" | "Global Alternate" | "Americas & Med";
}

export const MARITIME_CHOKEPOINTS: GeoChokepoint[] = [
  {
    id: "hormuz",
    name: "Strait of Hormuz",
    region: "Persian Gulf / Gulf of Oman",
    coordinates: [56.40, 26.56],
    baseRisk: 88,
    threatLevel: "CRITICAL RED",
    riskHistory7d: [76, 78, 81, 85, 84, 87, 88],
    baselineFlowBpd: "20.5M bpd",
    activeFlowBpd: "11.2M bpd",
    flowStatusNote: "-45% War-Risk Suppression",
    flowBpd: "11.2M active (20.5M base)",
    globalSharePct: "21% of Global Petroleum",
    status: "DIRECT INTERDICTION THREAT",
    threatDetails: "IRGC fast-attack missile boats, UAV surveillance swarms, GPS electronic spoofing, Tomahawk standoff strikes in vicinity",
    rerouteImpact: "No physical maritime bypass exists for 85% of Gulf crude; East-West pipeline capacity maxed",
    insuranceSurcharge: "+420 bps JWLA War-Risk Area",
    primaryCommodity: "Crude Oil, Condensates & Qatari LNG (33% of global LNG)",
    category: "Persian Gulf"
  },
  {
    id: "bab-el-mandeb",
    name: "Bab el-Mandeb",
    region: "Southern Red Sea / Gulf of Aden",
    coordinates: [43.33, 12.58],
    baseRisk: 91,
    threatLevel: "CRITICAL RED",
    riskHistory7d: [87, 88, 86, 89, 90, 92, 91],
    baselineFlowBpd: "8.8M bpd",
    activeFlowBpd: "2.2M bpd",
    flowStatusNote: "-75% Diverted to Cape",
    flowBpd: "2.2M active (8.8M base)",
    globalSharePct: "9% of Seaborne Petroleum",
    status: "ACTIVE KINETIC DISRUPTION",
    threatDetails: "Anti-ship ballistic and cruise missile vectors, explosive USV drone boats, naval escort operations active",
    rerouteImpact: "74.8% of container & tanker traffic diverted around Cape of Good Hope (+14 days sailing)",
    insuranceSurcharge: "+450 bps War Risk Surcharge",
    primaryCommodity: "Crude, Refined Products & Asia-Europe Container Freight",
    category: "Red Sea & Suez"
  },
  {
    id: "kharg-island",
    name: "Kharg Island Terminal",
    region: "Northern Persian Gulf",
    coordinates: [50.31, 29.23],
    baseRisk: 84,
    threatLevel: "CRITICAL RED",
    riskHistory7d: [74, 75, 78, 80, 81, 83, 84],
    baselineFlowBpd: "1.85M bpd",
    activeFlowBpd: "1.45M bpd",
    flowStatusNote: "-22% Dark Fleet Pacing",
    flowBpd: "1.45M active (1.85M base)",
    globalSharePct: "90% of Iranian Crude Exports",
    status: "HIGH TARGET EXPOSURE",
    threatDetails: "Optical and synthetic aperture radar surveillance overhead; dark fleet VLCC loading operations accelerated",
    rerouteImpact: "Target of potential kinetic escalation; disruption would eliminate 1.4M bpd of illicit teapot supply",
    insuranceSurcharge: "+580 bps Shadow Risk Adder",
    primaryCommodity: "Iranian Heavy & Light Crude (Teapot flow)",
    category: "Persian Gulf"
  },
  {
    id: "fujairah",
    name: "Fujairah Offshore Anchorage",
    region: "Gulf of Oman",
    coordinates: [56.36, 25.13],
    baseRisk: 74,
    threatLevel: "HIGH ELEVATED",
    riskHistory7d: [65, 67, 69, 72, 73, 75, 74],
    baselineFlowBpd: "750K bpd bunkering",
    activeFlowBpd: "420K bpd bunkering",
    flowStatusNote: "-44% Jamming & Queue Lag",
    flowBpd: "420K active (750K base)",
    globalSharePct: "World #2 Bunkering Station",
    status: "CONGESTION & JAMMING ALERT",
    threatDetails: "92-vessel tanker backlog due to bunkering delays, insurer clearance stalls, and regional GPS signal degradation",
    rerouteImpact: "48-72hr bunkering queue extension; vessels rerouting to Colombo and Port Louis for refueling",
    insuranceSurcharge: "+280 bps",
    primaryCommodity: "Marine Bunker Fuel (VLSFO/MGO) & STS Operations",
    category: "Persian Gulf"
  },
  {
    id: "suez-canal",
    name: "Suez Canal",
    region: "Egypt / Eastern Mediterranean",
    coordinates: [32.34, 30.70],
    baseRisk: 76,
    threatLevel: "HIGH ELEVATED",
    riskHistory7d: [81, 80, 78, 77, 76, 75, 76],
    baselineFlowBpd: "9.2M bpd",
    activeFlowBpd: "4.5M bpd",
    flowStatusNote: "-51% Upstream Blockage",
    flowBpd: "4.5M active (9.2M base)",
    globalSharePct: "12% of Global Seaborne Trade",
    status: "TRANSIT CAPACITY CRUSHED",
    threatDetails: "Suez transit volume down 68% year-on-year due to upstream Bab el-Mandeb security choke",
    rerouteImpact: "Suez Canal Authority revenue collapsed -64%; systemic transit backlog for remaining Mediterranean traffic",
    insuranceSurcharge: "+220 bps",
    primaryCommodity: "Refined Products, LNG, Manufactured Goods",
    category: "Red Sea & Suez"
  },
  {
    id: "malacca",
    name: "Strait of Malacca",
    region: "Southeast Asia / Singapore",
    coordinates: [103.00, 1.43],
    baseRisk: 58,
    threatLevel: "MEDIUM WATCH",
    riskHistory7d: [54, 55, 55, 57, 56, 57, 58],
    baselineFlowBpd: "23.7M bpd",
    activeFlowBpd: "24.1M bpd",
    flowStatusNote: "+2% STS Hub Absorption",
    flowBpd: "24.1M active (23.7M base)",
    globalSharePct: "24% of Global Maritime Trade",
    status: "SHADOW FLEET STS HOTSPOT",
    threatDetails: "Intensive ship-to-ship (STS) dark tanker transfers in Riau Archipelago; AIS spoofing cluster density 184 vessels",
    rerouteImpact: "Lombok/Makassar straits used as backup for ultra-deep draft VLCCs (+3.5 days)",
    insuranceSurcharge: "+45 bps Baseline Security",
    primaryCommodity: "Mideast Crude to China, Japan & South Korea",
    category: "Indo-Pacific"
  },
  {
    id: "cape-of-good-hope",
    name: "Cape of Good Hope",
    region: "South Africa / Southern Ocean",
    coordinates: [18.49, -34.35],
    baseRisk: 48,
    threatLevel: "MEDIUM WATCH",
    riskHistory7d: [41, 43, 44, 46, 45, 47, 48],
    baselineFlowBpd: "5.9M bpd",
    activeFlowBpd: "15.8M bpd",
    flowStatusNote: "+168% War Diversion Surge",
    flowBpd: "15.8M active (5.9M base)",
    globalSharePct: "Primary Global Red Sea Diversion",
    status: "SEVERE VESSEL OVERLOAD",
    threatDetails: "Bunkering facilities at Durban, Port Elizabeth and Port Louis operate at 100% capacity; extreme winter swells",
    rerouteImpact: "+10 to 14 days voyage time; adds $1.8M-$2.2M in bunker fuel burn per VLCC round-trip",
    insuranceSurcharge: "+15 bps (Heavy Weather Risk)",
    primaryCommodity: "Diverted Middle East Crude & Asia-Europe Container Fleets",
    category: "Global Alternate"
  },
  {
    id: "bosporus",
    name: "Bosporus & Dardanelles",
    region: "Black Sea / Turkey",
    coordinates: [29.07, 41.11],
    baseRisk: 54,
    threatLevel: "MEDIUM WATCH",
    riskHistory7d: [58, 57, 56, 55, 55, 54, 54],
    baselineFlowBpd: "3.1M bpd",
    activeFlowBpd: "2.6M bpd",
    flowStatusNote: "-16% Sanction Queue Lag",
    flowBpd: "2.6M active (3.1M base)",
    globalSharePct: "Black Sea & Russian Crude Outlet",
    status: "SANCTIONS & DRONE SURVEILLANCE",
    threatDetails: "Russian shadow fleet tankers transporting Urals blend; strict Turkish P&I insurance documentation checks",
    rerouteImpact: "7-10 day anchorage wait times; no alternate water passage exists for Black Sea ports",
    insuranceSurcharge: "+95 bps War Zone Addition",
    primaryCommodity: "Russian Urals, Kazakh CPC Blend, Grain",
    category: "Americas & Med"
  },
  {
    id: "gibraltar",
    name: "Strait of Gibraltar",
    region: "Iberia / Morocco",
    coordinates: [-5.60, 35.96],
    baseRisk: 34,
    threatLevel: "STABLE FLOW",
    riskHistory7d: [36, 35, 34, 35, 33, 34, 34],
    baselineFlowBpd: "5.5M bpd",
    activeFlowBpd: "5.4M bpd",
    flowStatusNote: "Nominal Stable Flow",
    flowBpd: "5.4M active (5.5M base)",
    globalSharePct: "Atlantic / Mediterranean Gateway",
    status: "REGULAR ESCORT PATROLS",
    threatDetails: "STS dark fleet activities observed off Ceuta; NATO naval surveillance actively intercepting illicit vessels",
    rerouteImpact: "Minimal physical transit delays; increased radar sweeps on Cook Islands and Panama flagged tankers",
    insuranceSurcharge: "Standard Baseline",
    primaryCommodity: "Atlantic Crude, Med Refined Cargoes",
    category: "Americas & Med"
  },
  {
    id: "panama",
    name: "Panama Canal",
    region: "Central America",
    coordinates: [-79.68, 9.08],
    baseRisk: 38,
    threatLevel: "STABLE FLOW",
    riskHistory7d: [46, 44, 43, 41, 40, 39, 38],
    baselineFlowBpd: "2.8M bpd equiv",
    activeFlowBpd: "2.7M bpd equiv",
    flowStatusNote: "Near Nominal Recovery",
    flowBpd: "2.7M active (2.8M base)",
    globalSharePct: "5% of Global Seaborne Trade",
    status: "RECOVERING DRAFT LEVELS",
    threatDetails: "Lake Gatun water levels stabilized; daily booking slots recovered to 36 vessels/day; booking auction premiums ease",
    rerouteImpact: "US Gulf Coast LNG carriers returning to canal route instead of Cape Horn",
    insuranceSurcharge: "Standard Baseline",
    primaryCommodity: "US Gulf LNG, Grain, Container Goods",
    category: "Americas & Med"
  },
  {
    id: "ningbo-zhoushan",
    name: "Port of Ningbo-Zhoushan",
    region: "East China Sea / Yangtze Delta",
    coordinates: [121.80, 29.90],
    baseRisk: 42,
    threatLevel: "STABLE FLOW",
    riskHistory7d: [38, 39, 40, 41, 40, 42, 42],
    baselineFlowBpd: "14.2M bpd equiv",
    activeFlowBpd: "13.8M bpd equiv",
    flowStatusNote: "Peak Intake Operations",
    flowBpd: "13.8M active (14.2M base)",
    globalSharePct: "World's #1 Port by Tonnage (Asian SPR Hub)",
    status: "INTENSIVE DISCHARGE OPERATIONS",
    threatDetails: "World's largest cargo and crude discharge gateway; primary offloading terminal for Middle East VLCC supertankers; flanked by Taiwan Strait naval transit corridors",
    rerouteImpact: "Any regional escalation in East China Sea approaches forces supertankers to divert eastward around Ryukyu archipelago (+3 to 4 days voyage delay)",
    insuranceSurcharge: "+18 bps (Coastal Geopolitical Watch)",
    primaryCommodity: "Middle East VLCC Crude, Qatari LNG, Industrial Commodities & Asian Exports",
    category: "Indo-Pacific"
  }
];

// Major maritime shipping corridors (Realistic multi-point nautical waypoints)
export interface ShippingCorridor {
  id: string;
  name: string;
  from: [number, number];
  to: [number, number];
  waypoints: Array<[number, number]>; // Array of [lon, lat] along actual maritime channels
  flowType: "crude" | "lng" | "container" | "diversion";
  riskRating: "critical" | "high" | "moderate" | "diverted";
  flowVolume: string;
  description: string;
}

export const SHIPPING_CORRIDORS: ShippingCorridor[] = [
  // Persian Gulf outbound through Hormuz to Arabian Sea
  {
    id: "pg-hormuz",
    name: "Kharg Island to Strait of Hormuz",
    from: [50.31, 29.23],
    to: [56.40, 26.56],
    waypoints: [[50.31, 29.23], [52.50, 27.50], [55.00, 26.80], [56.40, 26.56]],
    flowType: "crude",
    riskRating: "critical",
    flowVolume: "1.45M bpd",
    description: "Iranian crude shuttle run from Kharg Island terminal through Hormuz"
  },
  {
    id: "hormuz-fuj",
    name: "Hormuz to Fujairah Bunkering",
    from: [56.40, 26.56],
    to: [56.36, 25.13],
    waypoints: [[56.40, 26.56], [56.80, 25.90], [56.36, 25.13]],
    flowType: "crude",
    riskRating: "critical",
    flowVolume: "20.5M bpd",
    description: "Exiting Persian Gulf tankers entering Fujairah anchorage and Gulf of Oman"
  },
  // Arabian Sea eastward to Malacca
  {
    id: "fuj-malacca",
    name: "Persian Gulf to Malacca Strait (Eastbound Crude)",
    from: [56.36, 25.13],
    to: [103.00, 1.43],
    waypoints: [
      [56.36, 25.13],
      [64.00, 18.00],
      [74.00, 10.00],
      [82.00, 5.50],
      [92.00, 4.00],
      [98.00, 3.00],
      [103.00, 1.43]
    ],
    flowType: "crude",
    riskRating: "high",
    flowVolume: "16.2M bpd",
    description: "Primary maritime energy artery supplying China, Japan and South Korea"
  },
  // Arabian Sea westward to Bab el-Mandeb
  {
    id: "arabian-bab",
    name: "Gulf of Oman to Bab el-Mandeb (Westbound Route)",
    from: [56.36, 25.13],
    to: [43.33, 12.58],
    waypoints: [
      [56.36, 25.13],
      [58.00, 22.00],
      [55.00, 16.50],
      [50.00, 13.50],
      [46.00, 12.00],
      [43.33, 12.58]
    ],
    flowType: "crude",
    riskRating: "critical",
    flowVolume: "4.8M bpd",
    description: "Westbound crude and container corridor passing through the Gulf of Aden"
  },
  // Bab el-Mandeb through Red Sea to Suez
  {
    id: "bab-suez",
    name: "Red Sea Transit to Suez (Disrupted Channel)",
    from: [43.33, 12.58],
    to: [32.34, 30.70],
    waypoints: [
      [43.33, 12.58],
      [41.50, 16.50],
      [38.50, 21.00],
      [35.50, 26.00],
      [33.50, 28.50],
      [32.34, 30.70]
    ],
    flowType: "container",
    riskRating: "critical",
    flowVolume: "4.5M bpd (-68% YoY)",
    description: "Severely curtailed Suez canal route under active kinetic anti-ship threat"
  },
  // Suez to Gibraltar / Europe
  {
    id: "suez-gib",
    name: "Mediterranean to Gibraltar (Europe Gate)",
    from: [32.34, 30.70],
    to: [-5.60, 35.96],
    waypoints: [
      [32.34, 30.70],
      [27.00, 33.50],
      [18.00, 35.50],
      [8.00, 37.00],
      [0.00, 36.50],
      [-5.60, 35.96]
    ],
    flowType: "container",
    riskRating: "high",
    flowVolume: "5.5M bpd",
    description: "Mediterranean trunk line delivering goods to Western Europe and Atlantic"
  },
  // Cape of Good Hope Diversion Route (Around Africa - Silky Smooth Coastline Wrap)
  {
    id: "fuj-cape",
    name: "Cape Diversion: Indian Ocean Leg",
    from: [56.36, 25.13],
    to: [18.49, -34.35],
    waypoints: [
      [56.36, 25.13],
      [58.50, 18.00],
      [54.00, 8.00],
      [48.00, -2.00],
      [44.00, -12.00],
      [38.00, -22.00],
      [32.00, -30.00],
      [24.00, -34.00],
      [18.49, -34.35]
    ],
    flowType: "diversion",
    riskRating: "diverted",
    flowVolume: "15.8M bpd",
    description: "74.8% of Red Sea traffic diverted south around the African continent"
  },
  {
    id: "cape-gib",
    name: "Cape Diversion: Atlantic Leg to Europe",
    from: [18.49, -34.35],
    to: [-5.60, 35.96],
    waypoints: [
      [18.49, -34.35],
      [13.00, -28.00],
      [7.00, -18.00],
      [0.00, -5.00],
      [-8.00, 5.00],
      [-16.00, 15.00],
      [-18.00, 25.00],
      [-12.00, 32.00],
      [-5.60, 35.96]
    ],
    flowType: "diversion",
    riskRating: "diverted",
    flowVolume: "15.8M bpd",
    description: "Atlantic ascent heading to Northern European refineries and ports"
  },
  // Malacca to Ningbo-Zhoushan & East Asia (World's #1 Discharge Port & SPR Hub)
  {
    id: "malacca-eastasia",
    name: "Malacca to Ningbo-Zhoushan & East Asia",
    from: [103.00, 1.43],
    to: [121.80, 29.90],
    waypoints: [
      [103.00, 1.43],
      [106.00, 6.00],
      [112.00, 14.00],
      [118.00, 22.00],
      [121.00, 26.50],
      [121.80, 29.90]
    ],
    flowType: "crude",
    riskRating: "moderate",
    flowVolume: "14.1M bpd",
    description: "Primary maritime energy artery supplying China's Strategic Petroleum Reserve (Zhoushan) and Sinopec mega-refineries"
  },
  // Panama Canal to Atlantic & Med Gateway
  {
    id: "panama-atlantic",
    name: "Panama to Atlantic & Med Gateway",
    from: [-79.68, 9.08],
    to: [-5.60, 35.96],
    waypoints: [
      [-79.68, 9.08],
      [-74.00, 14.00],
      [-66.00, 19.50],
      [-50.00, 26.00],
      [-32.00, 31.00],
      [-16.00, 34.00],
      [-5.60, 35.96]
    ],
    flowType: "container",
    riskRating: "moderate",
    flowVolume: "2.7M bpd equiv",
    description: "Americas maritime link carrying LNG and containerized cargoes into European and Mediterranean gateways"
  }
];

// Strategic overland energy bypass corridors & pipeline arteries
export interface GeoPipelineAsset {
  id: string;
  name: string;
  country: string;
  capacityBpd: string;
  activeThroughputBpd: string;
  status: "OFFLINE / EMERGENCY HALT" | "NOMINAL OPERATION" | "MAX CAPACITY RESTRICTED";
  severity: "critical" | "high" | "nominal";
  closureCause?: string;
  macroImpact: string;
  coordinates: Array<[number, number]>; // Array of [lon, lat] along pipeline path
  originName: string;
  terminalName: string;
}

export const STRATEGIC_PIPELINES: GeoPipelineAsset[] = [
  {
    id: "saudi-east-west-pipeline",
    name: "Saudi Petroline (East-West Crude Pipeline)",
    country: "Saudi Arabia",
    capacityBpd: "5.0M bpd",
    activeThroughputBpd: "0.0M bpd (SHUT DOWN)",
    status: "OFFLINE / EMERGENCY HALT",
    severity: "critical",
    closureCause: "Emergency precautionary closure following Yemen-Houthi drone & cruise missile escalation threats along the southern Red Sea corridor",
    macroImpact: "Removes Saudi Aramco's sole overland bypass around the Strait of Hormuz to the Red Sea terminal at Yanbu; forces 100% of crude exports back through Hormuz choke or storage",
    coordinates: [
      [50.15, 26.28], // Abqaiq / Ras Tanura
      [47.80, 25.60], // Riyadh booster stations
      [44.20, 24.80], // Central Desert pumping stations
      [41.50, 24.30], // Hejaz mountain pass
      [38.06, 24.09]  // Yanbu Red Sea Terminal
    ],
    originName: "Abqaiq Processing Hub",
    terminalName: "Yanbu Port (Red Sea)"
  },
  {
    id: "habshan-fujairah-pipeline",
    name: "ADCOP (Abu Dhabi Crude Oil Pipeline)",
    country: "United Arab Emirates",
    capacityBpd: "1.5M bpd",
    activeThroughputBpd: "1.48M bpd (PEAK LOAD)",
    status: "MAX CAPACITY RESTRICTED",
    severity: "high",
    closureCause: "Running at 98.7% max throughput to bypass Strait of Hormuz to Fujairah terminal",
    macroImpact: "Only active operational bypass around Hormuz; zero spare capacity remaining",
    coordinates: [
      [53.75, 23.95], // Habshan oil field
      [55.20, 24.40], // Sweihan desert junction
      [56.36, 25.13]  // Fujairah Oil Terminal
    ],
    originName: "Habshan Fields",
    terminalName: "Fujairah Anchorage"
  },
  {
    id: "kirkuk-ceyhan-pipeline",
    name: "Kirkuk-Ceyhan Crude Oil Pipeline",
    country: "Iraq / Turkey",
    capacityBpd: "1.6M bpd",
    activeThroughputBpd: "0.5M bpd (CURTAILED)",
    status: "MAX CAPACITY RESTRICTED",
    severity: "high",
    closureCause: "Arbitration friction, regional security interdictions, and infrastructure maintenance",
    macroImpact: "Restricts northern Iraqi crude from reaching Mediterranean markets without Gulf maritime transit",
    coordinates: [
      [44.39, 35.47], // Kirkuk
      [42.45, 37.15], // Fishkhabur border crossing
      [35.85, 36.88]  // Ceyhan Mediterranean Terminal
    ],
    originName: "Kirkuk Oil Fields",
    terminalName: "Ceyhan Terminal (Turkey)"
  }
];

// Active Geopolitical Events directly flagged on the map & intelligence layers
export interface GeoStrategicEvent {
  id: string;
  title: string;
  type:
    | "PIPELINE_CLOSURE"
    | "KINETIC_STRIKE"
    | "DRONE_INTERDICTION"
    | "NAVAL_BLOCKADE"
    | "MINE_ADVISORY"
    | "ELECTRONIC_JAMMING"
    | "PORT_CLOSURE";
  timestamp: string;
  relativeTime: string;
  coordinates: [number, number]; // [lon, lat]
  severity: "critical" | "high" | "warning";
  assetAffected: string;
  region: string;
  headline: string;
  operationalImpact: string;
  marketImpact: {
    brentSpread: string;
    tankerRates: string;
    macroShift: string;
  };
  isActive: boolean;
  relatedChokepointIds: string[];
}

export const ACTIVE_GEO_STRATEGIC_EVENTS: GeoStrategicEvent[] = [
  {
    id: "evt-saudi-pipeline-shut",
    title: "Saudi East-West Pipeline Emergency Closure",
    type: "PIPELINE_CLOSURE",
    timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    relativeTime: "Yesterday (Confirmed 22h ago)",
    coordinates: [44.20, 24.80], // Petroline central sector
    severity: "critical",
    assetAffected: "Petroline (Abqaiq to Yanbu - 5.0M bpd capacity)",
    region: "Saudi Arabia / Arabian Peninsula",
    headline: "Saudi Arabia orders emergency shutdown of East-West Crude Pipeline following escalation in Yemeni-Houthi ballistic & drone threats",
    operationalImpact: "Shuts down 5.0M bpd overland crude bypass to the Red Sea. Saudi Aramco loses ability to route Ras Tanura crude around Hormuz directly to Yanbu; 100% of Persian Gulf crude is forced back through the Strait of Hormuz.",
    marketImpact: {
      brentSpread: "+$3.60/bbl prompt backwardation spike",
      tankerRates: "+240 bps VLCC freight rate surge",
      macroShift: "Eliminates global crude market's primary contingency bypass cushion"
    },
    isActive: true,
    relatedChokepointIds: ["hormuz", "bab-el-mandeb"]
  },
  {
    id: "evt-houthi-asbm-bab",
    title: "Bab el-Mandeb Anti-Ship Missile Volley",
    type: "DRONE_INTERDICTION",
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    relativeTime: "4h ago",
    coordinates: [43.33, 12.58], // Bab el-Mandeb
    severity: "critical",
    assetAffected: "Southern Red Sea Maritime Channel",
    region: "Bab el-Mandeb / Gulf of Aden",
    headline: "Houthi forces launch multi-vector anti-ship ballistic missiles & explosive USVs into international shipping lane",
    operationalImpact: "Suez bypass rate holds at 74.8%; container carriers re-confirm Cape of Good Hope transit orders; coalition Task Force 153 deploys Aegis countermeasures.",
    marketImpact: {
      brentSpread: "+$1.80/bbl risk adder",
      tankerRates: "+380 bps JWLA war-risk premium",
      macroShift: "+14 days voyage delay for European import cargoes"
    },
    isActive: true,
    relatedChokepointIds: ["bab-el-mandeb"]
  },
  {
    id: "evt-centcom-hormuz-counter",
    title: "Operation Sentinel Surge: Hormuz Defense Sweep",
    type: "KINETIC_STRIKE",
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    relativeTime: "1h ago",
    coordinates: [56.40, 26.56], // Strait of Hormuz
    severity: "critical",
    assetAffected: "Strait of Hormuz Inbound & Outbound Traffic Lanes",
    region: "Strait of Hormuz / Gulf of Oman",
    headline: "US CENTCOM air wings strike IRGC coastal radar and fast-boat staging docks following commercial tanker harassment",
    operationalImpact: "DEFCON 2 readiness across regional naval taskforces; GPS spoofing confirmed over 45nm perimeter; commercial tankers holding in Fujairah anchorage.",
    marketImpact: {
      brentSpread: "+$5.20/bbl tail-risk spike",
      tankerRates: "+420 bps hull war-risk surcharge",
      macroShift: "Persian Gulf crude risk premium at historic highs"
    },
    isActive: true,
    relatedChokepointIds: ["hormuz", "fujairah"]
  }
];

// World geographic features powered by Natural Earth 1:110m via topojson-client
import { feature, mesh } from "topojson-client";
import worldTopology from "world-atlas/countries-110m.json";

// Authentic, unified world landmasses FeatureCollection (zero winding glitches)
export const WORLD_LAND_GEO: any = feature(worldTopology as any, (worldTopology as any).objects.land);
// Subtle international border mesh
export const WORLD_BORDERS_GEO: any = mesh(worldTopology as any, (worldTopology as any).objects.countries, (a: any, b: any) => a !== b);
export const WORLD_GEO_DATA = WORLD_LAND_GEO; // backward compatibility

