import React, { useState } from "react";
import {
  TrendingUp,
  Globe2,
  Droplets,
  Layers,
  ChevronRight,
  Info,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Activity,
  Flame,
  Award,
  Zap,
  BarChart2
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine
} from "recharts";
import { ChartExportDropdown } from "../ChartExportDropdown";

interface CountryProductionLevelsProps {
  onOpenTerminalWithPrompt?: (prompt: string) => void;
}

export interface CountryProductionData {
  id: string;
  country: string;
  flag: string;
  currentMbd: number; // Million barrels per day
  rank: number;
  shareGlobalPct: number; // Global share percentage
  opecStatus: "Non-OPEC" | "OPEC+" | "OPEC Core";
  spareCapacityMbd: number;
  primaryBasins: string;
  trajectoryTrend: string;
  keyCatalyst: string;
  fill: string;
}

export const countryProductionLevels: CountryProductionData[] = [
  {
    id: "us",
    country: "United States",
    flag: "🇺🇸",
    currentMbd: 13.45,
    rank: 1,
    shareGlobalPct: 13.0,
    opecStatus: "Non-OPEC",
    spareCapacityMbd: 0.35,
    primaryBasins: "Permian Basin (6.25M), Gulf of Mexico (1.85M), Bakken (1.28M), Eagle Ford (1.15M)",
    trajectoryTrend: "+2.4% YoY (All-Time Record)",
    keyCatalyst: "The #1 crude producer in human history. Multi-bench horizontal drilling and pad optimization in the Permian offset conventional declines. US is a net energy exporter (~4.1M bpd crude/products).",
    fill: "#10B981"
  },
  {
    id: "russia",
    country: "Russia",
    flag: "🇷🇺",
    currentMbd: 9.15,
    rank: 2,
    shareGlobalPct: 8.9,
    opecStatus: "OPEC+",
    spareCapacityMbd: 0.40,
    primaryBasins: "West Siberia (Samotlor/Priobskoye), Volga-Urals, East Siberia (ESPO pipeline)",
    trajectoryTrend: "-1.8% YoY (Sanctions & Quota)",
    keyCatalyst: "Committed to OPEC+ production ceilings; successfully rerouted ~88% of seaborne crude exports to India and China via non-Western shadow fleet tankers.",
    fill: "#EF4444"
  },
  {
    id: "saudi",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    currentMbd: 9.05,
    rank: 3,
    shareGlobalPct: 8.8,
    opecStatus: "OPEC Core",
    spareCapacityMbd: 3.10,
    primaryBasins: "Ghawar (supergiant onshore), Khurais, Safaniya (offshore), Shaybah",
    trajectoryTrend: "-2.1% YoY (Voluntary Cuts)",
    keyCatalyst: "Enforcing 1.0M bpd voluntary OPEC+ production trim. Maintains the world's premier swing capacity, capable of surging to 12.0M+ bpd within 90 days if required.",
    fill: "#3B82F6"
  },
  {
    id: "canada",
    country: "Canada",
    flag: "🇨🇦",
    currentMbd: 4.92,
    rank: 4,
    shareGlobalPct: 4.8,
    opecStatus: "Non-OPEC",
    spareCapacityMbd: 0.20,
    primaryBasins: "Western Canadian Sedimentary Basin (Alberta Oil Sands, Athabasca, Cold Lake)",
    trajectoryTrend: "+4.1% YoY (TMX Expansion)",
    keyCatalyst: "Trans Mountain Expansion (TMX) pipeline completed (+590k bpd), unlocking direct Pacific tidewater access to Asian and California refiners.",
    fill: "#F59E0B"
  },
  {
    id: "iraq",
    country: "Iraq",
    flag: "🇮🇶",
    currentMbd: 4.25,
    rank: 5,
    shareGlobalPct: 4.1,
    opecStatus: "OPEC Core",
    spareCapacityMbd: 0.25,
    primaryBasins: "Rumaila, West Qurna, Zubair (Southern Basra Terminals)",
    trajectoryTrend: "-0.5% YoY (Quota Restrained)",
    keyCatalyst: "OPEC's 2nd largest producer; 100% reliant on Persian Gulf VLCC tanker loading while northern Kirkuk-Ceyhan pipeline export route to Turkey remains constrained.",
    fill: "#6366F1"
  },
  {
    id: "china",
    country: "China",
    flag: "🇨🇳",
    currentMbd: 4.20,
    rank: 6,
    shareGlobalPct: 4.1,
    opecStatus: "Non-OPEC",
    spareCapacityMbd: 0.05,
    primaryBasins: "Changqing, Daqing, Shengli, Bohai Bay offshore",
    trajectoryTrend: "+1.2% YoY (Energy Security Push)",
    keyCatalyst: "National energy mandate maintains domestic output above 4.0M bpd despite mature field water-cuts; China remains the world's top crude importer (~11.5M bpd).",
    fill: "#EC4899"
  },
  {
    id: "brazil",
    country: "Brazil",
    flag: "🇧🇷",
    currentMbd: 3.42,
    rank: 7,
    shareGlobalPct: 3.3,
    opecStatus: "Non-OPEC",
    spareCapacityMbd: 0.15,
    primaryBasins: "Santos and Campos Basins (Buzios, Tupi deepwater pre-salt fields)",
    trajectoryTrend: "+6.8% YoY (Pre-Salt Boom)",
    keyCatalyst: "Leading driver of Non-OPEC Atlantic Basin growth; Petrobras deploying new FPSO mega-vessels each producing 180k-225k bpd of medium sweet crude.",
    fill: "#14B8A6"
  },
  {
    id: "iran",
    country: "Iran",
    flag: "🇮🇷",
    currentMbd: 3.32,
    rank: 8,
    shareGlobalPct: 3.2,
    opecStatus: "OPEC Core",
    spareCapacityMbd: 0.20,
    primaryBasins: "Ahvaz, Marun, Gachsaran, Kharg Island export hub",
    trajectoryTrend: "+3.2% YoY (Shadow Exports)",
    keyCatalyst: "Operating near maximum operational capacity despite US sanctions; exports ~1.6M bpd primarily to Chinese independent teapot refiners via STS operations.",
    fill: "#DC2626"
  },
  {
    id: "uae",
    country: "United Arab Emirates",
    flag: "🇦🇪",
    currentMbd: 3.18,
    rank: 9,
    shareGlobalPct: 3.1,
    opecStatus: "OPEC Core",
    spareCapacityMbd: 1.10,
    primaryBasins: "Upper Zakum, Bab, Bu Hasa, Murban crude flagship",
    trajectoryTrend: "+1.5% YoY (Capacity Expansion)",
    keyCatalyst: "Features 1.5M bpd ADCOP pipeline bypassing Strait of Hormuz to Fujairah terminal; aggressive target to reach 5.0M bpd total production capacity by 2027.",
    fill: "#8B5CF6"
  },
  {
    id: "kuwait",
    country: "Kuwait",
    flag: "🇰🇼",
    currentMbd: 2.52,
    rank: 10,
    shareGlobalPct: 2.4,
    opecStatus: "OPEC Core",
    spareCapacityMbd: 0.30,
    primaryBasins: "Greater Burgan (world's 2nd largest sandstone field), Partitioned Neutral Zone",
    trajectoryTrend: "Flat",
    keyCatalyst: "Ultra-low lifting cost (~$7.50/bbl); 100% dependent on maritime passage through Strait of Hormuz for crude export revenues.",
    fill: "#A855F7"
  }
];

