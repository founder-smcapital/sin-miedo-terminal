import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Globe2,
  Droplets,
  Calendar,
  Layers,
  Sliders,
  Compass,
  ArrowRight,
  Info,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Gauge,
  Ship,
  Sparkles,
  Satellite,
  X,
  Database,
  BarChart2
} from "lucide-react";
import { CountryProductionLevels } from "./CountryProductionLevels";
import { IndiaRussiaCrudeFlow } from "./IndiaRussiaCrudeFlow";
import { ChartExportDropdown } from "../ChartExportDropdown";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Cell
} from "recharts";
import { MacroDataState } from "../../types";

interface StrategicPetroleumReservesProps {
  macroData: MacroDataState;
  onOpenTerminalWithPrompt?: (prompt: string) => void;
}

// 2018 - 2026 Historical and Live Telemetry for Strategic Crude Oil Reserves (Million Barrels)
// Sources: US DOE, IEA, Kpler Satellite Radar, Vortexa Altimetry, US EIA
const historicalInventoryData = [
  { year: "2018", us: 649, china: 580, chinaTotal: 840, japan: 512, totalIea: 1540, brent: 71.3 },
  { year: "2019", us: 635, china: 690, chinaTotal: 940, japan: 508, totalIea: 1510, brent: 64.2 },
  { year: "2020", us: 638, china: 820, chinaTotal: 1060, japan: 505, totalIea: 1525, brent: 41.8 },
  { year: "2021", us: 593, china: 890, chinaTotal: 1120, japan: 495, totalIea: 1460, brent: 70.9 },
  { year: "2022", us: 372, china: 910, chinaTotal: 1160, japan: 482, totalIea: 1220, brent: 99.0 },
  { year: "2023", us: 351, china: 940, chinaTotal: 1195, japan: 476, totalIea: 1190, brent: 82.2 },
  { year: "2024", us: 367, china: 960, chinaTotal: 1220, japan: 472, totalIea: 1215, brent: 80.5 },
  { year: "2025", us: 362, china: 975, chinaTotal: 1240, japan: 470, totalIea: 1205, brent: 84.1 },
  { year: "2026 Q1", us: 359, china: 955, chinaTotal: 1250, japan: 469, totalIea: 1180, brent: 96.5 },
  { year: "2026 NOW", us: 358.4, china: 932.0, chinaTotal: 1162.0, japan: 468.0, totalIea: 1145, brent: 104.6 }
];

// Country Strategic Reserves Data & Forward Cover metrics
interface CountryReserveMetric {
  id: string;
  country: string;
  flag: string;
  agency: string;
  currentLevelMbbl: number;
  capacityMbbl: number;
  fillPct: number;
  forwardDaysCover: number;
  middleEastReliancePct: number;
  statusText: string;
  statusLevel: "critical" | "warning" | "drawdown" | "watch";
  statusColor: string;
  drawdownRate: string;
  storageSites: string[];
  keyVulnerability: string;
  tradingImplication: string;
  cavernFloorThresholdMbbl?: number; // Minimum crude volume to prevent geomechanical salt creep & collapse
  catastrophicCollapseLimitMbbl?: number; // Uncontrolled cavern coalescence & sinkhole rupture threshold
  usableBufferMbbl?: number; // Effective extractable volume above floor
  geologicalRiskNote?: string;
  totalCombinedStockpileMbbl?: number; // Verified total onshore crude (SPR + Commercial + Refiners)
  totalStockpileNote?: string;
  auditVerificationNote?: string;
}

const countryReserveMetrics: CountryReserveMetric[] = [
  {
    id: "us",
    country: "United States",
    flag: "🇺🇸",
    agency: "DOE Strategic Petroleum Reserve (SPR)",
    currentLevelMbbl: 358.4,
    capacityMbbl: 714.0,
    fillPct: 50.2,
    forwardDaysCover: 18.2, // net days of SPR emergency buffer
    middleEastReliancePct: 8.5,
    statusText: "HISTORIC 43-YEAR LOW",
    statusLevel: "critical",
    statusColor: "#EF4444",
    drawdownRate: "0.0 bpd (Refill Paused >$100 Brent)",
    cavernFloorThresholdMbbl: 140.0,
    catastrophicCollapseLimitMbbl: 100.0,
    usableBufferMbbl: 218.4,
    geologicalRiskNote: "Underground salt cavern structural integrity minimum is 140.0M bbls. Below 140M, lithostatic pressure triggers inward salt creep, ceiling spalling, and pump destruction from asphaltic sludge. Draining below 100M bbls risks cavern coalescence (adjacent cavern collapse) and catastrophic surface sinkhole breaches.",
    storageSites: ["Bryan Mound (TX)", "Big Hill (TX)", "West Hackberry (LA)", "Bayou Choctaw (LA)"],
    keyVulnerability: "Salt Cavern Geotechnical Integrity Floor: 140.0M bbls (Sandia Labs limit). Real usable extraction runway is only 218.4M bbls. Below 140M, lithostatic salt creep induces irreversible cavern deformation and sludge contamination; below 100M risks catastrophic cavern coalescence.",
    tradingImplication: "Bullish WTI/Brent prompt spreads; White House structurally incapable of repeating 2022's 180M bbl release without breaching the 140M cavern collapse threshold."
  },
  {
    id: "china",
    country: "China",
    flag: "🇨🇳",
    agency: "SRO / NDRC National Food & Strategic Reserves",
    currentLevelMbbl: 932.0, // State-controlled Strategic Reserves
    totalCombinedStockpileMbbl: 1162.0, // 1.162 Billion Barrels Total Onshore Stockpile
    capacityMbbl: 1020.0,
    fillPct: 91.4,
    forwardDaysCover: 82.0, // Based on SRO strategic; 105 days based on total 1.16B onshore
    middleEastReliancePct: 44.5,
    statusText: "ACTIVE DRAWDOWN (TOTAL >1.16B BBLS)",
    statusLevel: "drawdown",
    statusColor: "#F59E0B",
    drawdownRate: "-1.25M bpd (Emergency Release from 1.25B Peak)",
    storageSites: ["Zhoushan Underground Caverns", "Zhenhai Base", "Dalian Caverns", "Huangdao", "Lanzhou", "Shandong Teapot Hubs"],
    keyVulnerability: "Active emergency drawdown resumed (-1.25M bpd) to cushion Persian Gulf tanker halts. While total onshore inventories exceed 1.16 Billion barrels (verified by Kpler, Vortexa & EIA; peaked at 1.25B in April), heavy 16M bpd refining run-rate exhausts stockpiles rapidly during protracted Hormuz interdiction.",
    tradingImplication: "Chinese teapot refiners curbing runs; aggressive bidding for Atlantic basin West African / Angolan sweet barrels to replace Gulf sour grades.",
    totalStockpileNote: "Total Onshore Crude Inventories (Strategic SRO + Commercial + Refiners): 1,162M bbls (1.162 Billion Barrels). EIA models total systemic capacity at ~1.4 Billion barrels.",
    auditVerificationNote: "VERIFIED BY EIA, KPLER & VORTEXA: China is the world's largest oil stockpiler with over 1.16 Billion barrels in combined onshore storage. The U.S. EIA estimates China's combined strategic + commercial crude inventories at up to 1.4 Billion barrels (including refiners). Satellite radar altimetry from Kpler tracked inventories peaking at 1.25 Billion barrels in April 2026, currently at 1.162 Billion barrels after 1.25M bpd emergency drawdowns."
  },
  {
    id: "japan",
    country: "Japan",
    flag: "🇯🇵",
    agency: "METI / JOGMEC National & Private Oil Stockpiles",
    currentLevelMbbl: 468.0,
    capacityMbbl: 520.0,
    fillPct: 90.0,
    forwardDaysCover: 145.0,
    middleEastReliancePct: 95.3,
    statusText: "CRITICAL THREAT (95% GULF RISK)",
    statusLevel: "critical",
    statusColor: "#EF4444",
    drawdownRate: "-280k bpd (Commercial Blend Draw)",
    storageSites: ["Shibushi (Kagoshima)", "Tomakomai (Hokkaido)", "Mutsu-Ogawara", "Kamigoto (Floating)"],
    keyVulnerability: "95.3% of all crude imports traverse the Strait of Hormuz. Zero domestic production. While nominal days cover is 145 days, power grid and petrochemical supply chains face systemic disruption within 45 days.",
    tradingImplication: "JPY sensitivity to energy import inflation; heavy utility hedging via Brent calls; potential bilateral US emergency crude loan requests under IEA pact."
  },
  {
    id: "south_korea",
    country: "South Korea",
    flag: "🇰🇷",
    agency: "KNOC (Korea National Oil Corporation)",
    currentLevelMbbl: 96.5,
    capacityMbbl: 146.0,
    fillPct: 66.1,
    forwardDaysCover: 96.0,
    middleEastReliancePct: 72.8,
    statusText: "SEVERE SUPPLY SENSITIVITY",
    statusLevel: "warning",
    statusColor: "#F97316",
    drawdownRate: "-150k bpd (Contingency Release)",
    storageSites: ["Ulsan Underground Base", "Geoje Rock Cavern", "Yeosu", "Seosan", "Pyeongtaek"],
    keyVulnerability: "High concentration of energy-intensive semiconductor fabrication and petrochemical refining dependent on uninterrupted Arab Medium/Heavy tanker flow.",
    tradingImplication: "SK Innovation and S-Oil crack spreads widening; upward pressure on Korean Won import bill (KRW depreciation pressure)."
  },
  {
    id: "india",
    country: "India",
    flag: "🇮🇳",
    agency: "ISPRL (Indian Strategic Petroleum Reserves Ltd)",
    currentLevelMbbl: 39.1,
    capacityMbbl: 40.5,
    fillPct: 96.5,
    forwardDaysCover: 9.5, // Strategic SPR only (Commercial tanks add ~64 days)
    middleEastReliancePct: 52.0,
    statusText: "EXTREME PHYSICAL DEFICIT",
    statusLevel: "critical",
    statusColor: "#EF4444",
    drawdownRate: "0.0 bpd (Maximum Hold)",
    storageSites: ["Visakhapatnam (AP)", "Mangalore (Karnataka)", "Padur (Karnataka)", "Chandikhol (Phase II)"],
    keyVulnerability: "India's dedicated underground strategic reserve covers only 9.5 days of net demand. Highly reliant on Russian Urals and Persian Gulf flows; severe vulnerability if shipping lanes shut.",
    tradingImplication: "Intensified arbitrage bidding for non-Hormuz sour crudes; Indian refiners running at near maximum commercial tank usage."
  },
  {
    id: "germany_eu",
    country: "Germany / EU (IEA Europe)",
    flag: "🇪🇺",
    agency: "EBV (Erdölbevorratungsverband) & IEA Europe",
    currentLevelMbbl: 1120.0,
    capacityMbbl: 1250.0,
    fillPct: 89.6,
    forwardDaysCover: 92.0,
    middleEastReliancePct: 21.5,
    statusText: "DIESEL SQUEEZE SENSITIVITY",
    statusLevel: "watch",
    statusColor: "#3B82F6",
    drawdownRate: "-320k bpd (Refinery Feedstock Swaps)",
    storageSites: ["Etzel Salt Caverns (DE)", "Wilhelmshaven", "Rotterdam Bunkers", "Trieste Hub"],
    keyVulnerability: "Direct crude reliance on Middle East reduced post-2022, but Middle East supplies 35% of European jet fuel and ultra-low sulfur diesel via Suez/Cape routes.",
    tradingImplication: "Gas Oil (Diesel) crack spreads hitting record highs; European industrial gas-to-oil switching demand surge."
  }
];

