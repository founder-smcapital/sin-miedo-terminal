import React, { useState } from "react";
import { MacroDataState } from "../../types";
import {
  Maximize2,
  Minimize2,
  Ship,
  Cpu,
  DollarSign,
  Activity,
  Anchor,
  Navigation,
  ShieldAlert,
  BarChart3,
  Globe,
  Layers,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Coins,
  CheckCircle2,
  FileText,
  Search
} from "lucide-react";
import { ShadowFleetCorrelationChart } from "./ShadowFleetCorrelationChart";
import { ChartExportDropdown } from "../ChartExportDropdown";
import { exportShadowFleetPdf, exportChartElementAsPng } from "../../utils/chartExportUtils";

interface IranShadowFleetEngineProps {
  data: MacroDataState["engines"]["iranShadowFleet"];
  brentPrice?: number;
  onExpandToggle?: () => void;
  isExpanded?: boolean;
}

export type CorridorFilter = "all" | "iran" | "russia" | "syndicate";

type TabType = "Pricing Matrix" | "24M Correlation [D3]" | "Fleet Radar" | "Manifest" | "STS Hubs" | "Flows" | "Syndicate Nexus";

interface DarkHullRecord {
  imo: string;
  name: string;
  theater: "iran" | "russia" | "syndicate";
  corridor: "iran" | "russia-india" | "russia-china" | "syndicate";
  flag: string;
  dwt: string;
  cargo: string;
  piCoverage: string;
  stsHub: string;
  destination: string;
  statusBadge: string;
  statusColor: string;
  settlement: string;
}

const darkHullManifestData: DarkHullRecord[] = [
  // IRANIAN SHADOW FLEET (412 Hulls Core Sample)
  {
    imo: "IMO 9182394",
    name: "VLCC Ocean Glory",
    theater: "iran",
    corridor: "iran",
    flag: "Cook Islands (Spoofed)",
    dwt: "298,000 MT",
    cargo: "2.0M bbl Iranian Heavy",
    piCoverage: "Kish P&I / Unregulated",
    stsHub: "Lingga Anchorage (Indonesia)",
    destination: "Shandong Teapot (Dongying)",
    statusBadge: "DARK AIS (84h)",
    statusColor: "#FF8585",
    settlement: "CIPS Direct RMB"
  },
  {
    imo: "IMO 9238411",
    name: "Aframax Titan Star",
    theater: "iran",
    corridor: "iran",
    flag: "Panama (OFAC Sanctioned)",
    dwt: "115,000 MT",
    cargo: "750k bbl South Pars Condensate",
    piCoverage: "Opaque Front Club (Dubai)",
    stsHub: "Riau Archipelago",
    destination: "Rizhao Port Berth #4 (China)",
    statusBadge: "CIRCLE SPOOFING",
    statusColor: "#B08D57",
    settlement: "Gold Barter Escrow"
  },
  {
    imo: "IMO 9145822",
    name: "VLCC Red Dragon",
    theater: "iran",
    corridor: "iran",
    flag: "Gabon",
    dwt: "305,000 MT",
    cargo: "2.1M bbl 'Malaysian Blend' (Iranian Origin)",
    piCoverage: "Offshore Front Club",
    stsHub: "Karimun Outer Anchorage",
    destination: "Qingdao Maritime Terminal",
    statusBadge: "LAUNDERED BLEND",
    statusColor: "#38BDF8",
    settlement: "CIPS Escrow (Kunlun)"
  },
  {
    imo: "IMO 9198305",
    name: "Suezmax Persepolis Star",
    theater: "iran",
    corridor: "iran",
    flag: "Iran (NITC Fleet)",
    dwt: "160,000 MT",
    cargo: "1.0M bbl Iranian Light (Kharg)",
    piCoverage: "Kish P&I Club",
    stsHub: "Bandar Abbas Staging",
    destination: "Baniyas Refinery (Syria Gov)",
    statusBadge: "STATE PROTECTED",
    statusColor: "#10B981",
    settlement: "Bilateral Credit Line"
  },
  {
    imo: "IMO 9205514",
    name: "Aframax Zagros Spirit",
    theater: "iran",
    corridor: "iran",
    flag: "Palau (Sanctioned Registry)",
    dwt: "105,000 MT",
    cargo: "700k bbl Soroush Heavy Blend",
    piCoverage: "Tehran Reinsurance Mutual",
    stsHub: "Riau STS Zone",
    destination: "Yantai Teapot Port (China)",
    statusBadge: "GHOST TRANSHIPMENT",
    statusColor: "#E5C794",
    settlement: "CIPS RMB Escrow"
  },
  {
    imo: "IMO 9136589",
    name: "VLCC Aryan Pride",
    theater: "iran",
    corridor: "iran",
    flag: "Cameroon (FOC Registry)",
    dwt: "310,000 MT",
    cargo: "2.05M bbl South Pars Condensate",
    piCoverage: "Dubai Front Holding",
    stsHub: "Lingga STS Anchorage",
    destination: "Jose Terminal (Venezuela Swap)",
    statusBadge: "TRANS-ATLANTIC VOYAGE",
    statusColor: "#A78BFA",
    settlement: "Physical Gold & Diluent Swap"
  },

  // RUSSIAN SHADOW FLEET (685 Hulls Core Sample - 88% to India)
  {
    imo: "IMO 9243306",
    name: "Suezmax Geroi Rossii",
    theater: "russia",
    corridor: "russia-india",
    flag: "Gabon (Flag of Convenience)",
    dwt: "156,000 MT",
    cargo: "1.0M bbl Russian Urals (Primorsk)",
    piCoverage: "Ingosstrakh (Russian Non-Western)",
    stsHub: "Skaw / Danish Straits Bypass",
    destination: "Vadinar Berth #2 (Nayara Energy / India)",
    statusBadge: "88% SHADOW TRANSIT",
    statusColor: "#E5C794",
    settlement: "UAE Dirhams (AED)"
  },
  {
    imo: "IMO 9312896",
    name: "Aframax Sagar Jyoti (Ex-Nautilus)",
    theater: "russia",
    corridor: "russia-india",
    flag: "Cook Islands",
    dwt: "109,000 MT",
    cargo: "720k bbl Russian Urals (Novorossiysk)",
    piCoverage: "Al-Bahri Marine (Oman / Non-Western)",
    stsHub: "Lakonikos Gulf STS (Greece)",
    destination: "Sikka Single Point Mooring (Reliance Jamnagar)",
    statusBadge: "DISCHARGING GUJARAT",
    statusColor: "#10B981",
    settlement: "INR Vostro (UCO Bank)"
  },
  {
    imo: "IMO 9197832",
    name: "VLCC Caspian Pioneer",
    theater: "russia",
    corridor: "russia-india",
    flag: "Palau (Sanctioned Registry)",
    dwt: "300,000 MT",
    cargo: "2.0M bbl Urals (Ceuta Aframax STS Transfer)",
    piCoverage: "Opaque Gulf Mutual",
    stsHub: "Ceuta / Alboran Sea STS",
    destination: "Paradip Port SPM (Indian Oil Corp)",
    statusBadge: "EN ROUTE CAPE",
    statusColor: "#F59E0B",
    settlement: "UAE Dirhams (AED)"
  },
  {
    imo: "IMO 9345512",
    name: "Aframax Baltika Ice",
    theater: "russia",
    corridor: "russia-india",
    flag: "Gabon",
    dwt: "115,000 MT",
    cargo: "750k bbl Urals (Ust-Luga / Ice Class)",
    piCoverage: "Russian P&I Reinsurance",
    stsHub: "Kalamata / Peloponnese STS",
    destination: "Mundra Port Crude Terminal (India)",
    statusBadge: "MEDITERRANEAN SHUTTLE",
    statusColor: "#38BDF8",
    settlement: "AED / INR Hybrid"
  },
  {
    imo: "IMO 9285861",
    name: "Aframax Altai Star",
    theater: "russia",
    corridor: "russia-china",
    flag: "Liberia (Spoofed Identity)",
    dwt: "114,000 MT",
    cargo: "740k bbl ESPO Blend (Kozmino)",
    piCoverage: "Russian P&I Reinsurance",
    stsHub: "Yeosu Anchorage (East Sea)",
    destination: "Dongying Port Teapot Terminal",
    statusBadge: "PACIFIC SHUTTLE",
    statusColor: "#A78BFA",
    settlement: "Direct RMB Clearing"
  },
  {
    imo: "IMO 9308821",
    name: "Suezmax Sakhalin Star",
    theater: "russia",
    corridor: "russia-china",
    flag: "Panama",
    dwt: "158,000 MT",
    cargo: "1.0M bbl Sokol Crude (De-Kastri)",
    piCoverage: "Ingosstrakh Non-Western",
    stsHub: "La Perouse Strait STS",
    destination: "Tianjin Petrochemical Berth #1",
    statusBadge: "FAR EAST EXPORT",
    statusColor: "#10B981",
    settlement: "CIPS RMB Escrow"
  },

  // SYNDICATE & FLEET-SHARING ASSETS (68 Hulls Verified Across Both Theaters)
  {
    imo: "IMO 9214739",
    name: "Suezmax Phoenix Sea (Dual-Theater)",
    theater: "syndicate",
    corridor: "syndicate",
    flag: "Panama",
    dwt: "159,000 MT",
    cargo: "1.05M bbl Urals / Ex-Kharg Trader",
    piCoverage: "Ingosstrakh / Kish Shared",
    stsHub: "Fujairah Outer Anchorage",
    destination: "Mundra Port Crude Terminal (India)",
    statusBadge: "DUAL FLEET ASSET",
    statusColor: "#EC4899",
    settlement: "AED / INR Hybrid"
  },
  {
    imo: "IMO 9276531",
    name: "Aframax Golden Sun (Dual-Theater)",
    theater: "syndicate",
    corridor: "syndicate",
    flag: "Gabon",
    dwt: "110,000 MT",
    cargo: "720k bbl Dual Rotation (Urals & South Pars)",
    piCoverage: "Dubai Front Shell Mutual",
    stsHub: "Fujairah / Sohar Bunkering",
    destination: "Shandong Teapot & Sikka Alternating",
    statusBadge: "CROSS-THEATER ROTATION",
    statusColor: "#F43F5E",
    settlement: "AED / CIPS Dual Clearing"
  }
];

