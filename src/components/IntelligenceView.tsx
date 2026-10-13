import React, { useState, useMemo, useEffect } from "react";
import { MacroDataState, InstitutionalBrief, RelevantExecutiveSummary, UserSession, Currency } from "../types";
import { institutionalBriefs } from "../data/institutionalResearchData";
import { generateRelevantExecutiveSummaries } from "../data/executiveSummariesData";
import { downloadInstitutionalBriefPDF, downloadCompleteBriefingPackPDF, downloadDashboardReportPDF } from "../utils/pdfGenerator";
import { SentimentGauge } from "./engines/SentimentGauge";
import {
  FileText,
  Download,
  FileDown,
  Search,
  Filter,
  Crosshair,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Printer,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Copy,
  Check,
  Radio,
  RefreshCw,
  Flame,
  Shield,
  Droplets,
  Landmark
} from "lucide-react";
import { StrategicPetroleumReserves } from "./engines/StrategicPetroleumReserves";
import { CentralBankRateMatrix } from "./engines/CentralBankRateMatrix";
import { DebtBuybackIntelligenceDossier } from "./engines/DebtBuybackIntelligenceDossier";
import { ChartExportDropdown } from "./ChartExportDropdown";

interface IntelligenceViewProps {
  macroData: MacroDataState;
  onOpenTerminalWithPrompt: (prompt: string) => void;
  userSession?: UserSession;
  currency?: Currency;
  onNavigateToDashboard?: (tab: string) => void;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  macroData,
  onOpenTerminalWithPrompt,
  userSession,
  currency,
  onNavigateToDashboard,
}) => {
  const [viewMode, setViewMode] = useState<"compendium" | "central_bank_matrix" | "sentiment" | "strategic_reserves" | "debt_buyback">("compendium");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDashboard, setSelectedDashboard] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalBrief, setActiveModalBrief] = useState<InstitutionalBrief | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Auto-Refresh State for Intelligence & Relevant Summaries
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(macroData.formattedTime || "");
  const [relevantSummaries, setRelevantSummaries] = useState<RelevantExecutiveSummary[]>(() =>
    generateRelevantExecutiveSummaries(macroData)
  );
  const [activeFlashBrief, setActiveFlashBrief] = useState<RelevantExecutiveSummary | null>(null);

  // Synchronize relevant executive summaries with API or macro pulse
  const syncExecutiveSummaries = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/intelligence/executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.relevantSummaries) && data.relevantSummaries.length > 0) {
          setRelevantSummaries(data.relevantSummaries);
        } else {
          setRelevantSummaries(generateRelevantExecutiveSummaries(macroData));
        }
        setLastSyncTime(new Date().toTimeString().split(" ")[0] + " UTC");
      } else {
        throw new Error("API offline");
      }
    } catch {
      // Dynamic fallback
      setRelevantSummaries(generateRelevantExecutiveSummaries(macroData));
      setLastSyncTime(macroData.formattedTime || new Date().toTimeString().split(" ")[0] + " UTC");
    } finally {
      setIsSyncing(false);
    }
  };

  // Periodic Auto-Refresh (every 15s)
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      syncExecutiveSummaries();
    }, 15000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, macroData]);

  // When macroData changes, update live relevant summaries if auto-refresh is active
  useEffect(() => {
    if (isAutoRefresh) {
      setRelevantSummaries(generateRelevantExecutiveSummaries(macroData));
      setLastSyncTime(macroData.formattedTime || new Date().toTimeString().split(" ")[0] + " UTC");
    }
  }, [macroData.formattedTime, isAutoRefresh]);

  // Filter briefs
  const filteredBriefs = useMemo(() => {
    return institutionalBriefs.filter((brief) => {
      const matchesSearch =
        searchQuery === "" ||
        brief.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brief.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brief.executiveSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brief.reportRefNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brief.keyFindings.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDashboard =
        selectedDashboard === "all" || brief.dashboardSlug === selectedDashboard;

      const matchesCategory =
        selectedCategory === "all" || brief.institutionCategory === selectedCategory;

      return matchesSearch && matchesDashboard && matchesCategory;
    });
  }, [searchQuery, selectedDashboard, selectedCategory]);

  const handleCopySummary = (brief: InstitutionalBrief) => {
    const textToCopy = `[${brief.institutionAcronym}] ${brief.title}\nRef: ${brief.reportRefNumber}\n\nEXECUTIVE SUMMARY:\n${brief.executiveSummary}\n\nDESK POSITION: ${brief.deskImplications}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(brief.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="intelligence-view-root" className="space-y-6 animate-in fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="bg-[#0E1624] border border-[#1E293B] rounded-sm p-4 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-[#B08D57] text-[#0A111C] text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-sm tracking-widest uppercase">
                INSTITUTIONAL RESEARCH COMPENDIUM
              </span>
              <span className="text-[10px] font-mono-data text-[#8292A6] flex items-center gap-1 bg-[#080E18] px-2 py-0.5 rounded-sm border border-[#1E293B]">
                <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                VERIFIED CREDIBLE INSTITUTIONS ONLY
              </span>
              <span className="text-[10px] font-mono-data text-[#E5C794] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#B08D57]" />
                UPDATES REGULARLY
              </span>
            </div>

            <h1 className="font-swiss-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FBF8F1] tracking-tight">
              Macro Intelligence &amp; Institutional Executive Summaries
            </h1>
            <p className="text-xs sm:text-sm text-[#8292A6] mt-2 leading-relaxed font-mono-data">
              Curated, continuously refreshed executive research briefs from central banks (Bank of Japan, Banco de España, ECB), global tier-1 investment banks (Goldman Sachs, Morgan Stanley), energy institutes (Oxford Institute for Energy Studies, IEA), and maritime security authorities (CSIS, OFAC) synchronized with our active macro desks.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="download-complete-pack-btn"
              onClick={() => downloadCompleteBriefingPackPDF(institutionalBriefs)}
              className="flex items-center gap-2 bg-[#B08D57] hover:bg-[#C49B5D] text-[#0A111C] font-bold text-xs px-3.5 py-2 rounded-sm transition-all font-mono-data uppercase tracking-wider cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Pack (PDF)</span>
            </button>

            <button
              id="download-dashboard-state-pdf-btn"
              onClick={() => downloadDashboardReportPDF(macroData, { userSession, currency })}
              className="flex items-center gap-2 bg-[#111A28] hover:bg-[#182336] text-[#E5C794] border border-[#1E293B] hover:border-[#B08D57] font-bold text-xs px-3.5 py-2 rounded-sm transition-all font-mono-data uppercase tracking-wider cursor-pointer"
              title="Download full macro dashboard state, quantitative trading engines, and executive intelligence briefs as a formatted PDF"
            >
              <FileDown className="w-4 h-4 text-[#B08D57]" />
              <span>Dashboard PDF Brief</span>
            </button>

            <button
              onClick={() => onOpenTerminalWithPrompt("Synthesize the top findings from the latest Bank of Japan and Goldman Sachs research briefs regarding JPY intervention risks")}
              className="flex items-center gap-2 bg-[#111A28] hover:bg-[#182336] text-[#EDE9DE] border border-[#1E293B] hover:border-[#B08D57] font-semibold text-xs px-3.5 py-2 rounded-sm transition-all font-mono-data cursor-pointer"
              title="Open SMC Strategy Desk & Playbook"
            >
              <Crosshair className="w-4 h-4 text-[#B08D57]" />
              <span>SMC Strategy Desk</span>
            </button>
          </div>
        </div>

        {/* Live Macro Linkage Summary Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-5 pt-4 border-t border-[#1E293B] text-xs font-mono-data">
          <div className="bg-[#080E18] p-2 rounded-sm border border-[#1E293B]">
            <span className="text-[9px] text-[#8292A6] block uppercase">US Fed H.4.1 Balance Sheet</span>
            <span className="text-[#E5C794] font-bold">$6.81T • QT -$18.4B/Wk</span>
          </div>
          <div className="bg-[#080E18] p-2 rounded-sm border border-[#1E293B]">
            <span className="text-[9px] text-[#8292A6] block uppercase">Treasury Buyback Pace</span>
            <span className="text-[#38BDF8] font-bold">$6.0B / Week (Doubled)</span>
          </div>
          <div className="bg-[#080E18] p-2 rounded-sm border border-[#1E293B]">
            <span className="text-[9px] text-[#8292A6] block uppercase">BoJ Spot Defense Barrier</span>
            <span className="text-[#10B981] font-bold">160.50 Line in Sand</span>
          </div>
          <div className="bg-[#080E18] p-2 rounded-sm border border-[#1E293B]">
            <span className="text-[9px] text-[#8292A6] block uppercase">Crude Telemetry &amp; SPR</span>
            <span className="text-[#FF8585] font-bold">US 13.5M • SPR 358M</span>
          </div>
          <div className="bg-[#080E18] p-2 rounded-sm border border-[#1E293B]">
            <span className="text-[9px] text-[#8292A6] block uppercase">Sanctions &amp; Shadow Fleet</span>
            <span className="text-[#10B981] font-bold">412 Dark VLCCs • 1.62M bpd</span>
          </div>
          <div className="bg-[#080E18] p-2 rounded-sm border border-[#1E293B]">
            <span className="text-[9px] text-[#8292A6] block uppercase">BTC / Digital Gold Beta</span>
            <span className="text-[#F7931A] font-bold">BTC Beta r=+0.56</span>
          </div>
        </div>
      </div>

      {/* View Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0E1624] border border-[#1E293B] rounded-sm p-1.5 font-mono-data text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="view-compendium-btn"
            onClick={() => setViewMode("compendium")}
            className={`px-3 py-1.5 rounded-sm font-semibold transition-all flex items-center gap-2 ${
              viewMode === "compendium"
                ? "bg-[#B08D57] text-[#0A111C] font-bold"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Institutional Research Compendium</span>
            <span className="text-[9px] bg-black/30 px-1.5 py-0.2 rounded-sm font-normal">{institutionalBriefs.length} Docs</span>
          </button>

          <button
            id="view-debt-buyback-dossier-btn"
            onClick={() => setViewMode("debt_buyback")}
            className={`px-3 py-1.5 rounded-sm font-semibold transition-all flex items-center gap-2 ${
              viewMode === "debt_buyback"
                ? "bg-[#B08D57] text-[#0A111C] font-bold"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-[#E5C794]" />
            <span>US Debt Buybacks vs FX Defense</span>
            <span className="text-[9px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.2 rounded-sm border border-emerald-500/30 font-bold uppercase">
              $6.0B / WK
            </span>
          </button>
          <button
            id="view-central-bank-matrix-btn"
            onClick={() => setViewMode("central_bank_matrix")}
            className={`px-3 py-1.5 rounded-sm font-semibold transition-all flex items-center gap-2 ${
              viewMode === "central_bank_matrix"
                ? "bg-[#B08D57] text-[#0A111C] font-bold"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Central Bank Rate Matrix</span>
            <span className="text-[9px] bg-black/40 text-[#E5C794] px-1.5 py-0.2 rounded-sm border border-[#B08D57]/30 font-bold uppercase">
              FED / ECB / BOJ
            </span>
          </button>

          <button
            id="view-strategic-reserves-btn"
            onClick={() => setViewMode("strategic_reserves")}
            className={`px-3 py-1.5 rounded-sm font-semibold transition-all flex items-center gap-2 ${
              viewMode === "strategic_reserves"
                ? "bg-[#A6291C] text-[#EDE9DE] font-bold"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-[#FFA4A4]" />
            <span>Crude Oil SPR &amp; Flows</span>
            <span className="text-[9px] bg-red-950/60 text-red-300 px-1.5 py-0.2 rounded-sm border border-red-500/30 font-bold uppercase">
              US 13.5M
            </span>
          </button>

          <button
            id="view-sentiment-gauge-btn"
            onClick={() => setViewMode("sentiment")}
            className={`px-3 py-1.5 rounded-sm font-semibold transition-all flex items-center gap-2 ${
              viewMode === "sentiment"
                ? "bg-[#A6291C] text-[#EDE9DE] font-bold"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#FFA4A4]" />
            <span>Sentiment Gauge &amp; Risk Monitor</span>
            <span className="text-[9px] bg-[#FFA4A4]/20 text-[#FFA4A4] px-1.5 py-0.2 rounded-sm border border-[#FFA4A4]/30 font-bold uppercase">
              DEFCON 2
            </span>
          </button>
        </div>

        <span className="text-[10px] text-[#8292A6] px-2 hidden lg:inline">
          {viewMode === "compendium"
            ? "Central Bank & Tier-1 Research Compendium"
            : viewMode === "debt_buyback"
            ? "US Treasury $6B Weekly Bond Buyback vs BoJ Sovereign FX Defense Dossier"
            : viewMode === "central_bank_matrix"
            ? "Global Central Bank Rate Matrix, Policy Odds & 2026 Easing Curves"
            : viewMode === "strategic_reserves"
            ? "Global Crude Reserves, US 13.5M Output, India-Russia Trade Flow & Hormuz Runway"
            : "Real-Time NLP War-Risk Ingestion & Telemetry"}
        </span>
      </div>

      {viewMode === "central_bank_matrix" ? (
        <CentralBankRateMatrix onOpenTerminal={onOpenTerminalWithPrompt} />
      ) : viewMode === "sentiment" ? (
        <SentimentGauge onOpenTerminalWithPrompt={onOpenTerminalWithPrompt} />
      ) : viewMode === "strategic_reserves" ? (
        <StrategicPetroleumReserves
          macroData={macroData}
          onOpenTerminalWithPrompt={onOpenTerminalWithPrompt}
        />
      ) : viewMode === "debt_buyback" ? (
        <DebtBuybackIntelligenceDossier
          macroData={macroData}
          onOpenTerminalWithPrompt={onOpenTerminalWithPrompt}
          onNavigateToDashboard={onNavigateToDashboard}
        />
      ) : (
        <>
          {/* Live Auto-Refreshed Relevant Executive Summaries Bar */}
          <div id="relevant-executive-summaries-container" className="bg-[#111722] border border-[#B08D57]/30 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-[10px] font-mono-data font-bold tracking-[0.2em] text-[#E5C794] uppercase">
                    Institutional Intelligence Auto-Refresh Engine
                  </span>
                </div>
                <h3 className="text-lg font-serif italic font-bold text-[#FBF8F1] tracking-tight">
                  Live Relevant Executive Summaries &amp; Macro Regime Flash Briefs
                </h3>
              </div>

              {/* Auto-Refresh & Sync Controls */}
              <div className="flex items-center gap-2.5 font-mono-data text-xs">
                <button
                  id="toggle-view-autorefresh-btn"
                  onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                    isAutoRefresh
                      ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      : "bg-black/40 text-[#8292A6] border-white/10"
                  }`}
                  title={isAutoRefresh ? "Pause 15s Auto-Refresh" : "Enable 15s Auto-Refresh"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAutoRefresh ? "bg-[#10B981]" : "bg-gray-500"}`} />
                  <span className="font-bold text-[10px]">{isAutoRefresh ? "AUTO-REFRESH: 15s LIVE" : "AUTO-REFRESH: PAUSED"}</span>
                </button>

                {lastSyncTime && (
                  <span className="text-[10px] text-[#8292A6] hidden sm:flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/5">
                    <Clock className="w-3 h-3 text-[#B08D57]" />
                    <span>Synced: {lastSyncTime}</span>
                  </span>
                )}

                <button
                  id="manual-sync-intelligence-btn"
                  onClick={syncExecutiveSummaries}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 bg-[#B08D57]/20 hover:bg-[#B08D57]/30 text-[#E5C794] border border-[#B08D57]/40 px-3 py-1 rounded-lg transition-colors text-[10px] font-bold"
                  title="Force Sync Intelligence Now"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-[#B08D57]" : ""}`} />
                  <span>Sync Now</span>
                </button>

                <ChartExportDropdown
                  chartTitle="Live Institutional Executive Summaries & Macro Flash Briefs"
                  chartContainerId="relevant-executive-summaries-container"
                  subtitle={`SMC INSTITUTIONAL REGIME FLASH BRIEFS // ACTIVE: ${relevantSummaries.length} // SYNCED: ${lastSyncTime}`}
                  size="xs"
                  buttonLabel="Export Flash Briefs"
                  getCsvData={() => {
                    const headers = [
                      "Category",
                      "Urgency",
                      "Title",
                      "Executive Summary",
                      "Key Metric",
                      "Desk Takeaway",
                    ];
                    const rows = relevantSummaries.map((b) => [
                      b.category,
                      b.urgency,
                      b.title,
                      b.summary,
                      b.keyMetric,
                      b.deskTakeaway,
                    ]);
                    return {
                      filename: "smc-live-executive-summaries",
                      headers,
                      rows,
                      metaComments: [
                        "SIN MIEDO CAPITAL // LIVE RELEVANT EXECUTIVE SUMMARIES & REGIME BRIEFS",
                        `Synced at: ${lastSyncTime}`,
                        `Total Tracked Flash Briefs: ${relevantSummaries.length}`,
                      ],
                    };
                  }}
                />
              </div>
            </div>

            {/* Responsive Grid of Relevant Executive Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {relevantSummaries.map((brief) => {
                const isSelected = activeFlashBrief?.id === brief.id;
                return (
                  <div
                    key={brief.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#182233] border-[#B08D57] shadow-lg shadow-[#B08D57]/15"
                        : "bg-black/40 hover:bg-black/60 border-[#B08D57]/20 hover:border-[#B08D57]/40"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider text-[#B08D57] bg-[#B08D57]/10 px-2 py-0.5 rounded border border-[#B08D57]/20">
                          {brief.category}
                        </span>
                        <span
                          className={`text-[9px] font-mono-data px-1.5 py-0.5 rounded font-bold ${
                            brief.urgency === "CRITICAL"
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : brief.urgency === "HIGH"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {brief.urgency}
                        </span>
                      </div>

                      <h4 className="font-sans font-bold text-sm text-[#FBF8F1] leading-snug">
                        {brief.title}
                      </h4>

                      <p className="text-xs text-[#BAC7D5] leading-relaxed line-clamp-3">
                        {brief.summary}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#B08D57]/15 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-[10px] font-mono-data">
                        <span className="text-[#8292A6] shrink-0 font-medium">Key Metric:</span>
                        <span className="text-[#E5C794] font-bold text-left sm:text-right break-words">{brief.keyMetric}</span>
                      </div>

                      {/* Full Unabridged Desk Takeaway - Preserves Complete Insight Without Vertical Clipping */}
                      <div className="text-[10px] sm:text-[10.5px] font-mono-data bg-[#0A121F] p-2.5 rounded-lg border border-[#B08D57]/30 text-[#BAC7D5] shadow-inner space-y-1">
                        <div className="flex items-center gap-1.5 text-[#E5C794] font-bold uppercase tracking-wider text-[9px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          <span>Desk Takeaway:</span>
                        </div>
                        <p className="text-[#BAC7D5] leading-relaxed break-words font-mono-data">
                          {brief.deskTakeaway}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => {
                            const text = `[EXECUTIVE BRIEF] ${brief.title}\nKey Metric: ${brief.keyMetric}\nSummary: ${brief.summary}\nTakeaway: ${brief.deskTakeaway}`;
                            navigator.clipboard.writeText(text);
                            setCopiedId(brief.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="flex items-center gap-1 text-[10px] font-mono-data text-[#8292A6] hover:text-[#EDE9DE] transition-colors"
                        >
                          {copiedId === brief.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#10B981]" />
                              <span className="text-[#10B981]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Brief</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            onOpenTerminalWithPrompt(
                              `Synthesize the actionable desk implications for: "${brief.title}" given the key metric: "${brief.keyMetric}" and desk position: "${brief.deskTakeaway}"`
                            )
                          }
                          className="flex items-center gap-1 text-[10px] font-mono-data bg-[#B08D57] hover:bg-[#C9A46D] text-[#0A111C] font-bold px-2 py-1 rounded transition-all active:scale-95"
                        >
                          <Crosshair className="w-3 h-3 text-[#B08D57]" />
                          <span>SMC Strategy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Filters & Search Control Toolbar */}
          <div className="bg-[#141923] border border-[#B08D57]/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8292A6] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-intelligence-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search institutions, titles, keywords..."
            className="w-full bg-black/60 border border-[#B08D57]/30 rounded-lg pl-9 pr-4 py-2 text-xs text-[#EDE9DE] placeholder-[#8292A6] focus:outline-none focus:border-[#B08D57]"
          />
        </div>

        {/* Dashboard Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-[10px] font-mono-data text-[#8292A6] uppercase mr-1 hidden lg:inline">
            Dashboard Filter:
          </span>
          {[
            { id: "all", label: "All Briefs" },
            { id: "boj", label: "BoJ Yen" },
            { id: "ibex", label: "IBEX 35" },
            { id: "hormuz", label: "ME War-Risk" },
            { id: "shadow", label: "Dark Fleet" },
            { id: "gold", label: "Gold / Reserves" },
            { id: "crypto", label: "BTC / Digital" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDashboard(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono-data transition-all ${
                selectedDashboard === tab.id
                  ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow"
                  : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] hover:bg-black/80 border border-[#B08D57]/15"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Institution Category Filter & Export */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by institution category"
            className="w-full sm:w-auto bg-black/60 border border-[#B08D57]/30 rounded-lg px-3 py-2 text-xs font-mono-data text-[#EDE9DE] focus:outline-none focus:border-[#B08D57]"
          >
            <option value="all">All Institution Categories</option>
            <option value="Central Banks & Regulators">Central Banks & Regulators</option>
            <option value="Tier-1 Investment Banks">Tier-1 Investment Banks</option>
            <option value="Energy & Geopolitical Institutes">Energy & Geopolitical Institutes</option>
            <option value="Maritime Security & Analytics">Maritime Security & Analytics</option>
          </select>

          <ChartExportDropdown
            chartTitle="Institutional Research Compendium"
            chartContainerId="institutional-briefs-compendium-container"
            subtitle={`VERIFIED INSTITUTIONAL RESEARCH // ACTIVE BRIEFS: ${filteredBriefs.length}`}
            size="xs"
            buttonLabel="Export Compendium"
            getCsvData={() => {
              const headers = [
                "Institution",
                "Acronym",
                "Category",
                "Report Ref Number",
                "Publication Date",
                "Report Title",
                "Executive Summary",
                "Desk Position & Implications",
                "Key Finding 1",
                "Key Finding 2",
                "Key Finding 3",
              ];
              const rows = filteredBriefs.map((b) => [
                b.institution,
                b.institutionAcronym,
                b.institutionCategory,
                b.reportRefNumber,
                b.publishDate,
                b.title,
                b.executiveSummary,
                b.deskImplications,
                b.keyFindings[0] || "",
                b.keyFindings[1] || "",
                b.keyFindings[2] || "",
              ]);
              return {
                filename: `smc-institutional-research-compendium`,
                headers,
                rows,
                metaComments: [
                  "SIN MIEDO CAPITAL // INSTITUTIONAL RESEARCH COMPENDIUM",
                  `Category Filter: ${selectedCategory}`,
                  `Dashboard Filter: ${selectedDashboard}`,
                  `Showing ${filteredBriefs.length} verified publications`,
                ],
              };
            }}
          />
        </div>
      </div>

      {/* 3. Briefs Grid / List */}
      <div id="institutional-briefs-compendium-container" className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono-data text-[#8292A6] px-1">
          <span>
            SHOWING <strong className="text-[#EDE9DE]">{filteredBriefs.length}</strong> VERIFIED INSTITUTIONAL BRIEFINGS
          </span>
          <span>FORMATTED WITH DOWNLOADABLE INSTITUTIONAL PDFS</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredBriefs.map((brief) => (
            <div
              key={brief.id}
              id={`brief-card-${brief.id.toLowerCase()}`}
              className="bg-[#141923] border border-[#B08D57]/20 hover:border-[#B08D57]/50 rounded-xl p-5 sm:p-6 transition-all shadow-lg hover:shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Top Row: Institution Tag, Ref, Classification, Dashboard Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#B08D57]/15">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Institution Badge */}
                    <div className="flex items-center gap-1.5 bg-[#B08D57]/15 border border-[#B08D57]/40 px-2.5 py-1 rounded text-xs font-mono-data font-bold text-[#E5C794]">
                      <Building2 className="w-3.5 h-3.5 text-[#B08D57]" />
                      <span>{brief.institution}</span>
                      <span className="text-[10px] opacity-75 font-normal">({brief.institutionAcronym})</span>
                    </div>

                    {/* Relevant Dashboard Tag */}
                    <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-black/60 text-[#EDE9DE] border border-[#B08D57]/25 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" />
                      Linked to: {brief.relevantDashboard}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono-data text-[#8292A6]">
                    <span className="bg-[#A6291C]/20 text-[#FFA4A4] border border-[#A6291C]/40 px-2 py-0.5 rounded">
                      {brief.securityClassification}
                    </span>
                    <span>REF: {brief.reportRefNumber}</span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="mt-3.5 mb-3">
                  <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#EDE9DE] group-hover:text-[#B08D57] transition-colors leading-snug">
                    {brief.title}
                  </h2>
                  <p className="text-xs text-[#8292A6] mt-1 font-sans leading-relaxed">
                    {brief.subtitle}
                  </p>
                </div>

                {/* Quantitative Macro Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5 bg-black/50 p-3 rounded-lg border border-[#B08D57]/15 text-xs font-mono-data">
                  {brief.metrics.map((metric, mIdx) => (
                    <div key={mIdx} className="space-y-0.5 border-r border-[#B08D57]/10 last:border-none pr-2">
                      <span className="text-[9px] text-[#8292A6] uppercase block truncate">{metric.label}</span>
                      <div className="text-sm font-bold text-[#EDE9DE] flex items-baseline gap-1">
                        <span>{metric.value}</span>
                        {metric.change && (
                          <span className="text-[10px] text-[#B08D57] font-normal">{metric.change}</span>
                        )}
                      </div>
                      {metric.note && (
                        <span className="text-[8.5px] text-[#8292A6] block">{metric.note}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Executive Summary Paragraph */}
                <div className="text-xs sm:text-sm text-[#EDE9DE]/90 leading-relaxed font-sans bg-[#0E1A2B]/40 p-4 rounded-lg border border-[#B08D57]/10">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono-data font-bold text-[#B08D57] uppercase tracking-wider mb-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Executive Summary & Institutional Synthesis</span>
                  </div>
                  <p className="whitespace-pre-line line-clamp-3 group-hover:line-clamp-none transition-all">
                    {brief.executiveSummary}
                  </p>
                </div>

                {/* Key Findings List */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[10px] font-mono-data font-semibold text-[#8292A6] uppercase tracking-wider block">
                    Core Findings & Quantitative Models:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-sans">
                    {brief.keyFindings.slice(0, 2).map((finding, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 bg-black/30 p-2 rounded border border-[#B08D57]/10 text-[#8292A6]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B08D57] shrink-0 mt-0.5" />
                        <span className="text-[11.5px] leading-snug">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desk Positioning Callout */}
                <div className="mt-3 bg-[#B08D57]/10 border-l-2 border-[#B08D57] p-2.5 rounded-r text-xs font-mono-data flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] text-[#8292A6] block uppercase">Trading Desk Implication ({brief.authorDesk}):</span>
                    <span className="text-[#EDE9DE] font-semibold">{brief.deskImplications}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-[#B08D57]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-data">
                <div className="flex items-center gap-3 text-[#8292A6] text-[11px]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#B08D57]" />
                    {brief.publishDate}
                  </span>
                  <span>•</span>
                  <span>{brief.lastUpdated}</span>
                  <span>•</span>
                  <span>{brief.pagesCount} Pages</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Summary */}
                  <button
                    onClick={() => handleCopySummary(brief)}
                    className="flex items-center gap-1 bg-black/50 hover:bg-black text-[#8292A6] hover:text-[#EDE9DE] px-2.5 py-1.5 rounded border border-[#B08D57]/20 text-[11px] transition-colors"
                  >
                    {copiedId === brief.id ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === brief.id ? "Copied" : "Copy"}</span>
                  </button>

                  {/* Strategy Desk */}
                  <button
                    onClick={() => onOpenTerminalWithPrompt(`Explain the institutional findings of "${brief.title}" from ${brief.institution} and what it means for our macro trading position.`)}
                    className="flex items-center gap-1 bg-black/50 hover:bg-black text-[#B08D57] px-2.5 py-1.5 rounded border border-[#B08D57]/30 text-[11px] transition-colors"
                    title="Open Strategy Desk"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Strategy Desk</span>
                  </button>

                  {/* Read Modal */}
                  <button
                    onClick={() => setActiveModalBrief(brief)}
                    className="flex items-center gap-1 bg-[#1A2538] hover:bg-[#253347] text-[#EDE9DE] px-3 py-1.5 rounded border border-[#B08D57]/30 text-[11px] font-semibold transition-colors"
                  >
                    <span>Read Full Brief</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {/* Download PDF Button */}
                  <button
                    id={`download-pdf-btn-${brief.id.toLowerCase()}`}
                    onClick={() => downloadInstitutionalBriefPDF(brief)}
                    className="flex items-center gap-1.5 bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )}

  {/* 4. Full Brief Modal Reader */}
      {activeModalBrief && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#141923] border border-[#B08D57]/40 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col justify-between shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-[#0E1A2B] p-5 sm:p-6 border-b border-[#B08D57]/20 flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-mono-data">
                  <span className="bg-[#B08D57] text-[#0E1A2B] font-bold px-2 py-0.5 rounded uppercase">
                    {activeModalBrief.institutionAcronym}
                  </span>
                  <span className="text-[#8292A6]">REF: {activeModalBrief.reportRefNumber}</span>
                  <span className="text-[#FF8585]">{activeModalBrief.securityClassification}</span>
                </div>
                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#EDE9DE]">
                  {activeModalBrief.title}
                </h2>
                <p className="text-xs text-[#8292A6] mt-1 font-sans">
                  {activeModalBrief.subtitle} • {activeModalBrief.institution}
                </p>
              </div>

              <button
                onClick={() => setActiveModalBrief(null)}
                aria-label="Close modal"
                className="text-[#8292A6] hover:text-[#EDE9DE] p-1.5 rounded-lg bg-black/40 border border-[#B08D57]/20"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Quantitative Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/60 p-4 rounded-lg border border-[#B08D57]/20 font-mono-data text-xs">
                {activeModalBrief.metrics.map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[#8292A6] text-[10px] uppercase block">{m.label}</span>
                    <span className="text-base font-bold text-[#EDE9DE] block">{m.value}</span>
                    <span className="text-[10px] text-[#B08D57]">{m.change || m.note}</span>
                  </div>
                ))}
              </div>

              {/* Executive Summary */}
              <div>
                <h3 className="text-xs font-mono-data font-bold text-[#B08D57] uppercase tracking-wider mb-2">
                  Executive Summary
                </h3>
                <div className="text-[#EDE9DE]/90 leading-relaxed font-sans space-y-3 bg-[#0E1A2B]/50 p-4 rounded-lg border border-[#B08D57]/15">
                  <p className="whitespace-pre-line">{activeModalBrief.executiveSummary}</p>
                </div>
              </div>

              {/* Key Findings */}
              <div>
                <h3 className="text-xs font-mono-data font-bold text-[#B08D57] uppercase tracking-wider mb-2">
                  Comprehensive Institutional Findings
                </h3>
                <div className="space-y-2">
                  {activeModalBrief.keyFindings.map((finding, idx) => (
                    <div key={idx} className="bg-black/40 p-3 rounded border border-[#B08D57]/15 flex items-start gap-2.5 text-xs">
                      <span className="text-[#B08D57] font-mono-data font-bold">{idx + 1}.</span>
                      <span className="text-[#EDE9DE] leading-relaxed">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desk Positioning */}
              <div className="bg-[#B08D57]/15 border-l-4 border-[#B08D57] p-4 rounded-r text-xs font-mono-data space-y-1">
                <span className="text-[#8292A6] uppercase tracking-wider block">
                  Author Desk Strategy ({activeModalBrief.authorDesk}):
                </span>
                <p className="text-[#EDE9DE] font-semibold text-sm">
                  {activeModalBrief.deskImplications}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#0E1A2B] p-4 sm:p-5 border-t border-[#B08D57]/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-data">
              <div className="text-[#8292A6]">
                Linked to: <strong className="text-[#EDE9DE]">{activeModalBrief.relevantDashboard}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenTerminalWithPrompt(`Execute detailed risk scenario analysis on ${activeModalBrief.reportRefNumber} (${activeModalBrief.institution})`)}
                  className="flex items-center gap-1.5 bg-black/60 hover:bg-black text-[#B08D57] px-3 py-2 rounded border border-[#B08D57]/30 text-xs transition-colors"
                  title="Open SMC Strategy Desk & Macro Takeaways"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>SMC Strategy Desk</span>
                </button>

                <button
                  onClick={() => downloadInstitutionalBriefPDF(activeModalBrief)}
                  className="flex items-center gap-1.5 bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