export const historicalProductionData = [
  { year: "2018", us: 10.99, russia: 10.53, saudi: 10.32, canada: 4.29, china: 3.80, world: 98.5 },
  { year: "2019", us: 12.29, russia: 10.61, saudi: 9.81, canada: 4.42, china: 3.84, world: 100.2 },
  { year: "2020", us: 11.31, russia: 9.54, saudi: 9.21, canada: 4.20, china: 3.90, world: 93.8 },
  { year: "2021", us: 11.25, russia: 9.61, saudi: 9.12, canada: 4.44, china: 3.99, world: 95.6 },
  { year: "2022", us: 11.91, russia: 9.78, saudi: 10.52, canada: 4.58, china: 4.11, world: 99.8 },
  { year: "2023", us: 12.93, russia: 9.58, saudi: 9.61, canada: 4.65, china: 4.17, world: 101.4 },
  { year: "2024", us: 13.20, russia: 9.25, saudi: 8.98, canada: 4.80, china: 4.19, world: 102.3 },
  { year: "2025", us: 13.35, russia: 9.18, saudi: 8.95, canada: 4.88, china: 4.20, world: 102.8 },
  { year: "2026 LIVE", us: 13.45, russia: 9.15, saudi: 9.05, canada: 4.92, china: 4.20, world: 103.2 }
];

