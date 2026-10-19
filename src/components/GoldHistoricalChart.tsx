import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from "recharts";
import {
  TrendingUp,
  Shield,
  Layers,
  Calendar,
  Globe,
  DollarSign,
  Maximize2,
  Minimize2,
  Info,
  Flame
} from "lucide-react";
import { MacroDataState } from "../types";
import { ChartExportDropdown } from "./ChartExportDropdown";
import { exportGoldGprChartPdf } from "../utils/chartExportUtils";

interface GoldHistoricalChartProps {
  macroData: MacroDataState;
}

type TimeframeOption = "1D" | "1W" | "1M" | "1Y" | "5Y";

interface GoldDataPoint {
  timestamp: string;
  price: number;
  volume: number;
  gpr?: number;
  comment?: string;
  isWarStart?: boolean;
}

export const GoldHistoricalChart: React.FC<GoldHistoricalChartProps> = ({ macroData }) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1Y");
  const [showSovereignFloor, setShowSovereignFloor] = useState<boolean>(true);
  const [showGprCorrelation, setShowGprCorrelation] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Extract live gold ticker if available
  const goldTicker = macroData.tickers.find(t => t.symbol === "XAU/USD");
  const liveSpotPrice = goldTicker?.price ?? 4185.60;
  const liveChangePct = goldTicker?.change ?? +1.28;

  // Multi-Timeframe Historical Data Sets for XAU/USD (reflecting >$4,000/oz Supercycle)
  const chartData: GoldDataPoint[] = useMemo(() => {
    switch (timeframe) {
      case "1D":
        return [
          { timestamp: "00:00", price: 4132.50, volume: 1420, gpr: 345, comment: "Asia open; PBOC physical delivery demand" },
          { timestamp: "02:00", price: 4128.20, volume: 1180, gpr: 348, comment: "Mild profit-taking; Shanghai Gold Exchange bids steady" },
          { timestamp: "04:00", price: 4136.80, volume: 1650, gpr: 352, comment: "European pre-market safe haven bids" },
          { timestamp: "06:00", price: 4148.40, volume: 2240, gpr: 358, comment: "London fix; commercial vault delivery premiums rise" },
          { timestamp: "08:00", price: 4156.00, volume: 2980, gpr: 362, comment: "GPR Spike: Middle East maritime threat escalation" },
          { timestamp: "10:00", price: 4168.60, volume: 3420, gpr: 365, comment: "US Cash open; institutional CTA trend models fire long" },
          { timestamp: "12:00", price: 4162.20, volume: 2110, gpr: 361, comment: "Midday consolidation above $4,160 support" },
          { timestamp: "14:00", price: 4174.80, volume: 2890, gpr: 364, comment: "Treasury real yields compress; safe haven flight" },
          { timestamp: "16:00", price: 4188.40, volume: 3750, gpr: 368, comment: "COMEX futures volume acceleration" },
          { timestamp: "18:00", price: 4198.80, volume: 3920, gpr: 371, comment: "Session High $4,198.80 / oz test" },
          { timestamp: "20:00", price: 4182.30, volume: 1840, gpr: 366, comment: "Evening session floor holding" },
          { timestamp: "Latest snapshot", price: liveSpotPrice, volume: 2450, gpr: 364.5, comment: "Illustrative chart endpoint anchored to the current macro ticker snapshot" }
        ];

      case "1W":
        return [
          { timestamp: "Mon", price: 4048.20, volume: 14200, gpr: 338, comment: "Central bank weekly allocation starts" },
          { timestamp: "Tue", price: 4082.50, volume: 18900, gpr: 346, comment: "Red Sea maritime security threat escalation" },
          { timestamp: "Wed", price: 4115.00, volume: 22400, gpr: 354, comment: "Cross-border sovereign reserve diversification" },
          { timestamp: "Thu", price: 4148.60, volume: 26100, gpr: 362, comment: "COMEX spot premium over paper expands" },
          { timestamp: "Fri", price: 4185.60, volume: 31200, gpr: 365, comment: "Breakout above $4,180 resistance" }
        ];

      case "1M":
        return [
          { timestamp: "Wk 1", price: 3885.00, volume: 78000, gpr: 315, comment: "PBOC 21st consecutive month gold reserve purchase" },
          { timestamp: "Wk 2", price: 3960.40, volume: 92000, gpr: 328, comment: "De-dollarization flows accelerate in BRICS+ trade" },
          { timestamp: "Wk 3", price: 4055.20, volume: 114000, gpr: 344, comment: "Decisive breakthrough of $4,000/oz institutional barrier" },
          { timestamp: "Wk 4", price: 4138.80, volume: 135000, gpr: 359, comment: "Sovereign wealth funds lift allocations to 8.5%" },
          { timestamp: "Current", price: liveSpotPrice, volume: 148000, gpr: 364.5, comment: "Consolidation in all-time high safe haven regime" }
        ];

      case "1Y":
        return [
          { timestamp: "Sep '25", price: 3420.00, volume: 380000, gpr: 205.4, comment: "12M benchmark: GPR breaches 200 threshold; Gold consolidates at $3,420/oz" },
          { timestamp: "Nov '25", price: 3590.00, volume: 420000, gpr: 208.5, comment: "UN Security Council emergency session; safe-haven reserve bids widen" },
          { timestamp: "Jan '26", price: 3780.00, volume: 480000, gpr: 224.5, comment: "Pre-war military buildup & ultimatums; US 5th Fleet mobilization in Arabian Sea" },
          { timestamp: "Feb '26", price: 3920.00, volume: 590000, gpr: 286.0, isWarStart: true, comment: "⚡ OUTBREAK OF WAR IN IRAN: Kinetic strikes; GPR surges +61.5 pts in single month; Gold tests $3,920" },
          { timestamp: "Apr '26", price: 4080.00, volume: 680000, gpr: 332.0, comment: "Retaliatory missile exchanges; Gold decisively breaks $4,000/oz threshold" },
          { timestamp: "Jun '26", price: 4150.00, volume: 750000, gpr: 352.4, comment: "Persistent refining infrastructure drone attacks; institutional safe haven floor established" },
          { timestamp: "Illustrative endpoint", price: liveSpotPrice, volume: 820000, gpr: 364.5, comment: "Illustrative chart endpoint anchored to the current macro ticker snapshot" }
        ];

      case "5Y":
      default:
        return [
          { timestamp: "2022", price: 1824.00, volume: 1450000, gpr: 185, comment: "Ukraine conflict begins; Russia FX reserves frozen" },
          { timestamp: "2023", price: 2062.90, volume: 1680000, gpr: 210, comment: "Non-Western central banks accelerate gold reserve diversification" },
          { timestamp: "2024", price: 2630.00, volume: 2100000, gpr: 245, comment: "De-dollarization momentum accelerates across Asia/ME" },
          { timestamp: "2025", price: 3420.00, volume: 2650000, gpr: 205.4, comment: "Central bank gold demand reaches record 32% of total" },
          { timestamp: "Feb '26", price: 3920.00, volume: 2980000, gpr: 286.0, isWarStart: true, comment: "⚡ OUTBREAK OF WAR IN IRAN: Direct kinetic strikes on Iranian facilities" },
          { timestamp: "Illustrative endpoint", price: liveSpotPrice, volume: 3200000, gpr: 364.5, comment: "Illustrative chart endpoint anchored to the current macro ticker snapshot" }
        ];
    }
  }, [timeframe, liveSpotPrice]);

  const minPrice = useMemo(() => {
    const prices = chartData.map(d => d.price);
    const min = Math.min(...prices);
    return Math.floor((min * 0.96) / 50) * 50;
  }, [chartData]);

  const maxPrice = useMemo(() => {
    const prices = chartData.map(d => d.price);
    const max = Math.max(...prices);
    return Math.ceil((max * 1.04) / 50) * 50;
  }, [chartData]);

  // Dynamically calculate GPR domain to ensure proportionate vertical scaling and steep slope visibility
  const minGpr = useMemo(() => {
    const gprs = chartData.map(d => d.gpr).filter((g): g is number => typeof g === "number");
    if (gprs.length === 0) return 100;
    const min = Math.min(...gprs);
    return Math.max(0, Math.floor((min * 0.94) / 10) * 10);
  }, [chartData]);

  const maxGpr = useMemo(() => {
    const gprs = chartData.map(d => d.gpr).filter((g): g is number => typeof g === "number");
    if (gprs.length === 0) return 400;
    const max = Math.max(...gprs);
    return Math.ceil((max * 1.05) / 10) * 10;
  }, [chartData]);

  const basePoint = chartData[0];
  const warPoint = chartData.find(d => d.isWarStart || d.timestamp === "Feb '26");

  return (
    <div
      id="xau-usd-historical-chart-card"
      className={`bg-[#101622] border border-[#B08D57]/35 hover:border-[#B08D57]/55 rounded-xl p-4 sm:p-6 transition-all shadow-2xl relative overflow-hidden ${
        isExpanded ? "ring-2 ring-[#B08D57]" : ""
      }`}
    >
      {/* Subtle top brass highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent pointer-events-none" />

      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#B08D57]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#B08D57]/30 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-black/70 border border-[#B08D57]/45 text-[#E5C794] shadow-inner">
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif italic text-xl sm:text-2xl font-bold tracking-tight text-[#FBF8F1]" style={{ fontFamily: "Georgia, 'Newsreader', serif" }}>
                XAU/USD Gold Macro Supercycle & Geopolitical Valuation
              </h3>
              <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/50 px-2.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <Info className="w-3 h-3" />
                MACRO TICKER SNAPSHOT
              </span>
            </div>
            <p className="text-[10px] font-mono-data text-[#BAC7D5] mt-0.5 tracking-wider uppercase font-semibold">
              INSTITUTIONAL SOVEREIGN RESERVE DIVERSIFICATION & SAFE HAVEN REPRICING ARCHITECTURE
            </p>
          </div>
        </div>

        {/* Action Controls: Timeframe Selector & Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Switcher */}
          <div className="flex items-center bg-black/70 p-1 rounded-lg border border-[#B08D57]/30 text-[10px] font-mono-data shadow-inner">
            {(["1D", "1W", "1M", "1Y", "5Y"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded transition-all uppercase font-medium ${
                  timeframe === tf
                    ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md scale-105"
                    : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="relative mb-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-[9px] sm:text-[10px] font-mono-data text-amber-200">
            ILLUSTRATIVE HISTORY · Historical prices, volume, GPR points, and annotations below are demo values, not provider observations.
            {" "}Latest ticker snapshot:             {goldTicker ? "macro feed value (PAXG/USD proxy; provider timestamp not certified)" : "illustrative seed value"}.
          </div>

          {/* Overlays Toggles */}
          <button
            onClick={() => setShowSovereignFloor(!showSovereignFloor)}
            className={`flex items-center gap-1 text-[10px] font-mono-data px-3 py-1.5 rounded-lg border transition-all ${
              showSovereignFloor
                ? "bg-[#B08D57]/25 border-[#B08D57]/60 text-[#FBF8F1] font-bold shadow-sm"
                : "bg-black/60 border-[#253347] text-[#BAC7D5] hover:text-[#FBF8F1]"
            }`}
          >
            <Shield className="w-3 h-3 text-[#E5C794]" />
            <span className="hidden sm:inline">Floor: $4,050</span>
            <span className="sm:hidden">Floor</span>
          </button>

          <button
            id="gold-gpr-toggle-button"
            onClick={() => setShowGprCorrelation(!showGprCorrelation)}
            className={`flex items-center gap-1.5 text-[10px] font-mono-data px-3 py-1.5 rounded-lg border transition-all ${
              showGprCorrelation
                ? "bg-[#A6291C]/35 border-[#A6291C]/70 text-[#FFA4A4] font-bold shadow-sm"
                : "bg-black/60 border-[#253347] text-[#BAC7D5] hover:text-[#FBF8F1]"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showGprCorrelation ? "text-[#FF4545]" : "text-[#8292A6]"}`} />
            <span>GPR Correlation</span>
            <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-semibold ${
              showGprCorrelation ? "bg-[#FF4545] text-white" : "bg-white/10 text-[#8292A6]"
            }`}>
              Dual-Scale
            </span>
          </button>

          {/* Export Visual & Data Dropdown */}
          <ChartExportDropdown
            chartTitle="Gold (XAU/USD) Supercycle & GPR Dual Index"
            chartContainerId="xau-usd-historical-chart-card"
            subtitle={`GOLD SPOT: $${liveSpotPrice.toFixed(2)} // GPR: ${macroData.engines.middleEastWarRisk.gprIndex} PTS`}
            getCsvData={() => {
              const headers = [
                "Period / Milestone",
                "Gold Spot Price (USD/oz)",
                "Illustrative Turnover (oz)",
                "GPR Index (pts)",
                "Sovereign Buying Floor",
                "Kinetic War Phase",
                "Macro Strategic Takeaway",
              ];
              const rows = chartData.map((d) => [
                d.timestamp,
                d.price.toFixed(2),
                d.volume,
                d.gpr ? d.gpr.toFixed(1) : "-",
                "4050.00",
                d.isWarStart ? "WAR IN IRAN OUTBREAK" : "-",
                d.comment || "-",
              ]);

              return {
                filename: `smc-gold-gpr-supercycle-${timeframe.toLowerCase()}`,
                headers,
                rows,
                metaComments: [
                  "SIN MIEDO CAPITAL // GOLD SUPERCYCLE & GPR DUAL CORRELATION",
                  "ILLUSTRATIVE HISTORY: Price, volume, GPR, and event values are not provider observations.",
                  `Spot Gold: $${liveSpotPrice.toFixed(2)} / oz (+${liveChangePct}%)`,
                  `Geopolitical Risk (GPR): ${macroData.engines.middleEastWarRisk.gprIndex} pts`,
                  "Historical correlation is not calculated from provider observations.",
                ],
              };
            }}
            onExportPdf={() => {
              exportGoldGprChartPdf(
                liveSpotPrice,
                macroData.engines.middleEastWarRisk.gprIndex
              );
            }}
          />

          <button
            data-export-ignore="true"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse View" : "Expand Fullscreen"}
            className="p-2 rounded-lg bg-black/70 border border-[#B08D57]/30 text-[#BAC7D5] hover:text-[#E5C794] transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {/* 1. Latest ticker snapshot */}
        <div className="bg-black/40 border border-[#B08D57]/20 rounded p-3 flex flex-col justify-between overflow-hidden">
          <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider truncate">
            Gold Spot (XAU/USD)
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-none whitespace-nowrap">
              ${liveSpotPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
              <span className="text-[#10B981] font-semibold">+{liveChangePct}% (24H)</span>
              <span className="text-[#8292A6]">Macro snapshot</span>
            </div>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#B08D57]/10 pt-1 whitespace-nowrap truncate">
            ATH High: $4,198.80 / oz
          </div>
        </div>

        {/* 2. Sovereign Floor */}
        <div className="bg-black/50 border border-[#B08D57]/40 rounded p-3 relative shadow-[0_0_15px_rgba(176,141,87,0.1)] flex flex-col justify-between overflow-hidden">
          <div className="text-[10px] font-mono-data text-[#E5C794] uppercase tracking-wider truncate">
            Central Bank Floor
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#B08D57] leading-none whitespace-nowrap">
              $4,050.00
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
              <span className="text-[#10B981] font-semibold">+$135.60 buffer</span>
              <span className="text-[#EDE9DE]/70">Support</span>
            </div>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#B08D57]/20 pt-1 whitespace-nowrap truncate">
            PBOC / RBI Structural Bid
          </div>
        </div>

        {/* 3. Central Bank Annual Accumulation */}
        <div className="bg-black/40 border border-[#B08D57]/20 rounded p-3 flex flex-col justify-between overflow-hidden">
          <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider truncate">
            Official Sector Demand
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#10B981] leading-none whitespace-nowrap flex items-baseline gap-1">
              <span>1,280</span>
              <span className="text-[11px] text-[#8292A6] font-normal">Tonnes/yr</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
              <span className="text-[#10B981] font-semibold">32% Global Demand</span>
              <span className="text-[#8292A6]">Record Inflows</span>
            </div>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#B08D57]/10 pt-1 whitespace-nowrap truncate">
            De-Dollarization Velocity
          </div>
        </div>

        {/* 4. GPR Link & War Premium */}
        <div className="bg-black/40 border border-[#B08D57]/20 rounded p-3 flex flex-col justify-between overflow-hidden">
          <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider truncate">
            Geopolitical Beta
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#FF8585] leading-none whitespace-nowrap flex items-baseline gap-1">
              <span>+0.82</span>
              <span className="text-[11px] text-[#8292A6] font-normal">GPR Correl.</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 whitespace-nowrap gap-1">
              <span className="text-[#FF8585] font-semibold">War Risk Hedge</span>
              <span className="text-[#8292A6]">Safe Haven</span>
            </div>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 border-t border-[#B08D57]/10 pt-1 whitespace-nowrap truncate">
            Persian Gulf Escalation Bias
          </div>
        </div>
      </div>

      {/* Proportionate Dual-Scale Indicator Banner when GPR Correlation is Active */}
      {showGprCorrelation && (
        <div
          id="gold-gpr-dual-scale-banner"
          className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 mb-3 bg-gradient-to-r from-[#A6291C]/25 via-black/50 to-[#B08D57]/15 border border-[#A6291C]/40 rounded-lg text-[10px] font-mono-data shadow-inner"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4545] animate-pulse" />
            <span className="text-[#FF8585] font-bold uppercase tracking-wider">
              Proportionate Dual-Scale Active:
            </span>
            <span className="text-[#EDE9DE]">
              <strong className="text-[#FFA4A4]">Left Axis (Crimson) = GPR Index ({minGpr}–{maxGpr} pts)</strong>
              <span className="text-[#8292A6] mx-1.5">•</span>
              <strong className="text-[#E5C794]">Right Axis (Gold) = XAU/USD (${minPrice.toLocaleString()}–${maxPrice.toLocaleString()})</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] text-[#FFA4A4] bg-[#A6291C]/35 px-2 py-0.5 rounded border border-[#A6291C]/60 font-bold">
              ⚡ GPR +62.4% (~+65%) since War in Iran (Feb &apos;26)
            </span>
            <span className="text-[9.5px] text-[#E5C794] bg-[#B08D57]/20 px-2 py-0.5 rounded border border-[#B08D57]/40 font-bold">
              Slope r = +0.82
            </span>
          </div>
        </div>
      )}

      {/* Main Full-Width Recharts Area */}
      <div className={`w-full ${isExpanded ? "h-96 sm:h-[480px]" : "h-72 sm:h-80"} relative`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 15, right: 25, left: showGprCorrelation ? 15 : 10, bottom: 0 }}
          >
            <defs>
              {/* Gold Gradient */}
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B08D57" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#B08D57" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#B08D57" stopOpacity={0.0} />
              </linearGradient>

              {/* Red GPR Gradient */}
              <linearGradient id="gprGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A6291C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#A6291C" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#253347" strokeDasharray="3 3" opacity={0.4} vertical={false} />

            <XAxis
              dataKey="timestamp"
              stroke="#8292A6"
              tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#253347" }}
              axisLine={{ stroke: "#253347" }}
            />

            {/* Primary Gold YAxis (Right Side) */}
            <YAxis
              yAxisId="goldAxis"
              domain={[minPrice, maxPrice]}
              stroke="#B08D57"
              tick={{ fill: "#E5C794", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#B08D57", strokeOpacity: 0.4 }}
              axisLine={{ stroke: "#B08D57", strokeOpacity: 0.4 }}
              tickFormatter={(val) => `$${val.toLocaleString()}`}
              orientation="right"
              width={65}
            />

            {/* Proportionate Secondary GPR YAxis (Left Side) */}
            {showGprCorrelation && (
              <YAxis
                yAxisId="gprAxis"
                domain={[minGpr, maxGpr]}
                stroke="#A6291C"
                tick={{ fill: "#FFA4A4", fontSize: 10, fontFamily: "monospace" }}
                tickLine={{ stroke: "#A6291C", strokeOpacity: 0.6 }}
                axisLine={{ stroke: "#A6291C", strokeOpacity: 0.6 }}
                tickFormatter={(val) => `${val} pts`}
                orientation="left"
                width={55}
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as GoldDataPoint;
                const goldReturn = basePoint?.price
                  ? (((data.price - basePoint.price) / basePoint.price) * 100).toFixed(1)
                  : null;
                const gprReturn = (data.gpr && basePoint?.gpr)
                  ? (((data.gpr - basePoint.gpr) / basePoint.gpr) * 100).toFixed(1)
                  : null;

                return (
                  <div className="bg-[#0E1A2B] border border-[#B08D57]/50 rounded-lg p-3 shadow-2xl font-mono-data text-xs max-w-xs backdrop-blur-md">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#B08D57]/20 text-[10px]">
                      <span className="text-[#8292A6] font-bold">{data.timestamp}</span>
                      <span className="text-[#B08D57] font-semibold uppercase">Dual-Scale Macro Feed</span>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[#E5C794] text-[11px] font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-xs bg-[#B08D57]" />
                          Gold Spot:
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#EDE9DE]">
                            ${data.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / oz
                          </span>
                          {goldReturn && (
                            <span className="block text-[9px] text-[#10B981]">
                              +{goldReturn}% vs period start
                            </span>
                          )}
                        </div>
                      </div>

                      {data.gpr && (
                        <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-white/5">
                          <span className="text-[#FFA4A4] text-[11px] font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#FF4545]" />
                            GPR Index:
                          </span>
                          <div className="text-right">
                            <span className="font-bold text-[#FFA4A4] text-xs">
                              {data.gpr} pts
                            </span>
                            {gprReturn && (
                              <span className="block text-[9px] text-[#FF8585]">
                                +{gprReturn}% vs period start
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-[#8292A6]">Rel. Volume:</span>
                        <span className="text-[#EDE9DE]/80">{data.volume.toLocaleString()} contracts</span>
                      </div>

                      {data.comment && (
                        <div className="mt-2 pt-1.5 border-t border-[#253347] text-[10px] text-[#E5C794] leading-relaxed">
                          <span className="font-bold text-[#B08D57]">Macro Note: </span>
                          {data.comment}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            {/* Sovereign Institutional Floor Reference Line at $4,050/oz on Gold Axis */}
            {showSovereignFloor && (
              <ReferenceLine
                yAxisId="goldAxis"
                y={4050}
                stroke="#10B981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "Central Bank Floor $4,050",
                  fill: "#10B981",
                  fontSize: 9,
                  position: "insideBottomRight",
                  offset: 8
                }}
              />
            )}

            {/* All-Time High Milestone Line at $4,150/oz on Gold Axis */}
            <ReferenceLine
              yAxisId="goldAxis"
              y={4150}
              stroke="#B08D57"
              strokeDasharray="2 2"
              opacity={0.6}
              label={{
                value: "ATH Breakout Pivot $4,150",
                fill: "#B08D57",
                fontSize: 9,
                position: "insideTopRight",
                offset: 8
              }}
            />

            {/* Outbreak of War in Iran Milestone Line */}
            {showGprCorrelation && (timeframe === "1Y" || timeframe === "5Y") && (
              <ReferenceLine
                x="Feb '26"
                stroke="#FF4545"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: "⚡ War in Iran (Feb '26)",
                  fill: "#FF8585",
                  fontSize: 9,
                  position: "insideTopLeft",
                  fontFamily: "monospace",
                  fontWeight: "bold"
                }}
              />
            )}

            {/* Main Area Plot for Gold Spot on Right Axis */}
            <Area
              yAxisId="goldAxis"
              type="monotone"
              dataKey="price"
              stroke="#B08D57"
              strokeWidth={2.5}
              fill="url(#goldGradient)"
              activeDot={{ r: 5, fill: "#EDE9DE", stroke: "#B08D57", strokeWidth: 2 }}
            />

            {/* Proportionate GPR Correlation Line on Left Axis */}
            {showGprCorrelation && (
              <Line
                yAxisId="gprAxis"
                type="monotone"
                dataKey="gpr"
                stroke="#FF4545"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#A6291C", stroke: "#FF8585", strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: "#FF4545", stroke: "#FFF", strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Context Footer */}
      <div className="mt-3 pt-3 border-t border-[#B08D57]/15 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono-data text-[#8292A6]">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#B08D57]" />
          <span>
            Institutional XAU/USD pricing models driven by official sector non-Western sovereign reserves (PBOC, RBI, Central Bank of Turkey).
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#B08D57]" />
            Spot Trajectory (Right Axis)
          </span>
          {showGprCorrelation && (
            <span className="flex items-center gap-1.5 text-[#FFA4A4]">
              <span className="w-2.5 h-1 rounded-xs bg-[#FF4545]" />
              GPR Index (Left Axis: {minGpr}–{maxGpr} pts)
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#10B981]" />
            $4,050 Sovereign Floor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#B08D57] border-t border-dashed" />
            $4,150 ATH Breakout
          </span>
        </div>
      </div>
    </div>
  );
};