export interface StsHubRecord {
  id: string;
  name: string;
  theater: "iran" | "russia" | "syndicate";
  theaterLabel: string;
  theaterColor: string;
  badge: string;
  pairs: string;
  description: string;
  servicing: string;
  servicingColor: string;
}

const stsHubsData: StsHubRecord[] = [
  {
    id: "lakonikos",
    name: "Lakonikos Gulf / Kalamata (Greece)",
    theater: "russia",
    theaterLabel: "RUSSIA CORRIDOR",
    theaterColor: "#EF4444",
    badge: "DEFCON 1",
    pairs: "3 Aframax-to-VLCC Consolidation Pairs",
    description: "Primary Mediterranean transshipment node for Russian Urals loaded in Baltic/Black Sea, consolidating onto supertankers before transiting Suez or Cape to Gujarat, India.",
    servicing: "Servicing: 88% India Shadow Fleet Corridor",
    servicingColor: "text-amber-300"
  },
  {
    id: "riau",
    name: "Riau Archipelago / Karimun",
    theater: "iran",
    theaterLabel: "IRAN CORRIDOR",
    theaterColor: "#10B981",
    badge: "DEFCON 1",
    pairs: "4 Active VLCC Pairs Transferring",
    description: "Primary Iranian origin-laundering zone. Crude rebranded as 'Malaysian Blend' before heading to independent teapots in Shandong.",
    servicing: "Servicing: Iran → China Teapot Corridor",
    servicingColor: "text-[#10B981]"
  },
  {
    id: "ceuta",
    name: "Ceuta / Alboran Sea (Gibraltar)",
    theater: "russia",
    theaterLabel: "RUSSIA CORRIDOR",
    theaterColor: "#EF4444",
    badge: "ACTIVE",
    pairs: "2 Suezmax Consolidation Pairs",
    description: "Atlantic staging ground off North Africa. Baltic Urals ice-class feeder tankers transfer cargo to VLCCs for the long haul around Africa to Indian refiners.",
    servicing: "Servicing: Russian Baltic → India Cape Voyage",
    servicingColor: "text-amber-300"
  },
  {
    id: "yeosu",
    name: "Yeosu & Kozmino Anchorage",
    theater: "russia",
    theaterLabel: "RUSSIA PACIFIC",
    theaterColor: "#38BDF8",
    badge: "ACTIVE",
    pairs: "3 High-Speed Shuttle Tankers",
    description: "Pacific transfer zone for Russian ESPO crude from Kozmino pipeline terminus, transferring to Chinese buyers with short 3-day turnaround times.",
    servicing: "Servicing: Russia Pacific → China Teapots",
    servicingColor: "text-[#38BDF8]"
  },
  {
    id: "lingga",
    name: "Lingga & Tanjung Sedili",
    theater: "iran",
    theaterLabel: "IRAN CORRIDOR",
    theaterColor: "#10B981",
    badge: "ACTIVE",
    pairs: "Floating Condensate Storage",
    description: "Floating buffer storage holding South Pars condensate and fuel oil during teapot refinery quota transition windows in China.",
    servicing: "Servicing: Iranian Condensate Buffer",
    servicingColor: "text-[#10B981]"
  },
  {
    id: "fujairah",
    name: "Fujairah & Sohar Outer Anchorage",
    theater: "syndicate",
    theaterLabel: "DUAL SYNDICATE",
    theaterColor: "#A855F7",
    badge: "SYNDICATE HUB",
    pairs: "Dark Bunkering & Repositioning",
    description: "The operational nervous system of the dark fleet. Ships take on dark bunker fuel, change offshore technical managers, and swap crews before re-entering Persian Gulf or Baltic rotations.",
    servicing: "Servicing: Dual-Corridor Fleet Management",
    servicingColor: "text-purple-400"
  }
];