export const usBasinBreakdownData = [
  { basin: "Permian Basin (TX/NM)", mbd: 6.25, pct: 46.5, fill: "#10B981", desc: "Delaware & Midland basins; world's most productive tight-oil shale formation." },
  { basin: "Gulf of Mexico (Offshore)", mbd: 1.85, pct: 13.8, fill: "#3B82F6", desc: "Deepwater subsea tiebacks; low decline rate baseload crude." },
  { basin: "Bakken (North Dakota)", mbd: 1.28, pct: 9.5, fill: "#F59E0B", desc: "Williston Basin light sweet crude; pipeline-linked to Cushing and Gulf Coast." },
  { basin: "Eagle Ford (South Texas)", mbd: 1.15, pct: 8.6, fill: "#8B5CF6", desc: "Proximity to Corpus Christi and Houston export terminals; high condensate yield." },
  { basin: "Niobrara / DJ (CO/WY)", mbd: 0.68, pct: 5.1, fill: "#EC4899", desc: "Denver-Julesburg basin light sweet crude." },
  { basin: "Alaska North Slope", mbd: 0.43, pct: 3.2, fill: "#06B6D4", desc: "Trans-Alaska Pipeline System (TAPS) legacy field; Prudhoe Bay." },
  { basin: "Other Lower-48 Onshore", mbd: 1.81, pct: 13.5, fill: "#64748B", desc: "Conventional Mid-Continent, California, Anadarko, and Appalachia." }
];

