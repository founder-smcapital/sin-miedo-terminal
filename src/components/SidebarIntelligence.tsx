import React, { useState, useEffect } from "react";
import { MacroDataState, RelevantExecutiveSummary, UserSession, Currency } from "../types";
import { generateRelevantExecutiveSummaries } from "../data/executiveSummariesData";
import {
  X,
  Sparkles,
  FileDown,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Shield,
  Activity,
  Radio,
  Clock,
  ArrowUpRight,
  Zap,
  Crosshair,
  Sliders,
  Target,
  Layers,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import Markdown from "react-markdown";
import { SentimentGauge } from "./engines/SentimentGauge";
import { TerminalTradeSetups, TradeSetupItem } from "./TerminalTradeSetups";

interface SidebarIntelligenceProps {
  isOpen: boolean;
  onClose: () => void;
  macroData: MacroDataState;
  initialTab?: "strategy" | "summary" | "sentiment" | "chat";
  initialPrompt?: string;
  userSession?: UserSession;
  currency?: Currency;
}

export const SidebarIntelligence: React.FC<SidebarIntelligenceProps> = ({
  isOpen,
  onClose,
  macroData,
  initialTab = "strategy",
  initialPrompt,
  userSession,
  currency,
}) => {
  // Map any legacy "chat" initialTab directly to "strategy"
  const normalizedInitialTab = initialTab === "chat" ? "strategy" : initialTab;
  const [activeTab, setActiveTab] = useState<"strategy" | "summary" | "sentiment">(
    normalizedInitialTab as "strategy" | "summary" | "sentiment"
  );
  const [summaryMarkdown, setSummaryMarkdown] = useState<string>("");
  const [relevantSummaries, setRelevantSummaries] = useState<RelevantExecutiveSummary[]>([]);
  const [selectedFlashSummary, setSelectedFlashSummary] = useState<RelevantExecutiveSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(macroData.formattedTime || "");
  const [copied, setCopied] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState<TradeSetupItem | null>(null);

  useEffect(() => {
    if (initialTab === "chat" || initialTab === "strategy") {
      setActiveTab("strategy");
    } else if (initialTab === "summary" || initialTab === "sentiment") {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (isOpen && !summaryMarkdown) {
      fetchExecutiveSummary();
    }
  }, [isOpen]);

  // Periodic Auto-Refresh for Intelligence & Executive Summaries
  useEffect(() => {
    if (!isOpen || !isAutoRefresh) return;
    const interval = setInterval(() => {
      fetchExecutiveSummary();
    }, 15000);
    return () => clearInterval(interval);
  }, [isOpen, isAutoRefresh]);

  // React to external macro data pulse changes when auto-refresh is active
  useEffect(() => {
    if (isOpen && isAutoRefresh && macroData.formattedTime) {
      setLastSyncTime(macroData.formattedTime);
      setRelevantSummaries(() => generateRelevantExecutiveSummaries(macroData));
    }
  }, [macroData.formattedTime, isOpen, isAutoRefresh]);

  const fetchExecutiveSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch("/api/intelligence/executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setSummaryMarkdown(data.summary);
        if (Array.isArray(data.relevantSummaries) && data.relevantSummaries.length > 0) {
          setRelevantSummaries(data.relevantSummaries);
        } else {
          setRelevantSummaries(generateRelevantExecutiveSummaries(macroData));
        }
        setLastSyncTime(new Date().toTimeString().split(' ')[0] + ' UTC');
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      // Dynamic fallback
      setRelevantSummaries(generateRelevantExecutiveSummaries(macroData));
      setLastSyncTime(macroData.formattedTime || new Date().toTimeString().split(' ')[0] + ' UTC');
      setSummaryMarkdown(`# SIN MIEDO CAPITAL // DAILY MACRO EXECUTIVE TAKEAWAYS
**Classification**: Institutional Proprietary // **Refresh Cycle**: 15-Sec Live

### 1. MICRO S&P 500 ($MES) & DXY PREMARKET RESISTANCE
The Dollar Index (DXY) is testing the **102.04 – 102.20** zone. In early premarket trade, USD strength caps commodity rallies (MCL Crude) and creates valuation translation friction for S&P 500 multinationals. However, with the Treasury continuing its **$24B/month ($6B/week) duration buyback operations**, liquidity plumbing remains accommodative. **Desk Strategy**: Buy shallow morning pullbacks into 5,735.00 – 5,742.00 (VWAP shelf) with a hard invalidation below 5,720.50 (Overnight Low).

### 2. US-YEN STEALTH INTERVENTION EXECUTION (${macroData.engines.yenIntervention.defcon})
The USD/JPY spot has stabilized around **${macroData.engines.yenIntervention.spot}** (${macroData.engines.yenIntervention.change}) following an unannounced **quiet (stealth) intervention** conducted by the Japanese Ministry of Finance (MoF) and Bank of Japan. The critical 160.50 threshold was defended, causing unilateral intervention odds to contract to **${macroData.engines.yenIntervention.interventionOdds}%**. Desk bias: *${macroData.engines.yenIntervention.deskPosition}*.

### 3. IBEX 35 DIRECTIONAL EXECUTION SYSTEM
Spanish equities demonstrate robust momentum (${macroData.engines.ibexBias.dailyChange} at **${macroData.engines.ibexBias.level}**), staying firmly above the **${macroData.engines.ibexBias.keyLevels.pivot} Daily Pivot**. Yield spreads and domestic credit expansion provide tailwinds for major financials (Santander, BBVA, CaixaBank). Prop desks hold: *${macroData.engines.ibexBias.deskPosition}*.

### 4. MIDDLE EAST MARITIME RISK & CHOKEPOINT VOLATILITY
The Geopolitical Risk Index is elevated at **${macroData.engines.middleEastWarRisk.gprIndex} / 100** (Risk Index: **${macroData.engines.middleEastWarRisk.riskIndex}**). With **${macroData.engines.middleEastWarRisk.redSeaRerouteRate}** commercial traffic continuing Cape rerouting, freight spreads remain wide. An embedded geopolitical risk premium of **${macroData.engines.middleEastWarRisk.brentGeopoliticalPremium}** supports Brent crude.

### 5. DIGITAL ASSETS & SOVEREIGN DEBASEMENT (BTC/USD & GOLD)
Bitcoin exhibits structural strength, co-trending with Gold ($4,408+/oz) on sovereign debt debasement. Institutional ETF flows absorb secondary market supply on tests of $78,200 – $79,400 support.`);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      const { downloadDashboardReportPDF } = await import("../utils/pdfGenerator");
      downloadDashboardReportPDF(macroData, { userSession, currency });
    } catch (err) {
      console.error("Failed to generate PDF briefing:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="intelligence-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="intelligence-drawer-container"
        className="w-full max-w-2xl bg-[#1A1D24] border-l border-[#B08D57]/30 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 relative"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#0E1A2B] border-b border-[#B08D57]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-black/60 border border-[#B08D57]/50 flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-[#B08D57]" />
            </div>
            <div>
              <h3 className="font-serif italic text-lg font-bold text-[#B08D57]" style={{ fontFamily: "Georgia, serif" }}>
                SMC Strategy Desk &amp; Takeaways
              </h3>
              <p className="text-[9.5px] font-mono-data text-[#8292A6]">
                INSTITUTIONAL POSITION PLAYBOOKS // MACRO TAKEAWAYS &amp; RISK FILTERS
              </p>
            </div>
          </div>

          <button
            id="close-intelligence-drawer-btn"
            onClick={onClose}
            aria-label="Close Strategy Desk"
            className="p-1.5 rounded bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] border border-[#B08D57]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#B08D57]/15 bg-[#0E1A2B] px-4 pt-2 flex-wrap">
          <button
            id="tab-strategy-btn"
            onClick={() => setActiveTab("strategy")}
            className={`px-4 py-2 text-xs font-mono-data font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "strategy"
                ? "border-[#B08D57] text-[#EDE9DE] bg-[#1A1D24]"
                : "border-transparent text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>Position Strategy</span>
            <span className="text-[8px] bg-[#B08D57]/20 text-[#B08D57] px-1 py-0.2 rounded font-bold">
              MES / MNQ
            </span>
          </button>

          <button
            id="tab-summary-btn"
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 text-xs font-mono-data font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "summary"
                ? "border-[#B08D57] text-[#EDE9DE] bg-[#1A1D24]"
                : "border-transparent text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>SMC Macro Takeaways</span>
          </button>

          <button
            id="tab-sentiment-btn"
            onClick={() => setActiveTab("sentiment")}
            className={`px-4 py-2 text-xs font-mono-data font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "sentiment"
                ? "border-[#A6291C] text-[#EDE9DE] bg-[#1A1D24]"
                : "border-transparent text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#FF8585]" />
            <span>Sentiment Radar</span>
            <span className="text-[8px] bg-[#A6291C]/30 text-[#FFA4A4] border border-[#A6291C]/50 px-1 py-0.2 rounded font-mono-data font-bold">
              LIVE
            </span>
          </button>
        </div>

        {/* Tab 1: Position Strategy Playbook */}
        {activeTab === "strategy" && (
          <div className="flex-1 overflow-y-auto bg-[#0A111C]">
            {/* Embedded Tactical Trade Setups Deck with Strategy Deep-Dive */}
            <TerminalTradeSetups
              macroData={macroData}
              defaultSelectedId="mes"
              onSelectSetup={(setup) => setSelectedSetup(setup)}
            />

            {/* Institutional Trade Management Rules for Prop Traders */}
            <div className="p-4 space-y-3 border-t border-[#B08D57]/20 bg-[#0F1724]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#B08D57]" />
                <h4 className="text-xs font-mono-data font-bold text-[#EDE9DE] uppercase tracking-wider">
                  Prop Firm Account Execution Playbook (MyFundedFutures · Tradovate / TradingView)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono-data">
                <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
                  <span className="text-[#B08D57] font-bold block text-[10px] uppercase">
                    1. Micro Sizing Discipline
                  </span>
                  <p className="text-[#BAC7D5] leading-relaxed">
                    Always trade <strong>Micro E-mini (MES)</strong> or <strong>Micro Nasdaq (MNQ)</strong> during evaluation phases. 1 full ES contract = 10 MES contracts. Using 1-2 MES limits per-trade dollar risk to $100–$200, protecting the trailing drawdown buffer.
                  </p>
                </div>

                <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
                  <span className="text-[#B08D57] font-bold block text-[10px] uppercase">
                    2. Mandatory Bracket Orders
                  </span>
                  <p className="text-[#BAC7D5] leading-relaxed">
                    Set up your <strong>OCO Bracket</strong> in Tradovate / TradingView before clicking buy/sell. A trade should never exist without an attached stop-loss on the book.
                  </p>
                </div>

                <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
                  <span className="text-[#B08D57] font-bold block text-[10px] uppercase">
                    3. Premarket DXY Filter
                  </span>
                  <p className="text-[#BAC7D5] leading-relaxed">
                    Check the <strong>Dollar Index (DXY)</strong> chart before the 9:30 AM ET open. If DXY is holding above 102.20, expect heavy resistance on MCL Crude and multiple compression drag on tech (MNQ).
                  </p>
                </div>

                <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
                  <span className="text-[#B08D57] font-bold block text-[10px] uppercase">
                    4. Trailing Drawdown Preservation
                  </span>
                  <p className="text-[#BAC7D5] leading-relaxed">
                    Once in profit of $300+ on MES, immediately move stop-loss to <strong>breakeven + 2 ticks</strong>. Do not let winning runners retrace into negative territory that pulls up your trailing high-water mark.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Executive Summary & SMC Macro Takeaways */}
        {activeTab === "summary" && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Action Bar with Auto-Refresh Status */}
            <div className="p-3 bg-black/40 border-b border-[#B08D57]/15 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-data">
              <div className="flex items-center gap-2">
                <span className="text-[#8292A6] text-[10px] flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#B08D57]" />
                  Proprietary SMC Takeaways
                </span>

                {/* Auto-Refresh Toggle Pill */}
                <button
                  id="toggle-summary-autorefresh-btn"
                  onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono-data border transition-all ${
                    isAutoRefresh
                      ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                      : "bg-black/40 text-[#8292A6] border-white/10"
                  }`}
                  title={isAutoRefresh ? "Click to Pause Auto-Refresh" : "Click to Enable 15s Auto-Refresh"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAutoRefresh ? "bg-[#10B981] animate-pulse" : "bg-gray-500"}`} />
                  <span>{isAutoRefresh ? "AUTO-SYNC 15s" : "PAUSED"}</span>
                </button>

                {lastSyncTime && (
                  <span className="text-[9px] text-[#8292A6] hidden sm:inline flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#B08D57]" />
                    {lastSyncTime}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="refresh-summary-btn"
                  onClick={fetchExecutiveSummary}
                  disabled={isLoadingSummary}
                  className="p-1 rounded text-[#8292A6] hover:text-[#EDE9DE] hover:bg-black/50 border border-[#B08D57]/20 transition-colors flex items-center gap-1 text-[10px]"
                  title="Regenerate Executive Summary"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSummary ? 'animate-spin text-[#B08D57]' : ''}`} />
                  <span className="hidden sm:inline">Sync</span>
                </button>

                <button
                  id="copy-summary-btn"
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 text-[10px] bg-black/40 hover:bg-black/60 text-[#EDE9DE] px-2 py-1 rounded border border-[#B08D57]/20 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-[#B08D57]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  id="download-pdf-btn"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1 text-[10px] bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] font-bold px-2.5 py-1 rounded shadow transition-all"
                  title="Export Daily Macro Briefing PDF"
                >
                  <FileDown className="w-3 h-3" />
                  <span>Briefing PDF</span>
                </button>
              </div>
            </div>

            {/* Relevant Executive Summaries Quick Strip */}
            {relevantSummaries.length > 0 && (
              <div className="bg-[#111722] border-b border-[#B08D57]/20 px-3 py-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono-data text-[#E5C794] uppercase tracking-wider font-bold">
                    <Sparkles className="w-3 h-3 text-[#B08D57]" />
                    <span>Live Macro Flash Briefs</span>
                  </div>
                  <span className="text-[8px] font-mono-data text-[#8292A6]">
                    {relevantSummaries.length} briefs active
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {relevantSummaries.map((brief) => {
                    const isSelected = selectedFlashSummary?.id === brief.id;
                    return (
                      <button
                        key={brief.id}
                        onClick={() => setSelectedFlashSummary(isSelected ? null : brief)}
                        className={`text-left shrink-0 w-48 sm:w-56 p-2 rounded-lg border transition-all text-xs font-mono-data ${
                          isSelected
                            ? "bg-[#1B2537] border-[#B08D57] shadow-md shadow-[#B08D57]/10"
                            : "bg-black/40 hover:bg-black/60 border-[#B08D57]/20 hover:border-[#B08D57]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[8px] uppercase tracking-wider text-[#B08D57] truncate font-bold">
                            {brief.category.split('&')[0]}
                          </span>
                          <span
                            className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                              brief.urgency === "CRITICAL"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : brief.urgency === "HIGH"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {brief.urgency}
                          </span>
                        </div>
                        <h4 className="text-[10.5px] font-bold text-[#EDE9DE] line-clamp-1 mb-1">
                          {brief.title}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] text-[#8292A6]">
                          <span className="text-[#34D399] font-bold truncate">{brief.keyMetric}</span>
                          <span>{brief.badge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Flash Brief Expanded Card */}
                {selectedFlashSummary && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#141B26] border border-[#B08D57]/40 text-xs font-mono-data space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[#E5C794] font-bold text-[11px]">
                        {selectedFlashSummary.title}
                      </span>
                      <button
                        onClick={() => setSelectedFlashSummary(null)}
                        className="text-[#8292A6] hover:text-[#EDE9DE] text-[10px]"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <p className="text-[#BAC7D5] text-[10px] leading-relaxed">
                      {selectedFlashSummary.summary}
                    </p>
                    <div className="bg-black/40 p-2 rounded border border-white/5 text-[9.5px]">
                      <span className="text-[#B08D57] font-bold block mb-0.5">DESK TAKEAWAY:</span>
                      <span className="text-[#BAC7D5]">{selectedFlashSummary.deskTakeaway}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Markdown content body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm text-[#EDE9DE]/90 leading-relaxed font-sans bg-[#1A1D24]">
              {isLoadingSummary ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#B08D57] animate-spin" />
                  <p className="font-mono-data text-xs text-[#8292A6]">
                    Synthesizing real-time BoJ, IBEX, DXY, and sovereign debt telemetry...
                  </p>
                </div>
              ) : (
                <div className="prose prose-invert prose-headings:font-serif prose-headings:text-[#EDE9DE] prose-h3:text-[#B08D57] prose-h3:text-xs prose-h3:font-mono-data prose-h3:uppercase prose-h3:mt-4 prose-h3:mb-1.5 prose-p:my-2 prose-strong:text-[#EDE9DE] max-w-none">
                  <Markdown>{summaryMarkdown}</Markdown>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Live Sentiment Gauge */}
        {activeTab === "sentiment" && (
          <div className="flex-1 overflow-y-auto p-4 bg-[#0A111C]">
            <SentimentGauge
              onOpenTerminalWithPrompt={() => {
                setActiveTab("strategy");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
