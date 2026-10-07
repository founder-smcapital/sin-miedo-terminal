import React, { useState, useEffect } from "react";
import { motion, useReducedMotion, Variants } from "motion/react";
import { MacroDataState, UserSession, Currency } from "../types";
import { YenInterventionEngine } from "./engines/YenInterventionEngine";
import { IbexPropEngine } from "./engines/IbexPropEngine";
import { MiddleEastRiskEngine, MiddleEastSubTab } from "./engines/MiddleEastRiskEngine";
import { IranShadowFleetEngine } from "./engines/IranShadowFleetEngine";
import { AssetSparklines } from "./AssetSparklines";
import { GoldHistoricalChart } from "./GoldHistoricalChart";
import { GprHistoricalChart } from "./GprHistoricalChart";
import { MacroCorrelationMatrix } from "./MacroCorrelationMatrix";
import { ChokepointHeatmap } from "./ChokepointHeatmap";
import { DebtServicingRiskRadar } from "./DebtServicingRiskRadar";
import { LiquidityDriverTracker } from "./LiquidityDriverTracker";
import { VixVolatilityIndexChart } from "./VixVolatilityIndexChart";
import { X, Layers, Sparkles, RefreshCw, FileDown, Crosshair, TrendingUp, Flame, Activity, Shield, Lock, Unlock, ArrowRight, Award, Building2, Zap, Globe, DollarSign } from "lucide-react";

interface DashboardGridProps {
  macroData: MacroDataState;
  onOpenTerminal: (customPrompt?: string) => void;
  onOpenSummaryDrawer: () => void;
  onManualRefresh: () => void;
  refreshKey?: string | number;
  isCalmMode?: boolean;
  userSession?: UserSession;
  currency?: Currency;
  onOpenTierModal?: () => void;
}

// Gentle, stimulus-safe animation variants (plays smoothly on initial tab mount without blank screen)
const gentleContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.01,
    },
  },
};

const gentleCardVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

// Static variants for Calm Mode & Reduced Motion (instant, zero sensory load)
const calmContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

const calmCardVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  macroData,
  onOpenTerminal,
  onOpenSummaryDrawer,
  onManualRefresh,
  refreshKey,
  isCalmMode = false,
  userSession,
  currency,
  onOpenTierModal,
}) => {
  const currentTier = userSession?.tier || "Founding Member";
  const isFounding = currentTier.includes("Founding");
  const isSovereign = currentTier.includes("Sovereign") || isFounding;
  const isInstitutional = currentTier.includes("Institutional") || isSovereign;

  const [expandedEngine, setExpandedEngine] = useState<"yen" | "ibex" | "middleEast" | "shadowFleet" | null>(null);
  const [expandedMiddleEastTab, setExpandedMiddleEastTab] = useState<MiddleEastSubTab>("Sentiment Gauge");
  const [activeMacroChart, setActiveMacroChart] = useState<"gold" | "gpr">("gold");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Toggle between Trader mode (intraday, momentum, VIX, prop systems) and Macro mode (full sovereign stack)
  const [dashboardViewMode, setDashboardViewMode] = useState<"macro" | "trader">(() => {
    try {
      const saved = localStorage.getItem("smc_dashboard_view_mode");
      if (saved === "trader" || saved === "macro") return saved;
    } catch (e) {}
    return "macro";
  });

  const handleViewModeChange = (mode: "macro" | "trader") => {
    setDashboardViewMode(mode);
    try {
      localStorage.setItem("smc_dashboard_view_mode", mode);
    } catch (e) {}
  };

  // Close any expanded engine on Escape key and manage body scroll safely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expandedEngine) {
        setExpandedEngine(null);
      }
    };
    if (expandedEngine) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [expandedEngine]);

  const handleDownloadDashboardPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { downloadDashboardReportPDF } = await import("../utils/pdfGenerator");
      downloadDashboardReportPDF(macroData, { userSession, currency });
    } catch (err) {
      console.error("Failed to generate dashboard PDF:", err);
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 800);
    }
  };

  const prefersReduced = useReducedMotion();
  const calm = isCalmMode || Boolean(prefersReduced);

  const activeContainerVariants = calm ? calmContainerVariants : gentleContainerVariants;
  const activeCardVariants = calm ? calmCardVariants : gentleCardVariants;

  return (
    <motion.div
      id="main-dashboard-container"
      key="dashboard-grid-root"
      variants={activeContainerVariants}
      initial={false}
      animate="visible"
      className="space-y-6"
    >
      {/* Top Section Header & Quick Action Row */}
      <motion.div
        variants={activeCardVariants}
        className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#B08D57]/35 relative"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B08D57]" />
            <span className="text-[10px] font-mono-data font-bold tracking-[0.2em] text-[#E5C794] uppercase">
              Institutional Intelligence Terminal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic font-bold text-[#FBF8F1] tracking-tight" style={{ fontFamily: "Georgia, 'Newsreader', serif" }}>
            Macro Command Grid
          </h1>
          <p className="text-[11px] font-mono-data text-[#BAC7D5] tracking-wider">
            REAL-TIME QUANTITATIVE RISK & GEOPOLITICAL FLOW ARCHITECTURE // SMC DESK
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="download-dashboard-pdf-btn"
            onClick={handleDownloadDashboardPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest bg-[#111724] hover:bg-[#1A2234] text-[#E5C794] hover:text-[#FBF8F1] px-3.5 sm:px-4 py-2 rounded-lg border border-[#B08D57]/45 hover:border-[#B08D57] transition-all font-mono-data shadow-md group disabled:opacity-50"
            title="Export Daily Macro Briefing PDF with vector VIX volatility charts, risk ranges, and snippets (desk actions omitted for content use)"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#B08D57] animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-[#B08D57] group-hover:translate-y-0.5 transition-transform" />
            )}
            <span>{isGeneratingPdf ? "Generating..." : "Briefing PDF (Snippets)"}</span>
          </button>

          <button
            id="open-executive-summary-btn"
            onClick={onOpenSummaryDrawer}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest bg-[#111724] hover:bg-[#1A2234] text-[#FBF8F1] px-4 py-2 rounded-lg border border-[#B08D57]/45 hover:border-[#B08D57] transition-all font-mono-data shadow-md group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5C794] group-hover:rotate-12 transition-transform" />
            <span>Executive Brief</span>
          </button>

          <button
            id="quick-terminal-btn"
            onClick={() => onOpenTerminal()}
            className="flex items-center gap-1.5 text-[10px] bg-[#B08D57] hover:bg-[#C9A46D] text-[#0A111C] font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(176,141,87,0.3)] transition-all font-sans uppercase tracking-widest active:scale-95"
            title="Open SMC Strategy Desk & Macro Takeaways"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>SMC Strategy Desk</span>
          </button>
        </div>
      </motion.div>

      {/* Mode Switcher: Trader Mode (Intraday Focus) vs Macro Mode (Full Sovereign Stack) */}
      <motion.div
        variants={activeCardVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0d131f]/95 border border-[#B08D57]/35 rounded-xl shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-black/70 rounded-lg border border-[#B08D57]/30">
            <button
              id="dashboard-mode-trader-btn"
              onClick={() => handleViewModeChange("trader")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-mono-data font-bold transition-all cursor-pointer ${
                dashboardViewMode === "trader"
                  ? "bg-[#B08D57] text-[#0A111C] shadow-md"
                  : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Trader Mode</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-normal ${
                dashboardViewMode === "trader" ? "bg-black/25 text-[#0A111C] font-semibold" : "bg-white/10 text-[#8292A6]"
              }`}>
                Intraday
              </span>
            </button>

            <button
              id="dashboard-mode-macro-btn"
              onClick={() => handleViewModeChange("macro")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-mono-data font-bold transition-all cursor-pointer ${
                dashboardViewMode === "macro"
                  ? "bg-[#B08D57] text-[#0A111C] shadow-md"
                  : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Macro Mode</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-normal ${
                dashboardViewMode === "macro" ? "bg-black/25 text-[#0A111C] font-semibold" : "bg-white/10 text-[#8292A6]"
              }`}>
                Full Stack
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono-data">
            {dashboardViewMode === "trader" ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Intraday Focus: 24h Momentum, VIX Gamma Surface, Prop Benchmarks &amp; Yen Carry (Optimized for Speed)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#E5C794]">
                <Shield className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>Full Sovereign Macro: 24M Time-Series, Fed Liquidity Drivers, D3 Maritime Heatmaps &amp; Debt Velocity</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-[10px] font-mono-data text-[#8292A6]">
          <span className="bg-black/50 px-2.5 py-1 rounded border border-white/5 text-[#BAC7D5]">
            {dashboardViewMode === "trader" ? "⚡ 4 Intraday Modules Active" : "🌐 10 Sovereign Modules Active"}
          </span>
          {dashboardViewMode === "trader" && (
            <span className="text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30 font-medium">
              Ultra-Lightweight
            </span>
          )}
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* TRADER MODE LAYOUT (Intraday Focus & Lightweight Execution) */}
      {/* ============================================================ */}
      {dashboardViewMode === "trader" ? (
        <>
          {/* 1. 24-Hour Macro Momentum & Intraday Sparklines Bar */}
          <motion.div variants={activeCardVariants}>
            <AssetSparklines macroData={macroData} />
          </motion.div>

          {/* 2. Real-Time VIX Volatility Index: Option Gamma Surface & Volatility Spikes */}
          <motion.div variants={activeCardVariants}>
            <VixVolatilityIndexChart
              macroData={macroData}
              isCalmMode={calm}
              onOpenTerminal={(prompt) => {
                onOpenTerminal(prompt);
              }}
            />
          </motion.div>

          {/* 3. Global Benchmarks, Equities & $BTC Prop Execution Systems */}
          <motion.div id="benchmarks-prop-systems-section" variants={activeCardVariants} className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[9.5px] font-mono-data text-[#8292A6]">
              <span className="flex items-center gap-1 text-[#E5C794]">
                <Unlock className="w-3 h-3 text-[#B08D57]" />
                <span>CORE TIER I (PROFESSIONAL ALLOCATOR) — BENCHMARKS &amp; PROP EXECUTION</span>
              </span>
              <span className="text-[#5A687C]">GLOBAL INDEX &amp; CRYPTO DESK</span>
            </div>
            <IbexPropEngine
              data={macroData.engines.ibexBias}
              macroData={macroData}
              onExpandToggle={() => setExpandedEngine("ibex")}
              isExpanded={expandedEngine === "ibex"}
              onOpenTerminal={onOpenTerminal}
            />
          </motion.div>

          {/* 4. FX Volatility & BoJ Yen Intervention Dynamics (Intraday Carry Trade Sentinel) */}
          <motion.div variants={activeCardVariants} className="flex flex-col">
            <div className="flex items-center justify-between px-2 py-1 mb-1 text-[9.5px] font-mono-data text-[#8292A6]">
              <span className="flex items-center gap-1 text-[#E5C794]">
                <Unlock className="w-3 h-3 text-[#B08D57]" />
                <span>CORE TIER I (PROFESSIONAL ALLOCATOR) — FX SENTINEL</span>
              </span>
              <span className="text-[#5A687C]">USD/JPY CARRY DYNAMICS</span>
            </div>
            <YenInterventionEngine
              data={macroData.engines.yenIntervention}
              onExpandToggle={() => setExpandedEngine("yen")}
              isExpanded={expandedEngine === "yen"}
            />
          </motion.div>

          {/* 5. Visual Macro Correlation & Transmission Matrix Component (9x9) */}
          <motion.div variants={activeCardVariants}>
            <MacroCorrelationMatrix macroData={macroData} />
          </motion.div>

          {/* Trader Mode Switch to Full Macro Prompt Card */}
          <motion.div
            variants={activeCardVariants}
            className="p-4 rounded-xl border border-[#B08D57]/30 bg-[#0e1726]/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-data shadow-md"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-[#B08D57]" />
              <div>
                <p className="text-[#FBF8F1] font-bold text-[11.5px]">Need sovereign balance sheet &amp; geopolitical GIS depth?</p>
                <p className="text-[10px] text-[#8292A6]">
                  Net Fed Liquidity, D3 Maritime Heatmaps, 24M Time-Series, and Dark Fleet AIS are active in Macro Mode.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleViewModeChange("macro")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider bg-[#B08D57] hover:bg-[#C9A46D] text-[#0A111C] transition-all cursor-pointer shadow-md active:scale-95"
            >
              <span>Switch to Macro Mode</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        </>
      ) : (
        /* ============================================================ */
        /* FULL MACRO MODE LAYOUT (All 10 Sovereign Macro Modules)     */
        /* ============================================================ */
        <>
          {/* 24-Hour Macro Momentum & Intraday Sparklines Bar */}
          <motion.div variants={activeCardVariants}>
            <AssetSparklines macroData={macroData} />
          </motion.div>

          {/* Global Benchmarks, Equities & $BTC Prop Execution Systems (IBEX 35, S&P 500, DAX 40, Nikkei 225, KOSPI, $BTC) */}
          <motion.div id="benchmarks-prop-systems-section" variants={activeCardVariants} className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[9.5px] font-mono-data text-[#8292A6]">
              <span className="flex items-center gap-1 text-[#E5C794]">
                <Unlock className="w-3 h-3 text-[#B08D57]" />
                <span>CORE TIER I (PROFESSIONAL ALLOCATOR) — BENCHMARKS &amp; PROP EXECUTION</span>
              </span>
              <span className="text-[#5A687C]">GLOBAL INDEX &amp; CRYPTO DESK</span>
            </div>
            <IbexPropEngine
              data={macroData.engines.ibexBias}
              macroData={macroData}
              onExpandToggle={() => setExpandedEngine("ibex")}
              isExpanded={expandedEngine === "ibex"}
              onOpenTerminal={onOpenTerminal}
            />
          </motion.div>

          {/* Visual Macro Correlation & Transmission Matrix Component (9x9) */}
          <motion.div variants={activeCardVariants}>
            <MacroCorrelationMatrix macroData={macroData} />
          </motion.div>

          {/* Real-Time VIX Volatility Index Component: Intraday Volatility Spikes & Option Gamma Surface */}
          <motion.div variants={activeCardVariants}>
            <VixVolatilityIndexChart
              macroData={macroData}
              isCalmMode={calm}
              onOpenTerminal={(prompt) => {
                onOpenTerminal(prompt);
              }}
            />
          </motion.div>

          {/* Macro Time-Series Charts: Gold Supercycle & GPR 24M Historical Trajectory */}
          <motion.div id="macro-timeseries-section" variants={activeCardVariants} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B08D57]" />
                <span className="text-[10px] font-mono-data font-bold tracking-[0.2em] text-[#E5C794] uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#B08D57]" />
                  Macro Time-Series Quantitative Analysis
                </span>
              </div>

              {/* Switcher between XAU/USD Supercycle and GPR 24M Chart */}
              <div className="flex items-center bg-black/80 p-1 rounded-lg border border-[#B08D57]/30 text-[10px] font-mono-data shadow-inner">
                <button
                  id="macro-chart-gold-tab"
                  onClick={() => setActiveMacroChart("gold")}
                  className={`px-3 py-1.5 rounded transition-all uppercase font-medium flex items-center gap-1.5 ${
                    activeMacroChart === "gold"
                      ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md"
                      : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
                  }`}
                >
                  <span>XAU/USD Supercycle</span>
                  <span className="text-[9px] opacity-80">($4,185+)</span>
                </button>

                <button
                  id="macro-chart-gpr-tab"
                  onClick={() => setActiveMacroChart("gpr")}
                  className={`px-3 py-1.5 rounded transition-all uppercase font-medium flex items-center gap-1.5 ${
                    activeMacroChart === "gpr"
                      ? "bg-[#A6291C] text-[#EDE9DE] font-bold shadow-md"
                      : "text-[#BAC7D5] hover:text-[#FFA4A4] hover:bg-white/5"
                  }`}
                >
                  <Flame className="w-3 h-3 text-[#FFA4A4]" />
                  <span>GPR Index 24M &amp; Iran War</span>
                  <span className="text-[9px] opacity-85">({macroData.engines.middleEastWarRisk.gprIndex} pts)</span>
                </button>
              </div>
            </div>

            {activeMacroChart === "gold" ? (
              <GoldHistoricalChart macroData={macroData} />
            ) : (
              <GprHistoricalChart
                currentLiveGpr={macroData.engines.middleEastWarRisk.gprIndex}
                currentLiveBrent={macroData.tickers.find(t => t.symbol === "BRENT")?.price ?? 100.04}
              />
            )}
          </motion.div>

          {/* D3-Based Geographical Heatmap: Global Maritime Chokepoints & War-Risk Overlay */}
          <motion.div variants={activeCardVariants}>
            <ChokepointHeatmap
              macroData={macroData}
              onOpenWarRiskEngine={() => {
                setExpandedMiddleEastTab("Maritime Chokepoints");
                setExpandedEngine("middleEast");
              }}
            />
          </motion.div>

          {/* Terminal Access Tier Clearance Status Strip */}
          <motion.div
            variants={activeCardVariants}
            className={`p-3.5 sm:p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono-data shadow-md ${
              isFounding
                ? "bg-[#16130E] border-[#B08D57]/50"
                : isSovereign
                ? "bg-[#150F22] border-[#C084FC]/50"
                : isInstitutional
                ? "bg-[#0E1C2B] border-[#38BDF8]/50"
                : "bg-[#0B121E] border-[#4E6178]/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shield className={`w-4 h-4 ${
                isFounding
                  ? "text-[#B08D57]"
                  : isSovereign
                  ? "text-[#C084FC]"
                  : isInstitutional
                  ? "text-[#38BDF8]"
                  : "text-[#94A3B8]"
              }`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8292A6] uppercase tracking-wider">Active Clearance Level:</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                    isFounding
                      ? "bg-[#B08D57]/20 border-[#B08D57]/60 text-[#E5C794]"
                      : isSovereign
                      ? "bg-[#C084FC]/20 border-[#C084FC]/60 text-[#E9D5FF]"
                      : isInstitutional
                      ? "bg-[#38BDF8]/20 border-[#38BDF8]/60 text-[#7DD3FC]"
                      : "bg-[#4E6178]/20 border-[#4E6178]/60 text-[#BAC7D5]"
                  }`}>
                    {isFounding ? "Founding Member (Lifetime All-Access)" : currentTier}
                  </span>
                </div>
                <p className="text-[10.5px] text-[#BAC7D5] mt-0.5">
                  {isFounding
                    ? "Founding Member Sovereign Clearance: Unrestricted access across all 4 macro engines, AIS Dark Fleet radar, covariance analytics & sovereign risk."
                    : isSovereign
                    ? "Sovereign Advisory Clearance: Unrestricted access across all 4 macro engines, AIS Dark Fleet radar & sovereign risk."
                    : isInstitutional
                    ? "Institutional Desk Clearance: Macro Sparklines, BoJ Yen, IBEX 35, Middle East War-Risk GIS & Matrix Unlocked."
                    : "Professional Allocator Clearance: 24H Macro Sparklines, BoJ Yen & IBEX 35 Prop Desk Execution Active."}
                </p>
              </div>
            </div>

            {onOpenTierModal && (
              <button
                id="open-tier-modal-from-grid-btn"
                onClick={onOpenTierModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold bg-[#141E2F] hover:bg-[#1C2B44] text-[#EDE9DE] border border-[#B08D57]/40 hover:border-[#B08D57] transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>Switch Test Tier</span>
                <ArrowRight className="w-3 h-3 text-[#B08D57]" />
              </button>
            )}
          </motion.div>

          {/* Institutional Macro Intelligence Engines Grid */}
          <div id="engines-macro-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start bg-[#0a121d]/40 p-1 sm:p-2 rounded-xl">
            {/* Engine 1: US-Yen Intervention Dynamics */}
            <motion.div variants={activeCardVariants} className="flex flex-col">
              <div className="flex items-center justify-between px-2 py-1 mb-1 text-[9.5px] font-mono-data text-[#8292A6]">
                <span className="flex items-center gap-1 text-[#E5C794]">
                  <Unlock className="w-3 h-3 text-[#B08D57]" />
                  <span>CORE TIER I (PROFESSIONAL ALLOCATOR)</span>
                </span>
                <span className="text-[#5A687C]">YEN DYNAMICS (ENGINE 1)</span>
              </div>
              <YenInterventionEngine
                data={macroData.engines.yenIntervention}
                onExpandToggle={() => setExpandedEngine("yen")}
                isExpanded={expandedEngine === "yen"}
              />
            </motion.div>

            {/* Engine 2: Middle East War-Risk & Maritime Impact Index */}
            <motion.div variants={activeCardVariants} className="flex flex-col">
              <div className="flex items-center justify-between px-2 py-1 mb-1 text-[9.5px] font-mono-data">
                <span className={`flex items-center gap-1 ${isInstitutional ? (isFounding ? "text-[#E5C794]" : "text-[#7DD3FC]") : "text-[#E5C794]"}`}>
                  {isInstitutional ? (
                    <Unlock className={`w-3 h-3 ${isFounding ? "text-[#B08D57]" : "text-[#38BDF8]"}`} />
                  ) : (
                    <Lock className="w-3 h-3 text-[#B08D57]" />
                  )}
                  <span>{isInstitutional ? (isFounding ? "UNLOCKED: FOUNDING ALL-ACCESS" : "UNLOCKED: TIER II (INSTITUTIONAL DESK)") : "TIER II INSTITUTIONAL CLEARANCE REQUIRED [PREVIEW]"}</span>
                </span>
                {!isInstitutional && onOpenTierModal && (
                  <button
                    onClick={onOpenTierModal}
                    className="text-[9px] text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Unlock [Test]</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <MiddleEastRiskEngine
                data={macroData.engines.middleEastWarRisk}
                onExpandToggle={() => {
                  setExpandedMiddleEastTab("Maritime Chokepoints");
                  setExpandedEngine("middleEast");
                }}
                onExpandWithTab={(tab) => {
                  setExpandedMiddleEastTab(tab);
                  setExpandedEngine("middleEast");
                }}
                isExpanded={false}
              />
            </motion.div>

            {/* Engine 3: Iranian Oil Shadow-Fleet Tracking */}
            <motion.div variants={activeCardVariants} className="h-full flex flex-col lg:col-span-2">
              <div className="flex items-center justify-between px-2 py-1 mb-1 text-[9.5px] font-mono-data">
                <span className={`flex items-center gap-1 ${isSovereign ? (isFounding ? "text-[#E5C794]" : "text-[#E9D5FF]") : "text-[#C084FC]"}`}>
                  {isSovereign ? (
                    <Unlock className={`w-3 h-3 ${isFounding ? "text-[#B08D57]" : "text-[#C084FC]"}`} />
                  ) : (
                    <Lock className="w-3 h-3 text-[#C084FC]" />
                  )}
                  <span>{isSovereign ? (isFounding ? "UNLOCKED: FOUNDING ALL-ACCESS" : "UNLOCKED: TIER III (SOVEREIGN ADVISORY)") : "TIER III SOVEREIGN ADVISORY REQUIRED [PREVIEW]"}</span>
                </span>
                {!isSovereign && onOpenTierModal && (
                  <button
                    onClick={onOpenTierModal}
                    className="text-[9px] text-[#C084FC] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Unlock [Test]</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <IranShadowFleetEngine
                data={macroData.engines.iranShadowFleet}
                brentPrice={macroData.tickers.find(t => t.symbol === "BRENT")?.price ?? 100.04}
                onExpandToggle={() => setExpandedEngine("shadowFleet")}
                isExpanded={expandedEngine === "shadowFleet"}
              />
            </motion.div>
          </div>

          {/* Sovereign Liquidity Architecture (Near Bottom of Dashboards Area) */}
          <motion.div variants={activeCardVariants} className="space-y-6 pt-2">
            <div className="flex items-center justify-between px-2 py-1 text-[9.5px] font-mono-data text-[#8292A6] border-b border-[#B08D57]/20 pb-2">
              <span className="flex items-center gap-1.5 text-[#E5C794] font-bold tracking-wider uppercase">
                <DollarSign className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>SOVEREIGN LIQUIDITY ARCHITECTURE // TRANSMISSION DESK</span>
              </span>
              <span className="text-[#5A687C]">FED H.4.1 • TREASURY BOND BUYBACKS ($6B/WK) • NET FED LIQUIDITY</span>
            </div>

            {/* 1. US Liquidity Driver Telemetry (Transmission Tracker & Debt Buyback Monitor) - Placed Above Net Liquidity Drivers Dashboard */}
            <div id="us-liquidity-driver-telemetry-dashboard">
              <LiquidityDriverTracker isCalmMode={calm} />
            </div>

            {/* 2. Net Liquidity Drivers Dashboard & Macro Debt-Servicing Velocity Risk Radar */}
            <div id="net-liquidity-drivers-dashboard">
              <DebtServicingRiskRadar isCalmMode={calm} />
            </div>
          </motion.div>
        </>
      )}

      {/* Expanded Modal Overlay when any engine is maximized */}
      {expandedEngine && (
        <div
          id="engine-fullscreen-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0E1A2B]/95 backdrop-blur-md animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpandedEngine(null);
          }}
        >
          <div className="w-full max-w-6xl bg-[#13161C] border border-[#B08D57]/50 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-3 sm:p-5 max-h-[94vh] overflow-y-auto overflow-x-hidden relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#B08D57]/20">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-data uppercase tracking-widest text-[#B08D57] font-bold">
                  SMC PROPRIETARY ENGINE — INSTITUTIONAL EXPANDED VIEW
                </span>
              </div>
              <button
                id="close-fullscreen-engine-btn"
                onClick={() => setExpandedEngine(null)}
                aria-label="Close Maximize View"
                className="p-1.5 sm:p-2 rounded bg-black/60 text-[#8292A6] hover:text-[#EDE9DE] border border-[#B08D57]/30 hover:border-[#B08D57] transition-colors flex items-center gap-1 text-xs font-mono-data"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">CLOSE [ESC]</span>
              </button>
            </div>

            <div>
              {expandedEngine === "yen" && (
                <YenInterventionEngine
                  data={macroData.engines.yenIntervention}
                  onExpandToggle={() => setExpandedEngine(null)}
                  isExpanded={true}
                />
              )}
              {expandedEngine === "ibex" && (
                <IbexPropEngine
                  data={macroData.engines.ibexBias}
                  macroData={macroData}
                  onExpandToggle={() => setExpandedEngine(null)}
                  isExpanded={true}
                />
              )}
              {expandedEngine === "middleEast" && (
                <MiddleEastRiskEngine
                  data={macroData.engines.middleEastWarRisk}
                  onExpandToggle={() => setExpandedEngine(null)}
                  isExpanded={true}
                  initialSubTab={expandedMiddleEastTab}
                />
              )}
              {expandedEngine === "shadowFleet" && (
                <IranShadowFleetEngine
                  data={macroData.engines.iranShadowFleet}
                  brentPrice={macroData.tickers.find(t => t.symbol === "BRENT")?.price ?? 100.04}
                  onExpandToggle={() => setExpandedEngine(null)}
                  isExpanded={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