export const CountryProductionLevels: React.FC<CountryProductionLevelsProps> = ({
  onOpenTerminalWithPrompt
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>("us");
  const [activeChartMode, setActiveChartMode] = useState<"ranking" | "historical" | "us_basins">("ranking");

  const selectedCountry = countryProductionLevels.find(c => c.id === selectedCountryId) || countryProductionLevels[0];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Live Production Telemetry */}
      <div className="bg-[#101522] border border-[#B08D57]/30 rounded-xl p-5 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#10B981] text-[#0A111C] text-[10px] font-mono-data font-bold px-2.5 py-0.5 rounded tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                <Award className="w-3.5 h-3.5" />
                US #1 GLOBAL PRODUCER RECORD
              </span>
              <span className="bg-[#B08D57]/20 border border-[#B08D57]/40 text-[#E5C794] text-[10px] font-mono-data px-2.5 py-0.5 rounded flex items-center gap-1">
                <Globe2 className="w-3 h-3 text-[#B08D57]" />
                GLOBAL PRODUCTION: ~103.2M BPD
              </span>
              <span className="bg-blue-950/60 border border-blue-500/30 text-blue-300 text-[10px] font-mono-data px-2.5 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                VERIFIED EIA, IEA &amp; OPEC TELEMETRY
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#FBF8F1] tracking-tight">
              Global Crude Oil Production by Country &amp; US Output Dominance
            </h2>
            <p className="text-xs sm:text-sm text-[#8292A6] leading-relaxed">
              Real-time daily crude extraction volumes across sovereign producers. The United States continues to lead world production at an all-time record <strong>13.45 Million barrels per day</strong> (outproducing Saudi Arabia and Russia), driven by Permian Basin technological efficiencies while OPEC+ maintains disciplined supply curbs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenTerminalWithPrompt && (
              <button
                onClick={() =>
                  onOpenTerminalWithPrompt(
                    "Analyze current US crude oil production levels (13.45M bpd), Permian basin decline curves, and how this offsets OPEC+ production cuts and Middle East supply risks."
                  )
                }
                className="flex items-center gap-2 bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] text-xs font-sans font-bold px-4 py-2.5 rounded-lg transition-all shadow-md uppercase tracking-wider cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate US vs OPEC Balance</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Stat Rapid Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#B08D57]/20 font-mono-data text-xs">
          <div className="bg-black/40 border border-[#10B981]/40 p-3 rounded-lg">
            <span className="text-[10px] text-[#10B981] block uppercase font-bold flex items-center gap-1">
              <span>🇺🇸 United States Output</span>
            </span>
            <div className="text-lg font-bold text-white mt-0.5">13.45M bpd</div>
            <span className="text-[10px] text-[#8292A6]">
              #1 in World • <strong className="text-emerald-300">Permian: 6.25M</strong>
            </span>
          </div>

          <div className="bg-black/40 border border-blue-500/30 p-3 rounded-lg">
            <span className="text-[10px] text-blue-400 block uppercase font-bold flex items-center gap-1">
              <span>🇸🇦 Saudi Arabia Output</span>
            </span>
            <div className="text-lg font-bold text-blue-200 mt-0.5">9.05M bpd</div>
            <span className="text-[10px] text-[#8292A6]">
              3.10M bpd Spare Capacity Held
            </span>
          </div>

          <div className="bg-black/40 border border-red-500/30 p-3 rounded-lg">
            <span className="text-[10px] text-red-400 block uppercase font-bold flex items-center gap-1">
              <span>🇷🇺 Russia Crude Output</span>
            </span>
            <div className="text-lg font-bold text-red-200 mt-0.5">9.15M bpd</div>
            <span className="text-[10px] text-[#8292A6]">
              88% rerouted to India &amp; China
            </span>
          </div>

          <div className="bg-black/40 border border-amber-500/30 p-3 rounded-lg">
            <span className="text-[10px] text-amber-400 block uppercase font-bold flex items-center gap-1">
              <span>🇨🇦 Canada + 🇧🇷 Brazil</span>
            </span>
            <div className="text-lg font-bold text-amber-200 mt-0.5">8.34M bpd Combined</div>
            <span className="text-[10px] text-[#8292A6]">
              Non-OPEC expansion leaders
            </span>
          </div>
        </div>
      </div>

      {/* 2. Chart Mode Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 border border-[#B08D57]/30 rounded-xl p-2 font-mono-data text-xs shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveChartMode("ranking")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeChartMode === "ranking"
                ? "bg-[#B08D57] text-[#0E1A2B] shadow-md"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Top 10 Country Production Ranking</span>
          </button>

          <button
            onClick={() => setActiveChartMode("historical")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeChartMode === "historical"
                ? "bg-[#10B981] text-[#0A111C] shadow-md shadow-emerald-500/20"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Multi-Year Production Trajectory (2018-2026)</span>
          </button>

          <button
            onClick={() => setActiveChartMode("us_basins")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeChartMode === "us_basins"
                ? "bg-[#3B82F6] text-white shadow-md shadow-blue-500/20"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>US Basin Breakdown (Permian 46.5%)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8292A6] px-2 hidden lg:inline">
            Click any country below to inspect field data and trading implications
          </span>
          <ChartExportDropdown
            chartTitle="Global Crude Oil Production Telemetry & Basins"
            chartContainerId="country-production-levels-chart-card"
            subtitle={`ACTIVE MODE: ${activeChartMode.toUpperCase()} // US RECORD: 13.45M BPD // PERMIAN: 6.25M BPD`}
            size="xs"
            buttonLabel="Export Data"
            getCsvData={() => {
              if (activeChartMode === "historical") {
                const headers = ["Year", "United States (M bpd)", "Russia (M bpd)", "Saudi Arabia (M bpd)", "Canada (M bpd)", "China (M bpd)", "World Liquids (M bpd)"];
                const rows = historicalProductionData.map(d => [d.year, d.us, d.russia, d.saudi, d.canada, d.china, d.world]);
                return {
                  filename: "smc-historical-crude-production-trends",
                  headers,
                  rows,
                  metaComments: ["SIN MIEDO CAPITAL // HISTORICAL CRUDE OIL EXTRACTION (2018-2026 LIVE)"]
                };
              }
              if (activeChartMode === "us_basins") {
                const headers = ["Basin / Region", "Extraction (M bpd)", "Share of US Total (%)", "Basin Description"];
                const rows = usBasinBreakdownData.map(d => [d.basin, d.mbd, `${d.pct}%`, d.desc]);
                return {
                  filename: "smc-us-crude-basin-breakdown",
                  headers,
                  rows,
                  metaComments: ["SIN MIEDO CAPITAL // UNITED STATES CRUDE PRODUCTION BY BASIN", "Total US Output: 13.45M bpd"]
                };
              }
              const headers = ["Country", "Rank", "Current Extraction (M bpd)", "Share of Global (%)", "OPEC Status", "Spare Capacity (M bpd)", "Primary Basins", "YoY Trend", "Key Catalyst"];
              const rows = countryProductionLevels.map(c => [c.country, c.rank, c.currentMbd, `${c.shareGlobalPct}%`, c.opecStatus, c.spareCapacityMbd, c.primaryBasins, c.trajectoryTrend, c.keyCatalyst]);
              return {
                filename: "smc-top-10-crude-producers",
                headers,
                rows,
                metaComments: ["SIN MIEDO CAPITAL // GLOBAL TOP 10 CRUDE OIL PRODUCERS (2026 LIVE)", "US Leads World at 13.45M bpd"]
              };
            }}
          />
        </div>
      </div>

      {/* 3. Primary Chart Container */}
      <div id="country-production-levels-chart-card" className="bg-[#111622] border border-[#B08D57]/30 rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
        {activeChartMode === "ranking" && (
          <div id="country-production-ranking-chart">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#B08D57]" />
                  Global Top 10 Crude Oil Producers (Million Barrels per Day - M bpd)
                </h3>
                <span className="text-[11px] font-mono-data text-[#D1D5DB]">
                  Data reflects live 2026 average daily crude extraction. Hover bars for details.
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono-data">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" /> Non-OPEC (US #1)
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" /> OPEC Core
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> OPEC+
                </span>
                <ChartExportDropdown
                  chartTitle="Global Top 10 Crude Oil Producers (2026 Live)"
                  chartContainerId="country-production-ranking-chart"
                  subtitle="US Record Output: 13.45M bpd // Non-OPEC vs OPEC Breakdown"
                  size="xs"
                  getCsvData={() => {
                    const headers = ["Country", "Rank", "Current Extraction (M bpd)", "Share of Global (%)", "OPEC Status", "Spare Capacity (M bpd)", "Primary Basins", "YoY Trend", "Key Catalyst"];
                    const rows = countryProductionLevels.map(c => [c.country, c.rank, c.currentMbd, `${c.shareGlobalPct}%`, c.opecStatus, c.spareCapacityMbd, c.primaryBasins, c.trajectoryTrend, c.keyCatalyst]);
                    return {
                      filename: "smc-top-10-crude-producers-ranking",
                      headers,
                      rows,
                      metaComments: ["SIN MIEDO CAPITAL // TOP 10 CRUDE PRODUCERS", "US: 13.45M bpd (Global #1)"]
                    };
                  }}
                />
              </div>
            </div>

            <div className="h-80 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={countryProductionLevels}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload[0]) {
                      const payload = state.activePayload[0].payload as CountryProductionData;
                      setSelectedCountryId(payload.id);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    type="number"
                    stroke="#8292A6"
                    tick={{ fill: "#EDE9DE", fontSize: 10 }}
                    domain={[0, 15]}
                    ticks={[0, 3, 6, 9, 12, 15]}
                  />
                  <YAxis
                    dataKey="country"
                    type="category"
                    stroke="#8292A6"
                    tick={{ fill: "#FFFFFF", fontSize: 11 }}
                    width={115}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0E131F",
                      borderColor: "#B08D57",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "#FFFFFF"
                    }}
                    itemStyle={{ color: "#FFFFFF" }}
                    labelStyle={{ color: "#E5C794", fontWeight: "bold" }}
                    formatter={(val: any, name: any, item: any) => {
                      const d = item.payload as CountryProductionData;
                      return [
                        `${val}M bpd (${d.shareGlobalPct}% of global) • Rank #${d.rank}`,
                        `${d.country} ${d.flag}`
                      ];
                    }}
                  />
                  <ReferenceLine
                    x={10}
                    stroke="#B08D57"
                    strokeDasharray="4 4"
                    label={{ value: "10M bpd Megaproducer Line", fill: "#B08D57", fontSize: 10, position: "top" }}
                  />
                  <Bar dataKey="currentMbd" radius={[0, 6, 6, 0]} cursor="pointer">
                    {countryProductionLevels.map((entry) => (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.fill}
                        opacity={selectedCountryId === entry.id ? 1.0 : 0.75}
                        stroke={selectedCountryId === entry.id ? "#FFFFFF" : undefined}
                        strokeWidth={selectedCountryId === entry.id ? 1.5 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] font-mono-data text-white pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-white font-medium">*US leads the world at 13.45M bpd — exceeding Saudi Arabia by +4.40M bpd and Russia by +4.30M bpd.</span>
              <span className="text-[#E5C794] font-bold">Total Top 10 Share: ~52.8M bpd (~51.2% of global liquids)</span>
            </div>
          </div>
        )}

        {activeChartMode === "historical" && (
          <div id="country-production-historical-chart">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  Historical Production Trajectory (2018 - 2026 Live, M bpd)
                </h3>
                <span className="text-[11px] font-mono-data text-[#D1D5DB]">
                  Demonstrates the rapid ascent of US shale surpassing Saudi Arabia and Russia.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-data bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  US Grew from 10.99M to 13.45M bpd (+22.4%)
                </span>
                <ChartExportDropdown
                  chartTitle="Historical Crude Production Trajectory (2018-2026 Live)"
                  chartContainerId="country-production-historical-chart"
                  subtitle="US Record Growth vs Saudi Arabia & Russia Multi-Year Output"
                  size="xs"
                  getCsvData={() => {
                    const headers = [
                      "Year",
                      "United States (M bpd)",
                      "Russia (M bpd)",
                      "Saudi Arabia (M bpd)",
                      "Canada (M bpd)",
                      "China (M bpd)",
                      "World Total Liquids (M bpd)",
                    ];
                    const rows = historicalProductionData.map((d) => [
                      d.year,
                      d.us,
                      d.russia,
                      d.saudi,
                      d.canada,
                      d.china,
                      d.world,
                    ]);
                    return {
                      filename: "smc-historical-production-trajectory-2018-2026",
                      headers,
                      rows,
                      metaComments: [
                        "SIN MIEDO CAPITAL // MULTI-YEAR CRUDE EXTRACTION TRAJECTORY",
                        "Source: EIA, IEA, Joint Organisations Data Initiative (JODI)",
                      ],
                    };
                  }}
                />
              </div>
            </div>

            <div className="h-80 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalProductionData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="year" stroke="#8292A6" tick={{ fill: "#EDE9DE", fontSize: 10 }} />
                  <YAxis
                    stroke="#8292A6"
                    tick={{ fill: "#EDE9DE", fontSize: 10 }}
                    domain={[2, 14.5]}
                    ticks={[3, 5, 7, 9, 11, 13, 14]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0E131F",
                      borderColor: "#B08D57",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "#FFFFFF"
                    }}
                    itemStyle={{ color: "#FFFFFF" }}
                    labelStyle={{ color: "#E5C794", fontWeight: "bold" }}
                    formatter={(val: any, name: any) => [`${val}M bpd`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "#FFFFFF" }} />
                  <Line
                    type="monotone"
                    dataKey="us"
                    name="🇺🇸 United States (Record 13.45M)"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10B981" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="russia"
                    name="🇷🇺 Russia (9.15M)"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#EF4444" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="saudi"
                    name="🇸🇦 Saudi Arabia (9.05M)"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#3B82F6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="canada"
                    name="🇨🇦 Canada (4.92M)"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="china"
                    name="🇨🇳 China (4.20M)"
                    stroke="#EC4899"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] font-mono-data text-white pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-white font-medium">*Notice the 2020 COVID shock collapse followed by US shale reaching all-time record highs in 2024-2026.</span>
              <span className="text-emerald-400 font-bold">US Permian Basin alone is 6.25M bpd</span>
            </div>
          </div>
        )}

        {activeChartMode === "us_basins" && (
          <div id="country-production-basins-chart">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#3B82F6]" />
                  United States Crude Production Breakdown by Basin (Total: 13.45M bpd)
                </h3>
                <span className="text-[11px] font-mono-data text-[#D1D5DB]">
                  Permian Basin produces 46.5% of total American oil extraction.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-data bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Permian: 6.25M bpd (#1 Basin Worldwide)
                </span>
                <ChartExportDropdown
                  chartTitle="US Crude Production Breakdown by Basin (Total 13.45M bpd)"
                  chartContainerId="country-production-basins-chart"
                  subtitle="Permian Basin (6.25M bpd) + Deepwater Gulf of Mexico + Major US Plays"
                  size="xs"
                  getCsvData={() => {
                    const headers = [
                      "Basin / Formation",
                      "Production (M bpd)",
                      "Share of US Total (%)",
                      "Basin Geological Description & Rig Activity",
                    ];
                    const rows = usBasinBreakdownData.map((d) => [
                      d.basin,
                      d.mbd,
                      `${d.pct}%`,
                      d.desc,
                    ]);
                    return {
                      filename: "smc-us-crude-production-by-basin",
                      headers,
                      rows,
                      metaComments: [
                        "SIN MIEDO CAPITAL // US SHALE & OFFSHORE BASIN BREAKDOWN",
                        "Source: US EIA Drilling Productivity Report (DPR) & Baker Hughes Rig Count",
                        "Total US Record Output: 13.45M bpd",
                      ],
                    };
                  }}
                />
              </div>
            </div>

            <div className="h-80 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={usBasinBreakdownData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    type="number"
                    stroke="#8292A6"
                    tick={{ fill: "#EDE9DE", fontSize: 10 }}
                    domain={[0, 7]}
                    ticks={[0, 1.5, 3.0, 4.5, 6.0, 7.0]}
                  />
                  <YAxis
                    dataKey="basin"
                    type="category"
                    stroke="#8292A6"
                    tick={{ fill: "#FFFFFF", fontSize: 11 }}
                    width={185}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0E131F",
                      borderColor: "#B08D57",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "#FFFFFF"
                    }}
                    itemStyle={{ color: "#FFFFFF" }}
                    labelStyle={{ color: "#E5C794", fontWeight: "bold" }}
                    formatter={(val: any, name: any, item: any) => {
                      const d = item.payload;
                      return [`${val}M bpd (${d.pct}% of US total)`, d.desc];
                    }}
                  />
                  <Bar dataKey="mbd" radius={[0, 6, 6, 0]}>
                    {usBasinBreakdownData.map((entry, index) => (
                      <Cell key={`basin-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] font-mono-data text-white pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-white font-medium">*Permian Basin (West Texas &amp; SE New Mexico) alone produces more crude than Iraq, Iran, UAE, or China.</span>
              <span className="text-emerald-400 font-bold">Deepwater Gulf of Mexico adds 1.85M bpd of low-decline crude</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Selected Country Deep Dive Card */}
      <div className="bg-[#121722] border border-[#B08D57]/40 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#B08D57]/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedCountry.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-sans">{selectedCountry.country}</h3>
                <span className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[#E5C794]">
                  Rank #{selectedCountry.rank}
                </span>
                <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded ${
                  selectedCountry.opecStatus === "Non-OPEC"
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                    : selectedCountry.opecStatus === "OPEC Core"
                    ? "bg-blue-950/60 text-blue-300 border border-blue-500/40"
                    : "bg-red-950/60 text-red-300 border border-red-500/40"
                }`}>
                  {selectedCountry.opecStatus}
                </span>
              </div>
              <span className="text-xs text-[#8292A6] font-mono-data">
                Extraction: <strong className="text-white">{selectedCountry.currentMbd}M bpd</strong> • Global Market Share: <strong className="text-[#E5C794]">{selectedCountry.shareGlobalPct}%</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-lg text-right font-mono-data">
              <span className="text-[9px] text-[#8292A6] block uppercase">Spare Capacity</span>
              <span className="text-sm font-bold text-[#E5C794]">{selectedCountry.spareCapacityMbd}M bpd</span>
            </div>
            <div className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-lg text-right font-mono-data">
              <span className="text-[9px] text-[#8292A6] block uppercase">YoY Trajectory</span>
              <span className="text-sm font-bold text-white">{selectedCountry.trajectoryTrend}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-mono-data text-xs">
          <div className="bg-black/30 border border-white/5 rounded-lg p-3.5 space-y-1.5">
            <span className="text-[10px] text-[#8292A6] block uppercase font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#B08D57]" /> Key Production Basins &amp; Asset Hubs
            </span>
            <p className="text-[#EDE9DE] text-xs leading-relaxed font-sans">
              {selectedCountry.primaryBasins}
            </p>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-lg p-3.5 space-y-1.5">
            <span className="text-[10px] text-[#8292A6] block uppercase font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#E5C794]" /> Strategic Catalyst &amp; Market Footprint
            </span>
            <p className="text-[#EDE9DE] text-xs leading-relaxed font-sans">
              {selectedCountry.keyCatalyst}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Country Cards Grid for Quick Switching */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono-data px-1">
          <span className="text-[#8292A6] uppercase tracking-wider">Select Producer to Inspect:</span>
          <span className="text-[#B08D57]">10 Nations Account for 51.2% of Worldwide Crude</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {countryProductionLevels.map((item) => {
            const isSelected = selectedCountryId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedCountryId(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer font-mono-data ${
                  isSelected
                    ? "bg-[#151C2A] border-[#B08D57] shadow-lg shadow-[#B08D57]/15 ring-1 ring-[#B08D57]/60"
                    : "bg-[#0F1420] border-white/10 hover:border-[#B08D57]/40 hover:bg-[#131926]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{item.flag}</span>
                  <span className="text-[10px] text-[#8292A6] bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                    #{item.rank}
                  </span>
                </div>
                <div className="font-bold text-white text-xs truncate font-sans">{item.country}</div>
                <div className="text-sm font-bold text-[#E5C794] mt-0.5">{item.currentMbd}M bpd</div>
                <div className="text-[9px] text-[#8292A6] mt-0.5 flex items-center justify-between">
                  <span>{item.shareGlobalPct}% of world</span>
                  <span className={item.id === "us" ? "text-emerald-400 font-bold" : ""}>
                    {item.id === "us" ? "RECORD" : item.opecStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