export const IranShadowFleetEngine: React.FC<IranShadowFleetEngineProps> = ({
  data,
  brentPrice = 105.25,
  onExpandToggle,
  isExpanded = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<TabType>("Pricing Matrix");
  const [corridorFilter, setCorridorFilter] = useState<CorridorFilter>("all");
  const [manifestCorridor, setManifestCorridor] = useState<"all" | "iran" | "russia-india" | "russia-china" | "syndicate">("all");
  const [stsFilter, setStsFilter] = useState<"all" | "iran" | "russia" | "syndicate">("all");
  const [flowFilter, setFlowFilter] = useState<"all" | "iran" | "russia">("all");
  const [manifestSearch, setManifestSearch] = useState<string>("");

  const handleCorridorChange = (corridor: CorridorFilter) => {
    setCorridorFilter(corridor);
    if (corridor === "iran") {
      setManifestCorridor("iran");
      setStsFilter("iran");
      setFlowFilter("iran");
    } else if (corridor === "russia") {
      setManifestCorridor("russia-india");
      setStsFilter("russia");
      setFlowFilter("russia");
    } else if (corridor === "syndicate") {
      setManifestCorridor("syndicate");
      setStsFilter("syndicate");
      setFlowFilter("all");
    } else {
      setManifestCorridor("all");
      setStsFilter("all");
      setFlowFilter("all");
    }
  };

  const brentBenchmark = brentPrice;

  // Realized Netback pricing models ($/bbl)
  const iranianLightPrice = brentBenchmark - 7.90;
  const iranianHeavyPrice = brentBenchmark - 12.02;
  const southParsPrice = brentBenchmark - 9.62;
  const uralsPrice = brentBenchmark - 7.20; // Current stabilized dark fleet discount to Brent (-$7.20)
  const espoPrice = brentBenchmark - 3.80;  // Kozmino Pacific ESPO discount to Brent (-$3.80)
  const sokolPrice = brentBenchmark - 4.50; // Sakhalin Sokol discount (-$4.50)

  // Combined Dark Fleet Real-world aggregates
  const totalDarkHulls = 1097; // 412 Iran + 685 Russia global
  const russiaIndiaShadowShare = "88.0%";
  const combinedOutflowBpd = "3.27M bpd"; // 1.62M Iran + 1.65M Russian shadow to India
  const combinedCumulativeWealth = "$139.4B"; // $77.0B Iran + $62.4B Russia-to-India
  const totalAisSpoofingBeacons = 342; // 184 Persian Gulf/Malacca + 158 Baltic/Med/Black Sea

  // Filter manifest based on sub-selection or top theater and search term
  const filteredManifest = darkHullManifestData.filter((item) => {
    let matchesCorridor = true;
    if (manifestCorridor === "all") {
      if (corridorFilter === "iran") matchesCorridor = item.theater === "iran";
      else if (corridorFilter === "russia") matchesCorridor = item.theater === "russia";
      else if (corridorFilter === "syndicate") matchesCorridor = item.theater === "syndicate";
      else matchesCorridor = true;
    } else if (manifestCorridor === "iran") {
      matchesCorridor = item.theater === "iran" || item.corridor === "iran";
    } else if (manifestCorridor === "russia-india") {
      matchesCorridor = item.corridor === "russia-india";
    } else if (manifestCorridor === "russia-china") {
      matchesCorridor = item.corridor === "russia-china";
    } else if (manifestCorridor === "syndicate") {
      matchesCorridor = item.theater === "syndicate" || item.corridor === "syndicate";
    }

    if (!matchesCorridor) return false;

    if (manifestSearch.trim()) {
      const q = manifestSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.imo.toLowerCase().includes(q) ||
        item.flag.toLowerCase().includes(q) ||
        item.cargo.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.stsHub.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered STS hubs
  const filteredStsHubs = stsHubsData.filter((hub) => {
    if (stsFilter === "all") return true;
    if (stsFilter === "iran") return hub.theater === "iran";
    if (stsFilter === "russia") return hub.theater === "russia";
    if (stsFilter === "syndicate") return hub.theater === "syndicate";
    return true;
  });

  return (
    <div
      id="iran-shadow-fleet-engine-card"
      className={
        isExpanded
          ? "space-y-6 text-[#EDE9DE]"
          : "bg-[#101622] border border-[#B08D57]/35 hover:border-[#B08D57]/55 rounded-xl p-4 sm:p-6 transition-all shadow-2xl flex flex-col justify-between relative group overflow-hidden"
      }
    >
      {/* Subtle top brass highlight */}
      {!isExpanded && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent pointer-events-none" />
      )}

      {/* Top Header & Sub-Tabs */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/30">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#A6291C]/20 border border-[#A6291C]/40 text-[#FF8585]">
                <Ship className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif italic text-xl sm:text-2xl font-bold tracking-tight text-[#FBF8F1]" style={{ fontFamily: "Georgia, 'Newsreader', serif" }}>
                  Global Shadow-Fleet &amp; Sanctions Radar
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider bg-black/70 text-[#E5C794] border border-[#B08D57]/45 px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C794] animate-pulse" />
                {corridorFilter === "iran" ? "412 IRAN HULLS" : corridorFilter === "russia" ? "685 RUSSIA HULLS" : "1,097 DUAL-CORRIDOR HULLS"}
              </span>
              <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider bg-amber-950/70 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded shadow-sm">
                88.0% RUSSIA→INDIA DARK
              </span>
              <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider bg-black/70 text-[#34D399] border border-[#10B981]/45 px-2.5 py-0.5 rounded shadow-sm">
                {combinedOutflowBpd} OUTFLOW
              </span>
            </div>
          </div>

          {/* Sub Tab Switcher & Fullscreen */}
          <div className="flex items-center gap-2 max-w-full min-w-0 w-full xl:w-auto">
            <div className="flex items-center bg-black/70 p-1 rounded-lg border border-[#B08D57]/30 text-[10px] font-mono-data overflow-x-auto no-scrollbar max-w-full min-w-0 flex-1 scroll-smooth shadow-inner">
              {(["Pricing Matrix", "24M Correlation [D3]", "Fleet Radar", "Manifest", "STS Hubs", "Flows", "Syndicate Nexus"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-2 sm:px-2.5 py-1 rounded transition-all whitespace-nowrap text-[9px] sm:text-[10px] uppercase font-medium shrink-0 ${
                    activeSubTab === tab
                      ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md scale-105"
                      : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Export Dropdown for Dual-Corridor Shadow-Fleet */}
            <ChartExportDropdown
              chartTitle="Global Dual-Corridor Shadow-Fleet Telemetry & Sanctions Arbitrage"
              chartContainerId="iran-shadow-fleet-engine-card"
              subtitle={`BRENT: $${brentBenchmark.toFixed(2)}/BBL // TOTAL DARK HULLS: ${totalDarkHulls} // 88% INDIA SHADOW FLOW: 1.65M BPD`}
              customPngOptions={[
                {
                  id: "fleet-engine-full-png",
                  label: "Complete Dual-Corridor Engine View",
                  sublabel: "Full card with Iran & Russia telemetry, pricing matrix & STS hubs",
                  iconColor: "#B08D57",
                  onExport: async () => {
                    await exportChartElementAsPng(
                      "iran-shadow-fleet-engine-card",
                      "smc-global-shadow-fleet-dual-corridor",
                      "Global Shadow-Fleet: Iran & Russia Sanctions Evasion Radar",
                      `BRENT: $${brentBenchmark.toFixed(2)} // DARK HULLS: ${totalDarkHulls} // 88% INDIA IMPORT SHARE`
                    );
                  },
                },
                {
                  id: "fleet-active-tab-png",
                  label: `Active Panel: ${activeSubTab}`,
                  sublabel: "Current focused analytics and intelligence matrix",
                  iconColor: "#38BDF8",
                  onExport: async () => {
                    await exportChartElementAsPng(
                      "iran-shadow-fleet-active-panel",
                      `smc-shadow-fleet-${activeSubTab.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
                      `Shadow Fleet Intelligence: ${activeSubTab}`,
                      `SIN MIEDO CAPITAL RADAR // BRENT: $${brentBenchmark.toFixed(2)}/BBL`
                    );
                  },
                },
              ]}
              getCsvData={() => {
                const headers = [
                  "Theater / Stream",
                  "Origin Loading Terminal",
                  "Netback FOB ($/bbl)",
                  "Brent Differential ($/bbl)",
                  "Ghost Freight Net ($/bbl)",
                  "Delivered CIF Price ($/bbl)",
                  "Primary Destination Port & Buyer",
                  "Settlement Mechanism / Currency",
                  "Shadow Fleet Share",
                  "Corridor Flow Volume",
                ];
                const rows = [
                  [
                    "Russian Urals (Maritime)",
                    "Primorsk / Baltic & Novorossiysk",
                    uralsPrice.toFixed(2),
                    "-$7.20",
                    "+$6.20",
                    (uralsPrice + 6.20).toFixed(2),
                    "Sikka (Reliance) & Vadinar (Nayara) / India",
                    "UAE Dirhams (AED) & INR Vostro Accounts",
                    "88.0% via Shadow Fleet",
                    "1.88M bpd total (1.65M bpd dark)",
                  ],
                  [
                    "Russian ESPO Blend",
                    "Kozmino (Pacific)",
                    espoPrice.toFixed(2),
                    "-$3.80",
                    "+$3.65",
                    (espoPrice + 3.65).toFixed(2),
                    "Dongying & Rizhao (China Teapots)",
                    "Direct RMB / CIPS Escrow",
                    "84.5% via Shadow Fleet",
                    "840,000 bpd",
                  ],
                  [
                    "Russian Sokol",
                    "De-Kastri / Sakhalin-I",
                    sokolPrice.toFixed(2),
                    "-$4.50",
                    "+$3.85",
                    (sokolPrice + 3.85).toFixed(2),
                    "Paradip (Indian Oil Corp) / India",
                    "UAE Dirhams (AED)",
                    "92.0% via Shadow Fleet",
                    "190,000 bpd",
                  ],
                  [
                    "Iranian Light (NIOC)",
                    "Kharg Island",
                    iranianLightPrice.toFixed(2),
                    "-$7.90",
                    "+$4.85",
                    (iranianLightPrice + 4.85).toFixed(2),
                    "Shandong Independent Teapots (China)",
                    "CIPS / RMB Escrow (Kunlun Bank)",
                    "100.0% via Shadow Fleet",
                    "980,000 bpd",
                  ],
                  [
                    "Iranian Heavy (NIOC)",
                    "Kharg Island",
                    iranianHeavyPrice.toFixed(2),
                    "-$12.02",
                    "+$4.85",
                    (iranianHeavyPrice + 4.85).toFixed(2),
                    "Shandong Independent Teapots (China)",
                    "CIPS / RMB Escrow (Kunlun Bank)",
                    "100.0% via Shadow Fleet",
                    "640,000 bpd",
                  ],
                  [
                    "South Pars Condensate",
                    "Bandar Assaluyeh",
                    southParsPrice.toFixed(2),
                    "-$9.62",
                    "+$5.10",
                    (southParsPrice + 5.10).toFixed(2),
                    "China & Jose Terminal (Venezuela swaps)",
                    "Physical Gold Bullion / Barter Swaps",
                    "100.0% via Shadow Fleet",
                    "280,000 bpd",
                  ],
                ];
                return {
                  filename: "smc-global-shadow-fleet-telemetry",
                  headers,
                  rows,
                  metaComments: [
                    "SIN MIEDO CAPITAL // GLOBAL SHADOW-FLEET TELEMETRY & SANCTIONS NETBACK",
                    `Active Dark Tankers: ${totalDarkHulls} hulls (Iran: 412, Russia: 685) // 88% of Russian Crude to India via Dark Tankers`,
                    `Total Combined Dark Outflow: ${combinedOutflowBpd} // 24M Cumulative Inflow: ${combinedCumulativeWealth}`,
                    `Brent Benchmark: $${brentBenchmark.toFixed(2)}/bbl`,
                    `Active AIS Spoofing Beacons: ${totalAisSpoofingBeacons} isolated`,
                    `Primary STS Corridors: Lakonikos Gulf (Greece), Ceuta (Gibraltar), Riau (Malaysia), Lingga (Indonesia)`,
                  ],
                };
              }}
              onExportPdf={() => {
                exportShadowFleetPdf(
                  {
                    activeDarkTankers: totalDarkHulls,
                    illicitOutflowBpd: combinedOutflowBpd,
                    outflowChange: "+8.4%",
                    aisSpoofingBeacons: totalAisSpoofingBeacons,
                    stsClustersCount: 9,
                    monitoredTotal: 1380,
                    sarSatellitePass: "Sentinel-1 SAR / Spire Optic Dual-Pass (Kharg, Malacca & Lakonikos)",
                    complianceStatus: "Dual-Corridor Dark Fleet Active // 88% Russia→India & 88.8% Iran→China",
                    deskCode: "SMC_GLOBAL_SHADOW_v6.0",
                    synthesis: "Comprehensive satellite telemetry confirms 88.0% of Russian crude shipped to India travels aboard dark tankers bypassing G7 price cap limits, while Iranian dark crude continues funneling into Shandong teapots via Riau transshipment.",
                  },
                  brentBenchmark
                );
              }}
            />

            {onExpandToggle && (
              <button
                data-export-ignore="true"
                onClick={onExpandToggle}
                title={isExpanded ? "Collapse View" : "Expand Fullscreen"}
                aria-label={isExpanded ? "Collapse View" : "Expand Fullscreen"}
                className="p-1.5 rounded-lg bg-black/70 border border-[#B08D57]/30 text-[#BAC7D5] hover:text-[#E5C794] transition-colors shrink-0 flex items-center justify-center shadow-sm"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Subtitle & Strategic Corridor Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 mb-3">
          <p className="text-[10px] font-mono-data tracking-widest text-[#BAC7D5] uppercase font-semibold">
            DUAL-CORRIDOR SATELLITE RADAR: IRAN (SHANDONG TEAPOTS) &amp; RUSSIA (INDIA 88% CRUDE &amp; CHINA)
          </p>

          {/* Quick Corridor Filter Pills */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-[#B08D57]/20 text-[9px] font-mono-data">
            <span className="text-[#8292A6] px-1.5 uppercase font-medium">Theater:</span>
            <button
              onClick={() => handleCorridorChange("all")}
              className={`px-2 py-0.5 rounded transition-all uppercase font-medium ${
                corridorFilter === "all"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold"
                  : "text-[#BAC7D5] hover:text-[#EDE9DE]"
              }`}
            >
              All Global ({totalDarkHulls})
            </button>
            <button
              onClick={() => handleCorridorChange("iran")}
              className={`px-2 py-0.5 rounded transition-all uppercase font-medium ${
                corridorFilter === "iran"
                  ? "bg-[#10B981] text-[#0A111C] font-bold"
                  : "text-[#BAC7D5] hover:text-[#EDE9DE]"
              }`}
            >
              Iran (412 Hulls)
            </button>
            <button
              onClick={() => handleCorridorChange("russia")}
              className={`px-2 py-0.5 rounded transition-all uppercase font-medium ${
                corridorFilter === "russia"
                  ? "bg-[#EF4444] text-white font-bold"
                  : "text-[#BAC7D5] hover:text-[#EDE9DE]"
              }`}
            >
              Russia → India 88% (685 Hulls)
            </button>
            <button
              onClick={() => handleCorridorChange("syndicate")}
              className={`px-2 py-0.5 rounded transition-all uppercase font-medium ${
                corridorFilter === "syndicate"
                  ? "bg-purple-600 text-white font-bold"
                  : "text-[#BAC7D5] hover:text-[#EDE9DE]"
              }`}
            >
              Fleet Sharing (68 Hulls)
            </button>
          </div>
        </div>

        {/* Focused Active Tab Content for Targeted Export */}
        <div id="iran-shadow-fleet-active-panel">

        {/* Tab 1: PRICING MATRIX */}
        {activeSubTab === "Pricing Matrix" && (
          <div className="space-y-4">
            {/* Top Stat Summary for Pricing - Dynamically filtered by Theater */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
              {corridorFilter === "iran" ? (
                <>
                  <div className="bg-black/40 border border-[#10B981]/30 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#10B981] uppercase tracking-wider font-semibold">Iranian Light FOB (NIOC)</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#10B981] leading-tight whitespace-nowrap">${iranianLightPrice.toFixed(2)}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#FF8585] font-semibold">-$7.90 vs Brent</span>
                        <span className="text-[#8292A6]">Delivered $102.20</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#10B981]/15 pt-1 whitespace-nowrap">Kharg Island → Shandong Teapots</div>
                  </div>

                  <div className="bg-black/40 border border-[#10B981]/30 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium">Iranian Heavy FOB (NIOC)</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#10B981] leading-tight whitespace-nowrap">${iranianHeavyPrice.toFixed(2)}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#FF8585] font-semibold">-$12.02 vs Brent</span>
                        <span className="text-[#8292A6]">Delivered $98.15</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#10B981]/15 pt-1 whitespace-nowrap">Kharg Island → Shandong (100% Shadow)</div>
                  </div>

                  <div className="bg-black/50 border border-[#B08D57]/45 rounded-lg p-2.5 sm:p-3 relative shadow-[0_0_15px_rgba(176,141,87,0.12)] flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#E5C794] uppercase tracking-wider font-medium">24M Iran Dark Oil Inflow</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#E5C794] leading-tight whitespace-nowrap">$77.0B</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#10B981] font-semibold">100% Non-Western Insured</span>
                        <span className="text-[#EDE9DE]/70">Net</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/20 pt-1 whitespace-nowrap">CIPS / Kunlun Bank RMB Escrow</div>
                  </div>

                  <div className="bg-black/40 border border-[#10B981]/30 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium">Daily Iran Cash Velocity</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#10B981] leading-tight whitespace-nowrap">$153.9M</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#B08D57] font-semibold">~1.62M bpd</span>
                        <span className="text-[#8292A6]">/day</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#10B981]/15 pt-1 whitespace-nowrap">China Teapots 1.44M + Syria 95k</div>
                  </div>
                </>
              ) : corridorFilter === "russia" ? (
                <>
                  <div className="bg-black/40 border border-[#EF4444]/30 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#FF8585] uppercase tracking-wider font-semibold">Russian Urals FOB (Baltic)</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#EF4444] leading-tight whitespace-nowrap">${uralsPrice.toFixed(2)}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#FF8585] font-semibold">-$7.20 vs Brent</span>
                        <span className="text-[#8292A6]">Delivered $104.25</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#EF4444]/15 pt-1 whitespace-nowrap">88% Shipped to India via Shadow</div>
                  </div>

                  <div className="bg-black/40 border border-[#EF4444]/30 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium">Russian ESPO Blend FOB (Pacific)</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#EF4444] leading-tight whitespace-nowrap">${espoPrice.toFixed(2)}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#FF8585] font-semibold">-$3.80 vs Brent</span>
                        <span className="text-[#8292A6]">Delivered $102.75</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#EF4444]/15 pt-1 whitespace-nowrap">Kozmino → China Teapots &amp; Sokol to India</div>
                  </div>

                  <div className="bg-black/50 border border-[#B08D57]/45 rounded-lg p-2.5 sm:p-3 relative shadow-[0_0_15px_rgba(176,141,87,0.12)] flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#E5C794] uppercase tracking-wider font-medium">24M Russia Dark Oil Inflow</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#E5C794] leading-tight whitespace-nowrap">$62.4B</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-amber-400 font-semibold">88% India Seaborne Shadow</span>
                        <span className="text-[#EDE9DE]/70">Net</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/20 pt-1 whitespace-nowrap">UAE Dirhams (AED) &amp; INR Vostro</div>
                  </div>

                  <div className="bg-black/40 border border-[#EF4444]/30 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium">Daily Russia Shadow Velocity</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#10B981] leading-tight whitespace-nowrap">$238.1M</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#B08D57] font-semibold">~2.49M bpd</span>
                        <span className="text-[#8292A6]">/day</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#EF4444]/15 pt-1 whitespace-nowrap">India 1.65M Dark + China 840k Dark</div>
                  </div>
                </>
              ) : corridorFilter === "syndicate" ? (
                <>
                  <div className="bg-black/40 border border-purple-500/30 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-purple-300 uppercase tracking-wider font-semibold">Verified Dual-Theater Tankers</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-purple-400 leading-tight whitespace-nowrap">68 Hulls</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-purple-300 font-semibold">Aframax &amp; Suezmax</span>
                        <span className="text-[#8292A6]">110k-300k DWT</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-purple-500/15 pt-1 whitespace-nowrap">Persian Gulf ↔ Baltic Cross-Deployment</div>
                  </div>

                  <div className="bg-black/40 border border-purple-500/30 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium">Rotating Cargo Velocity</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#E5C794] leading-tight whitespace-nowrap">480k bpd</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-purple-300 font-semibold">Shared Fleet Capacity</span>
                        <span className="text-[#8292A6]">0 Idle Days</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-purple-500/15 pt-1 whitespace-nowrap">Offload China → Reposition to Kozmino/Baltic</div>
                  </div>

                  <div className="bg-black/50 border border-purple-500/40 rounded-lg p-2.5 sm:p-3 relative shadow-[0_0_15px_rgba(168,85,247,0.12)] flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-purple-300 uppercase tracking-wider font-medium">Cross-Clearing Revenue</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#E5C794] leading-tight whitespace-nowrap">$14.2B</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#B08D57] font-semibold">Dual-Settled</span>
                        <span className="text-[#EDE9DE]/70">Net</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-purple-500/20 pt-1 whitespace-nowrap">Dubai DMCC &amp; Mumbai Shell Company Nexus</div>
                  </div>

                  <div className="bg-black/40 border border-purple-500/30 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium">Flag-Hopping Velocity</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#10B981] leading-tight whitespace-nowrap">4.8 Mo.</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-purple-300 font-semibold">Avg Re-flag Interval</span>
                        <span className="text-[#8292A6]">OFAC Evaded</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-purple-500/15 pt-1 whitespace-nowrap">Gabon, Cook Islands, Palau, Panama Cycles</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium">Russian Urals FOB (Baltic)</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#EF4444] leading-tight whitespace-nowrap">${uralsPrice.toFixed(2)}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#FF8585] font-semibold">-$7.20 vs Brent</span>
                        <span className="text-[#8292A6]">Delivered $104.25</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 whitespace-nowrap">88% Shipped to India via Shadow</div>
                  </div>

                  <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium">Iranian Light FOB</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#10B981] leading-tight whitespace-nowrap">${iranianLightPrice.toFixed(2)}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#FF8585] font-semibold">-$7.90 vs Brent</span>
                        <span className="text-[#8292A6]">Delivered $102.20</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 whitespace-nowrap">Kharg Island → Shandong</div>
                  </div>

                  <div className="bg-black/50 border border-[#B08D57]/45 rounded-lg p-2.5 sm:p-3 relative shadow-[0_0_15px_rgba(176,141,87,0.12)] flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#E5C794] uppercase tracking-wider font-medium">24M Combined Dark Revenue</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#E5C794] leading-tight whitespace-nowrap">{combinedCumulativeWealth}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#B08D57] font-semibold">Iran $77B / Russia $62.4B</span>
                        <span className="text-[#EDE9DE]/70">Net</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/20 pt-1 whitespace-nowrap">CIPS / AED / INR Vostro</div>
                  </div>

                  <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium">Daily Combined Cash Velocity</div>
                    <div className="mt-1.5">
                      <div className="text-lg sm:text-xl 2xl:text-2xl font-bold font-mono-data text-[#10B981] leading-tight whitespace-nowrap">$274.5M</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
                        <span className="text-[#B08D57] font-semibold">~3.27M bpd</span>
                        <span className="text-[#8292A6]">/day</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 whitespace-nowrap">India 1.65M + China 1.44M</div>
                  </div>
                </>
              )}
            </div>

            {/* Pricing Matrix Table */}
            <div className="bg-black/40 border border-[#B08D57]/15 rounded-lg p-4 space-y-3 font-mono-data text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#B08D57]/15">
                <span className="text-[10px] font-bold text-[#B08D57] uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#B08D57]" />
                  SANCTIONED CRUDE NETBACK &amp; BENCHMARK MATRIX ({corridorFilter === "iran" ? "IRAN CORRIDOR" : corridorFilter === "russia" ? "RUSSIA CORRIDOR (88% INDIA)" : corridorFilter === "syndicate" ? "DUAL-CORRIDOR SYNDICATE" : "IRAN & RUSSIA"})
                </span>
                <span className="text-[9px] text-[#8292A6]">Updated Live // Realized Netback Models</span>
              </div>

              <div className="overflow-x-auto pb-1">
                <table className="w-full text-left min-w-[720px]">
                  <thead>
                    <tr className="border-b border-[#B08D57]/15 text-[#8292A6] text-[10px]">
                      <th className="pb-2">Crude Grade &amp; Theater</th>
                      <th className="pb-2">Loading Port</th>
                      <th className="pb-2">FOB Price</th>
                      <th className="pb-2">Brent Diff</th>
                      <th className="pb-2">Ghost Freight</th>
                      <th className="pb-2">Delivered CIF</th>
                      <th className="pb-2">Primary Destination</th>
                      <th className="pb-2">Settlement Mechanism</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B08D57]/10 text-xs">
                    <tr>
                      <td className="py-2 text-[#EDE9DE] font-bold">Dated Brent (Benchmark)</td>
                      <td className="py-2 text-[#8292A6]">North Sea Sullom Voe</td>
                      <td className="py-2 text-[#EDE9DE] font-bold">${brentBenchmark.toFixed(2)}</td>
                      <td className="py-2 text-[#8292A6]">Par ($0.00)</td>
                      <td className="py-2 text-[#8292A6]">Standard</td>
                      <td className="py-2 text-[#EDE9DE]">${(brentBenchmark + 1.68).toFixed(2)}</td>
                      <td className="py-2 text-[#8292A6]">Global Waterborne</td>
                      <td className="py-2 text-[#8292A6]">USD Clearing (NY Fed)</td>
                    </tr>
                    {(corridorFilter === "all" || corridorFilter === "russia" || corridorFilter === "syndicate") && (
                      <tr className="bg-[#EF4444]/10">
                        <td className="py-2 text-[#FF8585] font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          Russian Urals (Maritime)
                        </td>
                        <td className="py-2 text-[#8292A6]">Primorsk / Novorossiysk</td>
                        <td className="py-2 text-[#EF4444] font-bold">${uralsPrice.toFixed(2)}</td>
                        <td className="py-2 text-[#FF8585] font-semibold">-$7.20/bbl</td>
                        <td className="py-2 text-[#B08D57]">+$6.20/bbl</td>
                        <td className="py-2 text-[#EDE9DE] font-bold">${(uralsPrice + 6.20).toFixed(2)}</td>
                        <td className="py-2 text-[#E5C794] font-semibold">Sikka / Vadinar (India - 88%)</td>
                        <td className="py-2 text-[#34D399]">UAE Dirham (AED) / INR Vostro</td>
                      </tr>
                    )}
                    {(corridorFilter === "all" || corridorFilter === "russia") && (
                      <tr className="bg-[#EF4444]/5">
                        <td className="py-2 text-[#FF8585]">Russian ESPO Blend</td>
                        <td className="py-2 text-[#8292A6]">Kozmino (Pacific)</td>
                        <td className="py-2 text-[#EDE9DE] font-bold">${espoPrice.toFixed(2)}</td>
                        <td className="py-2 text-[#FF8585] font-semibold">-$3.80/bbl</td>
                        <td className="py-2 text-[#B08D57]">+$3.65/bbl</td>
                        <td className="py-2 text-[#EDE9DE] font-bold">${(espoPrice + 3.65).toFixed(2)}</td>
                        <td className="py-2 text-[#EDE9DE]">Dongying / Rizhao (China)</td>
                        <td className="py-2 text-[#E5C794]">CIPS Direct RMB Clearing</td>
                      </tr>
                    )}
                    {(corridorFilter === "all" || corridorFilter === "iran" || corridorFilter === "syndicate") && (
                      <tr className="bg-[#B08D57]/5">
                        <td className="py-2 text-[#E5C794] font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          Iranian Light (NIOC)
                        </td>
                        <td className="py-2 text-[#8292A6]">Kharg Island Terminal</td>
                        <td className="py-2 text-[#10B981] font-bold">${iranianLightPrice.toFixed(2)}</td>
                        <td className="py-2 text-[#FF8585] font-semibold">-$7.90/bbl</td>
                        <td className="py-2 text-[#B08D57]">+$4.85/bbl</td>
                        <td className="py-2 text-[#EDE9DE] font-bold">${(iranianLightPrice + 4.85).toFixed(2)}</td>
                        <td className="py-2 text-[#EDE9DE]">Shandong Teapots (China)</td>
                        <td className="py-2 text-[#E5C794]">CIPS / Kunlun Bank RMB</td>
                      </tr>
                    )}
                    {(corridorFilter === "all" || corridorFilter === "iran") && (
                      <tr>
                        <td className="py-2 text-[#E5C794] font-bold">Iranian Heavy (NIOC)</td>
                        <td className="py-2 text-[#8292A6]">Kharg Island Terminal</td>
                        <td className="py-2 text-[#10B981] font-bold">${iranianHeavyPrice.toFixed(2)}</td>
                        <td className="py-2 text-[#FF8585] font-semibold">-$12.02/bbl</td>
                        <td className="py-2 text-[#B08D57]">+$4.85/bbl</td>
                        <td className="py-2 text-[#EDE9DE] font-bold">${(iranianHeavyPrice + 4.85).toFixed(2)}</td>
                        <td className="py-2 text-[#EDE9DE]">Shandong Teapots (China)</td>
                        <td className="py-2 text-[#E5C794]">CIPS / Kunlun Bank RMB</td>
                      </tr>
                    )}
                    {(corridorFilter === "all" || corridorFilter === "iran") && (
                      <tr className="bg-[#B08D57]/5">
                        <td className="py-2 text-[#EDE9DE]">South Pars Condensate</td>
                        <td className="py-2 text-[#8292A6]">Bandar Assaluyeh</td>
                        <td className="py-2 text-[#10B981] font-bold">${southParsPrice.toFixed(2)}</td>
                        <td className="py-2 text-[#FF8585] font-semibold">-$9.62/bbl</td>
                        <td className="py-2 text-[#B08D57]">+$5.10/bbl</td>
                        <td className="py-2 text-[#EDE9DE] font-bold">${(southParsPrice + 5.10).toFixed(2)}</td>
                        <td className="py-2 text-[#EDE9DE]">China &amp; Jose (Venezuela Swap)</td>
                        <td className="py-2 text-[#F59E0B]">Physical Gold Bullion / Barter</td>
                      </tr>
                    )}
                    {(corridorFilter === "all" || corridorFilter === "russia") && (
                      <tr>
                        <td className="py-2 text-[#8292A6]">Russian Sokol (Sakhalin)</td>
                        <td className="py-2 text-[#8292A6]">De-Kastri Terminal</td>
                        <td className="py-2 text-[#EDE9DE]">${sokolPrice.toFixed(2)}</td>
                        <td className="py-2 text-[#FF8585]">-$4.50/bbl</td>
                        <td className="py-2 text-[#8292A6]">+$3.85/bbl</td>
                        <td className="py-2 text-[#8292A6]">${(sokolPrice + 3.85).toFixed(2)}</td>
                        <td className="py-2 text-[#8292A6]">Paradip Port (IOCL / India)</td>
                        <td className="py-2 text-[#34D399]">UAE Dirhams (AED)</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Settlement & Wealth Breakdown Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 pt-2 border-t border-[#B08D57]/15 text-xs">
                <div className="bg-black/50 p-2.5 rounded border border-[#B08D57]/15">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8292A6]">UAE Dirham &amp; INR Vostro</span>
                    <span className="text-[9px] bg-amber-950/60 text-amber-300 px-1.5 rounded">RUSSIA→INDIA</span>
                  </div>
                  <span className="text-[#34D399] font-bold text-sm block mt-0.5">$56.2B (40.3%)</span>
                  <span className="text-[9px] text-[#8292A6] block mt-0.5">88% India shadow fleet settlement via Dubai &amp; UCO Bank</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded border border-[#B08D57]/15">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8292A6]">CIPS / RMB Escrow (Kunlun)</span>
                    <span className="text-[9px] bg-emerald-950/60 text-emerald-300 px-1.5 rounded">IRAN/RUSSIA→CHINA</span>
                  </div>
                  <span className="text-[#E5C794] font-bold text-sm block mt-0.5">$58.4B (41.9%)</span>
                  <span className="text-[9px] text-[#8292A6] block mt-0.5">Direct bilateral escrow for Shandong teapot refiners</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded border border-[#B08D57]/15">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8292A6]">Physical Gold &amp; Barter Swaps</span>
                    <span className="text-[9px] bg-yellow-950/60 text-yellow-300 px-1.5 rounded">IRAN/VENEZUELA</span>
                  </div>
                  <span className="text-[#10B981] font-bold text-sm block mt-0.5">$16.5B (11.8%)</span>
                  <span className="text-[9px] text-[#8292A6] block mt-0.5">Bullion repatriations &amp; heavy diluent exchanges</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded border border-[#B08D57]/15">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8292A6]">Front-Company Bilateral Trade</span>
                    <span className="text-[9px] bg-purple-950/60 text-purple-300 px-1.5 rounded">DUBAI / MUMBAI</span>
                  </div>
                  <span className="text-[#B08D57] font-bold text-sm block mt-0.5">$8.3B (6.0%)</span>
                  <span className="text-[9px] text-[#8292A6] block mt-0.5">DMCC &amp; Hong Kong shell company freight netbacks</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 24M CORRELATION & WEALTH (D3 Interactive Chart) */}
        {activeSubTab === "24M Correlation [D3]" && (
          <ShadowFleetCorrelationChart isExpanded={isExpanded} externalCorridor={corridorFilter} />
        )}

        {/* Tab 3: FLEET RADAR & SAR ENGINE */}
        {activeSubTab === "Fleet Radar" && (
          <div className="space-y-4">
            {/* Quick Filter Reminder / Status */}
            <div className="flex items-center justify-between bg-black/50 border border-[#B08D57]/20 p-2.5 rounded-lg text-xs font-mono-data">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${corridorFilter === "iran" ? "bg-[#10B981]" : corridorFilter === "russia" ? "bg-[#EF4444]" : corridorFilter === "syndicate" ? "bg-purple-500" : "bg-[#B08D57]"} animate-pulse`} />
                <span className="text-[#EDE9DE] font-bold uppercase tracking-wider text-[11px]">
                  TELEMETRY SCOPE: {corridorFilter === "iran" ? "IRANIAN SHADOW FLEET (412 HULLS • SHANDONG CORRIDOR)" : corridorFilter === "russia" ? "RUSSIAN SHADOW FLEET (685 HULLS • 88% INDIA & CHINA)" : corridorFilter === "syndicate" ? "DUAL-THEATER CROSS-ROTATION SYNDICATE (68 HULLS)" : "GLOBAL DUAL-CORRIDOR AGGREGATE (1,097 HULLS)"}
                </span>
              </div>
              <span className="text-[10px] text-[#8292A6]">
                {corridorFilter === "iran" ? "100% Non-Western Insured (Kish P&I)" : corridorFilter === "russia" ? "Ingosstrakh & UAE/India Fronts" : corridorFilter === "syndicate" ? "Shared Maritime Fronts (DMCC)" : "1,380 Monitored Globally"}
              </span>
            </div>

            {/* 4 Stat Cards Row - Dynamic based on corridorFilter */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {corridorFilter === "iran" ? (
                <>
                  <div className="bg-black/40 border border-[#10B981]/30 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#10B981] uppercase tracking-wider font-semibold">Iran Dark Outflow</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#10B981] leading-tight">1.62M bpd</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-[#10B981] font-semibold">+12.4% vs 2024</span>
                        <span className="text-[#8292A6]">Seaborne</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#10B981]/15 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Primary Destination</span>
                      <span className="text-[#EDE9DE] font-semibold">Shandong Teapots (88.8%)</span>
                    </div>
                  </div>

                  <div className="bg-black/50 border border-[#10B981]/50 rounded p-3 relative shadow-[0_0_15px_rgba(16,185,129,0.12)] flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#10B981] uppercase tracking-wider font-semibold">Active Iran Tankers</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#10B981] leading-tight">412 Hulls</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-[#10B981] font-semibold">NITC + Opaque FOC</span>
                        <span className="text-[#8292A6]">Hulls</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#10B981]/20 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>P&amp;I Insurance</span>
                      <span className="text-[#10B981] font-semibold">100% Non-Western (Kish)</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-[#10B981]/30 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">Iran Daily Cash Inflow</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight">$153.9M/day</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-[#10B981] font-semibold">24M Inflow: $77.0B</span>
                        <span className="text-[#8292A6]">Net</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#10B981]/15 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Settlement</span>
                      <span className="text-[#E5C794] font-semibold">CIPS RMB &amp; Barter</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-[#10B981]/30 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">AIS Spoofing Beacons</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight">184 Isolated</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-[#FFA4A4] font-semibold">Kharg &amp; Malacca</span>
                        <span className="text-[#8292A6]">Active</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#10B981]/15 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Key STS Hubs</span>
                      <span className="text-[#EDE9DE] font-semibold">Riau &amp; Lingga (Indonesia)</span>
                    </div>
                  </div>
                </>
              ) : corridorFilter === "russia" ? (
                <>
                  <div className="bg-black/40 border border-[#EF4444]/30 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#FF8585] uppercase tracking-wider font-semibold">Russia Dark Outflow</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EF4444] leading-tight">2.49M bpd</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-amber-400 font-semibold">1.65M India + 840k China</span>
                        <span className="text-[#8292A6]">Dark</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#EF4444]/15 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Primary Destination</span>
                      <span className="text-amber-300 font-semibold">India Sikka/Vadinar (88%)</span>
                    </div>
                  </div>

                  <div className="bg-black/50 border border-amber-500/50 rounded p-3 relative shadow-[0_0_15px_rgba(245,158,11,0.12)] flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-amber-300 uppercase tracking-wider font-semibold">Russia→India Shadow Ratio</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-amber-400 leading-tight">88.0%</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-amber-300 font-semibold">1.65M / 1.88M bpd</span>
                        <span className="text-[#8292A6]">Outside Cap</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-amber-500/20 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Active Shadow Hulls</span>
                      <span className="text-amber-300 font-semibold">685 Hulls (Urals/ESPO)</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-[#EF4444]/30 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">Russia Daily Velocity</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight">$238.1M/day</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-amber-400 font-semibold">24M Inflow: $62.4B</span>
                        <span className="text-[#8292A6]">Net</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#EF4444]/15 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Settlement</span>
                      <span className="text-amber-300 font-semibold">AED Dirhams &amp; INR Vostro</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-[#EF4444]/30 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">AIS Spoofing Beacons</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight">158 Isolated</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-[#FFA4A4] font-semibold">Baltic &amp; Lakonikos</span>
                        <span className="text-[#8292A6]">Active</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#EF4444]/15 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Key STS Hubs</span>
                      <span className="text-[#EDE9DE] font-semibold">Lakonikos Gulf &amp; Ceuta</span>
                    </div>
                  </div>
                </>
              ) : corridorFilter === "syndicate" ? (
                <>
                  <div className="bg-black/40 border border-purple-500/30 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-purple-300 uppercase tracking-wider font-semibold">Dual-Theater Tankers</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-purple-400 leading-tight">68 Verified</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-purple-300 font-semibold">Cross-Corridor</span>
                        <span className="text-[#8292A6]">Aframax/Suezmax</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-purple-500/15 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Asset Utilization</span>
                      <span className="text-purple-300 font-semibold">92.0% (Zero Ballast)</span>
                    </div>
                  </div>

                  <div className="bg-black/50 border border-purple-500/50 rounded p-3 relative shadow-[0_0_15px_rgba(168,85,247,0.12)] flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-purple-300 uppercase tracking-wider font-semibold">Rotating Outflow</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-purple-400 leading-tight">480,000 bpd</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-purple-300 font-semibold">Shared Hull Velocity</span>
                        <span className="text-[#8292A6]">Rolling</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-purple-500/20 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Operational Hub</span>
                      <span className="text-purple-300 font-semibold">Fujairah &amp; Sohar</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-purple-500/30 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">Management Nexus</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight">Dubai DMCC</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-purple-300 font-semibold">Mumbai Fronts</span>
                        <span className="text-[#8292A6]">94% Nominee</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-purple-500/15 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Sanctions Evasion</span>
                      <span className="text-purple-300 font-semibold">Re-flagging &lt;72h</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-purple-500/30 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">Dual Settlements</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight">AED / CIPS Dual</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-[#10B981] font-semibold">De-Dollarized</span>
                        <span className="text-[#8292A6]">Escrow</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-purple-500/15 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Cross-Theaters</span>
                      <span className="text-[#EDE9DE] font-semibold">Baltic ↔ Kharg</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-black/40 border border-[#B08D57]/15 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">Total Dark Outflow</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight">{combinedOutflowBpd}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-[#10B981] font-semibold">Iran + Russia Dark</span>
                        <span className="text-[#8292A6]">Seaborne</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#B08D57]/10 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Destinations</span>
                      <span className="text-[#E5C794] font-semibold">India &amp; China</span>
                    </div>
                  </div>

                  <div className="bg-black/50 border border-[#A6291C]/60 rounded p-3 relative shadow-[0_0_15px_rgba(166,41,28,0.15)] flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#FF8585] uppercase tracking-wider">Active Dark Tankers</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#A6291C] leading-tight">{totalDarkHulls}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-[#FFA4A4] font-semibold">412 Iran / 685 Russia</span>
                        <span className="text-[#8292A6]">Hulls</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#A6291C]/20 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Monitored Global</span>
                      <span className="text-[#FFA4A4] font-semibold">1,380 Hulls</span>
                    </div>
                  </div>

                  <div className="bg-black/50 border border-amber-500/40 rounded p-3 flex flex-col justify-between shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <div className="text-[10px] font-mono-data text-amber-300 uppercase tracking-wider">Russia→India Shadow Ratio</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-amber-400 leading-tight">{russiaIndiaShadowShare}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-amber-300 font-semibold">1.65M / 1.88M bpd</span>
                        <span className="text-[#8292A6]">Dark Hulls</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-amber-500/20 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Price Cap Evasion</span>
                      <span className="text-amber-300 font-semibold">Outside $60 Cap</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-[#B08D57]/15 rounded p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">AIS Spoofing Beacons</div>
                    <div className="mt-1">
                      <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight">{totalAisSpoofingBeacons}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5">
                        <span className="text-[#FFA4A4] font-semibold">Circle-Drift / Ghost</span>
                        <span className="text-[#8292A6]">Isolated</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#B08D57]/10 pt-1 whitespace-nowrap flex items-center justify-between">
                      <span>Hubs Covered</span>
                      <span className="text-[#EDE9DE] font-semibold">9 Active STS Zones</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Radar Telemetry Synthesis Box */}
            <div className="bg-black/40 border border-[#B08D57]/15 rounded p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-data text-[#8292A6] pb-2 border-b border-[#B08D57]/15">
                <div className="flex items-center gap-2 text-[#EDE9DE]">
                  <Cpu className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span className="font-bold text-[#B08D57] uppercase tracking-wider text-[10px]">
                    SAR TELEMETRY &amp; OPTICAL PASS COVERAGE ({corridorFilter === "iran" ? "IRANIAN THEATER" : corridorFilter === "russia" ? "RUSSIAN THEATER" : corridorFilter === "syndicate" ? "SYNDICATE FLEET SHARING" : "DUAL-CORRIDOR"})
                  </span>
                </div>
                <span className="text-[9px] text-[#8292A6]">Sentinel-1 SAR / Spire Maritime Pass</span>
              </div>

              {/* Status pass banner */}
              <div className="bg-black/50 border border-[#B08D57]/15 rounded p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${corridorFilter === "iran" ? "bg-[#10B981]" : corridorFilter === "russia" ? "bg-[#EF4444]" : corridorFilter === "syndicate" ? "bg-purple-500" : "bg-[#10B981]"} animate-pulse`} />
                  <div>
                    <span className="text-xs font-mono-data font-bold text-[#EDE9DE] block">
                      {corridorFilter === "iran"
                        ? "Persian Gulf & Malacca SAR Radar Active (Kharg Island, Lavan & Riau Archipelago)"
                        : corridorFilter === "russia"
                        ? "Baltic, Black Sea & Lakonikos SAR Radar Active (Primorsk, Ust-Luga, Novorossiysk & Kalamata)"
                        : corridorFilter === "syndicate"
                        ? "Cross-Corridor Staging Nodes Active (Fujairah, Sohar Outer Anchorage & Strait of Hormuz)"
                        : "Multi-Theater SAR Coverage Active (Persian Gulf, Malacca, Lakonikos & Danish Straits)"}
                    </span>
                    <span className="text-[10px] font-mono-data text-[#8292A6]">
                      {corridorFilter === "iran"
                        ? "Optical pass confirmed 412 Iranian dark tankers spoofing transponders in Malacca/Riau and loading Kharg crude for Shandong."
                        : corridorFilter === "russia"
                        ? "Optical pass confirmed 410 Russian shadow tankers en route Gujarat terminals (Sikka & Vadinar) bypassing the $60 price cap."
                        : corridorFilter === "syndicate"
                        ? "Satellite telemetry verified 68 Aframax & Suezmax hulls executing alternating Baltic and Persian Gulf cargo rotations."
                        : "Optical pass confirmed 412 Iranian dark tankers in Malacca/Riau and 410 Russian shadow tankers en route Gujarat terminals (Sikka & Vadinar)."}
                    </span>
                  </div>
                </div>

                <div className="text-right pl-3 sm:border-l sm:border-[#B08D57]/15">
                  <span className="text-[9px] font-mono-data text-[#8292A6] block">
                    {corridorFilter === "iran" ? "Iran Dark Seaborne Outflow" : corridorFilter === "russia" ? "Russia Dark to India + China" : "Combined Dark Outflow"}
                  </span>
                  <span className="text-sm font-mono-data font-bold text-[#10B981]">
                    {corridorFilter === "iran" ? "1,620,000 bpd" : corridorFilter === "russia" ? "2,490,000 bpd" : "3,270,000 bpd"}
                  </span>
                </div>
              </div>

              {/* SMC SATELLITE INTELLIGENCE SYNTHESIS BOX */}
              <div className="bg-black/60 border-l-2 border-[#B08D57] p-3 text-xs">
                <span className="text-[9px] font-mono-data text-[#B08D57] font-bold block mb-1 uppercase tracking-wider">
                  SMC INSTITUTIONAL SHADOW-FLEET SYNTHESIS:
                </span>
                <p className="font-serif italic text-sm text-[#EDE9DE]/90 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
                  {corridorFilter === "iran"
                    ? "\"Iranian crude outflows remain heavily anchored to Shandong independent teapots (~1.44M bpd), transshipped as 'Malaysian Blend' in the Riau and Lingga anchorages with systematic circular AIS spoofing. Netback realizations reflect a -$7.90 to -$12.02 discount to Brent, fully cleared in RMB via CIPS and Kunlun Bank escrow accounts, immunizing the trade against Western banking interdiction.\""
                    : corridorFilter === "russia"
                    ? "\"Russian maritime crude logistics have consolidated into a high-capacity shadow armada. With 88.0% (~1.65M bpd) of all Russian crude delivered to India transported aboard dark, non-Western insured tankers, Russian exporters circumvent the G7 $60 price cap completely. Cargoes sold CIF to Reliance Jamnagar and Nayara Vadinar settle in UAE Dirhams and INR Vostro accounts, generating $62.4B in dark revenue over 24 months.\""
                    : corridorFilter === "syndicate"
                    ? "\"The dark fleet is not fragmented by nationality—it is operated as a synchronized logistics syndicate. 68 verified dual-theater tankers alternate between discharging Iranian crude in China and loading Urals in the Baltic for Indian refineries. Technical management in Dubai DMCC and flag-hopping cycles (averaging 4.8 months post-sanctions) ensure a 92% continuous asset utilization rate.\""
                    : "\"The dark maritime ecosystem has converged into an interconnected dual-corridor logistics syndicate. Russian crude exports to India have fundamentally standardized on the shadow fleet—with 88.0% (~1.65M bpd) arriving aboard non-Western insured, convenience-flagged vessels to completely bypass the G7 $60 price cap. Simultaneously, Iranian crude (~1.62M bpd) continues flowing into independent Chinese teapots in Shandong via automated AIS-spoofed transfers in Riau. Crucially, satellite telemetry reveals 68+ dark tankers operating across both theaters—loading Urals in the Baltic after offloading Iranian crude in Asia.\""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: MANIFEST */}
        {activeSubTab === "Manifest" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-3 text-xs font-mono-data">
            <div className="flex flex-wrap items-center justify-between border-b border-[#B08D57]/15 pb-2 gap-2">
              <div>
                <div className="text-[10px] font-bold text-[#B08D57] uppercase">
                  Active Dark Hulls Telemetry Manifest ({filteredManifest.length} of {darkHullManifestData.length} Sample Hulls Monitored)
                </div>
                <span className="text-[9px] text-[#8292A6]">Optical &amp; Radar Match Confidence: 99.4% • Instant Theater Separation</span>
              </div>

              {/* Corridor filter buttons */}
              <div className="flex flex-wrap items-center gap-1 text-[9px]">
                <button
                  onClick={() => { setManifestCorridor("all"); setCorridorFilter("all"); }}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    manifestCorridor === "all" && corridorFilter === "all" ? "bg-[#B08D57] text-[#0A111C] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  All ({darkHullManifestData.length})
                </button>
                <button
                  onClick={() => { setManifestCorridor("iran"); setCorridorFilter("iran"); }}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    manifestCorridor === "iran" || corridorFilter === "iran" ? "bg-[#10B981] text-[#0A111C] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  Iran Fleet ({darkHullManifestData.filter(h => h.theater === "iran").length})
                </button>
                <button
                  onClick={() => { setManifestCorridor("russia-india"); setCorridorFilter("russia"); }}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    manifestCorridor === "russia-india" ? "bg-[#EF4444] text-white font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  Russia ↔ India 88% ({darkHullManifestData.filter(h => h.corridor === "russia-india").length})
                </button>
                <button
                  onClick={() => { setManifestCorridor("russia-china"); setCorridorFilter("russia"); }}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    manifestCorridor === "russia-china" ? "bg-[#38BDF8] text-[#0A111C] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  Russia ↔ China ({darkHullManifestData.filter(h => h.corridor === "russia-china").length})
                </button>
                <button
                  onClick={() => { setManifestCorridor("syndicate"); setCorridorFilter("syndicate"); }}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    manifestCorridor === "syndicate" || corridorFilter === "syndicate" ? "bg-purple-600 text-white font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  Dual Syndicate ({darkHullManifestData.filter(h => h.theater === "syndicate").length})
                </button>
              </div>
            </div>

            {/* Quick Search Bar */}
            <div className="flex items-center gap-2 bg-black/60 border border-[#B08D57]/20 rounded px-2.5 py-1.5">
              <Search className="w-3.5 h-3.5 text-[#B08D57]" />
              <input
                type="text"
                value={manifestSearch}
                onChange={(e) => setManifestSearch(e.target.value)}
                placeholder="Search hulls by IMO, vessel name, flag of convenience, cargo, STS hub or destination..."
                className="bg-transparent border-none text-[#EDE9DE] placeholder-[#8292A6]/60 text-xs w-full focus:outline-none font-mono-data"
              />
              {manifestSearch && (
                <button
                  onClick={() => setManifestSearch("")}
                  className="text-[10px] text-[#8292A6] hover:text-white px-1"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-2">
              {filteredManifest.length === 0 ? (
                <div className="p-4 text-center text-[#8292A6] bg-black/30 rounded border border-[#B08D57]/10">
                  No dark hull telemetry records match your selected theater filter or search query.
                </div>
              ) : (
                filteredManifest.map((hull) => (
                  <div
                    key={hull.imo}
                    className="p-2.5 rounded bg-black/50 border border-[#B08D57]/15 hover:border-[#B08D57]/40 transition-all flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[#EDE9DE] font-bold">{hull.imo} ({hull.name})</span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-bold border"
                          style={{
                            backgroundColor: `${hull.statusColor}22`,
                            color: hull.statusColor,
                            borderColor: `${hull.statusColor}55`,
                          }}
                        >
                          {hull.statusBadge}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          hull.theater === "iran"
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                            : hull.theater === "russia"
                            ? "bg-red-950/60 text-red-300 border-red-500/30"
                            : "bg-purple-950/60 text-purple-300 border-purple-500/30"
                        }`}>
                          {hull.theater === "iran" ? "IRAN THEATER" : hull.theater === "russia" ? (hull.corridor === "russia-india" ? "RUSSIA→INDIA 88%" : "RUSSIA→CHINA") : "DUAL SYNDICATE"}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8292A6]">
                        Flag: {hull.flag} • DWT: {hull.dwt} • Cargo: <span className="text-[#EDE9DE] font-medium">{hull.cargo}</span>
                      </div>
                      <div className="text-[9px] text-[#8292A6]">
                        P&amp;I Insurance: <span className="text-[#E5C794]">{hull.piCoverage}</span> • STS Node: <span className="text-[#BAC7D5]">{hull.stsHub}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#10B981] font-semibold text-xs block">{hull.destination}</span>
                      <span className="text-[9px] text-[#8292A6]">Settlement: <span className="text-[#B08D57]">{hull.settlement}</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: STS HUBS */}
        {activeSubTab === "STS Hubs" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-3 text-xs font-mono-data">
            <div className="flex flex-wrap items-center justify-between border-b border-[#B08D57]/15 pb-2 gap-2">
              <div className="text-[10px] font-bold text-[#B08D57] uppercase flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-[#B08D57]" />
                Global Ship-to-Ship (STS) Transshipment Corridors ({filteredStsHubs.length} Active Hubs Monitored)
              </div>
              
              {/* Dedicated STS Theater Filter Pills */}
              <div className="flex items-center gap-1 text-[9px]">
                <button
                  onClick={() => setStsFilter("all")}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    stsFilter === "all" ? "bg-[#B08D57] text-[#0A111C] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  All Hubs (6)
                </button>
                <button
                  onClick={() => setStsFilter("iran")}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    stsFilter === "iran" ? "bg-[#10B981] text-[#0A111C] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  Iran Hubs (2)
                </button>
                <button
                  onClick={() => setStsFilter("russia")}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    stsFilter === "russia" ? "bg-[#EF4444] text-white font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  Russia Hubs (3)
                </button>
                <button
                  onClick={() => setStsFilter("syndicate")}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    stsFilter === "syndicate" ? "bg-purple-600 text-white font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  Syndicate (1)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredStsHubs.map((hub) => (
                <div
                  key={hub.id}
                  className={`bg-black/50 p-3 rounded border space-y-1 ${
                    hub.theater === "iran"
                      ? "border-[#10B981]/30 hover:border-[#10B981]/60"
                      : hub.theater === "russia"
                      ? "border-amber-500/30 hover:border-amber-500/60"
                      : "border-purple-500/30 hover:border-purple-500/60"
                  } transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#EDE9DE] font-bold">{hub.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      hub.badge === "DEFCON 1"
                        ? "bg-[#A6291C]/30 text-[#FF8585]"
                        : hub.badge === "SYNDICATE HUB"
                        ? "bg-purple-950/60 text-purple-300"
                        : "bg-[#B08D57]/30 text-[#E5C794]"
                    }`}>
                      {hub.badge}
                    </span>
                  </div>
                  <div className="text-[9px] uppercase font-bold tracking-wider" style={{ color: hub.theaterColor }}>
                    [{hub.theaterLabel}]
                  </div>
                  <div className="text-[#E5C794] font-semibold text-[11px]">{hub.pairs}</div>
                  <p className="text-[10px] text-[#8292A6] leading-relaxed">
                    {hub.description}
                  </p>
                  <div className={`pt-1 text-[9px] ${hub.servicingColor} font-medium`}>{hub.servicing}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: FLOWS */}
        {activeSubTab === "Flows" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-4 text-xs font-mono-data">
            <div className="flex flex-wrap items-center justify-between border-b border-[#B08D57]/15 pb-2 gap-2">
              <div className="text-[10px] font-bold text-[#B08D57] uppercase flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#B08D57]" />
                Destination Breakdown &amp; Sanctioned Trade Flows (Past 30 Days Rolling Telemetry)
              </div>
              
              {/* Flow Theater Filter Buttons */}
              <div className="flex items-center gap-1 text-[9px]">
                <button
                  onClick={() => setFlowFilter("all")}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    flowFilter === "all" ? "bg-[#B08D57] text-[#0A111C] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  All Flows
                </button>
                <button
                  onClick={() => setFlowFilter("russia")}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    flowFilter === "russia" ? "bg-[#EF4444] text-white font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  Russia → India (88%) &amp; China
                </button>
                <button
                  onClick={() => setFlowFilter("iran")}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    flowFilter === "iran" ? "bg-[#10B981] text-[#0A111C] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  Iran → China Teapots (88.8%)
                </button>
              </div>
            </div>

            {/* Russia Crude Seaborne Inflow (Highlighting the 88% India Discovery) */}
            {(flowFilter === "all" || flowFilter === "russia") && (
              <div className="bg-black/50 border border-amber-500/30 rounded-lg p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <span className="text-sm font-bold text-[#EDE9DE]">Russia Seaborne Crude Destination Architecture</span>
                  </div>
                  <span className="text-[10px] bg-amber-950/70 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                    88.0% SHIPPED TO INDIA VIA SHADOW FLEET
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#EDE9DE] font-semibold">India (Total Inflow: ~1.88M bpd // 38.4% of all Indian imports)</span>
                      <span className="text-amber-400 font-bold">1.65M bpd Dark (88.0%)</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2.5 overflow-hidden border border-[#B08D57]/20 flex">
                      <div className="bg-amber-500 h-full" style={{ width: "88%" }} title="Shadow Fleet (88%)" />
                      <div className="bg-[#38BDF8] h-full" style={{ width: "12%" }} title="Western Compliant (12%)" />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#8292A6] mt-1">
                      <span>Shadow Fleet: <strong>1.65M bpd (88.0%)</strong> • Non-Western P&amp;I / Outside G7 Price Cap</span>
                      <span>Western Insured: <strong>0.23M bpd (12.0%)</strong></span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#EDE9DE] font-semibold">China (ESPO, Urals &amp; Sokol seaborne intake)</span>
                      <span className="text-[#10B981] font-bold">1.18M bpd (34.2%)</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-[#B08D57]/20">
                      <div className="bg-[#10B981] h-full rounded-full" style={{ width: "34.2%" }} />
                    </div>
                    <span className="text-[9px] text-[#8292A6] mt-0.5 block">Discharge Ports: Dongying, Rizhao, Yantai, Tianjin</span>
                  </div>
                </div>

                {/* Major Indian Refiners Sourcing Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#B08D57]/15">
                  <div className="bg-black/60 p-2 rounded border border-[#B08D57]/15">
                    <span className="text-[10px] text-[#8292A6] block">Reliance Industries (Jamnagar)</span>
                    <span className="text-[#EDE9DE] font-bold text-xs">~680,000 bpd</span>
                    <span className="text-[9px] text-[#10B981] block">World's largest refining complex</span>
                  </div>
                  <div className="bg-black/60 p-2 rounded border border-[#B08D57]/15">
                    <span className="text-[10px] text-[#8292A6] block">Nayara Energy (Vadinar)</span>
                    <span className="text-[#EDE9DE] font-bold text-xs">~420,000 bpd</span>
                    <span className="text-[9px] text-amber-300 block">Rosneft-backed private refiner</span>
                  </div>
                  <div className="bg-black/60 p-2 rounded border border-[#B08D57]/15">
                    <span className="text-[10px] text-[#8292A6] block">Indian State Refiners (IOCL, BPCL, HPCL)</span>
                    <span className="text-[#EDE9DE] font-bold text-xs">~780,000 bpd</span>
                    <span className="text-[9px] text-[#38BDF8] block">Paradip, Mundra &amp; Kochi terminals</span>
                  </div>
                </div>
              </div>
            )}

            {/* Iranian Crude Seaborne Flow */}
            {(flowFilter === "all" || flowFilter === "iran") && (
              <div className="bg-black/50 border border-[#10B981]/30 rounded-lg p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-sm font-bold text-[#EDE9DE]">Iran Seaborne Crude Destination Architecture (1.62M bpd total)</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#EDE9DE] font-semibold">China (Independent Teapots in Shandong Province)</span>
                      <span className="text-[#10B981] font-bold">1.44M bpd (88.8%)</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-[#B08D57]/20">
                      <div className="bg-[#10B981] h-full rounded-full" style={{ width: "88.8%" }} />
                    </div>
                    <span className="text-[9px] text-[#8292A6] mt-0.5 block">Laundered as 'Malaysian Blend' via Riau transshipment</span>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#EDE9DE] font-semibold">Syria (Baniyas Government Refinery)</span>
                      <span className="text-[#B08D57] font-bold">95,000 bpd (5.8%)</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-[#B08D57]/20">
                      <div className="bg-[#B08D57] h-full rounded-full" style={{ width: "5.8%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#EDE9DE] font-semibold">Venezuela (Jose Terminal Heavy Condensate Swaps)</span>
                      <span className="text-[#E5C794] font-bold">85,000 bpd (5.4%)</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-[#B08D57]/20">
                      <div className="bg-[#E5C794] h-full rounded-full" style={{ width: "5.4%" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Why 88% of Russian crude travels via shadow fleet */}
            <div className="bg-black/60 border-l-2 border-amber-500 p-3 text-xs space-y-1">
              <span className="text-[10px] font-mono-data text-amber-300 font-bold uppercase tracking-wider block">
                INSTITUTIONAL INSIGHT: WHY 88% OF RUSSIAN CRUDE TO INDIA RELIES ON SHADOW HULLS
              </span>
              <p className="text-[#8292A6] leading-relaxed">
                When Brent trades above $85/bbl, Russian Urals consistently prices well above the G7 $60/bbl price cap (currently realized FOB at $98.05/bbl). Under Western maritime sanctions, G7 and EU shipowners, insurers, and P&amp;I clubs are legally prohibited from providing transport services for oil sold above $60. To sustain India's enormous ~1.88M bpd import volume without triggering Western enforcement, the trade migrated almost entirely into the dark fleet. By purchasing on a <strong>CIF (Delivered at Indian Port)</strong> basis settled in UAE Dirhams (AED) and Rupee Vostro accounts, Indian buyers shield themselves from maritime liability while Russian exporters orchestrate end-to-end dark logistics.
              </p>
            </div>
          </div>
        )}

        {/* Tab 7: SYNDICATE NEXUS & FLEET SHARING */}
        {activeSubTab === "Syndicate Nexus" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-4 text-xs font-mono-data">
            <div className="flex items-center justify-between border-b border-[#B08D57]/15 pb-2">
              <div className="text-[10px] font-bold text-[#B08D57] uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#B08D57]" />
                Cross-Corridor Dark Fleet Syndicate: Iran &amp; Russia Fleet-Sharing Nexus
              </div>
              <span className="text-[9px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                68 DUAL-THEATER TANKERS VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-black/50 p-3 rounded border border-[#B08D57]/20 space-y-1.5">
                <span className="text-[10px] font-bold text-[#E5C794] block uppercase">
                  1. Dual-Theater Asset Repositioning
                </span>
                <p className="text-[10px] text-[#8292A6] leading-relaxed">
                  Satellite transponder archives confirm that at least <strong>68 Aframax and Suezmax tankers</strong> have hauled both Iranian and Russian crude over rolling 12-month periods. Tankers offloading Iranian heavy crude in Shandong reposition to Kozmino (Pacific) or sail ballast through Malacca to load Urals in the Black Sea or Baltic.
                </p>
                <div className="pt-1 border-t border-[#B08D57]/10 text-[9px] text-[#10B981]">
                  Asset Utilization Rate: ~92% (Zero idle ballast days)
                </div>
              </div>

              <div className="bg-black/50 p-3 rounded border border-[#B08D57]/20 space-y-1.5">
                <span className="text-[10px] font-bold text-[#E5C794] block uppercase">
                  2. Dubai DMCC &amp; Mumbai Shell Nexus
                </span>
                <p className="text-[10px] text-[#8292A6] leading-relaxed">
                  Technical ship management and commercial chartering are consolidated within hundreds of opaque holding companies registered in the <strong>Dubai Multi Commodities Centre (DMCC)</strong> and coastal Indian shipping hubs. These entities frequently act as common operators for both Russian state-linked entities and Iranian front networks.
                </p>
                <div className="pt-1 border-t border-[#B08D57]/10 text-[9px] text-amber-300">
                  Beneficial Ownership: 94% hidden behind nominee trusts
                </div>
              </div>

              <div className="bg-black/50 p-3 rounded border border-[#B08D57]/20 space-y-1.5">
                <span className="text-[10px] font-bold text-[#E5C794] block uppercase">
                  3. Systemic Flag-Hopping Cycles
                </span>
                <p className="text-[10px] text-[#8292A6] leading-relaxed">
                  Whenever the US Department of the Treasury (OFAC) or UK HM Treasury sanctions an individual vessel, the syndicate re-registers the tanker within 48 to 72 hours under new flags of convenience—cycling rapidly between <strong>Gabon, Cook Islands, Palau, Cameroon, and Mongolia</strong>, accompanied by altered call signs.
                </p>
                <div className="pt-1 border-t border-[#B08D57]/10 text-[9px] text-[#FF8585]">
                  Average Re-flagging Interval: 4.8 months post-sanctions
                </div>
              </div>
            </div>

            {/* Tactical Syndicate Case Studies */}
            <div className="bg-black/50 border border-[#B08D57]/20 rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-bold text-[#B08D57] uppercase tracking-wider block">
                VERIFIED DUAL-THEATER TANKER PROFILES (AIS SATELLITE PASS):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded bg-black/60 border border-[#B08D57]/15">
                  <div className="flex justify-between items-center text-[#EDE9DE] font-bold">
                    <span>Suezmax Phoenix Sea (IMO 9214739)</span>
                    <span className="text-[9px] text-purple-300">Panama Flag</span>
                  </div>
                  <p className="text-[#8292A6] mt-1">
                    <strong>Q1:</strong> Loaded 1.0M bbl Iranian Heavy at Kharg Island → STS off Karimun → Discharged Rizhao.<br />
                    <strong>Q2:</strong> Sailed ballast to Novorossiysk (Black Sea) → Loaded Urals → Discharged Vadinar (Nayara Energy, India).
                  </p>
                </div>

                <div className="p-2 rounded bg-black/60 border border-[#B08D57]/15">
                  <div className="flex justify-between items-center text-[#EDE9DE] font-bold">
                    <span>Aframax Golden Sun (IMO 9276531)</span>
                    <span className="text-[9px] text-amber-300">Gabon Flag</span>
                  </div>
                  <p className="text-[#8292A6] mt-1">
                    <strong>Q1:</strong> Loaded Primorsk (Baltic) → Lakonikos Gulf STS to VLCC → Carried to Sikka (Reliance).<br />
                    <strong>Q2:</strong> Re-routed to Fujairah bunkering → Loaded South Pars condensate for Shandong teapot buyers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Compliance Action Footer */}
      <div className="mt-5 pt-3 border-t border-[#B08D57]/15 flex flex-wrap items-center justify-between text-xs font-mono-data gap-2 text-[#8292A6]">
        <div className="flex items-center gap-2 text-[#EDE9DE]">
          <Ship className="w-3.5 h-3.5 text-[#B08D57]" />
          <span>
            <strong className="text-[#B08D57]">COMPLIANCE RADAR:</strong> Dual-Theater Shadow Fleet Active // 88% Russia→India &amp; 88.8% Iran→China Dark
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            INDIA SHADOW RATIO: 88.0%
          </span>
          <span className="text-[9px] text-[#8292A6]">{data.deskCode}</span>
        </div>
      </div>
    </div>
  );
};
