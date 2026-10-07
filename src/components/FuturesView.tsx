import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  TrendingUp,
  Activity,
  RefreshCw,
  Clock,
  Shield,
  Target,
  Bell,
  AlertCircle,
  BarChart3,
  Globe,
  Flame,
  Zap,
  SlidersHorizontal,
  Layers,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  DollarSign,
} from "lucide-react";
import { INITIAL_FUTURES_DATA, FuturesContract, getFuturesMarketSession, MarketSessionInfo } from "../data/futuresData";
import { FuturesSparkline } from "./FuturesSparkline";
import { VixVolatilityIndexChart } from "./VixVolatilityIndexChart";
import { FuturesContractChart } from "./FuturesContractChart";
import { FuturesOrderflowEngine } from "./FuturesOrderflowEngine";
import { DxyDollarIndexChart } from "./DxyDollarIndexChart";
import { initialMacroData } from "../data/mockMacroData";
import { MacroDataState } from "../types";

export const CONTRACT_TICKERS = [
  "MES",
  "ES",
  "MNQ",
  "NQ",
  "IBEX",
  "KOSPI",
  "NKD",
  "FESX",
  "DAX",
  "HSI",
  "VX",
  "DXY",
  "CL",
  "BZ",
  "MGC",
  "MBT",
] as const;
export type ContractSymbol = (typeof CONTRACT_TICKERS)[number];

export type ContractCategory = "ALL" | "GLOBAL" | "US" | "VOLATILITY" | "COMMODITIES";

export const CATEGORY_MAP: Record<ContractCategory, { label: string; symbols: readonly ContractSymbol[] }> = {
  ALL: { label: "All Instruments (16)", symbols: CONTRACT_TICKERS },
  GLOBAL: { label: "Global Indices ($IBEX35, $KOSPI, $NKD, $FESX, $DAX, $HSI)", symbols: ["IBEX", "KOSPI", "NKD", "FESX", "DAX", "HSI"] },
  US: { label: "US Equities ($MES, $ES, $MNQ, $NQ)", symbols: ["MES", "ES", "MNQ", "NQ"] },
  VOLATILITY: { label: "Volatility ($VX / VIX)", symbols: ["VX"] },
  COMMODITIES: { label: "Commodities, FX & Crypto ($DXY, $CL, $BZ, $MGC, $MBT)", symbols: ["DXY", "CL", "BZ", "MGC", "MBT"] },
};

interface FuturesViewProps {
  macroData?: MacroDataState;
  isCalmMode?: boolean;
  onOpenTerminal?: (prompt?: string) => void;
}

