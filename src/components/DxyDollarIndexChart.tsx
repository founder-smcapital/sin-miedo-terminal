import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  Layers,
  Clock,
  Sparkles,
  Info,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Crosshair,
  Filter,
  CheckCircle2,
  Sliders
} from "lucide-react";
import { MacroDataState } from "../types";

interface DxyDollarIndexChartProps {
  macroData?: MacroDataState;
  isCalmMode?: boolean;
  onOpenTerminal?: (prompt?: string) => void;
}

type DxyTimeframe = "1D" | "5D" | "1M";
type CorrelationCategory = "ALL" | "EQUITIES" | "COMMODITIES" | "RATES_FX";

interface DxyDataPoint {
  time: string;
  dxy: number;
  mclResistanceCap?: number;
  mesPrice?: number;
  mesChangePct?: number;
  mnqPrice?: number;
  mnqChangePct?: number;
  usdStrengthScore?: number;
  sessionSegment?: string;
  isPremarket?: boolean;
  crudeImpact?: string;
  deskNote?: string;
}

interface CorrelationDetail {
  asset: string;
  ticker: string;
  ratio: number;
  type: "INVERSE" | "DIRECT";
  badgeColor: string;
  impact: string;
  note: string;
  category: "EQUITIES" | "COMMODITIES" | "RATES_FX";
}

const DEFAULT_CORRELATION_DETAILS: CorrelationDetail[] = [
  {
    asset: "Micro Nasdaq-100",
    ticker: "$MNQ",
    ratio: -0.71,
    type: "INVERSE",
    badgeColor: "#8B5CF6",
    impact: "Multiple Compression Drag",
    note: "High-duration tech earnings are heavily discounted during USD surges; dollar strength dampens foreign revenue conversion for mega-caps.",
    category: "EQUITIES"
  },
  {
    asset: "Micro S&P 500",
    ticker: "$MES",
    ratio: -0.61,
    type: "INVERSE",
    badgeColor: "#10B981",
    impact: "Valuation Headwind",
    note: "Over 40% of S&P 500 revenues originate overseas. A stronger greenback creates earnings translation friction and institutional defensive rebalancing.",
    category: "EQUITIES"
  },
  {
    asset: "Micro WTI Crude",
    ticker: "$MCL",
    ratio: -0.84,
    type: "INVERSE",
    badgeColor: "#EF4444",
    impact: "Severe Overhead Resistance",
    note: "Global oil is dollar-priced. Premarket USD rallies make crude more expensive for foreign refiners, establishing strict intraday ceilings on MCL.",
    category: "COMMODITIES"
  },
  {
    asset: "Micro Gold",
    ticker: "$MGC",
    ratio: -0.76,
    type: "INVERSE",
    badgeColor: "#E5C794",
    impact: "Alternative Currency Beta",
    note: "Bullion trades as an alternative fiat hedge. A surging USD raises the opportunity cost of holding non-yielding precious metals.",
    category: "COMMODITIES"
  },
  {
    asset: "Euro FX Futures",
    ticker: "$6E",
    ratio: -0.98,
    type: "INVERSE",
    badgeColor: "#3B82F6",
    impact: "Direct Basket Inversion",
    note: "The Euro comprises 57.6% of the DXY weighting. Any ECB/Fed rate divergence causes nearly mirror-image tick-for-tick movement.",
    category: "RATES_FX"
  },
  {
    asset: "USD/JPY Carry Trade",
    ticker: "USD/JPY",
    ratio: 0.81,
    type: "DIRECT",
    badgeColor: "#F59E0B",
    impact: "BoJ Yield Gap Transmission",
    note: "US-Japan sovereign yield spreads widen during dollar expansions, driving carry trade capital into USD assets until MoF intervention triggers.",
    category: "RATES_FX"
  },
  {
    asset: "US 10Y Yield",
    ticker: "^TNX",
    ratio: 0.68,
    type: "DIRECT",
    badgeColor: "#EC4899",
    impact: "Rate Divergence Driver",
    note: "Higher US benchmark yields attract global institutional capital into Treasuries, driving fundamental spot demand for US Dollars.",
    category: "RATES_FX"
  },
  {
    asset: "Micro Bitcoin",
    ticker: "$MBT",
    ratio: -0.54,
    type: "INVERSE",
    badgeColor: "#F97316",
    impact: "High-Beta Liquidity Sponge",
    note: "Crypto functions as high-beta global fiat liquidity. Dollar liquidity contraction reliably saps risk appetite from spot crypto flows.",
    category: "COMMODITIES"
  }
];

