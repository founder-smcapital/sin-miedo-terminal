import React, { useState, useMemo, useEffect, useCallback } from "react";
import { apiFetch } from "../api";
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
  ReferenceDot,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Flame,
  Layers,
  Maximize2,
  Minimize2,
  Crosshair,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  RefreshCw,
} from "lucide-react";
import { MacroDataState } from "../types";
import { ChartExportDropdown } from "./ChartExportDropdown";
import { exportVixChartPdf } from "../utils/chartExportUtils";

interface VixVolatilityIndexChartProps {
  macroData: MacroDataState;
  isCalmMode?: boolean;
  onOpenTerminal?: (prompt?: string) => void;
}

type VixTimeframe = "1D" | "5D" | "1M";

interface VixDataPoint {
  time: string;
  vix: number;
  realizedVol: number;
  vvix: number;
  isSpike?: boolean;
  spikeSeverity?: "critical" | "high" | "elevated" | "normal";
  spikeDelta?: string;
  eventTitle?: string;
  eventCategory?: string;
  deskNote?: string;
  spxReaction?: string;
}

export const VixVolatilityIndexChart: React.FC<VixVolatilityIndexChartProps> = ({
  macroData,
  isCalmMode = false,
  onOpenTerminal,
}) => {
  const [timeframe, setTimeframe] = useState<VixTimeframe>("1D");
  const [showSpikeMarkers, setShowSpikeMarkers] = useState<boolean>(true);
  const [showThresholds, setShowThresholds] = useState<boolean>(true);
  const [showRealizedVol, setShowRealizedVol] = useState<boolean>(true);
  const [showTermStructure, setShowTermStructure] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedSpikeTime, setSelectedSpikeTime] = useState<string | null>(null);

  // Live API ingestion state
  const [apiData, setApiData] = useState<{
    currentPrice: number;
    changePts: number;
    changePct: number;
    high24h: number;
    low24h: number;
    impliedDailyMovePct?: number;
    lastSync: string;
    lastSyncTimestamp: number;
    source: string;
    intradayPoints?: VixDataPoint[];
    historyType?: "provider" | "illustrative";
    quoteStatus?: "indicative" | "stale" | "unavailable";
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch real-time CBOE VIX intraday data from server
  const fetchVixIntraday = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const url = isManual ? "/api/macro/vix-refresh" : "/api/macro/vix-intraday";
      const res = await apiFetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.intradayPoints) {
          setApiData(json);
        }
      }
    } catch (err) {
      console.warn("VIX intraday feed sync:", err);
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, []);

  // Poll the provider-backed snapshot without manufacturing local quote updates.
  useEffect(() => {
    fetchVixIntraday(false);
    const pollInterval = setInterval(() => {
      fetchVixIntraday(false);
    }, 4000);
    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchVixIntraday]);

  // Extract baseline VIX from macroData tickers or active API ingestion
  const vixTicker = macroData?.tickers?.find((t) => t.symbol === "VIX");
  const hasUsableQuote = apiData?.quoteStatus === "indicative" || apiData?.quoteStatus === "stale";
  const liveVix = hasUsableQuote ? apiData.currentPrice : (vixTicker?.price ?? 18.95);
  const baseLiveVix = liveVix;
  const baseChangePct = hasUsableQuote ? apiData.changePct : (vixTicker?.change ?? -1.20);
  const liveChangePct = baseChangePct;

  // High-frequency intraday volatility time-series data (Dynamic & Non-Stale)
  const intradayData: VixDataPoint[] = useMemo(() => {
    if (apiData?.intradayPoints && apiData.intradayPoints.length >= 6) {
      return apiData.intradayPoints;
    }

    // Dynamic fallback anchored to the ACTUAL CURRENT TIME (now)
    const now = new Date();
    const totalPoints = 16;
    const stepMinutes = 20;
    const points: VixDataPoint[] = [];

    const low = Math.min(baseLiveVix - 1.25, 17.72);
    const high = Math.max(baseLiveVix + 2.70, 21.64);

    for (let i = 0; i < totalPoints - 1; i++) {
      const minutesAgo = (totalPoints - 1 - i) * stepMinutes;
      const ptDate = new Date(now.getTime() - minutesAgo * 60 * 1000);
      const timeStr = ptDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      
      let ptVix: number;
      if (i < 3) {
        ptVix = Number((low + 0.18 * i).toFixed(2));
      } else if (i === 5) {
        ptVix = Number((low + (high - low) * 0.68).toFixed(2));
      } else if (i === 9) {
        ptVix = Number(high.toFixed(2));
      } else if (i === 10) {
        ptVix = Number((high - 0.72).toFixed(2));
      } else {
        const factor = i / (totalPoints - 1);
        ptVix = Number((low + (liveVix - low) * factor + Math.sin(i * 1.4) * 0.28).toFixed(2));
      }
      ptVix = Math.max(low, Math.min(high, ptVix));
      const vvixVal = Number((98.0 + (ptVix - 17.5) * 4.8).toFixed(1));

      if (i === 5) {
        points.push({
          time: timeStr,
          vix: ptVix,
          realizedVol: 14.2,
          vvix: vvixVal,
          isSpike: true,
          spikeSeverity: "elevated",
          spikeDelta: `+${(ptVix - low).toFixed(2)} pts`,
          eventTitle: "Asia FX Carry Unwind Shock",
          eventCategory: "FX & Central Banks",
          deskNote: "Tokyo carry trades unwind sharply; MoF covert dollar liquidity signals trigger front-end SPX put buying.",
          spxReaction: "-0.45% ES futures dip",
        });
      } else if (i === 9) {
        points.push({
          time: timeStr,
          vix: ptVix,
          realizedVol: 14.4,
          vvix: vvixVal,
          isSpike: true,
          spikeSeverity: "critical",
          spikeDelta: `+${(ptVix - low).toFixed(2)} pts`,
          eventTitle: "US Core Inflation Print & 10Y Yield Tail",
          eventCategory: "Macro Data Shock",
          deskNote: "Core PCE inflation prints above consensus; 10-year Treasury yield spikes, igniting intense SPX 0DTE dealer negative gamma squeeze.",
          spxReaction: "-1.35% S&P 500 session trough",
        });
      } else if (i === 12) {
        points.push({
          time: timeStr,
          vix: ptVix,
          realizedVol: 14.4,
          vvix: vvixVal,
          isSpike: true,
          spikeSeverity: "elevated",
          spikeDelta: "+1.40 pts",
          eventTitle: "0DTE Dealer Gamma Pin & MOC Imbalance",
          eventCategory: "Market Microstructure",
          deskNote: "Late-day market-on-close sell imbalance forces market makers into delta-hedging whipsaw, spiking short-tenor volatility.",
          spxReaction: "-0.40% late-session wobble",
        });
      } else {
        points.push({
          time: timeStr,
          vix: ptVix,
          realizedVol: 14.3,
          vvix: vvixVal,
          deskNote: i % 2 === 0 ? "Orderly institutional index option flows" : "Liquidity consolidation across front-month strikes"
        });
      }
    }

    points.push({
      time: "LIVE",
      vix: liveVix,
      realizedVol: 14.3,
      vvix: Number((98.0 + (liveVix - 17.5) * 4.8).toFixed(1)),
      deskNote: `Active SMC desk live volatility tick feed; pricing ${(liveVix / Math.sqrt(252)).toFixed(2)}% implied daily S&P move`,
    });

    return points;
  }, [apiData, baseLiveVix, liveVix]);

  // Multi-day swing structure (5 trading sessions with open, mid, close benchmarks)
  const swing5DData: VixDataPoint[] = useMemo(() => {
    return [
      { time: "Mon 09:30", vix: 16.40, realizedVol: 13.8, vvix: 94.2, deskNote: "Weekly opening pricing; calm index baseline" },
      { time: "Mon 12:30", vix: 16.90, realizedVol: 13.8, vvix: 95.1, deskNote: "Midday orderly rebalancing" },
      { time: "Mon 16:00", vix: 17.15, realizedVol: 13.9, vvix: 96.5, deskNote: "Mild afternoon hedge flow into cash close" },
      { time: "Tue 09:30", vix: 17.65, realizedVol: 14.0, vvix: 98.4, deskNote: "European industrial output prints weaker" },
      {
        time: "Tue 11:30",
        vix: 19.80,
        realizedVol: 14.1,
        vvix: 108.4,
        isSpike: true,
        spikeSeverity: "elevated",
        spikeDelta: "+2.65 pts (+15.4%)",
        eventTitle: "Crude Oil Inventory Draw Spike",
        eventCategory: "Energy Shock",
        deskNote: "Unexpected 6.2M bbl US crude draw and Strait of Hormuz standoff headlines elevate prompt energy puts.",
        spxReaction: "-0.62% ES dip",
      },
      { time: "Tue 16:00", vix: 18.25, realizedVol: 14.1, vvix: 101.2, deskNote: "Geopolitical premium partial fade into settlement" },
      { time: "Wed 09:30", vix: 17.90, realizedVol: 14.0, vvix: 99.8, deskNote: "BoJ policy speculation muted; Asian session quiet" },
      { time: "Wed 12:00", vix: 18.45, realizedVol: 14.2, vvix: 102.6, deskNote: "Pre-FOMC options positioning builds" },
      {
        time: "Wed 14:00",
        vix: 22.40,
        realizedVol: 14.5,
        vvix: 121.5,
        isSpike: true,
        spikeSeverity: "critical",
        spikeDelta: "+4.50 pts (+25.1%)",
        eventTitle: "FOMC Minutes Hawkish Twist",
        eventCategory: "Central Bank Policy",
        deskNote: "Fed signals higher-for-longer regime; 10-year yields surge to 4.54% triggering negative dealer gamma.",
        spxReaction: "-1.45% intraday drawdown",
      },
      { time: "Wed 16:00", vix: 21.10, realizedVol: 14.4, vvix: 115.8, deskNote: "Late dealer re-hedging into post-FOMC cash close" },
      { time: "Thu 09:30", vix: 20.30, realizedVol: 14.4, vvix: 111.2, deskNote: "Initial jobless claims print within expectations" },
      { time: "Thu 12:30", vix: 19.60, realizedVol: 14.4, vvix: 108.0, deskNote: "Treasury yield curve stabilizes below 4.52%" },
      { time: "Thu 16:00", vix: 18.80, realizedVol: 14.3, vvix: 104.2, deskNote: "Systematic dip buyers absorb equity selling pressure" },
      { time: "Fri 09:30", vix: 19.10, realizedVol: 14.3, vvix: 105.4, deskNote: "Weekend geopolitical risk hedging flows initiate" },
      { time: "Fri 12:00", vix: 19.35, realizedVol: 14.3, vvix: 106.1, deskNote: "Midday options pin at 5,750 SPX gamma strike" },
      { time: "LIVE", vix: liveVix, realizedVol: 14.3, vvix: 104.5, deskNote: "Current session live telemetry; pricing ±1.20% daily implied swing" },
    ];
  }, [liveVix]);

  // 1-Month macro volatility regime trajectory
  const macro1MData: VixDataPoint[] = useMemo(() => {
    return [
      { time: "W-4", vix: 15.20, realizedVol: 12.8, vvix: 88.5, deskNote: "Sub-16 complacency regime" },
      { time: "W-3", vix: 16.85, realizedVol: 13.2, vvix: 93.4, deskNote: "Initial Yen FX carry volatility" },
      {
        time: "W-2",
        vix: 24.50,
        realizedVol: 15.8,
        vvix: 129.8,
        isSpike: true,
        spikeSeverity: "critical",
        spikeDelta: "+7.65 pts",
        eventTitle: "Middle East War Adder Shock",
        eventCategory: "Sovereign Geopolitics",
        deskNote: "Petroline pipeline shutdown & Kharg Island military blockade threats.",
      },
      { time: "W-1", vix: 19.80, realizedVol: 14.6, vvix: 108.2, deskNote: "Central bank stealth liquidity intervention" },
      { time: "LIVE", vix: liveVix, realizedVol: 14.3, vvix: 104.5, deskNote: "Current volatility baseline" },
    ];
  }, [liveVix]);

  const activeData = useMemo(() => {
    switch (timeframe) {
      case "5D":
        return swing5DData;
      case "1M":
        return macro1MData;
      case "1D":
      default:
        return intradayData;
    }
  }, [timeframe, intradayData, swing5DData, macro1MData]);

  // Volatility stats calculations
  const sessionMin = useMemo(() => Math.min(...activeData.map((d) => d.vix)), [activeData]);
  const sessionMax = useMemo(() => Math.max(...activeData.map((d) => d.vix)), [activeData]);
  const peakSpikePoint = useMemo(
    () => activeData.find((d) => d.vix === sessionMax) || activeData[0],
    [activeData, sessionMax]
  );

  // Sanitized identified spikes: eliminate adjacent duplicate dots & retain 1-3 prominent catalysts
  const identifiedSpikes = useMemo(() => {
    const rawSpikes = activeData.filter((d) => d.isSpike);
    const deduped: VixDataPoint[] = [];
    rawSpikes.forEach((spk) => {
      const last = deduped[deduped.length - 1];
      if (!last) {
        deduped.push(spk);
      } else {
        const lastIdx = activeData.indexOf(last);
        const currIdx = activeData.indexOf(spk);
        if (currIdx - lastIdx < 4) {
          // Too close (within 4 intervals): keep only the higher peak
          if (spk.vix > last.vix) {
            deduped[deduped.length - 1] = spk;
          }
        } else {
          deduped.push(spk);
        }
      }
    });
    return deduped.slice(0, 3); // Max 3 prominent catalysts across any view
  }, [activeData]);

  // Dynamic Adaptive Y-axis domain calculation
  const yDomain = useMemo<[number, number]>(() => {
    if (!activeData || activeData.length === 0) return [13.0, 22.0];

    const vixVals = activeData.map((d) => d.vix);
    let minV = Math.min(...vixVals);
    let maxV = Math.max(...vixVals);

    // If Realized Volatility overlay is visible, align vertical scale so VRP is visually accurate
    if (showRealizedVol) {
      const rvVals = activeData.map((d) => d.realizedVol);
      minV = Math.min(minV, ...rvVals);
      maxV = Math.max(maxV, ...rvVals);
    }

    const range = Math.max(0.8, maxV - minV);
    const padding = Math.max(0.4, range * 0.22);
    let calculatedMin = Math.max(0, Math.floor((minV - padding) * 2) / 2);
    let calculatedMax = Math.ceil((maxV + padding) * 2) / 2;

    // If Hedge Thresholds are toggled ON, frame the chart with the relevant threshold without blowing out resolution
    if (showThresholds) {
      if (maxV < 15.0) {
        // Low vol regime: frame with 15.0 Complacency Floor
        calculatedMax = Math.max(calculatedMax, 15.4);
      } else if (maxV >= 15.0 && maxV < 19.5) {
        // Normal regime: frame with 20.0 Hedge Zone
        calculatedMax = Math.max(calculatedMax, 20.5);
      } else {
        // High vol / crisis regime: frame with 25.0 Crisis line
        calculatedMax = Math.max(calculatedMax, 25.5);
      }
    }

    return [calculatedMin, calculatedMax];
  }, [activeData, showRealizedVol, showThresholds]);

  // Regime classification based on live VIX
  const getRegimeInfo = (val: number) => {
    if (val < 15.0) {
      return {
        label: "COMPLACENCY / LOW VOL",
        color: "#10B981",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        desc: "Dealer long gamma dominates; equity dips aggressively bought. Complacent option pricing.",
      };
    }
    if (val <= 20.0) {
      return {
        label: "MODERATE / NORMAL VOL",
        color: "#E5C794",
        bg: "bg-[#B08D57]/10",
        border: "border-[#B08D57]/30",
        desc: "Equilibrium regime. Option skew pricing mild downside tail risk with orderly cross-asset hedging.",
      };
    }
    if (val <= 25.0) {
      return {
        label: "ELEVATED RISK PREMIUM",
        color: "#F59E0B",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        desc: "Dealers approaching neutral/short gamma flip. Intraday volatility spikes amplify headline vulnerability.",
      };
    }
    return {
      label: "SYSTEMIC SQUEEZE / CRISIS",
      color: "#EF4444",
      bg: "bg-red-500/15",
      border: "border-red-500/40",
      desc: "Severe dealer short gamma. Forced liquidation, margin deleveraging & cross-asset contagion active.",
    };
  };

  const currentRegime = getRegimeInfo(liveVix);

  // VIX Term Structure data (VIX Spot vs 30D / 60D / 90D / 120D Futures)
  const termStructureData = [
    { label: "SPOT VIX", value: liveVix, spread: "0.00", isSpot: true },
    { label: "VIX 1M (UX1)", value: 19.35, spread: "+0.40", isSpot: false },
    { label: "VIX 2M (UX2)", value: 19.85, spread: "+0.90", isSpot: false },
    { label: "VIX 3M (UX3)", value: 20.40, spread: "+1.45", isSpot: false },
    { label: "VIX 6M (UX6)", value: 21.10, spread: "+2.15", isSpot: false },
  ];

  return (
    <div
      id="vix-volatility-grid-component"
      className={`bg-[#0E1522] border border-[#B08D57]/35 rounded-xl shadow-2xl p-4 sm:p-6 transition-all duration-300 relative overflow-hidden ${
        isExpanded ? "fixed inset-3 sm:inset-6 z-50 overflow-y-auto max-h-[96vh] bg-[#0A101A]" : ""
      }`}
    >
      {/* Subtle Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#B08D57]/10 via-transparent to-transparent pointer-events-none" />

      {/* 1. Header Bar: Identity, Live Pulse, and Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#B08D57]/20 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  liveVix > 20 ? "bg-amber-400" : "bg-[#10B981]"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  liveVix > 20 ? "bg-amber-500" : "bg-[#10B981]"
                }`}
              />
            </span>
            <span className="text-[10px] font-mono-data font-bold tracking-[0.2em] text-[#E5C794] uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#B08D57]" />
              VIX Index Snapshot // Intraday Volatility Analysis
            </span>
            <span className="text-[9px] font-mono-data text-[#8292A6] px-1.5 py-0.5 rounded bg-black/40 border border-white/5 hidden sm:inline">
              {apiData ? "API SNAPSHOT" : "SEED DATA"}
            </span>
          </div>

          <h2
            className="text-xl sm:text-2xl font-serif italic font-bold text-[#FBF8F1] tracking-tight"
            style={{ fontFamily: "Georgia, 'Newsreader', serif" }}
          >
            Equity Volatility &amp; Intraday Gamma Spikes
          </h2>
          <p className="text-[11px] font-mono-data text-[#BAC7D5] tracking-wide">
            30-DAY S&amp;P 500 OPTION-IMPLIED VOLATILITY SURFACE // 0DTE DEALER GAMMA &amp; TAIL RISK RADAR
          </p>
        </div>

        {/* Right Controls: Timeframes & Fullscreen */}
        <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
          {/* Timeframe Switcher */}
          <div className="flex items-center bg-black/70 p-1 rounded-lg border border-[#B08D57]/30 text-[10px] shadow-inner">
            {(["1D", "5D", "1M"] as VixTimeframe[]).map((tf) => (
              <button
                key={tf}
                id={`vix-timeframe-${tf.toLowerCase()}-btn`}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded transition-all font-bold uppercase ${
                  timeframe === tf
                    ? "bg-[#B08D57] text-[#0A111C] shadow"
                    : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
                }`}
              >
                {tf === "1D" ? "1D Intraday (5m Spikes)" : tf === "5D" ? "5D Swings" : "1M Regime"}
              </button>
            ))}
          </div>

          {/* Chart Export Button (CSV, PDF, PNG, Copy) */}
          <ChartExportDropdown
            chartTitle="CBOE VIX Volatility Radar & Term Structure"
            chartContainerId="vix-volatility-grid-component"
            subtitle={`SMC VOLATILITY TELEMETRY // SPOT VIX: ${liveVix.toFixed(2)} // ${timeframe}`}
            getCsvData={() => {
              const headers = [
                "Time / Interval",
                "VIX Implied Vol",
                "Realized Vol (20D)",
                "VVIX Vol-of-Vol",
                "Is Spike Event",
                "Spike Magnitude",
                "Severity",
                "Catalyst Title",
                "S&P 500 Reaction",
                "Desk Tactical Note",
              ];
              const rows = activeData.map((d) => [
                d.time,
                d.vix.toFixed(2),
                d.realizedVol ? d.realizedVol.toFixed(2) : "14.2",
                d.vvix ? d.vvix.toFixed(1) : "105.0",
                d.isSpike ? "YES" : "NO",
                d.spikeDelta || "-",
                d.spikeSeverity || "-",
                d.eventTitle || "-",
                d.spxReaction || "-",
                d.deskNote || "-",
              ]);

              return {
                filename: `smc-vix-volatility-${timeframe.toLowerCase()}`,
                headers,
                rows,
                metaComments: [
                  "SIN MIEDO CAPITAL // CBOE VIX INTRADAY SPIKES & TERM STRUCTURE",
                  `VIX Snapshot: ${liveVix.toFixed(2)} (${liveChangePct >= 0 ? "+" : ""}${liveChangePct.toFixed(2)}%)`,
                  `Active View: ${timeframe}`,
                  `Current Regime: ${currentRegime.label}`,
                ],
              };
            }}
            onExportPdf={() => {
              exportVixChartPdf(liveVix, timeframe, apiData?.lastSyncTimestamp ?? 0);
            }}
          />

          {/* Fullscreen Expand Toggle */}
          <button
            id="vix-fullscreen-toggle-btn"
            data-export-ignore="true"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-black/50 hover:bg-black text-[#8292A6] hover:text-[#EDE9DE] border border-[#B08D57]/20 transition-all text-xs"
            title={isExpanded ? "Minimize Chart" : "Maximize Fullscreen View"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quote source and chart-history classification */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 my-3 rounded-lg bg-[#070D17]/80 border border-[#B08D57]/25 text-[10px] font-mono-data">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Info className="w-3 h-3" />
            <span className="tracking-wider uppercase">{hasUsableQuote ? "YAHOO FINANCE ^VIX SNAPSHOT" : "ILLUSTRATIVE SEED QUOTE"}</span>
          </div>
          <span className="text-[#5A687C] hidden sm:inline">|</span>
          <span className="text-[#BAC7D5]">
            API CHECKED: <strong className="text-[#FFFFFF] font-bold">{apiData?.lastSync ? new Date(apiData.lastSyncTimestamp).toLocaleTimeString() : "NOT RECEIVED"}</strong>
          </span>
          <span className="text-[#5A687C] hidden md:inline">|</span>
          <span className="text-amber-300 font-bold hidden md:inline">
            {hasUsableQuote && timeframe === "1D" && apiData?.historyType === "provider"
              ? "PROVIDER VIX PRICES · RV / VVIX OVERLAYS MODELED"
              : "ILLUSTRATIVE CHART HISTORY"}
          </span>
          <span className="text-[#5A687C] hidden lg:inline">|</span>
          <span className="text-[#8292A6] text-[9.5px] hidden lg:inline truncate max-w-[240px]" title={apiData?.source}>
            {hasUsableQuote ? apiData?.source : apiData?.source || "No provider response"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="vix-force-sync-btn"
            onClick={() => fetchVixIntraday(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#B08D57]/20 hover:bg-[#B08D57]/30 border border-[#B08D57]/45 text-[#E5C794] transition-all cursor-pointer font-bold active:scale-95 disabled:opacity-50"
            title="Refresh the VIX snapshot and chart data"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#FFFFFF]" : ""}`} />
            <span>{isRefreshing ? "SYNCING..." : "FORCE SYNC"}</span>
          </button>
        </div>
      </div>

      {/* 2. Quantitative Key Metrics Bar (High-Contrast Editorial Tiles - Protected Against Overlap) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6 gap-2.5 mb-3.5">
        {/* Metric 1: VIX snapshot */}
        <div className="bg-black/50 border border-[#B08D57]/30 p-2.5 rounded-lg space-y-1 min-w-0 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-[9.5px] font-mono-data text-[#8292A6]">
            <span>SPOT VIX</span>
            <span className="flex items-center gap-1 text-amber-300">
              <Info className="w-2.5 h-2.5" /> {hasUsableQuote ? "SNAPSHOT" : "SEED"}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-lg sm:text-xl font-bold font-mono-data text-[#EDE9DE] tracking-tight">{liveVix.toFixed(2)}</span>
            <span
              className={`text-[10px] font-mono-data flex items-center font-bold whitespace-nowrap ${
                liveChangePct >= 0 ? "text-[#EF4444]" : "text-[#10B981]"
              }`}
            >
              {liveChangePct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {liveChangePct >= 0 ? `+${liveChangePct.toFixed(2)}%` : `${liveChangePct.toFixed(2)}%`}
            </span>
          </div>
          <span className="text-[8.5px] font-mono-data text-[#8292A6] block truncate">
            Implied daily SPX: ±{(liveVix / Math.sqrt(252)).toFixed(2)}%
          </span>
        </div>

        {/* Metric 2: Session / Multi-Day Peak Spike */}
        <div className="bg-black/50 border border-[#A6291C]/40 p-2.5 rounded-lg space-y-1 min-w-0 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-[9.5px] font-mono-data text-[#FFA4A4]">
            <span className="flex items-center gap-1 truncate">
              <Flame className="w-2.5 h-2.5 text-[#EF4444] shrink-0" />
              <span>{timeframe === "5D" ? "5D PEAK" : timeframe === "1M" ? "1M PEAK" : "PEAK SPIKE"}</span>
            </span>
            <span className="text-[9px] text-[#FFA4A4]/80 shrink-0">{peakSpikePoint.time}</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-lg sm:text-xl font-bold font-mono-data text-[#FFA4A4] tracking-tight">{sessionMax.toFixed(2)}</span>
            <span className="text-[9.5px] font-mono-data text-[#EF4444] font-bold px-1.5 py-0.2 rounded bg-red-500/10 border border-red-500/20 whitespace-nowrap">
              +{((sessionMax - sessionMin) / Math.max(0.1, sessionMin) * 100).toFixed(1)}% run
            </span>
          </div>
          <span className="text-[8.5px] font-mono-data text-[#8292A6] block truncate">
            {peakSpikePoint.eventTitle || "Session Max Stress"}
          </span>
        </div>

        {/* Metric 3: Session / Multi-Day Range */}
        <div className="bg-black/50 border border-[#B08D57]/20 p-2.5 rounded-lg space-y-1 min-w-0 overflow-hidden shadow-sm">
          <span className="text-[9.5px] font-mono-data text-[#8292A6] block">
            {timeframe === "5D" ? "5D SWING RANGE" : timeframe === "1M" ? "1M MACRO RANGE" : "SESSION RANGE"}
          </span>
          <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm font-bold font-mono-data text-[#EDE9DE]">
            <span className="text-[#10B981]">{sessionMin.toFixed(2)}</span>
            <span className="text-[#8292A6] text-xs font-normal">→</span>
            <span className="text-[#EF4444]">{sessionMax.toFixed(2)}</span>
          </div>
          <span className="text-[8.5px] font-mono-data text-[#8292A6] block truncate">
            Spread: {(sessionMax - sessionMin).toFixed(2)} pts
          </span>
        </div>

        {/* Metric 4: Illustrative realized-volatility spread (VRP) */}
        <div className="bg-black/50 border border-[#B08D57]/20 p-2.5 rounded-lg space-y-1 min-w-0 overflow-hidden shadow-sm">
          <span className="text-[9.5px] font-mono-data text-[#8292A6] block">20D REALIZED VOL</span>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono-data">
            <span className="text-base sm:text-lg font-bold text-[#EDE9DE]">14.3%</span>
            <span className="text-[9.5px] text-[#E5C794] font-semibold whitespace-nowrap px-1 py-0.2 rounded bg-[#B08D57]/15">
              VRP: +{(liveVix - 14.3).toFixed(2)}p
            </span>
          </div>
          <span className="text-[8.5px] font-mono-data text-[#8292A6] block truncate">
            Illustrative overlay; no realized-volatility feed
          </span>
        </div>

        {/* Metric 5: VVIX (Vol of Vol) */}
        <div className="bg-black/50 border border-[#B08D57]/20 p-2.5 rounded-lg space-y-1 min-w-0 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-[9.5px] font-mono-data text-[#8292A6]">
            <span>VVIX (VOL OF VOL)</span>
            <span className="text-[9px] text-[#E5C794]">ACTIVE</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono-data">
            <span className="text-base sm:text-lg font-bold text-[#EDE9DE]">104.5</span>
            <span className="text-[9.5px] text-amber-400 font-semibold whitespace-nowrap px-1 py-0.2 rounded bg-amber-500/15">+3.2%</span>
          </div>
          <span className="text-[8.5px] font-mono-data text-[#8292A6] block truncate">
            Tail options demand elevated
          </span>
        </div>

        {/* Metric 6: Vol Regime Classification */}
        <div className={`p-2.5 rounded-lg border ${currentRegime.border} ${currentRegime.bg} space-y-1 min-w-0 overflow-hidden shadow-sm`}>
          <span className="text-[9.5px] font-mono-data text-[#8292A6] block">VOLATILITY REGIME</span>
          <div
            className="text-[11px] sm:text-xs font-bold font-mono-data tracking-tight truncate leading-tight"
            style={{ color: currentRegime.color }}
            title={currentRegime.label}
          >
            {currentRegime.label}
          </div>
          <span className="text-[8px] font-mono-data text-[#BAC7D5] block truncate">
            {liveVix > 20 ? "Short gamma danger" : "Gamma equilibrium"}
          </span>
        </div>
      </div>

      {/* 3. Interactive Analysis Toolbar (Toggles for Spikes, Thresholds, RV, Term Structure) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-black/40 border border-[#B08D57]/20 text-[11px] font-mono-data mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-[#8292A6] uppercase text-[9.5px] hidden sm:inline">Overlay Filters:</span>

          {/* Toggle Spike Markers */}
          <button
            id="toggle-vix-spike-markers-btn"
            onClick={() => setShowSpikeMarkers(!showSpikeMarkers)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all text-[10px] font-bold ${
              showSpikeMarkers
                ? "bg-[#A6291C]/25 text-[#FFA4A4] border-[#A6291C]/60"
                : "bg-black/40 text-[#8292A6] border-white/5 hover:text-[#EDE9DE]"
            }`}
          >
            <Flame className="w-3 h-3 text-[#EF4444]" />
            <span>Spike Catalysts ({identifiedSpikes.length})</span>
          </button>

          {/* Toggle Threshold Reference Lines */}
          <button
            id="toggle-vix-thresholds-btn"
            onClick={() => setShowThresholds(!showThresholds)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all text-[10px] font-bold ${
              showThresholds
                ? "bg-[#B08D57]/20 text-[#E5C794] border-[#B08D57]/50"
                : "bg-black/40 text-[#8292A6] border-white/5 hover:text-[#EDE9DE]"
            }`}
          >
            <Layers className="w-3 h-3 text-[#B08D57]" />
            <span>Hedge Thresholds (15 / 20 / 25)</span>
          </button>

          {/* Toggle Realized Vol */}
          <button
            id="toggle-vix-realized-vol-btn"
            onClick={() => setShowRealizedVol(!showRealizedVol)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all text-[10px] font-bold ${
              showRealizedVol
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-black/40 text-[#8292A6] border-white/5 hover:text-[#EDE9DE]"
            }`}
          >
            <span className="w-2 h-0.5 bg-emerald-400" />
            <span>20D Realized Vol (14.3%)</span>
          </button>

          {/* Toggle Term Structure */}
          <button
            id="toggle-vix-term-structure-btn"
            onClick={() => setShowTermStructure(!showTermStructure)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all text-[10px] font-bold ${
              showTermStructure
                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                : "bg-black/40 text-[#8292A6] border-white/5 hover:text-[#EDE9DE]"
            }`}
          >
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span>Term Curve (UX1-UX6)</span>
          </button>
        </div>

        {/* Legend Hint */}
        <div className="flex items-center gap-3 text-[10px] text-[#8292A6]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span>Intraday Vol Spike</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#F59E0B]" />
            <span>20.0 Hedge Zone</span>
          </span>
        </div>
      </div>

      {/* Optional VIX Futures Term Structure Strip */}
      {showTermStructure && (
        <div className="mb-4 p-3 bg-black/60 border border-blue-500/30 rounded-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono-data">
            <span className="text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              CBOE VIX Futures Term Curve (Contango vs Backwardation)
            </span>
            <span className="text-[10px] text-[#8292A6]">
              Curve State: <strong className="text-emerald-400">Mild Contango (-1.2% UX1/UX2)</strong> (Non-panic)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono-data">
            {termStructureData.map((item, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border text-center ${
                  item.isSpot
                    ? "bg-[#B08D57]/20 border-[#B08D57] text-[#EDE9DE]"
                    : "bg-black/40 border-white/10 text-[#BAC7D5]"
                }`}
              >
                <div className="text-[9px] text-[#8292A6] uppercase">{item.label}</div>
                <div className="text-sm font-bold text-[#FBF8F1]">{item.value.toFixed(2)}</div>
                <div
                  className={`text-[9px] font-semibold ${
                    item.spread.startsWith("+") ? "text-emerald-400" : "text-[#8292A6]"
                  }`}
                >
                  {item.spread === "0.00" ? "BASELINE" : `${item.spread} vs Spot`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Primary Recharts Area / Composed Chart */}
      <div className="w-full h-80 sm:h-96 relative bg-[#090E17]/60 rounded-xl border border-[#B08D57]/20 p-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={activeData} margin={{ top: 15, right: 35, left: 5, bottom: 20 }}>
            <defs>
              {/* VIX Multi-Stop Spikes Gradient: Crimson above 20, Gold in 16-20, Emerald/Deep at base */}
              <linearGradient id="vixSpikeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.65} />
                <stop offset="35%" stopColor="#F59E0B" stopOpacity={0.45} />
                <stop offset="70%" stopColor="#B08D57" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>

              {/* Pulse glow filter */}
              <filter id="vixGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <CartesianGrid stroke="#B08D57" strokeOpacity={0.12} strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#8292A6"
              tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#B08D57", strokeOpacity: 0.3 }}
              interval="preserveStartEnd"
              minTickGap={26}
            />

            {/* Primary VIX YAxis (Dynamic Domain) */}
            <YAxis
              yAxisId="vixAxis"
              domain={yDomain}
              stroke="#E5C794"
              tick={{ fill: "#E5C794", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#B08D57", strokeOpacity: 0.4 }}
              axisLine={{ stroke: "#B08D57", strokeOpacity: 0.4 }}
              tickFormatter={(val) => `${val.toFixed(1)}`}
              orientation="right"
              width={45}
            />

            {/* Realized Volatility Secondary YAxis (aligned with exact same domain) */}
            {showRealizedVol && (
              <YAxis
                yAxisId="rvAxis"
                domain={yDomain}
                stroke="#10B981"
                tick={{ fill: "#10B981", fontSize: 9, fontFamily: "monospace" }}
                tickLine={{ stroke: "#10B981", strokeOpacity: 0.4 }}
                axisLine={{ stroke: "#10B981", strokeOpacity: 0.4 }}
                tickFormatter={(val) => `${val.toFixed(1)}%`}
                orientation="left"
                width={38}
              />
            )}

            {/* Threshold Reference Lines (Rendered only within visible vertical context) */}
            {showThresholds && (
              <>
                {yDomain[1] >= 24.5 && (
                  <ReferenceLine
                    yAxisId="vixAxis"
                    y={25.0}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "25.0 CRISIS / SYSTEMIC SQUEEZE",
                      fill: "#EF4444",
                      fontSize: 9,
                      fontFamily: "monospace",
                      position: "insideTopRight",
                    }}
                  />
                )}
                {yDomain[1] >= 19.5 && yDomain[0] <= 20.5 && (
                  <ReferenceLine
                    yAxisId="vixAxis"
                    y={20.0}
                    stroke="#F59E0B"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: "20.0 HEDGE THRESHOLD",
                      fill: "#F59E0B",
                      fontSize: 9,
                      fontFamily: "monospace",
                      position: "insideTopRight",
                    }}
                  />
                )}
                {yDomain[1] >= 14.8 && yDomain[0] <= 15.5 && (
                  <ReferenceLine
                    yAxisId="vixAxis"
                    y={15.0}
                    stroke="#10B981"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                    label={{
                      value: "15.0 COMPLACENCY FLOOR",
                      fill: "#10B981",
                      fontSize: 9,
                      fontFamily: "monospace",
                      position: "insideBottomRight",
                    }}
                  />
                )}
              </>
            )}

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as VixDataPoint;
                const vrp = (point.vix - point.realizedVol).toFixed(2);
                const regime = getRegimeInfo(point.vix);

                return (
                  <div className="bg-[#0A111C]/95 border border-[#B08D57]/60 rounded-xl p-3.5 shadow-2xl font-mono-data text-xs max-w-sm backdrop-blur-md space-y-2">
                    {/* Tooltip Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#B08D57]/20 text-[10px]">
                      <span className="text-[#8292A6] flex items-center gap-1 font-bold">
                        <Clock className="w-3 h-3 text-[#B08D57]" />
                        {point.time}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                        style={{ color: regime.color, backgroundColor: `${regime.color}20` }}
                      >
                        {regime.label}
                      </span>
                    </div>

                    {/* VIX Level & Spread */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[#BAC7D5] text-[11px] font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-xs bg-[#E5C794]" />
                          VIX Spot Level:
                        </span>
                        <span className="text-base font-bold text-[#FBF8F1]">{point.vix.toFixed(2)} pts</span>
                      </div>

                      <div className="flex items-baseline justify-between gap-3 text-[10px]">
                        <span className="text-[#8292A6]">20D Realized Vol (RV):</span>
                        <span className="text-[#10B981] font-semibold">{point.realizedVol.toFixed(1)}%</span>
                      </div>

                      <div className="flex items-baseline justify-between gap-3 text-[10px]">
                        <span className="text-[#8292A6]">Vol Risk Premium (IV - RV):</span>
                        <span className="text-[#E5C794] font-bold">+{vrp} pts</span>
                      </div>

                      {point.vvix && (
                        <div className="flex items-baseline justify-between gap-3 text-[10px]">
                          <span className="text-[#8292A6]">VVIX (Vol of Vol):</span>
                          <span className="text-blue-300 font-semibold">{point.vvix.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Volatility Spike Callout if active */}
                    {point.isSpike && (
                      <div className="p-2 rounded bg-red-500/15 border border-red-500/30 text-[10px] space-y-1">
                        <div className="flex items-center justify-between text-red-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {point.eventTitle}
                          </span>
                          <span>{point.spikeDelta}</span>
                        </div>
                        {point.spxReaction && (
                          <span className="text-[9px] text-[#FFA4A4] block">SPX Reaction: {point.spxReaction}</span>
                        )}
                        <p className="text-[9.5px] text-[#EDE9DE] font-sans leading-relaxed pt-0.5">
                          {point.deskNote}
                        </p>
                      </div>
                    )}

                    {!point.isSpike && point.deskNote && (
                      <div className="text-[9px] text-[#8292A6] font-sans pt-1 border-t border-white/5 leading-relaxed">
                        {point.deskNote}
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* Primary VIX Filled Area Curve */}
            <Area
              yAxisId="vixAxis"
              type="monotone"
              dataKey="vix"
              stroke="#E5C794"
              strokeWidth={2.4}
              fill="url(#vixSpikeGradient)"
              activeDot={{
                r: 6,
                stroke: "#FBF8F1",
                strokeWidth: 2,
                fill: "#EF4444",
              }}
            />

            {/* 20D Realized Volatility Overlay Line */}
            {showRealizedVol && (
              <Line
                yAxisId="rvAxis"
                type="monotone"
                dataKey="realizedVol"
                stroke="#10B981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="20D Realized Vol"
              />
            )}

            {/* Spike Event Reference Dots */}
            {showSpikeMarkers &&
              identifiedSpikes.map((spike, idx) => (
                <ReferenceDot
                  key={`spike-${idx}`}
                  yAxisId="vixAxis"
                  x={spike.time}
                  y={spike.vix}
                  r={5.5}
                  fill={spike.spikeSeverity === "critical" ? "#EF4444" : "#F59E0B"}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setSelectedSpikeTime(spike.time)}
                />
              ))}

            {/* Pulsing Live Reference Dot on latest tick */}
            <ReferenceDot
              yAxisId="vixAxis"
              x="LIVE"
              y={liveVix}
              r={5}
              fill="#10B981"
              stroke="#E5C794"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Intraday Volatility Spikes Breakdown: 4 Actionable Event Tiles */}
      <div className="mt-4 pt-4 border-t border-[#B08D57]/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-[#EF4444]" />
            <span className="text-[10px] font-mono-data font-bold uppercase tracking-wider text-[#E5C794]">
              Intraday Volatility Spikes // Microstructure &amp; Catalysts
            </span>
          </div>
          <span className="text-[9.5px] font-mono-data text-[#8292A6]">
            CLICK TILE TO CROSS-EXAMINE VOLATILITY REGIME
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {identifiedSpikes.map((spike, idx) => {
            const effectiveSelectedSpikeTime = selectedSpikeTime || identifiedSpikes[0]?.time;
            const isSelected = effectiveSelectedSpikeTime === spike.time;
            return (
              <div
                key={idx}
                onClick={() => setSelectedSpikeTime(spike.time)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#182333] border-[#B08D57] shadow-lg shadow-[#B08D57]/20 ring-1 ring-[#B08D57]"
                    : "bg-black/50 hover:bg-black/80 border-[#B08D57]/20 hover:border-[#B08D57]/40"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono-data">
                    <span className="text-[#8292A6] flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3 text-[#B08D57]" />
                      {spike.time} UTC
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                        spike.spikeSeverity === "critical"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {spike.spikeDelta}
                    </span>
                  </div>

                  <h4 className="font-sans font-bold text-xs text-[#FBF8F1] leading-snug">
                    {spike.eventTitle}
                  </h4>

                  <p className="text-[10.5px] font-sans text-[#BAC7D5] leading-relaxed">
                    {spike.deskNote}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-[#B08D57]/15 flex items-center justify-between text-[9.5px] font-mono-data">
                  <span className="text-[#8292A6]">Peak Vol:</span>
                  <span className="text-[#E5C794] font-bold">{spike.vix.toFixed(2)} pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Desk Volatility Takeaway & Actionable Option Strategies */}
      <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-[#0A121F] border border-[#B08D57]/30 shadow-inner space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[#E5C794] font-bold uppercase tracking-wider text-[10px] font-mono-data">
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>INSTITUTIONAL VOLATILITY DESK TAKEAWAY // SMC QUANT DESK:</span>
          </div>
          <span className="text-[9px] font-mono-data text-[#8292A6]">
            CORRELATION: SPX NEGATIVE GAMMA BELOW 5,720
          </span>
        </div>

        <p className="text-[#BAC7D5] leading-relaxed font-mono-data text-[10.5px] sm:text-[11px]">
          Spot VIX at <strong className="text-[#E5C794] font-bold">{liveVix.toFixed(2)}</strong> prices an implied daily
          S&amp;P move of <strong className="text-[#FBF8F1]">±{(liveVix / Math.sqrt(252)).toFixed(2)}%</strong>. Intraday
          spikes up to <strong className="text-[#EF4444] font-bold">{sessionMax.toFixed(2)}</strong> indicate persistent
          0DTE dealer negative-gamma overhang on market dips. With the Volatility Risk Premium at{" "}
          <strong className="text-[#10B981]">+{((liveVix - 14.3)).toFixed(2)} pts</strong> over 20D realized vol, recommend
          harvesting rich commodity and energy implied volatility skew (Brent call collars) while maintaining protective 30-day
          SPX put-spread hedges into the upcoming macro release window.
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            id="vix-ask-ai-btn"
            onClick={() =>
              onOpenTerminal?.(
                `Analyze current VIX volatility dynamics at ${liveVix.toFixed(2)} pts (intraday spike peak ${sessionMax.toFixed(2)}) with 20D realized vol at 14.3% and VVIX at 104.5. What are the optimal option hedging and desk positioning strategies?`
              )
            }
            className="flex items-center gap-1.5 text-[10px] font-mono-data bg-[#B08D57] hover:bg-[#C9A46D] text-[#0A111C] font-bold px-3 py-1.5 rounded-lg shadow transition-all active:scale-95"
            title="Open SMC Volatility Strategy & Hedging Desk"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>SMC Volatility Strategy Desk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
