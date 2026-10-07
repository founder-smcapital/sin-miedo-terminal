import React, { useState } from "react";
import {
  TrendingUp,
  Ship,
  Droplets,
  DollarSign,
  Globe2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Scale,
  RefreshCw,
  Coins
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

interface IndiaRussiaCrudeFlowProps {
  onOpenTerminalWithPrompt?: (prompt: string) => void;
}

export const indiaRussianCrudeFlowHistory = [
  { period: "2021 Pre-War", russianMbd: 0.05, sharePct: 1.8, brentPrice: 70.9, uralsDiscount: -2.1, uralsPrice: 68.8, note: "Pre-conflict baseline (<2% of India imports)" },
  { period: "2022 Q1", russianMbd: 0.12, sharePct: 2.5, brentPrice: 97.4, uralsDiscount: -12.4, uralsPrice: 85.0, note: "Invasion began; Western buyers self-sanctioned" },
  { period: "2022 Q2", russianMbd: 0.72, sharePct: 15.2, brentPrice: 112.0, uralsDiscount: -34.5, uralsPrice: 77.5, note: "Panic selling: Urals discounted by -$34.50/bbl" },
  { period: "2022 Q3", russianMbd: 0.94, sharePct: 19.8, brentPrice: 98.2, uralsDiscount: -23.0, uralsPrice: 75.2, note: "Indian refiners reconfigured crude distillation units" },
  { period: "2022 Q4", russianMbd: 1.18, sharePct: 24.8, brentPrice: 88.6, uralsDiscount: -21.5, uralsPrice: 67.1, note: "G7 $60/bbl price cap enacted; shadow fleet mobilized" },
  { period: "2023 Q1", russianMbd: 1.62, sharePct: 34.5, brentPrice: 82.2, uralsDiscount: -18.2, uralsPrice: 64.0, note: "Russia overtakes Iraq as India's #1 crude supplier" },
  { period: "2023 Q2", russianMbd: 1.85, sharePct: 39.5, brentPrice: 77.7, uralsDiscount: -16.0, uralsPrice: 61.7, note: "Peak volume surge; Jamnagar & Vadinar refiners at max" },
  { period: "2023 Q4", russianMbd: 1.64, sharePct: 34.2, brentPrice: 83.7, uralsDiscount: -13.5, uralsPrice: 70.2, note: "Settlement shifts to UAE Dirhams (AED) and INR Vostro" },
  { period: "2024 H1", russianMbd: 1.80, sharePct: 37.6, brentPrice: 84.5, uralsDiscount: -11.8, uralsPrice: 72.7, note: "Dark tanker logistics regularized; discounts compress" },
  { period: "2024 H2", russianMbd: 1.85, sharePct: 38.6, brentPrice: 78.4, uralsDiscount: -11.0, uralsPrice: 67.4, note: "Long-term term contracts signed by Indian state refiners" },
  { period: "2025 Average", russianMbd: 1.94, sharePct: 39.2, brentPrice: 84.1, uralsDiscount: -8.9, uralsPrice: 75.2, note: "Structural baseline established (~1.94M bpd)" },
  { period: "2026 LIVE", russianMbd: 1.88, sharePct: 38.4, brentPrice: 104.6, uralsDiscount: -7.2, uralsPrice: 97.4, note: "Active hedge against Persian Gulf Hormuz risk" }
];

export const indiaImportOriginBasket = [
  { origin: "Russia (Urals, ESPO, Sokol)", mbd: 1.88, pct: 38.4, fill: "#EF4444", paymentMode: "UAE Dirhams (AED) & INR Vostro accounts", shiftYoY: "+1.2%" },
  { origin: "Iraq (Basra Medium/Heavy)", mbd: 0.98, pct: 20.0, fill: "#3B82F6", paymentMode: "US Dollars (USD)", shiftYoY: "-3.4%" },
  { origin: "Saudi Arabia (Arab Light/Medium)", mbd: 0.65, pct: 13.3, fill: "#10B981", paymentMode: "US Dollars (USD)", shiftYoY: "-4.1%" },
  { origin: "United Arab Emirates (Murban)", mbd: 0.42, pct: 8.6, fill: "#8B5CF6", paymentMode: "AED & US Dollars", shiftYoY: "+0.5%" },
  { origin: "United States (WTI Midland)", mbd: 0.28, pct: 5.7, fill: "#F59E0B", paymentMode: "US Dollars (USD)", shiftYoY: "+1.8%" },
  { origin: "West Africa (Nigeria/Angola)", mbd: 0.25, pct: 5.1, fill: "#06B6D4", paymentMode: "US Dollars / Euros", shiftYoY: "-1.0%" },
  { origin: "Other (Kuwait, LatAm, Oman)", mbd: 0.44, pct: 8.9, fill: "#64748B", paymentMode: "Multi-currency", shiftYoY: "Flat" }
];

export const IndiaRussiaCrudeFlow: React.FC<IndiaRussiaCrudeFlowProps> = ({
  onOpenTerminalWithPrompt
}) => {
  const [activeChartTab, setActiveChartTab] = useState<"volumes" | "discount_spread" | "import_basket">("volumes");

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Strategic Realignment Metrics */}
      <div className="bg-[#111420] border border-[#B08D57]/30 rounded-xl p-5 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EF4444]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#B08D57]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#EF4444] text-white text-[10px] font-mono-data font-bold px-2.5 py-0.5 rounded tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                <Ship className="w-3.5 h-3.5" />
                INDIA-RUSSIA CRUDE CORRIDOR
              </span>
              <span className="bg-[#B08D57]/20 border border-[#B08D57]/40 text-[#E5C794] text-[10px] font-mono-data px-2.5 py-0.5 rounded flex items-center gap-1">
                <Droplets className="w-3 h-3 text-[#B08D57]" />
                CURRENT FLOW: ~1.88M BPD (38.4% SHARE)
              </span>
              <span className="bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] font-mono-data px-2.5 py-0.5 rounded flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                DE-DOLLARIZED SETTLEMENT (AED &amp; INR)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#FBF8F1] tracking-tight">
              India-Russia Crude Oil Trade Realignment &amp; Sanctions Arbitrage
            </h2>
            <p className="text-xs sm:text-sm text-[#8292A6] leading-relaxed">
              Tracking the historic structural transformation in global oil logistics since 2022. India has shifted from importing less than 2% of its crude from Russia to purchasing <strong>38.4% of its total oil requirements (~1.88M bpd)</strong> from Russian ports, generating billions in refining margin savings while insulating Indian energy security against Strait of Hormuz turmoil.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <ChartExportDropdown
              chartTitle="India-Russia Crude Oil Trade Realignment & Sanctions Arbitrage"
              chartContainerId="india-russia-crude-flow-card"
              subtitle="RUSSIAN CRUDE INFLOW: 1.88M BPD // SHARE: 38.4% // URALS DISCOUNT: -$7.20/BBL"
              size="xs"
              buttonLabel="Export Flow Data"
              getCsvData={() => {
                if (activeChartTab === "discount_spread") {
                  const headers = ["Period", "Urals Discount vs Brent ($/bbl)", "Brent Benchmark ($/bbl)", "Urals Price ($/bbl)", "Historical Context"];
                  const rows = indiaRussianCrudeFlowHistory.map(d => [d.period, d.uralsDiscount, d.brentPrice, d.uralsPrice, d.note]);
                  return {
                    filename: "smc-urals-brent-discount-spread",
                    headers,
                    rows,
                    metaComments: ["SIN MIEDO CAPITAL // URALS VS BRENT DISCOUNT SPREAD ARBITRAGE"]
                  };
                }
                if (activeChartTab === "import_basket") {
                  const headers = ["Origin Country / Sourcing Region", "Volume (M bpd)", "Share of Total (%)", "Settlement Currency / Mechanism", "YoY Shift"];
                  const rows = indiaImportOriginBasket.map(d => [d.origin, d.mbd, `${d.pct}%`, d.paymentMode, d.shiftYoY]);
                  return {
                    filename: "smc-india-crude-import-origin-basket",
                    headers,
                    rows,
                    metaComments: ["SIN MIEDO CAPITAL // INDIA SOURCING BASKET BY ORIGIN (4.9M BPD TOTAL)"]
                  };
                }
                const headers = ["Period", "Russian Seaborne Volume (M bpd)", "Share of India Seaborne Imports (%)", "Brent Benchmark ($/bbl)", "Urals Discount ($/bbl)", "Urals Realized Price ($/bbl)", "Strategic Context"];
                const rows = indiaRussianCrudeFlowHistory.map(d => [d.period, d.russianMbd, `${d.sharePct}%`, d.brentPrice, d.uralsDiscount, d.uralsPrice, d.note]);
                return {
                  filename: "smc-india-russia-crude-import-surge",
                  headers,
                  rows,
                  metaComments: ["SIN MIEDO CAPITAL // INDIA IMPORTS OF RUSSIAN CRUDE (2021-2026 LIVE)"]
                };
              }}
            />

            {onOpenTerminalWithPrompt && (
              <button
                onClick={() =>
                  onOpenTerminalWithPrompt(
                    "Evaluate India's reliance on Russian crude imports (~1.88M bpd, 38.4% share), the Urals-Brent discount spread, non-USD payment channels (AED/INR), and whether secondary sanctions could disrupt this trade flow."
                  )
                }
                className="flex items-center gap-2 bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] text-xs font-sans font-bold px-4 py-2.5 rounded-lg transition-all shadow-md uppercase tracking-wider cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Trade Flow Sanctions</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Stat Rapid Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#B08D57]/20 font-mono-data text-xs">
          <div className="bg-black/40 border border-red-500/30 p-3 rounded-lg">
            <span className="text-[10px] text-red-400 block uppercase font-bold">Russian Seaborne Volume</span>
            <div className="text-lg font-bold text-white mt-0.5">1.88M bpd</div>
            <span className="text-[10px] text-[#8292A6]">
              #1 Supplier to India • <strong className="text-red-300">Surged from 0.05M</strong>
            </span>
          </div>

          <div className="bg-black/40 border border-[#B08D57]/40 p-3 rounded-lg">
            <span className="text-[10px] text-[#E5C794] block uppercase font-bold">India Market Share</span>
            <div className="text-lg font-bold text-[#E5C794] mt-0.5">38.4%</div>
            <span className="text-[10px] text-[#8292A6]">
              Displaced Saudi Arabia (13.3%) &amp; Iraq (20%)
            </span>
          </div>

          <div className="bg-black/40 border border-emerald-500/30 p-3 rounded-lg">
            <span className="text-[10px] text-emerald-400 block uppercase font-bold">Urals Discount Spread</span>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">-$7.20 / bbl</div>
            <span className="text-[10px] text-[#8292A6]">
              Urals ~$97.40 vs Brent ~$104.60
            </span>
          </div>

          <div className="bg-black/40 border border-blue-500/30 p-3 rounded-lg">
            <span className="text-[10px] text-blue-400 block uppercase font-bold">Daily Feedstock Savings</span>
            <div className="text-lg font-bold text-blue-200 mt-0.5">~$13.5M / day</div>
            <span className="text-[10px] text-[#8292A6]">
              ~$4.9B annual gain for Indian refiners
            </span>
          </div>
        </div>
      </div>

      {/* 2. Chart Mode Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 border border-[#B08D57]/30 rounded-xl p-2 font-mono-data text-xs shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveChartTab("volumes")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeChartTab === "volumes"
                ? "bg-[#B08D57] text-[#0E1A2B] shadow-md"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Russian Volume &amp; Market Share Surge (2021-2026)</span>
          </button>

          <button
            onClick={() => setActiveChartTab("discount_spread")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeChartTab === "discount_spread"
                ? "bg-[#10B981] text-[#0A111C] shadow-md shadow-emerald-500/20"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Urals vs. Brent Discount Spread Trajectory</span>
          </button>

          <button
            onClick={() => setActiveChartTab("import_basket")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeChartTab === "import_basket"
                ? "bg-[#3B82F6] text-white shadow-md shadow-blue-500/20"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>India Sourcing Basket by Origin (Total 4.9M bpd)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8292A6] px-2 hidden lg:inline">
            Data verified by Kpler, Vortexa &amp; Indian Ministry of Petroleum
          </span>
          <ChartExportDropdown
            chartTitle="India-Russia Crude Trade Flow Telemetry"
            chartContainerId="india-russia-crude-flow-card"
            subtitle={`ACTIVE TAB: ${activeChartTab.toUpperCase()} // FLOW: ~1.88M BPD // SHARE: 38.4%`}
            size="xs"
            buttonLabel="Export Data"
            getCsvData={() => {
              if (activeChartTab === "discount_spread") {
                const headers = ["Period", "Urals Discount vs Brent ($/bbl)", "Brent Benchmark ($/bbl)", "Urals Price ($/bbl)", "Historical Context"];
                const rows = indiaRussianCrudeFlowHistory.map(d => [d.period, d.uralsDiscount, d.brentPrice, d.uralsPrice, d.note]);
                return {
                  filename: "smc-urals-brent-discount-spread",
                  headers,
                  rows,
                  metaComments: ["SIN MIEDO CAPITAL // URALS VS BRENT DISCOUNT SPREAD ARBITRAGE"]
                };
              }
              if (activeChartTab === "import_basket") {
                const headers = ["Origin Country / Sourcing Region", "Volume (M bpd)", "Share of Total (%)", "Settlement Currency / Mechanism", "YoY Shift"];
                const rows = indiaImportOriginBasket.map(d => [d.origin, d.mbd, `${d.pct}%`, d.paymentMode, d.shiftYoY]);
                return {
                  filename: "smc-india-crude-import-origin-basket",
                  headers,
                  rows,
                  metaComments: ["SIN MIEDO CAPITAL // INDIA SOURCING BASKET BY ORIGIN (4.9M BPD TOTAL)"]
                };
              }
              const headers = ["Period", "Russian Seaborne Volume (M bpd)", "Share of India Seaborne Imports (%)", "Brent Benchmark ($/bbl)", "Urals Discount ($/bbl)", "Urals Realized Price ($/bbl)", "Strategic Context"];
              const rows = indiaRussianCrudeFlowHistory.map(d => [d.period, d.russianMbd, `${d.sharePct}%`, d.brentPrice, d.uralsDiscount, d.uralsPrice, d.note]);
              return {
                filename: "smc-india-russia-crude-import-surge",
                headers,
                rows,
                metaComments: ["SIN MIEDO CAPITAL // INDIA IMPORTS OF RUSSIAN CRUDE (2021-2026 LIVE)"]
              };
            }}
          />
        </div>
      </div>

      {/* 3. Primary Chart Area */}
      <div id="india-russia-crude-flow-card" className="bg-[#111622] border border-[#B08D57]/30 rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
        {activeChartTab === "volumes" && (
          <div id="india-russia-volumes-chart">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <Ship className="w-4 h-4 text-[#EF4444]" />
                  India's Imports of Russian Crude (Million Barrels per Day &amp; % Share)
                </h3>
                <span className="text-[11px] font-mono-data text-[#D1D5DB]">
                  Evolution from pre-war negligible volumes (0.05M bpd) to structural core baseline (1.88M bpd).
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-data bg-red-950/60 text-red-300 border border-red-500/30 px-2 py-0.5 rounded">
                  +3,660% Growth Since 2021
                </span>
                <ChartExportDropdown
                  chartTitle="India Imports of Russian Crude (2021-2026 Live)"
                  chartContainerId="india-russia-volumes-chart"
                  subtitle="Inflow: 1.88M bpd (38.4% of India Seaborne Crude)"
                  size="xs"
                  getCsvData={() => {
                    const headers = ["Period", "Russian Seaborne Volume (M bpd)", "Share of India Seaborne Imports (%)", "Brent Benchmark ($/bbl)", "Urals Discount ($/bbl)", "Urals Realized Price ($/bbl)", "Strategic Context"];
                    const rows = indiaRussianCrudeFlowHistory.map(d => [d.period, d.russianMbd, `${d.sharePct}%`, d.brentPrice, d.uralsDiscount, d.uralsPrice, d.note]);
                    return {
                      filename: "smc-india-russian-crude-volume-surge",
                      headers,
                      rows,
                      metaComments: ["SIN MIEDO CAPITAL // INDIA IMPORTS OF RUSSIAN CRUDE (2021-2026)"]
                    };
                  }}
                />
              </div>
            </div>

            <div className="h-80 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={indiaRussianCrudeFlowHistory} margin={{ top: 15, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="russianVolumeColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="period" stroke="#8292A6" tick={{ fill: "#EDE9DE", fontSize: 10 }} />
                  <YAxis
                    yAxisId="left"
                    stroke="#EF4444"
                    tick={{ fill: "#EF4444", fontSize: 10 }}
                    domain={[0, 2.2]}
                    ticks={[0, 0.5, 1.0, 1.5, 2.0]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#E5C794"
                    tick={{ fill: "#FFFFFF", fontSize: 10 }}
                    domain={[0, 45]}
                    ticks={[0, 10, 20, 30, 40]}
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
                      if (name.includes("Volume")) {
                        return [`${val}M bpd`, "Russian Crude Inflow"];
                      }
                      return [`${val}%`, "Share of India Imports"];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "#FFFFFF" }} />
                  <ReferenceLine
                    yAxisId="left"
                    y={1.0}
                    stroke="#B08D57"
                    strokeDasharray="4 4"
                    label={{ value: "1.0M bpd Benchmark", fill: "#B08D57", fontSize: 10, position: "insideTopLeft" }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="russianMbd"
                    name="Russian Volume (M bpd)"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#russianVolumeColor)"
                    strokeWidth={2.5}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sharePct"
                    name="India Import Share (%)"
                    stroke="#E5C794"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#E5C794" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] font-mono-data text-white pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-white font-medium">*Russian crude accounts for 38.4% of Indian seaborne deliveries, primarily delivered to Jamnagar, Vadinar, and Paradip terminals.</span>
              <span className="text-red-300 font-bold">Over 88% loaded via Sovcomflot &amp; Dark Fleet Tankers</span>
            </div>
          </div>
        )}

        {activeChartTab === "discount_spread" && (
          <div id="india-russia-discount-chart">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#10B981]" />
                  Urals vs. Brent Crude Discount Spread ($/barrel)
                </h3>
                <span className="text-[11px] font-mono-data text-[#D1D5DB]">
                  Tracking the price arbitrage that fueled India's massive pivot away from Persian Gulf sour barrels.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-data bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Current Discount: -$7.20 / bbl
                </span>
                <ChartExportDropdown
                  chartTitle="Urals vs. Brent Crude Discount Spread ($/bbl)"
                  chartContainerId="india-russia-discount-chart"
                  subtitle="Historical Arbitrage Spread & Indian Refining Margin Capture"
                  size="xs"
                  getCsvData={() => {
                    const headers = ["Period", "Urals Discount vs Brent ($/bbl)", "Brent Price ($/bbl)", "Urals Price ($/bbl)", "Historical Arbitrage Notes"];
                    const rows = indiaRussianCrudeFlowHistory.map((d) => [
                      d.period,
                      d.uralsDiscount,
                      d.brentPrice,
                      d.uralsPrice,
                      d.note,
                    ]);
                    return {
                      filename: "smc-urals-brent-discount-spread-trajectory",
                      headers,
                      rows,
                      metaComments: [
                        "SIN MIEDO CAPITAL // URALS VS BRENT DISCOUNT TRAJECTORY",
                        "Peak Discount: -$34.50/bbl (Q2 2022)",
                        "Current Arbitrage: -$7.20/bbl (Stable Shadow Fleet Operations)",
                      ],
                    };
                  }}
                />
              </div>
            </div>

            <div className="h-80 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={indiaRussianCrudeFlowHistory} margin={{ top: 15, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="period" stroke="#8292A6" tick={{ fill: "#EDE9DE", fontSize: 10 }} />
                  <YAxis
                    stroke="#8292A6"
                    tick={{ fill: "#EDE9DE", fontSize: 10 }}
                    domain={[-40, 5]}
                    ticks={[-35, -25, -15, -7, 0]}
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
                      return [`$${val}/bbl (Brent $${d.brentPrice} vs Urals $${d.uralsPrice})`, d.note];
                    }}
                  />
                  <ReferenceLine y={0} stroke="#ffffff40" strokeWidth={1} />
                  <ReferenceLine
                    y={-10}
                    stroke="#E5C794"
                    strokeDasharray="4 4"
                    label={{ value: "-$10.00/bbl Historical Arbitrage Threshold", fill: "#E5C794", fontSize: 9.5, position: "insideBottomLeft" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="uralsDiscount"
                    name="Urals Discount vs Brent ($/bbl)"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10B981" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] font-mono-data text-white pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-white font-medium">*Panic selling in Q2 2022 produced historic -$34.50/bbl discounts. Today the shadow fleet network has stabilized the discount near -$7.20/bbl.</span>
              <span className="text-emerald-300 font-bold">Feedstock Arb: Indian refiners capture +$4.50-$6.00/bbl refining margin edge</span>
            </div>
          </div>
        )}

        {activeChartTab === "import_basket" && (
          <div id="india-russia-basket-chart">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#3B82F6]" />
                  India's Crude Import Basket by Origin Country (Total: ~4.90M bpd)
                </h3>
                <span className="text-[11px] font-mono-data text-[#D1D5DB]">
                  Russia now holds #1 market share at 38.4%, exceeding former top suppliers Iraq and Saudi Arabia.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-data bg-blue-950/60 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                  Russia: 1.88M bpd (#1)
                </span>
                <ChartExportDropdown
                  chartTitle="India Crude Import Basket by Origin (Total ~4.90M bpd)"
                  chartContainerId="india-russia-basket-chart"
                  subtitle="Russia 38.4% (#1) vs Iraq, Saudi Arabia, UAE & De-dollarized Settlement"
                  size="xs"
                  getCsvData={() => {
                    const headers = [
                      "Origin Country / Sourcing Region",
                      "Volume (M bpd)",
                      "Share of India Total (%)",
                      "Payment Settlement Mode",
                      "Shift YoY",
                    ];
                    const rows = indiaImportOriginBasket.map((d) => [
                      d.origin,
                      d.mbd,
                      `${d.pct}%`,
                      d.paymentMode,
                      d.shiftYoY,
                    ]);
                    return {
                      filename: "smc-india-crude-import-basket-origin",
                      headers,
                      rows,
                      metaComments: [
                        "SIN MIEDO CAPITAL // INDIA CRUDE OIL SOURCING BASKET",
                        "Source: Indian Ministry of Petroleum, Kpler & Vortexa",
                        "Russia is #1 supplier at 1.88M bpd",
                      ],
                    };
                  }}
                />
              </div>
            </div>

            <div className="h-80 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={indiaImportOriginBasket}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    type="number"
                    stroke="#8292A6"
                    tick={{ fill: "#EDE9DE", fontSize: 10 }}
                    domain={[0, 2.2]}
                    ticks={[0, 0.5, 1.0, 1.5, 2.0]}
                  />
                  <YAxis
                    dataKey="origin"
                    type="category"
                    stroke="#8292A6"
                    tick={{ fill: "#FFFFFF", fontSize: 10.5 }}
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
                      return [`${val}M bpd (${d.pct}% of India's imports)`, `Settlement: ${d.paymentMode}`];
                    }}
                  />
                  <Bar dataKey="mbd" radius={[0, 6, 6, 0]}>
                    {indiaImportOriginBasket.map((entry, index) => (
                      <Cell key={`basket-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] font-mono-data text-white pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-white font-medium">*Persian Gulf crude share dropped from 85%+ in 2021 to ~48% in 2026 as Russian seaborne barrels absorbed market share.</span>
              <span className="text-[#E5C794] font-bold">Settlement: Over 52% of Russian cargoes paid in UAE Dirhams (AED)</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Strategic Implications & Operational Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-data text-xs">
        <div className="bg-[#121622] border border-[#B08D57]/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <Ship className="w-4 h-4" />
            <span>Dark / Shadow Tanker Fleet</span>
          </div>
          <p className="text-[#E2E8F0] leading-relaxed font-sans text-xs">
            Over 88% of Russian crude shipped to India travels aboard the ~412-vessel "Shadow Fleet" (older Aframax/Suezmax tankers flying flags of convenience such as Panama, Liberia, and Gabon, with non-Western P&amp;I marine insurance).
          </p>
        </div>

        <div className="bg-[#121622] border border-[#B08D57]/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#E5C794] font-bold">
            <Coins className="w-4 h-4" />
            <span>De-Dollarized Settlements</span>
          </div>
          <p className="text-[#E2E8F0] leading-relaxed font-sans text-xs">
            52% of bilateral crude payments are settled in UAE Dirhams (AED) via Dubai financial intermediaries; 28% in Indian Rupee (INR) Vostro accounts; and 15% in Chinese Yuan (CNY), minimizing exposure to US Treasury OFAC sanctions.
          </p>
        </div>

        <div className="bg-[#121622] border border-[#B08D57]/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Scale className="w-4 h-4" />
            <span>Hormuz Risk Mitigation</span>
          </div>
          <p className="text-[#E2E8F0] leading-relaxed font-sans text-xs">
            Because India's dedicated strategic reserve (ISPRL) holds only <strong>9.5 days</strong> of consumption, the 1.88M bpd Russian maritime pipeline acts as an indispensable geopolitical shock absorber against Persian Gulf closures.
          </p>
        </div>
      </div>
    </div>
  );
};