export const DxyDollarIndexChart: React.FC<DxyDollarIndexChartProps> = ({
  macroData,
  isCalmMode = false,
  onOpenTerminal,
}) => {
  const [timeframe, setTimeframe] = useState<DxyTimeframe>("1D");
  const [showCrudeOverlay, setShowCrudeOverlay] = useState<boolean>(true);
  const [showMesOverlay, setShowMesOverlay] = useState<boolean>(true);
  const [showMnqOverlay, setShowMnqOverlay] = useState<boolean>(true);
  const [showLevels, setShowLevels] = useState<boolean>(true);
  const [activeCorrFilter, setActiveCorrFilter] = useState<CorrelationCategory>("ALL");
  const [selectedCorrCard, setSelectedCorrCard] = useState<string | null>("Micro Nasdaq-100");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [secondsSinceSync, setSecondsSinceSync] = useState<number>(0);

  const [apiData, setApiData] = useState<{
    currentPrice: number;
    changePts: number;
    changePct: number;
    high24h: number;
    low24h: number;
    prevClose: number;
    premarketRegime?: {
      status: string;
      color: string;
      crudeCapActive: boolean;
      actionNote: string;
      tacticalBias: string;
      mclResistanceBand: string;
    };
    correlations?: Record<string, number>;
    correlationDetails?: CorrelationDetail[];
    levels?: {
      resistance2: number;
      resistance1: number;
      pivot: number;
      support1: number;
      support2: number;
    };
    lastSync: string;
    source: string;
    intradayPoints?: DxyDataPoint[];
    fiveDayPoints?: Array<{ minute: string; price: number; sessionLabel?: string }>;
  } | null>(null);

  // Fetch real-time ICE DXY intraday telemetry from backend
  const fetchDxyData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const url = isManual ? "/api/macro/dxy-refresh" : "/api/macro/dxy-intraday";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setApiData(json);
          setSecondsSinceSync(0);
        }
      }
    } catch (err) {
      console.warn("[DXY] Failed to fetch live DXY telemetry, using fallback state:", err);
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  }, []);

  useEffect(() => {
    fetchDxyData();
    const interval = setInterval(() => {
      fetchDxyData();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchDxyData]);

  // Sync elapsed seconds ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceSync((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Current metrics
  const currentPrice = apiData?.currentPrice ?? 102.04;
  const changePts = apiData?.changePts ?? -0.13;
  const changePct = apiData?.changePct ?? -0.13;
  const high24h = apiData?.high24h ?? 102.35;
  const low24h = apiData?.low24h ?? 101.90;
  const isUp = changePts >= 0;

  // Premarket status calculation
  const premarketRegime = apiData?.premarketRegime ?? {
    status: currentPrice >= 102.20
      ? "STRONG USD STRENGTH · CRUDE & TECH DRAG ACTIVE"
      : currentPrice >= 102.00
      ? "ELEVATED DOLLAR · CONTROLLED ASSET CAP"
      : "DOLLAR SOFTENING · RISK ASSET RELIEF TAILWIND",
    color: currentPrice >= 102.20 ? "#EF4444" : currentPrice >= 102.00 ? "#F59E0B" : "#10B981",
    crudeCapActive: currentPrice >= 102.00,
    actionNote: "Monitor USD strength in early premarket trading. A strong dollar cap on crude usually provides clear resistance levels on MCL, while creating multiple drag on MNQ & MES.",
    tacticalBias: currentPrice >= 102.20
      ? "FADE MCL BREAKOUTS / SELL OVERNIGHT HIGH RE-TESTS ON MNQ & MES"
      : "RANGEBOUND CRUDE & EQUITIES WITH OVERHEAD CEILING",
    mclResistanceBand: "$91.80 - $92.20 Tactical Overhead Cap"
  };

  // Build chart points based on active timeframe
  const chartPoints = useMemo(() => {
    if (timeframe === "1D") {
      if (apiData?.intradayPoints && apiData.intradayPoints.length > 0) {
        return apiData.intradayPoints;
      }
      // Fallback 1D curve with simulated MES and MNQ curves
      return [
        { time: "01:00", dxy: 102.08, mclResistanceCap: 91.35, mesPrice: 7726.50, mesChangePct: -0.36, mnqPrice: 29590.00, mnqChangePct: -0.34, isPremarket: true },
        { time: "03:00", dxy: 102.12, mclResistanceCap: 91.28, mesPrice: 7724.25, mesChangePct: -0.39, mnqPrice: 29575.00, mnqChangePct: -0.39, isPremarket: true },
        { time: "04:30", dxy: 102.24, mclResistanceCap: 91.05, mesPrice: 7718.00, mesChangePct: -0.47, mnqPrice: 29540.00, mnqChangePct: -0.51, isPremarket: true },
        { time: "06:00", dxy: 102.31, mclResistanceCap: 90.92, mesPrice: 7714.50, mesChangePct: -0.52, mnqPrice: 29515.00, mnqChangePct: -0.59, isPremarket: true },
        { time: "07:30", dxy: 102.28, mclResistanceCap: 90.98, mesPrice: 7716.25, mesChangePct: -0.49, mnqPrice: 29530.00, mnqChangePct: -0.54, isPremarket: true },
        { time: "08:30", dxy: 102.20, mclResistanceCap: 91.12, mesPrice: 7720.00, mesChangePct: -0.45, mnqPrice: 29550.00, mnqChangePct: -0.47, isPremarket: true },
        { time: "09:30", dxy: 102.14, mclResistanceCap: 91.25, mesPrice: 7723.75, mesChangePct: -0.40, mnqPrice: 29570.00, mnqChangePct: -0.40, isPremarket: false },
        { time: "11:00", dxy: 102.09, mclResistanceCap: 91.34, mesPrice: 7725.50, mesChangePct: -0.38, mnqPrice: 29580.00, mnqChangePct: -0.37, isPremarket: false },
        { time: "13:00", dxy: 102.02, mclResistanceCap: 91.46, mesPrice: 7728.00, mesChangePct: -0.34, mnqPrice: 29595.00, mnqChangePct: -0.32, isPremarket: false },
        { time: "15:00", dxy: 102.05, mclResistanceCap: 91.40, mesPrice: 7726.00, mesChangePct: -0.37, mnqPrice: 29585.00, mnqChangePct: -0.35, isPremarket: false },
        { time: "LIVE", dxy: currentPrice, mclResistanceCap: Number((91.50 - ((currentPrice - 102.00) * 1.85)).toFixed(2)), mesPrice: 7722.00, mesChangePct: -0.42, mnqPrice: 29565.00, mnqChangePct: -0.48, isPremarket: false }
      ];
    }

    if (timeframe === "5D") {
      if (apiData?.fiveDayPoints && apiData.fiveDayPoints.length > 0) {
        return apiData.fiveDayPoints.map((pt, idx) => ({
          time: pt.minute,
          dxy: pt.price,
          mclResistanceCap: Number((91.50 - ((pt.price - 102.00) * 1.85)).toFixed(2)),
          mesPrice: Number((7722 - ((pt.price - 102.00) * 35)).toFixed(2)),
          mesChangePct: Number((-0.42 - ((pt.price - 102.00) * 0.45)).toFixed(2)),
          mnqPrice: Number((29565 - ((pt.price - 102.00) * 150)).toFixed(2)),
          mnqChangePct: Number((-0.48 - ((pt.price - 102.00) * 0.55)).toFixed(2)),
          sessionSegment: pt.sessionLabel || "5-Day Trajectory"
        }));
      }
      return [
        { time: "Wed 09:30", dxy: 101.42, mclResistanceCap: 92.55, mesPrice: 7668.00, mesChangePct: -1.12, mnqPrice: 29303.25, mnqChangePct: -1.30 },
        { time: "Wed 16:00", dxy: 101.65, mclResistanceCap: 92.15, mesPrice: 7692.50, mesChangePct: -0.80, mnqPrice: 29540.00, mnqChangePct: -0.50 },
        { time: "Thu 04:00", dxy: 101.80, mclResistanceCap: 91.85, mesPrice: 7705.00, mesChangePct: -0.64, mnqPrice: 29620.00, mnqChangePct: -0.24 },
        { time: "Thu 16:00", dxy: 102.20, mclResistanceCap: 91.12, mesPrice: 7738.00, mesChangePct: -0.22, mnqPrice: 29950.00, mnqChangePct: 0.88 },
        { time: "Fri 04:00", dxy: 102.35, mclResistanceCap: 90.85, mesPrice: 7748.25, mesChangePct: -0.08, mnqPrice: 30120.00, mnqChangePct: 1.45 },
        { time: "Fri 16:00", dxy: 102.17, mclResistanceCap: 91.18, mesPrice: 7754.75, mesChangePct: 0.00, mnqPrice: 29980.00, mnqChangePct: 0.98 },
        { time: "Mon 04:00", dxy: 102.05, mclResistanceCap: 91.40, mesPrice: 7728.50, mesChangePct: -0.34, mnqPrice: 29620.00, mnqChangePct: -0.24 },
        { time: "LIVE", dxy: currentPrice, mclResistanceCap: Number((91.50 - ((currentPrice - 102.00) * 1.85)).toFixed(2)), mesPrice: 7722.00, mesChangePct: -0.42, mnqPrice: 29565.00, mnqChangePct: -0.48 }
      ];
    }

    // 1M Macro Trajectory
    return [
      { time: "W-4", dxy: 100.85, mclResistanceCap: 93.60, mesPrice: 7580.00, mesChangePct: -2.25, mnqPrice: 28950.00, mnqChangePct: -2.50 },
      { time: "W-3", dxy: 101.20, mclResistanceCap: 92.95, mesPrice: 7620.00, mesChangePct: -1.74, mnqPrice: 29120.00, mnqChangePct: -1.93 },
      { time: "W-2", dxy: 101.65, mclResistanceCap: 92.15, mesPrice: 7690.00, mesChangePct: -0.83, mnqPrice: 29480.00, mnqChangePct: -0.71 },
      { time: "W-1", dxy: 102.40, mclResistanceCap: 90.75, mesPrice: 7755.00, mesChangePct: 0.00, mnqPrice: 29980.00, mnqChangePct: 0.98 },
      { time: "NOW", dxy: currentPrice, mclResistanceCap: Number((91.50 - ((currentPrice - 102.00) * 1.85)).toFixed(2)), mesPrice: 7722.00, mesChangePct: -0.42, mnqPrice: 29565.00, mnqChangePct: -0.48 }
    ];
  }, [timeframe, apiData, currentPrice]);

  // Compute domain bounds for DXY
  const dxyDomain = useMemo(() => {
    const vals = chartPoints.map((p) => p.dxy);
    const min = Math.min(...vals, 101.50);
    const max = Math.max(...vals, 102.50);
    return [Number((min - 0.15).toFixed(2)), Number((max + 0.15).toFixed(2))];
  }, [chartPoints]);

  // Filtered correlation list
  const correlationList = useMemo(() => {
    const raw = apiData?.correlationDetails && apiData.correlationDetails.length > 0
      ? apiData.correlationDetails
      : DEFAULT_CORRELATION_DETAILS;

    if (activeCorrFilter === "ALL") return raw;
    return raw.filter((item) => item.category === activeCorrFilter);
  }, [apiData, activeCorrFilter]);

  // Active correlation card detail
  const activeCard = useMemo(() => {
    const raw = apiData?.correlationDetails || DEFAULT_CORRELATION_DETAILS;
    return raw.find((c) => c.asset === selectedCorrCard) || raw[0];
  }, [apiData, selectedCorrCard]);

  return (
    <div className="bg-[#0B1019] border border-[#B08D57]/30 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#B08D57]/10 via-[#10B981]/5 to-transparent pointer-events-none rounded-tr-xl" />

      {/* Top Header Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#253347]/80 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center text-[#E5C794] shadow-sm">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-mono-data text-[#FBF8F1] tracking-wide flex items-center gap-1.5">
                  <span>US Dollar Index ($DXY) · Multi-Asset Correlation Radar</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-[#253347] text-[#BAC7D5] font-normal">
                    ICE Benchmark (DX-Y.NYB)
                  </span>
                </h3>
              </div>
              <p className="text-xs text-[#8292A6] font-mono-data mt-0.5">
                Premarket USD Strength &amp; Cross-Asset Transmission · Tracking $MCL, $MNQ &amp; $MES Real-Time Beta
              </p>
            </div>
          </div>
        </div>

        {/* Live Quotes & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Price Tag */}
          <div className="flex items-baseline gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-[#253347]">
            <span className="text-xl sm:text-2xl font-black font-mono-data text-[#FBF8F1] tabular-nums">
              {currentPrice.toFixed(3)}
            </span>
            <div className={`flex items-center text-xs font-mono-data font-bold ${isUp ? "text-[#34D399]" : "text-[#FF8585]"}`}>
              {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              <span>{changePts > 0 ? `+${changePts.toFixed(3)}` : changePts.toFixed(3)}</span>
              <span className="ml-1 opacity-90">({changePct > 0 ? `+${changePct.toFixed(2)}%` : `${changePct.toFixed(2)}%`})</span>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-[#253347]">
            {(["1D", "5D", "1M"] as DxyTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded text-xs font-mono-data font-bold transition-all ${
                  timeframe === tf
                    ? "bg-[#B08D57] text-[#0A111C] shadow-sm font-black"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDxyData(true)}
            disabled={isRefreshing}
            title="Refresh Live DXY Quotes from ICE / Yahoo Finance"
            className="p-2 rounded-lg bg-black/60 border border-[#253347] text-[#BAC7D5] hover:text-[#FBF8F1] hover:border-[#B08D57]/60 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#E5C794]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Premarket Tactical Alert Callout */}
      <div className="bg-[#101622] border border-[#B08D57]/40 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono-data shadow-lg relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border"
            style={{
              backgroundColor: `${premarketRegime.color}20`,
              borderColor: `${premarketRegime.color}50`,
              color: premarketRegime.color
            }}
          >
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#FBF8F1] uppercase tracking-wide">
                {premarketRegime.status}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[#E5C794] font-semibold">
                {premarketRegime.mclResistanceBand}
              </span>
            </div>
            <p className="text-[11px] text-[#BAC7D5] mt-1 leading-snug">
              <strong>Tactical Premarket Rule:</strong> {premarketRegime.actionNote}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {onOpenTerminal && (
            <button
              onClick={() => onOpenTerminal("Analyze current DXY strength and how it caps Micro Crude Oil (MCL), Micro Nasdaq (MNQ), and Micro S&P (MES) for today's session.")}
              className="px-3 py-1.5 rounded-lg bg-[#B08D57]/20 hover:bg-[#B08D57]/30 text-[#E5C794] border border-[#B08D57]/40 text-xs font-mono-data font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Open SMC Macro Strategy & Takeaways"
            >
              <Crosshair className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>SMC Macro Strategy</span>
            </button>
          )}
        </div>
      </div>

      {/* Chart Toggles Toolbar (Includes MES, MNQ, MCL & Key Levels) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono-data pt-1">
        <div className="flex flex-wrap items-center gap-3">
          {/* Overlay MES Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[#BAC7D5] hover:text-[#FBF8F1] select-none">
            <input
              type="checkbox"
              checked={showMesOverlay}
              onChange={(e) => setShowMesOverlay(e.target.checked)}
              className="rounded bg-black/60 border-[#253347] text-[#10B981] focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Overlay Micro S&amp;P (<strong className="text-[#34D399] font-mono-data">$MES</strong>)
            </span>
          </label>

          {/* Overlay MNQ Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[#BAC7D5] hover:text-[#FBF8F1] select-none">
            <input
              type="checkbox"
              checked={showMnqOverlay}
              onChange={(e) => setShowMnqOverlay(e.target.checked)}
              className="rounded bg-black/60 border-[#253347] text-[#8B5CF6] focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              Overlay Micro Nasdaq (<strong className="text-[#C084FC] font-mono-data">$MNQ</strong>)
            </span>
          </label>

          {/* Overlay Crude MCL Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[#BAC7D5] hover:text-[#FBF8F1] select-none">
            <input
              type="checkbox"
              checked={showCrudeOverlay}
              onChange={(e) => setShowCrudeOverlay(e.target.checked)}
              className="rounded bg-black/60 border-[#253347] text-[#EF4444] focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              Overlay Micro Crude (<strong className="text-[#F87171] font-mono-data">$MCL</strong> Cap)
            </span>
          </label>

          {/* Threshold Levels */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[#BAC7D5] hover:text-[#FBF8F1] select-none">
            <input
              type="checkbox"
              checked={showLevels}
              onChange={(e) => setShowLevels(e.target.checked)}
              className="rounded bg-black/60 border-[#253347] text-[#B08D57] focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px]">Key DXY Thresholds</span>
          </label>
        </div>

        <div className="text-[10px] text-[#8292A6]">
          Last sync: {secondsSinceSync}s ago · 24h Range:{" "}
          <span className="text-[#EDE9DE] font-bold">{low24h.toFixed(3)}</span> –{" "}
          <span className="text-[#EDE9DE] font-bold">{high24h.toFixed(3)}</span>
        </div>
      </div>

      {/* Main Interactive Recharts Canvas */}
      <div className="h-[300px] sm:h-[350px] w-full bg-black/40 rounded-xl p-2.5 border border-[#1E2738] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartPoints} margin={{ top: 14, right: 24, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="dxyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B08D57" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#B08D57" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#8292A6"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#1E2738" }}
            />

            {/* Primary Y-Axis: DXY Price (Left) */}
            <YAxis
              yAxisId="dxy"
              domain={dxyDomain}
              stroke="#E5C794"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#1E2738" }}
              tickFormatter={(val) => val.toFixed(2)}
            />

            {/* Secondary Y-Axis: Normalized Relative Scale (% Deviation / Normalized Index) */}
            {(showCrudeOverlay || showMesOverlay || showMnqOverlay) && (
              <YAxis
                yAxisId="overlays"
                orientation="right"
                domain={[-1.2, 1.2]}
                stroke="#BAC7D5"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val > 0 ? "+" : ""}${val.toFixed(1)}%`}
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as DxyDataPoint;
                  return (
                    <div className="bg-[#0A111C]/95 border border-[#B08D57]/60 p-3 rounded-lg shadow-xl text-xs font-mono-data space-y-1.5 backdrop-blur-md min-w-[240px]">
                      <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/10">
                        <span className="font-bold text-[#FBF8F1]">{pt.time}</span>
                        {pt.isPremarket ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                            PREMARKET
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                            RTH CASH
                          </span>
                        )}
                      </div>

                      {/* DXY Price */}
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[#E5C794] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" />
                          Dollar Index ($DXY):
                        </span>
                        <span className="font-bold text-[#FBF8F1]">{pt.dxy.toFixed(3)}</span>
                      </div>

                      {/* Micro S&P (MES) */}
                      {showMesOverlay && pt.mesPrice != null && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[#34D399] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            Micro S&amp;P ($MES):
                          </span>
                          <span className="font-bold text-[#EDE9DE]">
                            {pt.mesPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            <span className="text-[10px] ml-1 font-normal opacity-80 text-[#34D399]">
                              ({pt.mesChangePct != null && pt.mesChangePct > 0 ? "+" : ""}{pt.mesChangePct ?? "-0.42"}%)
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Micro Nasdaq (MNQ) */}
                      {showMnqOverlay && pt.mnqPrice != null && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[#C084FC] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                            Micro Nasdaq ($MNQ):
                          </span>
                          <span className="font-bold text-[#EDE9DE]">
                            {pt.mnqPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            <span className="text-[10px] ml-1 font-normal opacity-80 text-[#C084FC]">
                              ({pt.mnqChangePct != null && pt.mnqChangePct > 0 ? "+" : ""}{pt.mnqChangePct ?? "-0.48"}%)
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Crude Oil (MCL) Cap */}
                      {showCrudeOverlay && pt.mclResistanceCap != null && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-rose-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                            MCL Crude Cap:
                          </span>
                          <span className="font-bold text-rose-300">${pt.mclResistanceCap.toFixed(2)} / bbl</span>
                        </div>
                      )}

                      {pt.sessionSegment && (
                        <div className="text-[10px] text-[#BAC7D5] pt-1 border-t border-white/5">
                          {pt.sessionSegment}
                        </div>
                      )}

                      {pt.deskNote && (
                        <div className="text-[9.5px] text-[#A7F3D0] italic max-w-xs leading-tight">
                          {pt.deskNote}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Threshold Reference Lines for DXY */}
            {showLevels && (
              <>
                <ReferenceLine
                  yAxisId="dxy"
                  y={102.20}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{
                    value: "102.20 Premarket Cap (MCL Resistance)",
                    fill: "#EF4444",
                    fontSize: 9,
                    position: "insideTopRight"
                  }}
                />
                <ReferenceLine
                  yAxisId="dxy"
                  y={101.90}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  label={{
                    value: "101.90 Softening Pivot (Equities Relief)",
                    fill: "#10B981",
                    fontSize: 9,
                    position: "insideBottomRight"
                  }}
                />
              </>
            )}

            {/* DXY Primary Filled Area & Line */}
            <Area
              yAxisId="dxy"
              type="monotone"
              dataKey="dxy"
              stroke="#B08D57"
              strokeWidth={2.4}
              fill="url(#dxyGradient)"
              isAnimationActive={!isCalmMode}
              name="US Dollar Index"
            />

            {/* Micro S&P ($MES) Line */}
            {showMesOverlay && (
              <Line
                yAxisId="overlays"
                type="monotone"
                dataKey="mesChangePct"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={!isCalmMode}
                name="Micro S&P (MES)"
              />
            )}

            {/* Micro Nasdaq ($MNQ) Line */}
            {showMnqOverlay && (
              <Line
                yAxisId="overlays"
                type="monotone"
                dataKey="mnqChangePct"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={!isCalmMode}
                name="Micro Nasdaq (MNQ)"
              />
            )}

            {/* Inverted Crude Oil ($MCL) Overlay Curve */}
            {showCrudeOverlay && (
              <Line
                yAxisId="overlays"
                type="monotone"
                dataKey={(pt) => {
                  // Inverted % change from base $91.50
                  const cap = pt.mclResistanceCap || 91.50;
                  return Number(((cap - 91.50) / 91.50 * 100).toFixed(2));
                }}
                stroke="#EF4444"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={!isCalmMode}
                name="MCL Crude Resistance Cap"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Expanded Multi-Asset Correlation Ratios Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#253347]/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#B08D57]" />
            <h4 className="text-xs font-bold font-mono-data text-[#EDE9DE] uppercase tracking-wider">
              DXY Multi-Asset Correlation Beta Matrix (8 Ratios)
            </h4>
          </div>

          {/* Correlation Filter Pills */}
          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-[#253347] text-[10px] font-mono-data">
            {(
              [
                { id: "ALL", label: "All (8)" },
                { id: "EQUITIES", label: "Equities ($MES, $MNQ)" },
                { id: "COMMODITIES", label: "Commodities ($MCL, $MGC)" },
                { id: "RATES_FX", label: "Rates & FX" }
              ] as { id: CorrelationCategory; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveCorrFilter(f.id)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
                  activeCorrFilter === f.id
                    ? "bg-[#B08D57] text-[#0A111C]"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Correlation Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 font-mono-data text-xs">
          {correlationList.map((item) => {
            const isSelected = selectedCorrCard === item.asset;
            const isInverse = item.ratio < 0;

            return (
              <div
                key={item.asset}
                onClick={() => setSelectedCorrCard(item.asset)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#141C2B] border-[#B08D57] shadow-md ring-1 ring-[#B08D57]/40"
                    : "bg-black/50 border-[#253347] hover:border-[#384961] hover:bg-black/70"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/5">
                    <span className="text-[11px] font-bold text-[#FBF8F1] truncate">
                      {item.asset}
                    </span>
                    <span className="text-[9.5px] px-1 py-0.5 rounded bg-black/60 border border-white/10 font-bold" style={{ color: item.badgeColor }}>
                      {item.ticker}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-sm font-black tracking-tight" style={{ color: item.badgeColor }}>
                      {item.ratio > 0 ? `+${item.ratio.toFixed(2)}` : item.ratio.toFixed(2)}
                    </span>
                    <span className={`text-[9px] font-semibold uppercase px-1 py-0.2 rounded ${
                      isInverse ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/15 text-emerald-300"
                    }`}>
                      {item.type}
                    </span>
                  </div>

                  {/* Visual Correlation Bar */}
                  <div className="w-full h-1 bg-black/80 rounded-full mt-2 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.abs(item.ratio) * 100}%`,
                        backgroundColor: item.badgeColor
                      }}
                    />
                  </div>
                </div>

                <div className="text-[9px] text-[#8292A6] mt-2 pt-1 border-t border-white/5 line-clamp-1">
                  {item.impact}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Correlation Deep-Dive Card */}
        {activeCard && (
          <div className="bg-[#121824] border border-[#B08D57]/30 rounded-lg p-3 text-xs font-mono-data flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCard.badgeColor }} />
                <span className="font-bold text-[#FBF8F1] text-xs">
                  {activeCard.asset} ({activeCard.ticker}) · Correlation Beta: {activeCard.ratio > 0 ? `+${activeCard.ratio}` : activeCard.ratio}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[#BAC7D5]">
                  {activeCard.impact}
                </span>
              </div>
              <p className="text-[10.5px] text-[#BAC7D5] leading-relaxed">
                {activeCard.note}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-[10px] text-[#8292A6]">
                Prop Firm Application:
              </span>
              <span className="text-[10px] px-2 py-1 rounded bg-[#B08D57]/15 text-[#E5C794] border border-[#B08D57]/30 font-bold">
                {activeCard.type === "INVERSE" ? "Fade Rallies into Highs" : "Follow Breakout Flow"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Premarket Tactical Action Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono-data text-xs pt-1">
        {/* Box 1: Premarket MCL Energy Playbook */}
        <div className="bg-black/50 p-3 rounded-lg border border-[#253347] flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-white/5">
            <Flame className="w-3.5 h-3.5 text-[#EF4444]" />
            <span className="font-bold text-[#FBF8F1] text-[11px] uppercase">
              Micro Crude Oil (MCL) Premarket Friction
            </span>
          </div>
          <p className="text-[10px] text-[#BAC7D5] leading-relaxed">
            When <strong>DXY establishes an early premarket high above 102.20</strong> (04:00–08:30 ET), dollar friction establishes clear resistance on prompt crude. Look for rejections at overnight VWAP and fade breakout attempts on MCL.
          </p>
          <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px]">
            <span className="text-[#8292A6]">MCL Resistance Target:</span>
            <span className="text-rose-400 font-bold">$91.80 – $92.20 Overhead Cap</span>
          </div>
        </div>

        {/* Box 2: Premarket MNQ & MES Equity Multiple Drag */}
        <div className="bg-black/50 p-3 rounded-lg border border-[#253347] flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-white/5">
            <TrendingDown className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="font-bold text-[#FBF8F1] text-[11px] uppercase">
              MNQ vs MES Multiple Compression Playbook
            </span>
          </div>
          <p className="text-[10px] text-[#BAC7D5] leading-relaxed">
            <strong>Micro Nasdaq (MNQ, -0.71)</strong> carries higher negative correlation to DXY than <strong>Micro S&amp;P (MES, -0.61)</strong>. During morning dollar surges, tech growth multiples contract faster. Look to short MNQ on failed morning rallies or favor long MES relative to MNQ.
          </p>
          <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px]">
            <span className="text-[#8292A6]">Tech Multiple Beta:</span>
            <span className="text-purple-300 font-bold">MNQ Sensitivity 1.16x higher than MES</span>
          </div>
        </div>
      </div>
    </div>
  );
};