export const FuturesView: React.FC<FuturesViewProps> = ({
  macroData = initialMacroData,
  isCalmMode = false,
  onOpenTerminal,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<ContractSymbol>("IBEX");
  const [activeCategory, setActiveCategory] = useState<ContractCategory>("GLOBAL");
  const [chartViewMode, setChartViewMode] = useState<"VIX_RADAR" | "CONTRACT_CHART" | "BOTH" | "ORDERFLOW" | "DXY_RADAR">("CONTRACT_CHART");
  const [contractsData, setContractsData] = useState<Record<string, FuturesContract>>(INITIAL_FUTURES_DATA);
  const [currentTimeET, setCurrentTimeET] = useState<string>("14:45:09");
  const [isWeekend, setIsWeekend] = useState<boolean>(() => {
    const nyDateStr = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    const nyDate = new Date(nyDateStr);
    const day = nyDate.getDay();
    const totalMinutes = nyDate.getHours() * 60 + nyDate.getMinutes();
    return day === 6 || (day === 0 && totalMinutes < 1080) || (day === 5 && totalMinutes >= 1020);
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAlertsActive, setIsAlertsActive] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [isWrapView, setIsWrapView] = useState(false);
  const tickerScrollRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollState = useCallback(() => {
    const el = tickerScrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 6);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
    }
  }, []);

  useEffect(() => {
    const el = tickerScrollRef.current;
    if (el) {
      checkScrollState();
      const t1 = setTimeout(checkScrollState, 80);
      const t2 = setTimeout(checkScrollState, 350);
      el.addEventListener("scroll", checkScrollState, { passive: true });
      window.addEventListener("resize", checkScrollState);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        el.removeEventListener("scroll", checkScrollState);
        window.removeEventListener("resize", checkScrollState);
      };
    }
  }, [checkScrollState, activeCategory, isWrapView]);

  useEffect(() => {
    if (!isWrapView && pillRefs.current[selectedSymbol]) {
      pillRefs.current[selectedSymbol]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      const timer = setTimeout(checkScrollState, 350);
      return () => clearTimeout(timer);
    }
  }, [selectedSymbol, activeCategory, isWrapView, checkScrollState]);

  const handleScrollTicker = (dir: "left" | "right") => {
    if (tickerScrollRef.current) {
      const step = 280;
      tickerScrollRef.current.scrollBy({
        left: dir === "left" ? -step : step,
        behavior: "smooth",
      });
      setTimeout(checkScrollState, 320);
    }
  };

  const handleWheelTicker = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isWrapView && tickerScrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      tickerScrollRef.current.scrollLeft += e.deltaY;
      checkScrollState();
    }
  };

  // Live ET Clock & Weekend Detection
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      };
      const timeStr = new Intl.DateTimeFormat("en-US", options).format(now);
      setCurrentTimeET(timeStr);

      const nyDateStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
      const nyDate = new Date(nyDateStr);
      const day = nyDate.getDay();
      const totalMinutes = nyDate.getHours() * 60 + nyDate.getMinutes();
      const weekendActive = day === 6 || (day === 0 && totalMinutes < 1080) || (day === 5 && totalMinutes >= 1020);
      setIsWeekend(weekendActive);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync with /api/futures live backend endpoint
  const fetchLiveFutures = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const endpoint = isManual ? "/api/futures/refresh" : "/api/futures";
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (data && data.contracts) {
          setContractsData((prev) => ({
            ...prev,
            ...data.contracts
          }));
          if (data.isWeekend !== undefined) {
            setIsWeekend(data.isWeekend);
          }
          if (data.serverTimeET) {
            setLastSyncTime(data.serverTimeET);
          }
        }
      }
    } catch (err) {
      // Keep existing data gracefully
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  const [isStreamActive, setIsStreamActive] = useState(false);

  // Initial load and periodic polling every 5 seconds as resilient backup
  useEffect(() => {
    fetchLiveFutures(false);
    const pollTimer = setInterval(() => {
      fetchLiveFutures(false);
    }, 5000);

    return () => clearInterval(pollTimer);
  }, [fetchLiveFutures]);

  // Connect to direct institutional futures SSE stream (/api/futures/stream)
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/futures/stream");
      es.addEventListener("open", () => {
        setIsStreamActive(true);
      });
      es.addEventListener("futures-pulse", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.contracts) {
            setContractsData((prev) => ({
              ...prev,
              ...data.contracts
            }));
            if (data.isWeekend !== undefined) {
              setIsWeekend(data.isWeekend);
            }
            if (data.serverTimeET) {
              setLastSyncTime(data.serverTimeET);
            }
            setIsStreamActive(true);
          }
        } catch (err) {
          // ignore
        }
      });
      es.onerror = () => {
        setIsStreamActive(false);
      };
    } catch (err) {
      setIsStreamActive(false);
    }

    return () => {
      if (es) {
        es.close();
      }
    };
  }, []);

  // Subtle real-time micro-discovery for active 24/7 crypto contract ($MBT)
  useEffect(() => {
    const cryptoTickTimer = setInterval(() => {
      setContractsData((prev) => {
        const mbt = prev.MBT;
        if (!mbt) return prev;
        const jitter = (Math.random() * 0.4 - 0.2);
        const delta = Number((jitter * 18.0).toFixed(2));
        const newPrice = Number((mbt.price + delta).toFixed(2));
        const history = mbt.priceHistory15m ? [...mbt.priceHistory15m] : [];
        if (history.length > 0) {
          history[history.length - 1] = { minute: "Now", price: newPrice };
        }
        const history5d = mbt.priceHistory5d ? [...mbt.priceHistory5d] : [];
        if (history5d.length > 0) {
          history5d[history5d.length - 1] = { ...history5d[history5d.length - 1], price: newPrice };
        }
        return {
          ...prev,
          MBT: {
            ...mbt,
            price: newPrice,
            changePts: Number((newPrice - mbt.prevClose).toFixed(2)),
            changePct: Number((((newPrice - mbt.prevClose) / mbt.prevClose) * 100).toFixed(2)),
            priceHistory15m: history,
            priceHistory5d: history5d
          }
        };
      });
    }, 3500);

    return () => clearInterval(cryptoTickTimer);
  }, []);

  const handleManualRefresh = () => {
    fetchLiveFutures(true);
  };

  const currentContract = contractsData[selectedSymbol] || contractsData.MES;
  const sessionInfo: MarketSessionInfo = currentContract.marketStatus || getFuturesMarketSession(new Date(), currentContract.symbol);

  // Level markers for the Value Area Visual Ladder
  const { levels, price } = currentContract;
  const ladderLevels = [
    { label: "PD HIGH", value: levels.pdHigh, type: "resistance", color: "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40" },
    { label: "+2σ BAND", value: levels.plus2Sigma, type: "sd", color: "text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/40" },
    { label: "+1σ BAND", value: levels.plus1Sigma, type: "sd", color: "text-[#E5C794] bg-[#B08D57]/20 border-[#B08D57]/40" },
    { label: "ON HIGH", value: levels.onHigh, type: "overnight", color: "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40" },
    { label: "OR HIGH", value: levels.orHigh, type: "opening", color: "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40" },
    { label: "VWAP", value: levels.vwap, type: "vwap", color: "text-[#C084FC] bg-[#C084FC]/20 border-[#C084FC]/50" },
    { label: "POC", value: levels.poc, type: "poc", color: "text-[#EDE9DE] bg-white/10 border-white/20" },
    { label: "OR LOW", value: levels.orLow, type: "opening", color: "text-[#FF8585] bg-[#A6291C]/20 border-[#A6291C]/40" },
    { label: "ON LOW", value: levels.onLow, type: "overnight", color: "text-[#FF8585] bg-[#A6291C]/20 border-[#A6291C]/40" },
    { label: "-1σ BAND", value: levels.minus1Sigma, type: "sd", color: "text-[#E5C794] bg-[#B08D57]/20 border-[#B08D57]/40" },
    { label: "-2σ BAND", value: levels.minus2Sigma, type: "sd", color: "text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/40" },
    { label: "PD LOW", value: levels.pdLow, type: "support", color: "text-[#FF8585] bg-[#A6291C]/20 border-[#A6291C]/40" }
  ].sort((a, b) => b.value - a.value);

  return (
    <div id="smc-futures-view-root" className="space-y-6 animate-in fade-in pb-12">
      {/* 1. Header Bar with Tickers & Time */}
      <div className="bg-[#101622] border border-[#B08D57]/35 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Subtle top brass highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent pointer-events-none" />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-[#B08D57]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-3">
          {/* Row 1: Category Filters, Quick Chart Modes, Live Clock & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#253347]/70">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono-data uppercase text-[#8292A6] font-bold mr-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#B08D57]" />
                Desk Category:
              </span>
              {(["ALL", "GLOBAL", "US", "VOLATILITY", "COMMODITIES"] as ContractCategory[]).map((cat) => {
                const isActive = activeCategory === cat;
                const info = CATEGORY_MAP[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      // If current selected symbol is not in this category, auto-select first symbol in category
                      if (!info.symbols.includes(selectedSymbol)) {
                        setSelectedSymbol(info.symbols[0]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded text-[10.5px] font-mono-data font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#B08D57] text-[#0A111C] shadow-sm font-black ring-1 ring-[#F3E5AB]/40"
                        : "bg-black/50 text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5 border border-[#253347]/60"
                    }`}
                  >
                    {info.label.split("(")[0].trim()}
                    <span className="ml-1 opacity-75 text-[9px]">({info.symbols.length})</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Chart Modes, Live Clock & Top Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Quick Chart Mode Switcher */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-[#253347]">
                <button
                  onClick={() => setChartViewMode("DXY_RADAR")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold transition-all flex items-center gap-1 ${
                    chartViewMode === "DXY_RADAR"
                      ? "bg-[#10B981]/30 text-[#6EE7B7] border border-[#10B981]/60"
                      : "text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                  title="Monitor Premarket USD Strength & MCL Crude Oil Resistance"
                >
                  <DollarSign className="w-2.5 h-2.5 text-[#10B981]" />
                  <span>DXY USD</span>
                </button>
                <button
                  onClick={() => setChartViewMode("VIX_RADAR")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold transition-all flex items-center gap-1 ${
                    chartViewMode === "VIX_RADAR"
                      ? "bg-[#D97706]/30 text-[#FDE68A] border border-[#D97706]/60"
                      : "text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  <Flame className="w-2.5 h-2.5 text-[#F59E0B]" />
                  <span className="hidden sm:inline">VIX Radar</span>
                </button>
                <button
                  onClick={() => setChartViewMode("CONTRACT_CHART")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold transition-all flex items-center gap-1 ${
                    chartViewMode === "CONTRACT_CHART"
                      ? "bg-[#B08D57]/30 text-[#E5C794] border border-[#B08D57]/60"
                      : "text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  <BarChart3 className="w-2.5 h-2.5 text-[#B08D57]" />
                  <span>{currentContract.ticker} Chart</span>
                </button>
                <button
                  onClick={() => setChartViewMode("BOTH")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold transition-all flex items-center gap-1 ${
                    chartViewMode === "BOTH"
                      ? "bg-[#2563EB]/30 text-[#93C5FD] border border-[#2563EB]/60"
                      : "text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  <SlidersHorizontal className="w-2.5 h-2.5 text-[#60A5FA]" />
                  <span className="hidden sm:inline">Dual</span>
                </button>
              </div>

              {/* Time & Session */}
              <div className="flex items-center gap-2 bg-black/50 px-2.5 py-1 rounded-lg border border-[#253347]/60">
                <div className="text-sm sm:text-base font-bold font-mono-data text-[#FBF8F1] tracking-wider flex items-center gap-1">
                  <span>{currentTimeET}</span>
                  <span className="text-[10px] text-[#BAC7D5] font-normal">ET</span>
                </div>
                {sessionInfo.session === "crypto_24_7" ? (
                  <span className="text-[10px] font-mono-data uppercase font-bold tracking-wider bg-[#064E3B]/80 text-[#34D399] border border-[#059669]/80 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    24/7 Live
                  </span>
                ) : sessionInfo.session === "closed" ? (
                  <span className="text-[10px] font-mono-data uppercase font-bold tracking-wider bg-[#A6291C]/35 text-[#FF8585] border border-[#A6291C]/60 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8585]" />
                    Closed
                  </span>
                ) : (
                  <span className="text-[10px] font-mono-data uppercase font-bold tracking-wider bg-[#064E3B]/80 text-[#34D399] border border-[#059669]/80 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    {sessionInfo.label}
                  </span>
                )}
                {/* Direct Push Stream Status */}
                <span
                  className={`hidden md:flex items-center gap-1 text-[9px] font-mono-data uppercase px-1.5 py-0.5 rounded border ${
                    isStreamActive
                      ? "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/40"
                      : "bg-black/50 text-[#8292A6] border-white/10"
                  }`}
                  title={isStreamActive ? "Direct low-latency push stream active" : "Polling fallback active"}
                >
                  <span className={`w-1 h-1 rounded-full ${isStreamActive ? "bg-[#10B981]" : "bg-gray-500"}`} />
                  <span>{isStreamActive ? "STREAM" : "SYNC"}</span>
                </span>
              </div>

              {/* Alerts & Refresh */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAlertsActive(!isAlertsActive)}
                  title={isAlertsActive ? "Price & Level Alerts Enabled" : "Alerts Muted"}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isAlertsActive
                      ? "bg-black/60 border-[#B08D57]/60 text-[#E5C794] shadow-sm"
                      : "bg-black/40 border-[#253347] text-[#BAC7D5]"
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  title="Refresh Daily Bias & Volatility Bands from Live CME/Spot Data"
                  className="p-1.5 rounded-lg bg-black/70 border border-[#B08D57]/30 text-[#BAC7D5] hover:text-[#FBF8F1] hover:border-[#B08D57]/60 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#B08D57]" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Dedicated Full-Width Instruments Selector Ribbon */}
          <div className="w-full flex flex-col gap-2 pt-1">
            {/* Ribbon Subheader with contract specs and navigation buttons */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow font-bold shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                  <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#E5C794] whitespace-nowrap">
                    {CATEGORY_MAP[activeCategory].label.split("(")[0].trim()}
                  </span>
                  <span className="text-[10px] font-mono-data text-[#8292A6] whitespace-nowrap">
                    ({CATEGORY_MAP[activeCategory].symbols.length} instruments)
                  </span>
                  <span className="hidden md:inline-block text-[10px] font-mono-data text-[#BAC7D5] bg-black/40 px-2 py-0.5 rounded border border-white/5 truncate max-w-sm">
                    Selected: <strong className="text-[#FBF8F1]">{currentContract.ticker}</strong> · {currentContract.name} ({currentContract.contractSpecs.exchange})
                  </span>
                </div>
              </div>

              {/* Instrument Navigation & View Mode Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Scroll Arrow Buttons (enabled in scroll ribbon mode) */}
                {!isWrapView && (
                  <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-md border border-[#253347]">
                    <button
                      onClick={() => handleScrollTicker("left")}
                      disabled={!canScrollLeft}
                      title="Scroll Left (Previous Instruments)"
                      className={`p-1 rounded transition-all ${
                        canScrollLeft
                          ? "text-[#E5C794] hover:bg-[#B08D57]/20 active:scale-95 cursor-pointer"
                          : "text-[#8292A6]/30 cursor-not-allowed"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleScrollTicker("right")}
                      disabled={!canScrollRight}
                      title="Scroll Right (More Instruments)"
                      className={`p-1 rounded transition-all ${
                        canScrollRight
                          ? "text-[#E5C794] hover:bg-[#B08D57]/20 active:scale-95 cursor-pointer"
                          : "text-[#8292A6]/30 cursor-not-allowed"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Wrap All Grid vs Single Row Ribbon Toggle */}
                <button
                  onClick={() => setIsWrapView(!isWrapView)}
                  title={isWrapView ? "Switch to single row scroll ribbon" : "View all instruments wrapped in grid (no cut off)"}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-mono-data font-bold border transition-all ${
                    isWrapView
                      ? "bg-[#B08D57]/25 border-[#B08D57] text-[#E5C794] shadow-sm ring-1 ring-[#B08D57]/30"
                      : "bg-black/60 border-[#253347] text-[#BAC7D5] hover:text-[#FBF8F1] hover:border-[#B08D57]/40"
                  }`}
                >
                  {isWrapView ? (
                    <>
                      <List className="w-3.5 h-3.5 text-[#B08D57]" />
                      <span className="hidden sm:inline">Single Row</span>
                    </>
                  ) : (
                    <>
                      <LayoutGrid className="w-3.5 h-3.5 text-[#B08D57]" />
                      <span className="hidden sm:inline">Wrap Grid</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* The Instruments Container */}
            <div className="relative w-full">
              {/* Left Gradient Cue when scrollable */}
              {!isWrapView && canScrollLeft && (
                <div
                  onClick={() => handleScrollTicker("left")}
                  className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-[#101622] via-[#101622]/80 to-transparent flex items-center justify-start pl-1 cursor-pointer pointer-events-auto rounded-l-lg"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4 text-[#E5C794] animate-pulse" />
                </div>
              )}

              {/* Right Gradient Cue when scrollable */}
              {!isWrapView && canScrollRight && (
                <div
                  onClick={() => handleScrollTicker("right")}
                  className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-[#101622] via-[#101622]/80 to-transparent flex items-center justify-end pr-1 cursor-pointer pointer-events-auto rounded-r-lg"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4 text-[#E5C794] animate-pulse" />
                </div>
              )}

              <div
                ref={tickerScrollRef}
                onWheel={handleWheelTicker}
                className={`bg-black/70 p-2 rounded-lg border border-[#B08D57]/30 shadow-inner min-w-0 w-full ${
                  isWrapView
                    ? "flex flex-wrap gap-2 items-center"
                    : "flex items-center gap-2 overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-[#B08D57]/40 scrollbar-track-black/40"
                }`}
              >
                {CATEGORY_MAP[activeCategory].symbols.map((sym) => {
                  const isSelected = selectedSymbol === sym;
                  const c = contractsData[sym];
                  const isCryptoSym = sym === "MBT";
                  const isClosedSym = !isCryptoSym && isWeekend;

                  return (
                    <button
                      key={sym}
                      ref={(el) => {
                        pillRefs.current[sym] = el;
                      }}
                      onClick={() => {
                        setSelectedSymbol(sym);
                        if (!isWrapView && pillRefs.current[sym]) {
                          pillRefs.current[sym]?.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                            inline: "center",
                          });
                        }
                      }}
                      title={`${c?.name || sym} (${sym}) · ${c?.contractSpecs.exchange || "CME"}`}
                      className={`px-3 py-1.5 rounded text-xs font-mono-data font-bold transition-all uppercase flex items-center gap-2 shrink-0 ${
                        isSelected
                          ? "bg-[#B08D57] text-[#0A111C] shadow-md ring-1 ring-[#F3E5AB] font-black"
                          : "bg-black/50 text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/10 border border-[#253347]/70"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isCryptoSym ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" title="24/7 Live Crypto Feed" />
                        ) : isClosedSym ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8585]/70" title="Market Closed · Weekend" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" title="Market Open" />
                        )}
                        <span className="font-extrabold">{c?.ticker || sym}</span>
                      </div>
                      {c && (
                        <span className={`text-[10px] tabular-nums tracking-tight ${isSelected ? "text-[#0A111C] font-black" : "text-[#EDE9DE]"}`}>
                          {c.price >= 1000
                            ? c.price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                            : c.price.toFixed(2)}
                        </span>
                      )}
                      {c && (
                        <FuturesSparkline
                          data={c.priceHistory15m}
                          width={38}
                          height={14}
                          id={`pill-${sym}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Sync Status Line */}
        <div className="flex flex-wrap items-center justify-between mt-3 pt-2.5 border-t border-[#B08D57]/20 text-[10px] font-mono-data text-[#BAC7D5] gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span>Server sync: {lastSyncTime || currentTimeET} ET</span>
            <span>·</span>
            <span className="text-[#38BDF8] font-bold">Stream: {isStreamActive ? "SSE 1.2s Real-Time" : "5s Auto-Poll"}</span>
            <span>·</span>
            {currentContract.symbol === "MBT" ? (
              <span className="text-[#10B981] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                24/7 LIVE CRYPTO DISCOVERY
              </span>
            ) : isWeekend ? (
              <span className="text-[#FF8585] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8585]" />
                WEEKEND HALT · FRIDAY SETTLEMENT PRESERVED
              </span>
            ) : (
              <span className="text-[#10B981] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                CME GLOBEX LIVE FEED
              </span>
            )}
          </div>
          <div className="text-[#E5C794] hidden sm:inline-block font-semibold">
            {currentContract.symbol === "MBT"
              ? "Continuous 24/7 Liquid Spot Feed"
              : (sessionInfo.reopenTimeText || "SMC Proprietary Order Flow & Level Architecture")}
          </div>
        </div>
        </div>
      </div>

      {/* Weekend Notice Banner when CME Globex is halted */}
      {isWeekend && (
        <div className="bg-[#101622]/95 border border-[#B08D57]/35 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono-data shadow-lg">
          <div className="flex items-center gap-3 text-[#BAC7D5]">
            <div className="w-7 h-7 rounded-lg bg-[#A6291C]/20 border border-[#A6291C]/40 flex items-center justify-center shrink-0 text-[#FF8585]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#FBF8F1]">CME Weekend Globex Schedule Active:</span>{" "}
              Traditional futures (<span className="text-[#E5C794] font-bold">$MES, $ES, $MNQ, $NQ, $CL, $MGC</span>) closed Friday 17:00 ET and resume Sunday 18:00 ET. Displaying Friday closing settlement levels.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-md bg-[#064E3B]/80 text-[#34D399] border border-[#059669]/80 font-bold flex items-center gap-1.5 text-[11px] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              $MBT 24/7 Active
            </span>
          </div>
        </div>
      )}

      {/* Active CME Globex Session Banner (Sunday Reopen & Overnight Session) */}
      {!isWeekend && (
        <div className="bg-[#101622]/95 border border-emerald-500/35 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono-data shadow-lg">
          <div className="flex items-center gap-3 text-[#BAC7D5]">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-[#FBF8F1]">CME Globex Session Active:</span>{" "}
              {sessionInfo.label} ({sessionInfo.sublabel || sessionInfo.sessionWindow}) · Real-time order flow, Level 2 depth, CVD, and live price discovery are actively ticking across all 16 institutional contracts.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 text-[11px] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Globex Ticking
            </span>
            <span className="px-2 py-1 rounded bg-black/60 text-[#E5C794] border border-white/5 text-[10px]">
              NY {lastSyncTime || currentTimeET} ET
            </span>
          </div>
        </div>
      )}

      {/* 2. Top Level Metric Pill Strip */}
      {(() => {
        const fmt = (val: number) =>
          val >= 10000
            ? Math.round(val).toLocaleString("en-US")
            : val >= 1000
            ? val.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
            : val.toFixed(2);

        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2 text-center font-mono-data">
            {/* VWAP */}
            <div className="bg-[#121622] border border-[#9333EA]/60 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#C084FC] font-semibold truncate">VWAP</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#E9D5FF] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.vwap)}</span>
            </div>

            {/* ON HIGH */}
            <div className="bg-[#121622] border border-[#059669]/60 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#34D399] font-semibold truncate">ON HIGH</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#A7F3D0] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.onHigh)}</span>
            </div>

            {/* ON LOW */}
            <div className="bg-[#121622] border border-[#DC2626]/50 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#F87171] font-semibold truncate">ON LOW</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#FECACA] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.onLow)}</span>
            </div>

            {/* OR HIGH */}
            <div className="bg-[#121622] border border-[#059669]/60 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#34D399] font-semibold truncate">OR HIGH</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#A7F3D0] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.orHigh)}</span>
            </div>

            {/* OR LOW */}
            <div className="bg-[#121622] border border-[#DC2626]/50 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#F87171] font-semibold truncate">OR LOW</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#FECACA] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.orLow)}</span>
            </div>

            {/* PD HIGH */}
            <div className="bg-[#121622] border border-[#059669]/60 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#34D399] font-semibold truncate">PD HIGH</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#A7F3D0] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.pdHigh)}</span>
            </div>

            {/* PD LOW */}
            <div className="bg-[#121622] border border-[#DC2626]/50 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#F87171] font-semibold truncate">PD LOW</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#FECACA] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.pdLow)}</span>
            </div>

            {/* +1σ */}
            <div className="bg-[#121622] border border-[#D97706]/60 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#FBBF24] font-semibold truncate">+1σ</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#FDE68A] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.plus1Sigma)}</span>
            </div>

            {/* -1σ */}
            <div className="bg-[#121622] border border-[#D97706]/60 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#FBBF24] font-semibold truncate">-1σ</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#FDE68A] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.minus1Sigma)}</span>
            </div>

            {/* +2σ */}
            <div className="bg-[#121622] border border-[#0284C7]/60 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#38BDF8] font-semibold truncate">+2σ</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#BAE6FD] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.plus2Sigma)}</span>
            </div>

            {/* -2σ */}
            <div className="bg-[#121622] border border-[#0284C7]/60 rounded-lg px-2 py-1.5 flex flex-col justify-between shadow-sm min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-[#38BDF8] font-semibold truncate">-2σ</span>
              <span className="text-xs sm:text-[13px] font-bold text-[#BAE6FD] mt-0.5 tabular-nums tracking-tight truncate">{fmt(levels.minus2Sigma)}</span>
            </div>
          </div>
        );
      })()}

      {/* 3. Cross-Asset Volatility Radar & Institutional Value Area Chart Suite */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101622] border border-[#B08D57]/30 rounded-xl p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D97706]/20 border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold font-serif italic text-[#FBF8F1] tracking-wide" style={{ fontFamily: "Georgia, 'Newsreader', serif" }}>
                Cross-Asset Volatility, USD Premarket Radar &amp; Institutional Value Area Visualizer
              </div>
              <div className="text-[10px] font-mono-data text-[#BAC7D5]">
                REAL-TIME CBOE VIX SPIKES · ICE DXY DOLLAR INDEX PREMARKET CRUDE CAP · VALUE AREA DEVIATION CHANNELS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 bg-black/70 p-1 rounded-lg border border-[#253347] font-mono-data text-xs">
              <button
                onClick={() => setChartViewMode("DXY_RADAR")}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  chartViewMode === "DXY_RADAR"
                    ? "bg-[#10B981] text-[#0A111C] shadow-md font-black"
                    : "text-[#BAC7D5] hover:text-[#FBF8F1]"
                }`}
                title="Monitor USD Strength & Premarket Resistance on Crude (MCL/CL)"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Dollar Index (DXY)</span>
              </button>

              <button
                onClick={() => setChartViewMode("CONTRACT_CHART")}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  chartViewMode === "CONTRACT_CHART"
                    ? "bg-[#B08D57] text-[#0A111C] shadow-md font-black"
                    : "text-[#BAC7D5] hover:text-[#FBF8F1]"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{currentContract.ticker} Value Area (1D / 5D)</span>
              </button>

              <button
                onClick={() => setChartViewMode("VIX_RADAR")}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  chartViewMode === "VIX_RADAR"
                    ? "bg-[#D97706] text-[#0A111C] shadow-md font-black"
                    : "text-[#BAC7D5] hover:text-[#FBF8F1]"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>CBOE VIX Radar</span>
              </button>

              <button
                onClick={() => setChartViewMode("ORDERFLOW")}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  chartViewMode === "ORDERFLOW"
                    ? "bg-[#D97706] text-[#0A111C] shadow-md font-black"
                    : "text-[#BAC7D5] hover:text-[#FBF8F1]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Order Flow &amp; DOM</span>
              </button>

              <button
                onClick={() => setChartViewMode("BOTH")}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  chartViewMode === "BOTH"
                    ? "bg-[#2563EB] text-white shadow-md font-bold"
                    : "text-[#BAC7D5] hover:text-[#FBF8F1]"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Dual View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chart View Content */}
        {chartViewMode === "DXY_RADAR" && (
          <DxyDollarIndexChart
            macroData={macroData}
            isCalmMode={isCalmMode}
            onOpenTerminal={onOpenTerminal}
          />
        )}

        {chartViewMode === "VIX_RADAR" && (
          <VixVolatilityIndexChart
            macroData={macroData}
            isCalmMode={isCalmMode}
            onOpenTerminal={onOpenTerminal}
          />
        )}

        {chartViewMode === "CONTRACT_CHART" && (
          <FuturesContractChart contract={currentContract} />
        )}

        {chartViewMode === "ORDERFLOW" && (
          <FuturesOrderflowEngine
            contract={currentContract}
            onOpenTerminal={onOpenTerminal}
          />
        )}

        {chartViewMode === "BOTH" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <VixVolatilityIndexChart
              macroData={macroData}
              isCalmMode={isCalmMode}
              onOpenTerminal={onOpenTerminal}
            />
            <FuturesContractChart contract={currentContract} />
          </div>
        )}
      </div>

      {/* 4. Main Two-Column Structure: Level Ladder & Session Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Level Ladder & Value Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#101622] border border-[#B08D57]/30 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
            {/* Ladder Area Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#B08D57]/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-data uppercase font-bold text-[#FBF8F1] tracking-wider">
                  {currentContract.symbol} VALUE AREA LADDER & DEVIATION BANDS
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono-data text-[#BAC7D5]">
                <span>Spot Price:</span>
                <span className="text-[#34D399] font-bold text-sm ml-1">{currentContract.price.toFixed(2)}</span>
                <div className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded border border-[#253347] ml-1.5">
                  <FuturesSparkline
                    data={currentContract.priceHistory15m}
                    width={56}
                    height={16}
                    showBadge
                    id={`spot-${currentContract.symbol}`}
                  />
                  <span className="text-[8.5px] text-[#8292A6] uppercase tracking-wider font-semibold">15m</span>
                </div>
              </div>
            </div>

            {/* Level Ladder Visualizer */}
            <div className="py-4 space-y-2 font-mono-data text-xs">
              <div className="text-[10px] text-[#8292A6] uppercase tracking-wider pb-1 flex items-center justify-between">
                <span>Value Area Band / Pivot</span>
                <span>Distance from Spot</span>
                <span>Price Level</span>
              </div>

              {ladderLevels.map((lvl, index) => {
                const diff = (price - lvl.value);
                const isCurrentNearest = Math.abs(diff) < (currentContract.rangePts * 0.08);

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isCurrentNearest
                        ? "bg-[#B08D57]/20 border-[#B08D57] shadow-[0_0_15px_rgba(176,141,87,0.2)]"
                        : "bg-black/30 border-[#253347]/50 hover:border-[#253347]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${lvl.color}`}>
                        {lvl.label}
                      </span>
                      {isCurrentNearest && (
                        <span className="text-[9px] uppercase font-bold text-[#E5C794] bg-[#B08D57]/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E5C794]" />
                          AT TEST ZONE
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[#8292A6]">
                      {diff > 0 ? `+${diff.toFixed(2)} pts` : `${diff.toFixed(2)} pts`}
                    </div>

                    <div className="font-bold text-[#EDE9DE] text-sm">
                      {lvl.value.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current State Card */}
          <div className="bg-[#101726] border border-[#B08D57]/25 rounded-xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-data">
              <span className="text-[#8292A6] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#B08D57]" />
                CURRENT STATE & BIAS
              </span>
              <span className="text-[#10B981] font-bold flex items-center gap-1">
                ▲ {currentContract.bias}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-3.5 rounded-lg border border-[#253347]">
              {/* State Badge */}
              <div className="px-3.5 py-2 rounded-lg bg-[#064E3B]/80 border border-[#059669] text-[#34D399] shrink-0 text-center">
                <div className="font-bold text-base">{currentContract.state}</div>
                <div className="text-[10px] text-[#A7F3D0] font-mono-data mt-0.5">
                  {currentContract.biasConfidence}% confidence
                </div>
              </div>

              {/* State Description */}
              <div className="text-xs sm:text-sm text-[#EDE9DE] font-sans leading-relaxed">
                {currentContract.stateDescription}
              </div>
            </div>

            {/* SMC Trade Execution Gameplan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono-data pt-2">
              <div className="bg-black/30 border border-[#253347] p-3 rounded-lg space-y-1">
                <div className="text-[#B08D57] font-bold text-[10px] uppercase flex items-center gap-1">
                  <Target className="w-3 h-3 text-[#B08D57]" />
                  Execution Trigger & Setup:
                </div>
                <div className="text-[#EDE9DE]">{currentContract.tradePlan.trigger}</div>
              </div>

              <div className="bg-black/30 border border-[#A6291C]/30 p-3 rounded-lg space-y-1">
                <div className="text-[#FF8585] font-bold text-[10px] uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#FF8585]" />
                  Trade Invalidation Level:
                </div>
                <div className="text-[#EDE9DE]">{currentContract.tradePlan.invalidation}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SESSION SUMMARY Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#101622] border border-[#B08D57]/30 rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="text-xs font-mono-data text-[#BAC7D5] uppercase tracking-wider pb-2 border-b border-[#B08D57]/20 font-bold flex items-center justify-between">
              <span>SESSION SUMMARY</span>
              <span className="text-[10px] text-[#E5C794]">{currentContract.symbol}</span>
            </div>

            {/* Row 1: LAST PRICE & BIAS */}
            <div className="grid grid-cols-2 gap-3 items-start">
              {/* LAST PRICE */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono-data text-[#8292A6] uppercase flex items-center gap-1.5 font-semibold">
                  <Clock className="w-3 h-3 text-[#8292A6]" />
                  <span>LAST PRICE</span>
                </div>
                <div className={`text-xl sm:text-2xl font-bold font-mono-data leading-tight ${currentContract.changePts >= 0 ? "text-[#10B981]" : "text-[#FF8585]"}`}>
                  {currentContract.price.toFixed(2)}
                </div>
                <div className={`text-[11px] font-mono-data font-medium ${currentContract.changePts >= 0 ? "text-[#10B981]" : "text-[#FF8585]"}`}>
                  {currentContract.changePts >= 0 ? "+" : ""}{currentContract.changePts.toFixed(2)} ({currentContract.changePts >= 0 ? "+" : ""}{currentContract.changePct.toFixed(2)}%)
                </div>
              </div>

              {/* BIAS */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono-data text-[#8292A6] uppercase flex items-center gap-1.5 font-semibold">
                  <TrendingUp className="w-3 h-3 text-[#8292A6]" />
                  <span>BIAS</span>
                </div>
                <div className={`text-xl sm:text-2xl font-bold font-mono-data leading-tight ${
                  currentContract.bias.toLowerCase().includes("bull")
                    ? "text-[#10B981]"
                    : currentContract.bias.toLowerCase().includes("bear")
                    ? "text-[#FF8585]"
                    : "text-[#E5C794]"
                }`}>
                  {currentContract.bias}
                </div>
                <div className="text-[11px] font-mono-data text-[#8292A6] capitalize">
                  {currentContract.biasSubtext}
                </div>
              </div>
            </div>

            {/* Dedicated 15M Momentum Strip - Spacious & Clean with Zero Overlap */}
            <div className="bg-black/50 px-3 py-2 rounded-lg border border-[#253347] flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-data text-[#BAC7D5] uppercase font-semibold">
                <Activity className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-[#E5C794]">15M Momentum</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <FuturesSparkline
                  data={currentContract.priceHistory15m}
                  width={88}
                  height={22}
                  id={`summary-${currentContract.symbol}`}
                />
                {(() => {
                  const h = currentContract.priceHistory15m;
                  const startP = h && h.length > 0 ? h[0].price : currentContract.price;
                  const diff = currentContract.price - startP;
                  const pct = startP !== 0 ? (diff / startP) * 100 : 0;
                  const isUp = diff >= 0;
                  return (
                    <span className={`text-[9.5px] font-mono-data font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                      isUp
                        ? "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30"
                        : "bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30"
                    }`}>
                      {isUp ? "▲ +" : "▼ "}{diff.toFixed(2)} ({isUp ? "+" : ""}{pct.toFixed(2)}%)
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="border-t border-[#253347]/60" />

            {/* Row 2: RANGE & VOLATILITY */}
            <div className="grid grid-cols-2 gap-3">
              {/* RANGE */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono-data text-[#8292A6] uppercase">
                  ↕ RANGE
                </div>
                <div className="text-lg font-bold font-mono-data text-[#EDE9DE] leading-tight">
                  {currentContract.rangePts.toFixed(2)} pts
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6]">
                  ${(currentContract.rangePts * currentContract.multiplier).toFixed(2)}/contract
                </div>
              </div>

              {/* VOLATILITY */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono-data text-[#8292A6] uppercase">
                  📊 VOLATILITY
                </div>
                <div className="text-lg font-bold font-mono-data text-[#F59E0B] leading-tight">
                  {currentContract.volatility}
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6]">
                  ATR Active
                </div>
              </div>
            </div>

            <div className="border-t border-[#253347]/60" />

            {/* Row 3: VWAP SIDE & VWAP CROSSES */}
            <div className="grid grid-cols-2 gap-3">
              {/* VWAP SIDE */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono-data text-[#8292A6] uppercase">
                  ⚡ VWAP SIDE
                </div>
                <div className="text-base font-bold font-mono-data text-[#10B981] leading-tight flex items-center gap-1">
                  ↑ {currentContract.vwapSide}
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6]">
                  +{currentContract.vwapDistPts.toFixed(2)} pts
                </div>
              </div>

              {/* VWAP CROSSES */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono-data text-[#8292A6] uppercase">
                  🎯 VWAP CROSSES
                </div>
                <div className="text-base font-bold font-mono-data text-[#FF8585] leading-tight">
                  {currentContract.vwapCrosses}
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6]">
                  {currentContract.vwapCrossQuality}
                </div>
              </div>
            </div>

            <div className="border-t border-[#253347]/60" />

            {/* Row 4: VWAP DIST & SINCE OPEN */}
            <div className="grid grid-cols-2 gap-3">
              {/* VWAP DIST */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono-data text-[#8292A6] uppercase">
                  📈 VWAP DIST
                </div>
                <div className="text-base font-bold font-mono-data text-[#EDE9DE] leading-tight">
                  +{currentContract.vwapDistPct.toFixed(2)}%
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6]">
                  Normal Distribution
                </div>
              </div>

              {/* SINCE OPEN */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono-data text-[#8292A6] uppercase">
                  ⏱ SINCE OPEN
                </div>
                <div className="text-base font-bold font-mono-data text-[#EDE9DE] leading-tight">
                  {currentContract.sinceOpen}
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6]">
                  since 9:30 ET
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contract Specs Card */}
          <div className="bg-[#101726] border border-[#253347] rounded-xl p-4 text-xs font-mono-data space-y-2">
            <div className="text-[#8292A6] uppercase text-[10px] font-bold">
              {currentContract.symbol} CONTRACT SPECIFICATIONS
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-black/40 p-2 rounded border border-[#253347]/60">
                <span className="text-[#8292A6] block text-[9px]">Tick Size</span>
                <span className="font-bold text-[#EDE9DE]">{currentContract.contractSpecs.tickSize}</span>
              </div>
              <div className="bg-black/40 p-2 rounded border border-[#253347]/60">
                <span className="text-[#8292A6] block text-[9px]">Tick Value</span>
                <span className="font-bold text-[#10B981]">{currentContract.contractSpecs.tickValue}</span>
              </div>
              <div className="bg-black/40 p-2 rounded border border-[#253347]/60">
                <span className="text-[#8292A6] block text-[9px]">Point Value</span>
                <span className="font-bold text-[#E5C794]">{currentContract.contractSpecs.pointValue}</span>
              </div>
              <div className="bg-black/40 p-2 rounded border border-[#253347]/60">
                <span className="text-[#8292A6] block text-[9px]">Margin Req</span>
                <span className="font-bold text-[#EDE9DE]">{currentContract.contractSpecs.marginReq}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4.5. SMC Institutional Orderflow, Cumulative Delta & Depth Desk */}
      <FuturesOrderflowEngine
        contract={currentContract}
        onOpenTerminal={onOpenTerminal}
      />

      {/* 5. Daily Bias Matrix for All 15 Instruments */}
      <div className="bg-[#101622] border border-[#B08D57]/35 rounded-xl p-4 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Subtle top brass highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/30">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-serif italic text-[#FBF8F1]" style={{ fontFamily: "Georgia, 'Newsreader', serif" }}>
              SMC Daily Futures & Global Indices Bias Board
            </h3>
            <p className="text-xs font-mono-data text-[#BAC7D5] font-semibold">
              INSTITUTIONAL VALUE AREA, ORDER FLOW ORIENTATION & SMC EXECUTION PLANS (15 INSTRUMENTS)
            </p>
          </div>

          {/* Table Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(["ALL", "GLOBAL", "US", "VOLATILITY", "COMMODITIES"] as ContractCategory[]).map((cat) => {
              const isActive = activeCategory === cat;
              const info = CATEGORY_MAP[cat];
              return (
                <button
                  key={`table-cat-${cat}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 rounded text-[10px] font-mono-data font-bold transition-all ${
                    isActive
                      ? "bg-[#B08D57] text-[#0A111C] shadow-sm font-black"
                      : "bg-black/40 text-[#BAC7D5] hover:text-[#FBF8F1] border border-[#253347]"
                  }`}
                >
                  {info.label.split("(")[0].trim()} ({info.symbols.length})
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-data">
            <thead>
              <tr className="border-b border-[#253347] text-[#8292A6] text-[10px] uppercase">
                <th className="pb-3 font-semibold">Contract</th>
                <th className="pb-3 font-semibold min-w-[180px]">Price / 15m Momentum</th>
                <th className="pb-3 font-semibold">Daily Bias</th>
                <th className="pb-3 font-semibold">State & Session</th>
                <th className="pb-3 font-semibold">VWAP Status</th>
                <th className="pb-3 font-semibold">Order Flow Delta</th>
                <th className="pb-3 font-semibold">24h Range / Value</th>
                <th className="pb-3 font-semibold">SMC Gameplan Trigger</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253347]/50">
              {CATEGORY_MAP[activeCategory].symbols.map((sym) => {
                const c = contractsData[sym] || INITIAL_FUTURES_DATA[sym];
                if (!c) return null;
                const isSelected = selectedSymbol === sym;

                const formatNotional = (contract: FuturesContract) => {
                  const notional = contract.rangePts * contract.multiplier;
                  const s = contract.symbol;
                  if (s === "IBEX" || s === "FESX" || s === "DAX") {
                    return `€${notional.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
                  }
                  if (s === "KOSPI") {
                    return `₩${notional.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
                  }
                  if (s === "NKD") {
                    return `¥${notional.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
                  }
                  if (s === "HSI") {
                    return `HK$${notional.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
                  }
                  return `$${notional.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
                };

                return (
                  <tr
                    key={sym}
                    className={`hover:bg-[#B08D57]/5 transition-colors ${
                      isSelected ? "bg-[#B08D57]/10" : ""
                    }`}
                  >
                    {/* Contract */}
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#EDE9DE]">{c.ticker}</span>
                        <span className="text-[10px] text-[#8292A6] hidden sm:inline-block">({c.name})</span>
                      </div>
                      <div className="text-[9px] text-[#BAC7D5] opacity-75">
                        {c.contractSpecs.exchange} · {c.contractSpecs.pointValue}/pt
                      </div>
                    </td>

                    {/* Price / 15m Momentum */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="whitespace-nowrap tabular-nums">
                          <div className="font-bold text-[#EDE9DE] text-sm font-mono-data">
                            {c.price >= 1000
                              ? c.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : c.price.toFixed(2)}
                          </div>
                          <div className={`text-[10px] font-mono-data font-semibold ${c.changePts >= 0 ? "text-[#10B981]" : "text-[#FF8585]"}`}>
                            {c.changePts >= 0 ? "+" : ""}{c.changePts.toFixed(2)} ({c.changePct >= 0 ? "+" : ""}{c.changePct.toFixed(2)}%)
                          </div>
                        </div>

                        {/* Visual sparkline indicator next to the prices */}
                        <div className="flex flex-col items-start bg-black/45 px-2 py-1 rounded border border-[#253347]/70 shrink-0">
                          <FuturesSparkline
                            data={c.priceHistory15m}
                            width={58}
                            height={18}
                            id={`table-${c.symbol}`}
                          />
                          {(() => {
                            const h = c.priceHistory15m;
                            const sp = h && h.length > 0 ? h[0].price : c.price;
                            const d = c.price - sp;
                            const p = sp !== 0 ? (d / sp) * 100 : 0;
                            const up = d >= 0;
                            return (
                              <span className={`text-[8.5px] font-mono-data font-bold leading-none mt-0.5 ${up ? "text-[#34D399]" : "text-[#F87171]"}`}>
                                {up ? "▲ +" : "▼ "}{p.toFixed(2)}% (15m)
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </td>

                    {/* Daily Bias */}
                    <td className="py-3 pr-2">
                      {(() => {
                        const b = c.bias.toLowerCase();
                        const isBull = b.includes("bull");
                        const isBear = b.includes("bear");
                        return (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                              isBull
                                ? "bg-[#064E3B]/70 text-[#34D399] border-[#059669]/70"
                                : isBear
                                ? "bg-[#A6291C]/35 text-[#FF8585] border-[#A6291C]/60"
                                : "bg-[#B08D57]/20 text-[#E5C794] border-[#B08D57]/50"
                            }`}
                          >
                            {c.bias}
                          </span>
                        );
                      })()}
                    </td>

                    {/* State & Confidence / Session Status */}
                    <td className="py-3 pr-2">
                      <div className="text-[#EDE9DE] font-semibold flex items-center gap-1.5">
                        {c.symbol === "MBT" ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                        ) : isWeekend ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8585] shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                        )}
                        <span>{c.state}</span>
                      </div>
                      <div className="text-[10px] text-[#8292A6]">
                        {c.symbol === "MBT"
                          ? "24/7 Live Crypto Feed"
                          : isWeekend
                          ? "Friday Settlement (Closed)"
                          : `${c.biasConfidence}% Confidence`}
                      </div>
                    </td>

                    {/* VWAP */}
                    <td className="py-3 pr-2">
                      <div className={c.vwapSide === "Above" ? "text-[#10B981] font-semibold" : "text-[#FF8585] font-semibold"}>
                        {c.vwapSide === "Above" ? "↑ Above" : "↓ Below"}
                      </div>
                      <div className="text-[10px] text-[#8292A6]">
                        {c.vwapDistPts >= 0 ? `+${c.vwapDistPts.toFixed(2)}` : c.vwapDistPts.toFixed(2)} pts
                      </div>
                    </td>

                    {/* Orderflow Delta */}
                    <td className="py-3 pr-2">
                      {(() => {
                        const isBull = c.bias.toLowerCase().includes("bull");
                        const deltaApprox = Math.round((isBull ? 1 : -1) * (c.rangePts * (c.multiplier > 100 ? 12 : 160) + Math.abs(c.price % 280)));
                        const isAccumulation = deltaApprox >= 0;
                        return (
                          <div>
                            <div className={`font-bold flex items-center gap-1 tabular-nums ${isAccumulation ? "text-[#34D399]" : "text-[#FF8585]"}`}>
                              {isAccumulation ? "▲ +" : "▼ "}{Math.abs(deltaApprox).toLocaleString()} Δ
                            </div>
                            <div className="text-[9.5px] text-[#8292A6]">
                              {isAccumulation ? "Buyer Absorption" : "Overhead Defense"}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Range */}
                    <td className="py-3 pr-2">
                      <div className="text-[#EDE9DE] font-semibold">{c.rangePts.toFixed(2)} pts</div>
                      <div className="text-[10px] text-[#8292A6]">
                        {formatNotional(c)}
                      </div>
                    </td>

                    {/* SMC Setup */}
                    <td className="py-3 pr-2 max-w-[220px] truncate text-[11px] text-[#BAC7D5]" title={c.tradePlan.trigger}>
                      {c.tradePlan.trigger}
                    </td>

                    {/* Action */}
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedSymbol(sym)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                          isSelected
                            ? "bg-[#B08D57] text-[#0E1A2B]"
                            : "bg-black/50 text-[#8292A6] hover:text-[#EDE9DE] border border-[#253347]"
                        }`}
                      >
                        {isSelected ? "Active" : "Inspect"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