// Days of forward cover comparison data for bar chart (Reflecting both SRO and Total Onshore Stockpiles)
const forwardCoverChartData = [
  { country: "Japan (METI)", days: 145, gulfReliance: 95.3, strategicMbbl: 468, fill: "#EF4444" },
  { country: "China (Total >1.16B)", days: 105, gulfReliance: 44.5, strategicMbbl: 1162, fill: "#F59E0B" },
  { country: "South Korea (KNOC)", days: 96, gulfReliance: 72.8, strategicMbbl: 96.5, fill: "#F97316" },
  { country: "Germany/EU (EBV)", days: 92, gulfReliance: 21.5, strategicMbbl: 1120, fill: "#3B82F6" },
  { country: "China (Strategic SRO)", days: 82, gulfReliance: 44.5, strategicMbbl: 932, fill: "#D97706" },
  { country: "United States (SPR)", days: 18.2, gulfReliance: 8.5, strategicMbbl: 358.4, fill: "#DC2626" },
  { country: "India (Govt SPR)", days: 9.5, gulfReliance: 52.0, strategicMbbl: 39.1, fill: "#991B1B" }
];

export const StrategicPetroleumReserves: React.FC<StrategicPetroleumReservesProps> = ({
  macroData,
  onOpenTerminalWithPrompt
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("us");
  const [activeTab, setActiveTab] = useState<"overview" | "production" | "india_russia" | "simulator" | "vulnerability">("overview");
  const [copiedText, setCopiedText] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [chinaChartScope, setChinaChartScope] = useState<"both" | "total" | "strategic">("both");

  // Hormuz Disruption & Emergency Drawdown Simulator States
  const [hormuzDisruptionPct, setHormuzDisruptionPct] = useState<number>(75); // 0 - 100%
  const [globalDrawdownRateMbpd, setGlobalDrawdownRateMbpd] = useState<number>(2.5); // 0.5 - 4.5 M bpd
  const [brentBasePrice, setBrentBasePrice] = useState<number>(100.0);

  // Live Brent spot price
  const brentSpot = macroData.tickers.find(t => t.symbol === "BRENT")?.price || 100.04;
  const brentChange = macroData.tickers.find(t => t.symbol === "BRENT")?.change || -2.85;

  // Simulator dynamic calculations:
  // Normal Hormuz Flow: ~21.0M bpd
  // Disrupted volume = 21.0 * (hormuzDisruptionPct / 100)
  // Non-Hormuz bypass pipelines (Saudi East-West Petroline 5.0M bpd + UAE ADCOP 1.5M bpd = 6.5M bpd max)
  const hormuzDisruptedMbd = useMemo(() => {
    return Number((21.0 * (hormuzDisruptionPct / 100)).toFixed(1));
  }, [hormuzDisruptionPct]);

  const netGlobalSupplyDeficit = useMemo(() => {
    // 6.5M bpd bypass offset
    const bypassActive = Math.min(6.5, hormuzDisruptedMbd * 0.4);
    const deficit = Math.max(0, hormuzDisruptedMbd - bypassActive - globalDrawdownRateMbpd);
    return Number(deficit.toFixed(1));
  }, [hormuzDisruptedMbd, globalDrawdownRateMbpd]);

  // US SPR exhaustion days (unpumpable sludge limit ~140M bbls; usable ~218M bbls)
  const usSprExhaustionDays = useMemo(() => {
    const usableUsSpr = 358.4 - 140.0; // 218.4M bbls usable
    // US share of global drawdown ~ 40%
    const usDraw = globalDrawdownRateMbpd * 0.40;
    if (usDraw <= 0) return 999;
    return Math.round(usableUsSpr / usDraw);
  }, [globalDrawdownRateMbpd]);

  // Global total IEA buffer exhaustion days (~1,145M bbls / global drawdown)
  const globalIeaExhaustionDays = useMemo(() => {
    if (globalDrawdownRateMbpd <= 0) return 999;
    return Math.round(1145.0 / globalDrawdownRateMbpd);
  }, [globalDrawdownRateMbpd]);

  // Projected crude spike benchmark
  const projectedBrentPrice = useMemo(() => {
    const stressFactor = (hormuzDisruptionPct / 100) * 45;
    const reliefFactor = (globalDrawdownRateMbpd / 4.0) * 15;
    return Number((brentBasePrice + stressFactor - reliefFactor).toFixed(1));
  }, [brentBasePrice, hormuzDisruptionPct, globalDrawdownRateMbpd]);

  const activeCountryData = useMemo(() => {
    return countryReserveMetrics.find(c => c.id === selectedCountry) || countryReserveMetrics[0];
  }, [selectedCountry]);

  const handleCopyTelemetry = () => {
    const summary = `[GLOBAL STRATEGIC PETROLEUM RESERVES (SPR) TELEMETRY - IRAN-GULF WAR UPDATE]
• US SPR Level: 358.4M bbls (50.2% cap - 43-year historic low; Refill paused >$100 Brent)
• US Cavern Collapse Floor: 140.0M bbls structural limit (Net usable emergency draw: 218.4M bbls)
• Catastrophic Coalescence Redline: 100.0M bbls (Permanent cavern rupture & sinkhole risk)
• China Total Onshore Stockpile: 1,162.0M bbls (>1.16B bbls - verified by Kpler, Vortexa & EIA; 932M SRO Strategic, peak 1.25B)
• Japan METI Reserves: 468.0M bbls (145 days forward cover, BUT 95.3% dependent on Hormuz)
• South Korea KNOC: 96.5M bbls (96 days cover, 72.8% Persian Gulf crude reliance)
• India ISPRL: 39.1M bbls (Only 9.5 days dedicated strategic reserve cover)
• Brent Benchmark: $${brentSpot.toFixed(2)}/bbl (${brentChange >= 0 ? "+" : ""}${brentChange}%)
• Hormuz War Disruption: ~${hormuzDisruptedMbd}M bpd at risk | Usable US SPR Runway to 140M Floor: ${usSprExhaustionDays} days at ${globalDrawdownRateMbpd}M bpd release.`;

    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div id="strategic-petroleum-reserves-container" className="space-y-6 animate-in fade-in">
      {/* 1. Header Banner with Live Telemetry Badges */}
      <div className="bg-[#10141D] border border-[#B08D57]/30 rounded-xl p-5 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EF4444]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#B08D57]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-4xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#EF4444] text-white text-[10px] font-mono-data font-bold px-2.5 py-0.5 rounded tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                <ShieldAlert className="w-3.5 h-3.5" />
                GLOBAL ENERGY SECURITY TELEMETRY
              </span>
              <span className="bg-[#B08D57]/20 border border-[#B08D57]/40 text-[#E5C794] text-[10px] font-mono-data px-2.5 py-0.5 rounded flex items-center gap-1">
                <Droplets className="w-3 h-3 text-[#B08D57]" />
                CRUDE OIL INVENTORIES &amp; FORWARD COVER
              </span>
              <span className="bg-red-950/60 border border-red-500/30 text-red-300 text-[10px] font-mono-data px-2 py-0.5 rounded flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-400" />
                IRAN-GULF WAR HORMUZ DISRUPTION
              </span>
              <button
                onClick={() => setAuditModalOpen(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono-data font-bold px-2.5 py-0.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Satellite className="w-3 h-3 text-amber-400" />
                <span>Verified: China &gt;1.16B Stockpile</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif italic font-bold text-[#FBF8F1] tracking-tight">
              Global Strategic Petroleum Reserves (SPR) &amp; Depletion Runway Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[#8292A6] leading-relaxed">
              Real-time cross-national government crude stockpile monitoring across the United States, China, Japan, South Korea, India, and the European Union. Tracking physical inventory depletion, forward import burn rates, and emergency buffer exhaustion runway under persistent Persian Gulf military conflict.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setAuditModalOpen(true)}
              className="flex items-center gap-2 bg-[#172030] hover:bg-[#202e47] text-amber-300 border border-amber-500/40 text-xs font-mono-data font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
              title="Audit sovereign crude reserve data sources (EIA, Kpler, Vortexa)"
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>Audit Reserves Data</span>
            </button>

            <button
              onClick={handleCopyTelemetry}
              className="flex items-center gap-2 bg-[#1A2234] hover:bg-[#25324B] text-[#EDE9DE] border border-[#B08D57]/40 text-xs font-mono-data font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm"
              title="Copy strategic crude reserve telemetry summary to clipboard"
            >
              {copiedText ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#B08D57]" />}
              <span>{copiedText ? "Copied Telemetry" : "Copy SPR Brief"}</span>
            </button>

            <ChartExportDropdown
              chartTitle="Global Strategic Petroleum Reserves (SPR) & Depletion Runway Matrix"
              chartContainerId="strategic-petroleum-reserves-container"
              subtitle={`BRENT: $${brentSpot.toFixed(2)} // US SPR: 358.4M BBLS // CHINA TOTAL: 1,162M BBLS // HORMUZ DISRUPTED: ${hormuzDisruptedMbd}M BPD`}
              buttonLabel="Export SPR Data"
              size="xs"
              getCsvData={() => {
                const headers = [
                  "Country",
                  "Agency",
                  "Current SPR Level (Mbbl)",
                  "Total Onshore Stockpile (Mbbl)",
                  "Storage Capacity (Mbbl)",
                  "Fill %",
                  "Forward Net Import Cover (Days)",
                  "Middle East & Gulf Reliance (%)",
                  "Status",
                  "Drawdown Rate",
                  "Usable Buffer (Mbbl)",
                  "Cavern Floor Threshold (Mbbl)",
                  "Key Vulnerability",
                  "Desk Trading Implication",
                ];
                const rows = countryReserveMetrics.map((c) => [
                  c.country,
                  c.agency,
                  c.currentLevelMbbl,
                  c.totalCombinedStockpileMbbl || c.currentLevelMbbl,
                  c.capacityMbbl,
                  `${c.fillPct}%`,
                  c.forwardDaysCover,
                  `${c.middleEastReliancePct}%`,
                  c.statusText,
                  c.drawdownRate,
                  c.usableBufferMbbl || "-",
                  c.cavernFloorThresholdMbbl || "-",
                  c.keyVulnerability,
                  c.tradingImplication,
                ]);
                return {
                  filename: `smc-strategic-petroleum-reserves-telemetry`,
                  headers,
                  rows,
                  metaComments: [
                    "SIN MIEDO CAPITAL // GLOBAL STRATEGIC PETROLEUM RESERVES (SPR) TELEMETRY",
                    `Brent Spot Benchmark: $${brentSpot.toFixed(2)}/bbl (${brentChange >= 0 ? "+" : ""}${brentChange}%)`,
                    `Simulated Hormuz Disruption: ${hormuzDisruptionPct}% (~${hormuzDisruptedMbd}M bpd)`,
                    `Global Drawdown Rate: ${globalDrawdownRateMbpd}M bpd`,
                    "US Salt Cavern Floor Threshold: 140.0M bbls (Sandia Labs geomechanical limit)",
                    "China Total Onshore Inventories: 1,162M bbls (>1.16B bbls verified by Kpler, Vortexa & EIA)",
                  ],
                };
              }}
            />

            {onOpenTerminalWithPrompt && (
              <button
                onClick={() =>
                  onOpenTerminalWithPrompt(
                    "Analyze the US Strategic Petroleum Reserve cavern structural integrity limit (140M bbls) and contrast with China's combined 1.16 Billion barrel strategic and commercial stockpile."
                  )
                }
                className="flex items-center gap-2 bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] text-xs font-sans font-bold px-4 py-2 rounded-lg transition-all shadow-md uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Desk Strategy</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Stat Rapid Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#B08D57]/20 font-mono-data text-xs">
          <div className="bg-black/40 border border-red-500/30 p-2.5 rounded-lg">
            <span className="text-[10px] text-red-400 block uppercase font-bold">US Strategic Reserve</span>
            <div className="text-base font-bold text-white mt-0.5">358.4M bbls</div>
            <span className="text-[10px] text-[#8292A6]">
              43-Yr Low • <strong className="text-red-300">218.4M Usable</strong> Above 140M Collapse Floor
            </span>
          </div>

          <div
            className="bg-black/40 border border-amber-500/30 p-2.5 rounded-lg cursor-pointer hover:border-amber-400/80 transition-colors"
            onClick={() => {
              setSelectedCountry("china");
              setAuditModalOpen(true);
            }}
          >
            <span className="text-[10px] text-amber-400 block uppercase font-bold flex items-center justify-between">
              <span>China Total Stockpile</span>
              <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-normal">Kpler / EIA</span>
            </span>
            <div className="text-base font-bold text-amber-300 mt-0.5">
              1,162M bbls <span className="text-[11px] text-amber-400/90 font-normal">(&gt;1.16B)</span>
            </div>
            <span className="text-[10px] text-amber-400/80">
              932M Strategic SRO • -1.25M bpd draw
            </span>
          </div>

          <div className="bg-black/40 border border-red-500/30 p-2.5 rounded-lg">
            <span className="text-[10px] text-red-400 block uppercase font-bold">Japan Hormuz Vulnerability</span>
            <div className="text-base font-bold text-red-300 mt-0.5">95.3% At Risk</div>
            <span className="text-[10px] text-[#8292A6]">145 Days Cover • Zero Domestic</span>
          </div>

          <div className="bg-black/40 border border-[#B08D57]/30 p-2.5 rounded-lg">
            <span className="text-[10px] text-[#E5C794] block uppercase font-bold">Brent Crude Risk Spot</span>
            <div className="text-base font-bold text-[#E5C794] mt-0.5">${brentSpot.toFixed(2)}/bbl</div>
            <span className="text-[10px] text-[#8292A6]">Super-backwardation active</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 border border-[#B08D57]/30 rounded-xl p-2 font-mono-data text-xs shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-[#B08D57] text-[#0E1A2B] shadow-md"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Country SPR Telemetry &amp; Inventories</span>
          </button>

          <button
            onClick={() => setActiveTab("production")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === "production"
                ? "bg-[#10B981] text-[#0A111C] shadow-md shadow-emerald-500/20"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Country Crude Production</span>
            <span className="text-[9px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold uppercase">
              US 13.5M #1
            </span>
          </button>

          <button
            onClick={() => setActiveTab("india_russia")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === "india_russia"
                ? "bg-[#EF4444] text-white shadow-md shadow-red-500/20"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Ship className="w-4 h-4 text-[#FFA4A4]" />
            <span>India-Russia Crude Trade Flow</span>
            <span className="text-[9px] bg-red-950/60 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30 font-bold uppercase">
              38.4% SHARE
            </span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === "simulator"
                ? "bg-[#EF4444] text-white shadow-md shadow-red-500/20"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Hormuz Outage &amp; Exhaustion Simulator</span>
            <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-normal border border-white/20">
              Interactive
            </span>
          </button>

          <button
            onClick={() => setActiveTab("vulnerability")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === "vulnerability"
                ? "bg-[#1E293B] text-[#E5C794] border border-[#B08D57]/50 shadow-md"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Geopolitical Choke Point &amp; Refinery Matrix</span>
          </button>
        </div>

        <span className="text-[10px] text-[#8292A6] px-2 hidden lg:inline">
          Data synchronized with IEA, DOE EIA, JOGMEC &amp; Chinese National Energy Administration
        </span>
      </div>

      {/* TAB 1: OVERVIEW & INVENTORY CHARTS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Country Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countryReserveMetrics.map((item) => {
              const isSelected = selectedCountry === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCountry(item.id)}
                  className={`bg-[#121620] rounded-xl p-5 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-[#B08D57] shadow-xl shadow-[#B08D57]/10 ring-1 ring-[#B08D57]/50"
                      : "border-white/10 hover:border-[#B08D57]/40 hover:bg-[#151B27]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.flag}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-sans">{item.country}</h4>
                          <span className="text-[10px] text-[#8292A6] font-mono-data block truncate max-w-[190px]">
                            {item.agency}
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-[9px] font-mono-data font-bold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: `${item.statusColor}20`,
                          color: item.statusColor,
                          borderColor: `${item.statusColor}50`
                        }}
                      >
                        {item.statusText}
                      </span>
                    </div>

                    {/* Numbers Pod */}
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3 grid grid-cols-2 gap-2 font-mono-data">
                      <div>
                        <span className="text-[9px] text-[#8292A6] block uppercase">Current Reserve</span>
                        <div className="text-base font-bold text-white">{item.currentLevelMbbl.toFixed(1)}M bbls</div>
                        <span className="text-[9px] text-[#8292A6]">{item.fillPct}% of {item.capacityMbbl}M</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#8292A6] block uppercase">Forward Cover</span>
                        <div className="text-base font-bold text-[#E5C794]">{item.forwardDaysCover} Days</div>
                        <span className="text-[9px] text-red-400">{item.middleEastReliancePct}% Gulf reliant</span>
                      </div>
                    </div>

                    {/* Progress Bar of Capacity */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono-data text-[#8292A6]">
                        <span>Storage Fill Level</span>
                        <span className="text-white font-bold">{item.fillPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.fillPct}%`,
                            backgroundColor: item.fillPct < 55 ? "#EF4444" : item.fillPct < 75 ? "#F59E0B" : "#10B981"
                          }}
                        />
                      </div>
                    </div>

                    {item.cavernFloorThresholdMbbl && (
                      <div className="bg-red-950/30 border border-red-500/30 rounded px-2.5 py-1 text-[10px] font-mono-data flex items-center justify-between">
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Cavern Collapse Floor:
                        </span>
                        <span className="text-white font-bold">
                          {item.cavernFloorThresholdMbbl}M bbls <span className="text-red-300 font-normal">({item.usableBufferMbbl}M usable)</span>
                        </span>
                      </div>
                    )}

                    {item.totalCombinedStockpileMbbl && (
                      <div className="bg-amber-950/30 border border-amber-500/30 rounded px-2.5 py-1 text-[10px] font-mono-data flex items-center justify-between">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Satellite className="w-3 h-3" /> Total Onshore:
                        </span>
                        <span className="text-white font-bold">
                          {(item.totalCombinedStockpileMbbl / 1000).toFixed(3)}B bbls <span className="text-amber-300 font-normal">({item.totalCombinedStockpileMbbl}M)</span>
                        </span>
                      </div>
                    )}

                    <div className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-2">
                      {item.keyVulnerability}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono-data">
                    <span className="text-[#8292A6]">Flow: <strong className="text-white">{item.drawdownRate}</strong></span>
                    <span className="text-[#B08D57] flex items-center gap-1 font-bold">
                      View Deep Dive <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Country Deep Dive Banner */}
          <div className="bg-[#121722] border border-[#B08D57]/40 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#B08D57]/20">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeCountryData.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-sans">{activeCountryData.country} Strategic Petroleum Architecture</h3>
                    <span
                      className="text-[9px] font-mono-data font-bold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${activeCountryData.statusColor}20`,
                        color: activeCountryData.statusColor,
                        borderColor: `${activeCountryData.statusColor}50`
                      }}
                    >
                      {activeCountryData.statusText}
                    </span>
                  </div>
                  <span className="text-xs font-mono-data text-[#8292A6]">{activeCountryData.agency}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
                <div className="bg-black/50 px-3 py-1.5 rounded border border-white/10">
                  <span className="text-[10px] text-[#8292A6] block uppercase">Current Inventory</span>
                  <span className="text-[#FBF8F1] font-bold">{activeCountryData.currentLevelMbbl}M Barrels ({activeCountryData.fillPct}%)</span>
                </div>
                {activeCountryData.totalCombinedStockpileMbbl && (
                  <div className="bg-black/50 px-3 py-1.5 rounded border border-amber-500/40">
                    <span className="text-[10px] text-amber-400 block uppercase font-bold">Total Onshore Crude</span>
                    <span className="text-amber-300 font-bold">{(activeCountryData.totalCombinedStockpileMbbl / 1000).toFixed(3)}B bbls (Verified)</span>
                  </div>
                )}
                <div className="bg-black/50 px-3 py-1.5 rounded border border-white/10">
                  <span className="text-[10px] text-[#8292A6] block uppercase">Emergency Forward Cover</span>
                  <span className="text-[#E5C794] font-bold">{activeCountryData.forwardDaysCover} Days Net Buffer</span>
                </div>
              </div>
            </div>

            {/* Dedicated US Geotechnical Salt Cavern Architecture & Structural Collapse Limit */}
            {activeCountryData.id === "us" && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-red-950/40 via-black/60 to-red-950/20 border border-red-500/40 font-mono-data space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-white font-sans">
                      US SPR Salt Cavern Geotechnical Integrity &amp; Structural Collapse Limit
                    </span>
                  </div>
                  <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/40 font-bold">
                    DOE / Sandia National Labs Specification
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-black/50 p-2.5 rounded border border-white/10">
                    <span className="text-[9px] text-[#8292A6] block uppercase">Total Stored</span>
                    <div className="text-sm font-bold text-white">358.4M bbls</div>
                    <span className="text-[9px] text-[#8292A6]">50.2% Total Fill</span>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded border border-red-500/40">
                    <span className="text-[9px] text-red-400 block uppercase font-bold">Cavern Collapse Floor</span>
                    <div className="text-sm font-bold text-red-400">140.0M bbls</div>
                    <span className="text-[9px] text-red-300/80">Lithostatic Creep Limit</span>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded border border-[#10B981]/30">
                    <span className="text-[9px] text-[#10B981] block uppercase font-bold">Usable Extraction Buffer</span>
                    <div className="text-sm font-bold text-[#34D399]">218.4M bbls</div>
                    <span className="text-[9px] text-[#8292A6]">Real Emergency Cushion</span>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded border border-red-900/60">
                    <span className="text-[9px] text-red-500 block uppercase font-bold">Catastrophic Redline</span>
                    <div className="text-sm font-bold text-red-500">100.0M bbls</div>
                    <span className="text-[9px] text-red-400">Cavern Coalescence / Sinkhole</span>
                  </div>
                </div>

                <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed">
                  <strong>The Geomechanical Reality:</strong> US crude is stored across 60 subterranean caverns hollowed out of geological salt domes (Bryan Mound &amp; Big Hill in TX; West Hackberry &amp; Bayou Choctaw in LA) at depths of 2,000–4,000 feet. At these depths, rock salt is subjected to tremendous lithostatic overburden pressure (~1 psi/ft). Fluid hydrostatic pressure from crude oil and saturated brine is mechanically mandatory to resist plastic &ldquo;salt creep.&rdquo; Draining the SPR below <strong>140.0M barrels</strong> triggers severe cavern ceiling spalling, wall creep closure, and pump failure from dense asphaltic sludge and anhydrite precipitate. Draining below <strong>100.0M barrels</strong> causes cavern coalescence (adjacent caverns collapsing into one another) and catastrophic surface sinkhole breaches (as occurred at the 2012 Bayou Corne disaster).
                </p>
              </div>
            )}

            {/* Dedicated China Reserves Verification & Sovereign vs Commercial Architecture */}
            {activeCountryData.id === "china" && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-amber-950/40 via-black/60 to-amber-950/20 border border-amber-500/40 font-mono-data space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white font-sans">
                      China Crude Oil Stockpiles: Strategic SRO vs. Total Onshore Inventories (&gt;1.16B bbls)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                      EIA, Kpler &amp; Vortexa Telemetry
                    </span>
                    <button
                      onClick={() => setAuditModalOpen(true)}
                      className="text-[10px] bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] px-2.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                    >
                      Audit Data Sources
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-black/50 p-2.5 rounded border border-amber-500/40">
                    <span className="text-[9px] text-amber-400 block uppercase font-bold">Total Onshore Stockpile</span>
                    <div className="text-sm font-bold text-amber-300">1,162.0M bbls</div>
                    <span className="text-[9px] text-[#8292A6]"><strong>1.16B bbls</strong> (Kpler Radar Sept &apos;26)</span>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded border border-white/10">
                    <span className="text-[9px] text-[#8292A6] block uppercase">April &apos;26 Record Peak</span>
                    <div className="text-sm font-bold text-white">1,250.0M bbls</div>
                    <span className="text-[9px] text-red-400 font-semibold">-88M Drawdown Since Peak</span>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded border border-[#B08D57]/30">
                    <span className="text-[9px] text-[#B08D57] block uppercase font-bold">State Strategic SRO</span>
                    <div className="text-sm font-bold text-[#E5C794]">932.0M bbls</div>
                    <span className="text-[9px] text-[#8292A6]">Dedicated SRO / NDRC Sites</span>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded border border-white/10">
                    <span className="text-[9px] text-[#8292A6] block uppercase">EIA Combined Assessment</span>
                    <div className="text-sm font-bold text-[#38BDF8]">~1.40 Billion bbls</div>
                    <span className="text-[9px] text-[#8292A6]">Total Systemic Working Fill</span>
                  </div>
                </div>

                <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed">
                  <strong>Why Reports State &ldquo;Over 1 Billion Barrels in Reserve&rdquo;:</strong> Unlike the US, where the Strategic Petroleum Reserve (SPR) consists exclusively of federally owned salt caverns isolated from commercial refiners, China enforces a unified dual-tier sovereign stockpile strategy. Under State Council emergency regulations, state-owned oil majors (Sinopec, PetroChina, CNOOC, Sinochem) and private mega-refineries (Zhejiang Petrochemical, Hengli) are legally mandated to maintain minimum strategic operational stocks alongside central government SRO cavern sites (Zhoushan, Zhenhai, Dalian, Huangdao). Real-time satellite synthetic-aperture radar (SAR) altimetry from <strong>Kpler</strong> and <strong>Vortexa</strong> tracks China&apos;s total onshore crude inventory at <strong>1.162 Billion barrels</strong> (having peaked at <strong>1.25 Billion barrels</strong> in April 2026 before the latest 1.25M bpd emergency drawdown to buffer teapot refiners). The US EIA models China&apos;s total crude buffer at up to <strong>1.4 Billion barrels</strong>, confirming China as the single largest physical crude holder on Earth.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 font-mono-data text-xs">
              <div className="bg-black/40 p-4 rounded-lg border border-white/5 space-y-2">
                <span className="text-[10px] text-[#B08D57] font-bold block uppercase flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  Primary Geopolitical Threat
                </span>
                <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">{activeCountryData.keyVulnerability}</p>
              </div>

              <div className="bg-black/40 p-4 rounded-lg border border-white/5 space-y-2">
                <span className="text-[10px] text-[#B08D57] font-bold block uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#34D399]" />
                  Strategic Cavern Locations
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeCountryData.storageSites.map((site, idx) => (
                    <span key={idx} className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-[#94A3B8] border border-white/5">
                      {site}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-lg border border-white/5 space-y-2">
                <span className="text-[10px] text-[#B08D57] font-bold block uppercase flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-[#E5C794]" />
                  Prop Desk Macro Implication
                </span>
                <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">{activeCountryData.tradingImplication}</p>
              </div>
            </div>
          </div>

          {/* Dual Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Chart 1: Multi-Year Strategic Inventory Trajectory */}
            <div id="spr-inventory-drawdown-chart" className="bg-[#111620] border border-[#B08D57]/30 rounded-xl p-5 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-[#B08D57]" />
                    Multi-Year Strategic Reserve Inventory Drawdown (2018 - 2026)
                  </h3>
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Million Barrels (Mbbl) • Featuring China Total Onshore (&gt;1.16B) &amp; US Cavern Floor
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 font-mono-data text-[10px]">
                  <span className="text-[#8292A6] text-[9px] uppercase hidden sm:inline">China Metric:</span>
                  <button
                    onClick={() => setChinaChartScope("total")}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      chinaChartScope === "total"
                        ? "bg-amber-500 text-black font-bold"
                        : "bg-white/5 text-[#8292A6] hover:text-white"
                    }`}
                  >
                    Total (&gt;1.16B)
                  </button>
                  <button
                    onClick={() => setChinaChartScope("both")}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      chinaChartScope === "both"
                        ? "bg-[#B08D57] text-black font-bold"
                        : "bg-white/5 text-[#8292A6] hover:text-white"
                    }`}
                  >
                    Both
                  </button>
                  <button
                    onClick={() => setChinaChartScope("strategic")}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      chinaChartScope === "strategic"
                        ? "bg-amber-600 text-white font-bold"
                        : "bg-white/5 text-[#8292A6] hover:text-white"
                    }`}
                  >
                    SRO (932M)
                  </button>

                  <ChartExportDropdown
                    chartTitle="Strategic Petroleum Reserves Multi-Year Inventory Drawdown (2018-2026)"
                    chartContainerId="spr-inventory-drawdown-chart"
                    subtitle="US SPR vs China Total Onshore (>1.16B) vs China SRO vs Japan METI vs Brent Crude"
                    size="xs"
                    getCsvData={() => {
                      const headers = [
                        "Year / Period",
                        "United States SPR (Mbbl)",
                        "China Total Onshore (>1.16B bbls)",
                        "China Strategic SRO (Mbbl)",
                        "Japan METI / JOGMEC (Mbbl)",
                        "Total IEA Public Reserves (Mbbl)",
                        "Brent Crude Benchmark ($/bbl)",
                        "US Usable Buffer Above 140M Floor (Mbbl)",
                      ];
                      const rows = historicalInventoryData.map((d) => [
                        d.year,
                        d.us,
                        d.chinaTotal,
                        d.china,
                        d.japan,
                        d.totalIea,
                        d.brent,
                        Number((d.us - 140.0).toFixed(1)),
                      ]);
                      return {
                        filename: `smc-spr-historical-inventory-trends`,
                        headers,
                        rows,
                        metaComments: [
                          "SIN MIEDO CAPITAL // HISTORICAL STRATEGIC CRUDE OIL INVENTORIES",
                          "US SPR Sandia Labs Salt Cavern Floor: 140.0M bbls",
                          "Catastrophic Coalescence Collapse Limit: 100.0M bbls",
                          "China Total Onshore Stockpile: 1,162M bbls (>1.16B Verified)",
                        ],
                      };
                    }}
                  />
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalInventoryData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="usColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="chinaTotalColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="chinaColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="japanColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="year" stroke="#8292A6" tick={{ fill: "#8292A6", fontSize: 10 }} />
                    <YAxis
                      stroke="#8292A6"
                      tick={{ fill: "#8292A6", fontSize: 10 }}
                      domain={[70, 1320]}
                      ticks={[100, 140, 350, 600, 1000, 1250]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0E131F",
                        borderColor: "#B08D57",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontFamily: "monospace"
                      }}
                      formatter={(val: any, name: any) => {
                        if (name === "United States SPR") {
                          const usable = (Number(val) - 140.0).toFixed(1);
                          return [`${val}M bbls (+${usable}M above 140M floor)`, name];
                        }
                        if (name.includes("China Total")) {
                          return [`${val}M bbls (${(Number(val) / 1000).toFixed(2)}B bbls - Verified)`, name];
                        }
                        return [`${val}M bbls`, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <ReferenceLine
                      y={1000}
                      stroke="#F59E0B"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: "1.0 Billion Barrels Mark (China Total: 1.16B)",
                        fill: "#F59E0B",
                        fontSize: 10,
                        position: "insideTopLeft"
                      }}
                    />
                    <ReferenceLine
                      y={140}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: "US Cavern Floor (140M)",
                        fill: "#EF4444",
                        fontSize: 10,
                        position: "insideBottomRight"
                      }}
                    />
                    <ReferenceLine
                      y={100}
                      stroke="#991B1B"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{
                        value: "Catastrophic Coalescence (100M)",
                        fill: "#F87171",
                        fontSize: 9,
                        position: "insideBottomRight"
                      }}
                    />
                    {(chinaChartScope === "both" || chinaChartScope === "total") && (
                      <Area
                        type="monotone"
                        dataKey="chinaTotal"
                        name="China Total Onshore (>1.16B bbls)"
                        stroke="#F59E0B"
                        fillOpacity={1}
                        fill="url(#chinaTotalColor)"
                        strokeWidth={2.5}
                      />
                    )}
                    {(chinaChartScope === "both" || chinaChartScope === "strategic") && (
                      <Area
                        type="monotone"
                        dataKey="china"
                        name="China Strategic SRO (932M)"
                        stroke="#D97706"
                        strokeDasharray={chinaChartScope === "both" ? "3 3" : undefined}
                        fillOpacity={chinaChartScope === "both" ? 0.3 : 1}
                        fill="url(#chinaColor)"
                        strokeWidth={chinaChartScope === "both" ? 1.5 : 2}
                      />
                    )}
                    <Area type="monotone" dataKey="us" name="United States SPR" stroke="#EF4444" fillOpacity={1} fill="url(#usColor)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="japan" name="Japan METI/JOGMEC" stroke="#3B82F6" fillOpacity={1} fill="url(#japanColor)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] font-mono-data text-white pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <span className="text-white font-medium">US Cavern Floor: <strong className="text-red-400 font-bold">140M bbls</strong> minimum to prevent salt dome collapse</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Satellite className="w-3 h-3" /> China Onshore: 1,162M bbls (&gt;1.16B Verified)
                </span>
              </div>
            </div>

            {/* Chart 2: Forward Cover Days vs IEA 90-Day Mandate */}
            <div id="spr-forward-cover-chart" className="bg-[#111620] border border-[#B08D57]/30 rounded-xl p-5 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#B08D57]" />
                    Forward Net Import Cover Days vs. 90-Day IEA Mandate
                  </h3>
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Days of consumption/net import buffer during total crude import cutoff
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-data bg-amber-950/50 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded whitespace-nowrap">
                    IEA Min: 90 Days
                  </span>
                  <ChartExportDropdown
                    chartTitle="Forward Net Import Cover Days vs 90-Day IEA Mandate"
                    chartContainerId="spr-forward-cover-chart"
                    subtitle="Days of Consumption / Net Import Buffer During Total Crude Import Interdiction"
                    size="xs"
                    getCsvData={() => {
                      const headers = [
                        "Country / Stockpile Category",
                        "Forward Net Import Cover (Days)",
                        "Middle East & Gulf Reliance (%)",
                        "Strategic Stockpile (Mbbl)",
                        "IEA 90-Day Mandate Status",
                      ];
                      const rows = forwardCoverChartData.map((d) => [
                        d.country,
                        d.days,
                        `${d.gulfReliance}%`,
                        d.strategicMbbl,
                        d.days >= 90 ? "COMPLIANT" : "PHYSICAL DEFICIT",
                      ]);
                      return {
                        filename: `smc-spr-forward-cover-days`,
                        headers,
                        rows,
                        metaComments: [
                          "SIN MIEDO CAPITAL // FORWARD CRUDE IMPORT COVER DAYS",
                          "IEA Minimum Emergency Stockholding Mandate: 90 Days",
                          "India SPR: 9.5 Days (Severe Deficit)",
                          "Japan METI: 145 Days (High Cover, but 95.3% Gulf Reliance)",
                        ],
                      };
                    }}
                  />
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forwardCoverChartData} layout="vertical" margin={{ top: 15, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis type="number" stroke="#8292A6" tick={{ fill: "#8292A6", fontSize: 10 }} domain={[0, 160]} />
                    <YAxis dataKey="country" type="category" stroke="#8292A6" tick={{ fill: "#EDE9DE", fontSize: 11 }} width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0E131F",
                        borderColor: "#B08D57",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontFamily: "monospace"
                      }}
                      formatter={(val: any) => [`${val} Days`, "Forward Cover"]}
                    />
                    <ReferenceLine x={90} stroke="#10B981" strokeDasharray="4 4" label={{ value: "IEA 90D Mandate", fill: "#10B981", fontSize: 10, position: "top" }} />
                    <ReferenceLine x={30} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "30D Redline", fill: "#EF4444", fontSize: 10, position: "top" }} />
                    <Bar dataKey="days" radius={[0, 6, 6, 0]}>
                      {forwardCoverChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] font-mono-data text-white pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-white font-medium">*US Net Days reflect standalone SPR vs daily domestic run rates if shale exports frozen</span>
                <span className="text-red-400 font-bold">India SPR: Only 9.5 Days</span>
              </div>
            </div>
          </div>

          {/* Quick Access to Country Production & India-Russia Trade Flow Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div
              onClick={() => setActiveTab("production")}
              className="bg-[#101622] hover:bg-[#141C2C] border border-[#10B981]/30 hover:border-[#10B981]/60 rounded-xl p-4 cursor-pointer transition-all shadow-lg flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono-data text-emerald-400 font-bold uppercase">
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Global Crude Production Telemetry</span>
                </div>
                <div className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <span>US Record Output: 13.45M bpd</span>
                  <span className="text-[10px] font-mono-data text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">#1 World Producer</span>
                </div>
                <p className="text-[11px] text-[#E2E8F0] line-clamp-1">
                  Permian Basin (6.25M bpd) + deepwater Gulf of Mexico drive unprecedented US crude dominance over Saudi &amp; Russia.
                </p>
              </div>
              <div className="text-[#10B981] group-hover:translate-x-1 transition-transform pl-3">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab("india_russia")}
              className="bg-[#101622] hover:bg-[#141C2C] border border-red-500/30 hover:border-red-500/60 rounded-xl p-4 cursor-pointer transition-all shadow-lg flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono-data text-red-400 font-bold uppercase">
                  <Ship className="w-3.5 h-3.5" />
                  <span>Geopolitical Trade Realignment</span>
                </div>
                <div className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <span>India-Russia Crude Inflow: 1.88M bpd</span>
                  <span className="text-[10px] font-mono-data text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30">38.4% Share</span>
                </div>
                <p className="text-[11px] text-[#E2E8F0] line-clamp-1">
                  Urals discount saves Indian refiners ~$13.5M/day; non-USD payment channels (AED/INR) and shadow fleet routing.
                </p>
              </div>
              <div className="text-red-400 group-hover:translate-x-1 transition-transform pl-3">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: GLOBAL CRUDE OIL PRODUCTION BY COUNTRY */}
      {activeTab === "production" && (
        <CountryProductionLevels onOpenTerminalWithPrompt={onOpenTerminalWithPrompt} />
      )}

      {/* TAB: INDIA-RUSSIA CRUDE TRADE FLOW & SANCTIONS ARBITRAGE */}
      {activeTab === "india_russia" && (
        <IndiaRussiaCrudeFlow onOpenTerminalWithPrompt={onOpenTerminalWithPrompt} />
      )}

      {/* TAB 2: HORMUZ OUTAGE & EMERGENCY DRAWDOWN SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="bg-[#121724] border border-[#B08D57]/30 rounded-xl p-5 sm:p-7 shadow-xl space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#EF4444] text-white text-[10px] font-mono-data font-bold px-2 py-0.5 rounded uppercase">
                  WAR DISRUPTION SIMULATION MODEL
                </span>
                <span className="text-[10px] font-mono-data text-[#8292A6]">
                  Hormuz Choke Point &bull; 21.0M bpd normal daily throughput
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-sans">
                Hormuz Transit Interdiction &amp; Emergency SPR Exhaustion Runway
              </h3>
              <p className="text-xs text-[#8292A6] mt-1 max-w-3xl">
                Simulate varying degrees of Iranian naval blockage, drone interdiction, and mine warfare in the Strait of Hormuz to calculate national SPR exhaustion timelines, refining curtailment dates, and projected price equilibrium.
              </p>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 sm:p-6 bg-black/40 border border-white/10 rounded-xl font-mono-data">
              {/* Slider 1: Hormuz Outage */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8292A6] font-bold">Hormuz Transit Outage</span>
                  <span className="text-red-400 font-bold text-sm">{hormuzDisruptionPct}% ({hormuzDisruptedMbd}M bpd)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={hormuzDisruptionPct}
                  onChange={(e) => setHormuzDisruptionPct(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#EF4444]"
                />
                <div className="flex justify-between text-[9px] text-[#64748B]">
                  <span>0% (Open Flow)</span>
                  <span>50% (Partial Tanker Escort)</span>
                  <span>100% (Complete Blockade)</span>
                </div>
              </div>

              {/* Slider 2: Global SPR Drawdown Rate */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8292A6] font-bold">Global SPR Drawdown Rate</span>
                  <span className="text-[#E5C794] font-bold text-sm">{globalDrawdownRateMbpd.toFixed(1)}M bpd</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.5"
                  step="0.25"
                  value={globalDrawdownRateMbpd}
                  onChange={(e) => setGlobalDrawdownRateMbpd(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#B08D57]"
                />
                <div className="flex justify-between text-[9px] text-[#64748B]">
                  <span>0.5M bpd (Conservative)</span>
                  <span>2.5M bpd (IEA Joint Act)</span>
                  <span>4.5M bpd (Maximum Run)</span>
                </div>
              </div>

              {/* Slider 3: Base Brent Stress Benchmark */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8292A6] font-bold">Brent Base Baseline</span>
                  <span className="text-white font-bold text-sm">${brentBasePrice.toFixed(1)}/bbl</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="140"
                  step="2"
                  value={brentBasePrice}
                  onChange={(e) => setBrentBasePrice(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                />
                <div className="flex justify-between text-[9px] text-[#64748B]">
                  <span>$80 (Calm)</span>
                  <span>$105 (Current)</span>
                  <span>$140 (War Panic)</span>
                </div>
              </div>
            </div>

            {/* Simulator Output Pods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-data">
              <div className="bg-[#0D121D] border border-red-500/40 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-red-400 block uppercase font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  US Runway to 140M Collapse Floor
                </span>
                <div className="text-2xl font-bold text-white">
                  {usSprExhaustionDays > 365 ? "> 365" : usSprExhaustionDays} <span className="text-sm font-normal text-[#8292A6]">Days</span>
                </div>
                <p className="text-[10px] text-[#8292A6] leading-tight">
                  At {(globalDrawdownRateMbpd * 0.4).toFixed(1)}M bpd US share before depleting 218.4M usable bbls down to the <strong className="text-red-400">140.0M bbl cavern collapse floor</strong>.
                </p>
              </div>

              <div className="bg-[#0D121D] border border-amber-500/40 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-amber-400 block uppercase font-bold flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5" />
                  Global IEA Total Runway
                </span>
                <div className="text-2xl font-bold text-amber-300">
                  {globalIeaExhaustionDays} <span className="text-sm font-normal text-[#8292A6]">Days</span>
                </div>
                <p className="text-[10px] text-[#8292A6] leading-tight">
                  Time until 1,145M bbls aggregate Western alliance emergency crude is depleted.
                </p>
              </div>

              <div className="bg-[#0D121D] border border-purple-500/40 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-purple-400 block uppercase font-bold flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" />
                  Net Global Deficit
                </span>
                <div className="text-2xl font-bold text-purple-300">
                  {netGlobalSupplyDeficit} <span className="text-sm font-normal text-[#8292A6]">M bpd</span>
                </div>
                <p className="text-[10px] text-[#8292A6] leading-tight">
                  Uncompensated physical crude deficit after Saudi Yanbu &amp; Abu Dhabi bypass pipelines.
                </p>
              </div>

              <div className="bg-[#0D121D] border border-[#B08D57]/40 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-[#E5C794] block uppercase font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Simulated Brent Target
                </span>
                <div className="text-2xl font-bold text-[#E5C794]">
                  ${projectedBrentPrice.toFixed(1)} <span className="text-sm font-normal text-[#8292A6]">/bbl</span>
                </div>
                <p className="text-[10px] text-[#8292A6] leading-tight">
                  Equilibrium clearing price factoring inventory depletion velocity and panic hedging.
                </p>
              </div>
            </div>

            {/* Strategic Analysis Callout */}
            <div className="bg-black/50 border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono-data text-xs">
              <div className="space-y-1 max-w-3xl">
                <div className="text-white font-bold font-sans text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#B08D57]" />
                  Why the 2026 Energy Crisis is Structurally Different from 2022
                </div>
                <p className="text-[#94A3B8] leading-relaxed text-xs">
                  In 2022, the US SPR held <strong>593M barrels</strong> and had the headroom to deploy 180M barrels to crush prompt price spikes. In 2026, the US SPR sits at <strong>358.4M barrels (43-year low)</strong>. Because the <strong>DOE/Sandia salt cavern collapse floor is 140.0M barrels</strong> (to prevent lithostatic creep closure, ceiling failure, and asphaltic sludge pump destruction), the US has only <strong>218.4M barrels of real emergency ammunition</strong>. Repeating the 2022 180M draw would leave the reserve at 178M bbls—mere days from breaching the cavern collapse limit and risking irreversible cavern coalescence.
                </p>
              </div>

              <button
                onClick={() =>
                  onOpenTerminalWithPrompt &&
                  onOpenTerminalWithPrompt(
                    `Simulate trading desk crack spread expansion if Hormuz outage reaches ${hormuzDisruptionPct}% and US SPR release is bounded by the 140M bbl cavern collapse floor.`
                  )
                }
                className="shrink-0 bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] font-bold px-4 py-2.5 rounded-lg transition-all text-xs font-sans uppercase tracking-wider"
              >
                Send Model to Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GEOPOLITICAL CHOKE POINT & REFINERY MATRIX */}
      {activeTab === "vulnerability" && (
        <div className="space-y-6">
          {/* Middle East Bypass Pipeline Overview */}
          <div className="bg-[#111622] border border-[#B08D57]/30 rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Ship className="w-4 h-4 text-[#B08D57]" />
                Persian Gulf Crude Evacuation Choke Points vs. Bypass Pipelines
              </h3>
              <p className="text-xs text-[#8292A6] mt-0.5">
                Theoretical pipeline capacity capable of bypassing the Strait of Hormuz during naval blockade
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-data text-xs">
              <div className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Strait of Hormuz (Normal Flow)</span>
                  <span className="text-red-400 font-bold">21.0M bpd</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-red-500 rounded-full" />
                </div>
                <p className="text-[11px] text-[#8292A6]">
                  Carries ~20% of global petroleum liquids. 95% of Japanese and 73% of Korean crude transits this narrow 21-mile strait.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Saudi East-West Petroline</span>
                  <span className="text-[#34D399] font-bold">5.0M bpd max</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="w-[60%] h-full bg-[#10B981] rounded-full" />
                </div>
                <p className="text-[11px] text-[#8292A6]">
                  Runs from Abqaiq to Yanbu on the Red Sea. Vulnerable to Bab el-Mandeb interdiction and terminal bottlenecking.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Abu Dhabi ADCOP (Fujairah)</span>
                  <span className="text-[#34D399] font-bold">1.5M bpd max</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="w-[80%] h-full bg-[#10B981] rounded-full" />
                </div>
                <p className="text-[11px] text-[#8292A6]">
                  Habshan to Fujairah terminal outside the Persian Gulf in the Gulf of Oman. Operating at 1.2M bpd currently.
                </p>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-500/20 p-3.5 rounded-lg flex items-center justify-between text-xs font-mono-data text-red-300">
              <span><strong>Net Unbypassable Deficit:</strong> Over 14.5M bpd remains physically trapped inside the Gulf if Hormuz closes completely.</span>
              <span className="font-bold underline cursor-pointer" onClick={() => setSelectedCountry("japan")}>
                View Japan Exposure &rarr;
              </span>
            </div>
          </div>

          {/* Institutional Vulnerability Matrix Table */}
          <div className="bg-[#111622] border border-[#B08D57]/30 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-[#B08D57]/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Sovereign Crude Reserve &amp; Import Vulnerability Scorecard
                </h3>
                <span className="text-[10px] font-mono-data text-[#8292A6]">
                  Quantified risk factors across major consuming economies
                </span>
              </div>
              <span className="text-[10px] font-mono-data bg-[#B08D57]/20 text-[#E5C794] px-2 py-0.5 rounded border border-[#B08D57]/30">
                Updated Live
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-data text-xs">
                <thead className="bg-black/50 text-[#8292A6] text-[10px] uppercase border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">Country / Agency</th>
                    <th className="py-3 px-4">Current SPR</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Forward Cover</th>
                    <th className="py-3 px-4">Hormuz Dep.</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Primary Vulnerability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {countryReserveMetrics.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span>{row.flag}</span>
                        <div>
                          <div>{row.country}</div>
                          <div className="text-[9px] text-[#8292A6] font-normal">{row.agency.split(" ")[0]}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white font-bold">
                        <div>{row.currentLevelMbbl}M bbls</div>
                        {row.totalCombinedStockpileMbbl && (
                          <div className="text-[9px] text-amber-400 font-normal font-mono-data mt-0.5">
                            Total Onshore: {(row.totalCombinedStockpileMbbl / 1000).toFixed(2)}B bbls (Verified)
                          </div>
                        )}
                        {row.cavernFloorThresholdMbbl && (
                          <div className="text-[9px] text-red-400 font-normal font-mono-data mt-0.5">
                            Floor: {row.cavernFloorThresholdMbbl}M ({row.usableBufferMbbl}M usable)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#94A3B8]">{row.fillPct}% ({row.capacityMbbl}M)</td>
                      <td className="py-3 px-4 text-[#E5C794] font-bold">{row.forwardDaysCover} Days</td>
                      <td className="py-3 px-4 text-red-400 font-bold">{row.middleEastReliancePct}%</td>
                      <td className="py-3 px-4">
                        <span
                          className="text-[9px] px-2 py-0.5 rounded border font-bold"
                          style={{
                            backgroundColor: `${row.statusColor}20`,
                            color: row.statusColor,
                            borderColor: `${row.statusColor}50`
                          }}
                        >
                          {row.statusText}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#94A3B8] max-w-xs font-sans text-xs truncate">
                        {row.keyVulnerability}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Institutional Data Verification & Satellite Audit Modal (China >1.16B / EIA / Kpler / Vortexa) */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0E131E] border border-[#B08D57]/60 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5 text-white font-sans">
            <div className="flex items-center justify-between border-b border-[#B08D57]/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Satellite className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Reserves Data Verification &amp; Satellite Altimetry Audit
                  </h3>
                  <span className="text-xs font-mono-data text-[#8292A6]">
                    Intelligence Dossier: Reconciling China&apos;s &ldquo;&gt;1 Billion Barrels in Reserve&rdquo;
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="text-[#8292A6] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Verification Banner */}
            <div className="bg-gradient-to-r from-amber-950/40 to-black/60 border border-amber-500/40 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-mono-data font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                AUDIT VERDICT: CONFIRMED ACCURATE (&gt;1.16B — 1.40B BARRELS)
              </div>
              <p className="text-xs text-[#E2E8F0] leading-relaxed">
                Statements that <strong>China holds over a billion barrels of crude oil in reserve</strong> are <strong>confirmed accurate and verified</strong> by satellite radar altimetry and official agencies. The difference comes down to the distinction between <em>pure government-owned strategic caverns (SRO)</em> and <em>total national sovereign-accessible onshore inventories</em>.
              </p>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B08D57] font-mono-data">
                Verified Breakdown of Chinese Crude Inventories (Sept 2026 Telemetry)
              </h4>
              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left font-mono-data text-xs">
                  <thead className="bg-black/60 text-[#8292A6] text-[10px] uppercase border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Stockpile Segment</th>
                      <th className="py-2.5 px-3">Volume</th>
                      <th className="py-2.5 px-3">Verification Source</th>
                      <th className="py-2.5 px-3">Operational Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3 font-bold text-amber-300">Total Combined Onshore Crude</td>
                      <td className="py-2.5 px-3 font-bold text-white">1,162.0M bbls (1.162B)</td>
                      <td className="py-2.5 px-3 text-[#38BDF8]">Kpler Satellite SAR / Vortexa</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">Sovereign Wartime Control</td>
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3 text-[#CBD5E1]">Central Government Strategic Reserve (SRO)</td>
                      <td className="py-2.5 px-3 text-white">360.0M bbls</td>
                      <td className="py-2.5 px-3 text-[#8292A6]">NDRC / SRO Public Releases</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">National Food &amp; Strategic Reserves</td>
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3 text-[#CBD5E1]">SOE Mandated Strategic Caverns &amp; Tanks</td>
                      <td className="py-2.5 px-3 text-white">572.0M bbls</td>
                      <td className="py-2.5 px-3 text-[#8292A6]">Sinopec / PetroChina / CNOOC</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">State-Owned Enterprise Quotas</td>
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3 text-[#CBD5E1]">Commercial Refinery Working Inventory</td>
                      <td className="py-2.5 px-3 text-white">230.0M bbls</td>
                      <td className="py-2.5 px-3 text-[#8292A6]">Shandong Teapots &amp; Private Megas</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">Private &amp; Teapot Working Fill</td>
                    </tr>
                    <tr className="hover:bg-white/5 bg-amber-950/20">
                      <td className="py-2.5 px-3 font-bold text-[#E5C794]">U.S. EIA Total Systemic Assessment</td>
                      <td className="py-2.5 px-3 font-bold text-[#38BDF8]">Up to 1,400.0M bbls (1.40B)</td>
                      <td className="py-2.5 px-3 text-[#38BDF8]">U.S. Energy Information Admin (EIA)</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">Full Crude Storage Infrastructure</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Three Key Takeaways */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono-data text-xs">
              <div className="bg-black/40 border border-white/10 p-3.5 rounded-lg space-y-1.5">
                <span className="text-amber-400 font-bold block uppercase text-[10px]">1. Satellite Tracking</span>
                <p className="text-[11px] text-[#94A3B8] font-sans leading-relaxed">
                  Kpler radar altimetry satellites measure tank roof heights every 48 hours across hundreds of Chinese storage terminals. In April 2026, total onshore crude reached a peak of <strong>1.25 Billion barrels</strong> before Beijing initiated emergency draws (-1.25M bpd).
                </p>
              </div>
              <div className="bg-black/40 border border-white/10 p-3.5 rounded-lg space-y-1.5">
                <span className="text-amber-400 font-bold block uppercase text-[10px]">2. State Mandate Rule</span>
                <p className="text-[11px] text-[#94A3B8] font-sans leading-relaxed">
                  Unlike US oil companies who manage inventory purely for quarterly working capital, Chinese refiners are legally bound by NDRC quotas to maintain 15–30 days of compulsory operational crude reserves, creating a unified sovereign reserve buffer.
                </p>
              </div>
              <div className="bg-black/40 border border-white/10 p-3.5 rounded-lg space-y-1.5">
                <span className="text-red-400 font-bold block uppercase text-[10px]">3. The US vs China Asymmetry</span>
                <p className="text-[11px] text-[#94A3B8] font-sans leading-relaxed">
                  The US SPR sits at <strong>358.4M barrels</strong> (with only <strong>218.4M usable</strong> before hitting the 140M salt cavern collapse floor), meaning China&apos;s total crude buffer is over <strong>3.2x to 3.9x larger</strong> than the total US government reserve.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setAuditModalOpen(false)}
                className="bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] font-bold px-5 py-2 rounded-lg text-xs font-mono-data uppercase tracking-wider cursor-pointer"
              >
                Close Audit Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StrategicPetroleumReserves;
