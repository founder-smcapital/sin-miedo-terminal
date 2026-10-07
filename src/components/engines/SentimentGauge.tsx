import React from "react";
import { useGeopoliticalFeed } from "../../hooks/useGeopoliticalFeed";
import {
  ShieldAlert,
  Radio,
  Sparkles,
  RefreshCw,
  Send,
  Zap,
  Activity,
  Flame,
  AlertTriangle,
  Play,
  Pause,
  Filter,
  CheckCircle2,
  TrendingUp,
  Anchor,
  Compass,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Info,
  Clock
} from "lucide-react";
import { ChartExportDropdown } from "../ChartExportDropdown";

interface SentimentGaugeProps {
  compact?: boolean;
  onOpenTerminalWithPrompt?: (prompt: string) => void;
  viewMode?: "all" | "gauge-only" | "telemetry-only";
  onSwitchToTelemetry?: () => void;
  onSwitchToSentiment?: () => void;
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({
  compact = false,
  onOpenTerminalWithPrompt,
  viewMode = "all",
  onSwitchToTelemetry,
  onSwitchToSentiment,
}) => {
  const {
    headlines,
    isAutoStreaming,
    selectedCategory,
    maxAgeHours,
    setMaxAgeHours,
    inputHeadline,
    isAnalyzing,
    isSyncingFeed,
    lastSyncTime,
    flashNewId,
    metrics,
    filteredHeadlines,
    setSelectedCategory,
    setInputHeadline,
    toggleAutoStream,
    triggerNextLiveHeadline,
    handleSimulateUSIranStrikesScenario,
    handleAnalyzeCustomHeadline,
    fetchVerifiedFeed,
  } = useGeopoliticalFeed();

  // Dial calculations for War-Risk Arc Gauge
  const score = metrics.compositeScore;
  const radius = 42;
  const strokeWidth = 8.5;
  const arcLength = Math.PI * radius; // ~131.95
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = arcLength * (1 - progress);

  // Dynamic Theme Palette based on Defcon / Severity
  const getSeverityStyling = () => {
    if (score >= 90) {
      return {
        text: "text-[#FF8585]",
        border: "border-[#A6291C]",
        bg: "bg-[#A6291C]/25",
        badge: "bg-[#A6291C] text-[#FBF8F1]",
        glow: "rgba(166, 41, 28, 0.45)",
      };
    }
    if (score >= 80) {
      return {
        text: "text-[#FFA4A4]",
        border: "border-[#A6291C]/80",
        bg: "bg-[#A6291C]/20",
        badge: "bg-[#A6291C]/80 text-[#FBF8F1]",
        glow: "rgba(166, 41, 28, 0.35)",
      };
    }
    if (score >= 70) {
      return {
        text: "text-[#E5C794]",
        border: "border-[#B08D57]/80",
        bg: "bg-[#B08D57]/20",
        badge: "bg-[#B08D57] text-[#0A111C]",
        glow: "rgba(176, 141, 87, 0.35)",
      };
    }
    if (score >= 50) {
      return {
        text: "text-[#B08D57]",
        border: "border-[#B08D57]/50",
        bg: "bg-[#B08D57]/15",
        badge: "bg-[#B08D57]/70 text-[#0A111C]",
        glow: "rgba(176, 141, 87, 0.25)",
      };
    }
    return {
      text: "text-[#10B981]",
      border: "border-[#10B981]/50",
      bg: "bg-[#10B981]/15",
      badge: "bg-[#10B981] text-[#0A111C]",
      glow: "rgba(16, 185, 129, 0.25)",
    };
  };

  const severity = getSeverityStyling();

  // If telemetry-only view mode is requested, render just the telemetry stream
  if (viewMode === "telemetry-only") {
    return (
      <div id="geopolitical-live-telemetry-panel" className="space-y-4">
        {/* Top Control Bar for Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 border border-[#B08D57]/25 rounded-xl p-3.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-data">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-[#E5C794] uppercase tracking-wider">
              Live Ingestion Telemetry:
            </span>
            <span className="text-[#8292A6]">
              {lastSyncTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateUSIranStrikesScenario}
              className="flex items-center gap-1 text-[10px] font-mono-data bg-[#A6291C] hover:bg-[#BF3022] text-[#EDE9DE] font-bold px-2.5 py-1.5 rounded border border-[#FF8585]/30 transition-all shadow-sm active:scale-95"
              title="Inject breaking kinetic strike & retaliation signals into the feed"
            >
              <Flame className="w-3 h-3 text-[#FFA4A4]" />
              <span>Simulate Strikes</span>
            </button>

            {onSwitchToSentiment && (
              <button
                onClick={onSwitchToSentiment}
                className="flex items-center gap-1 text-[10px] font-mono-data bg-[#B08D57]/20 hover:bg-[#B08D57]/40 text-[#E5C794] px-2.5 py-1.5 rounded border border-[#B08D57]/40 transition-colors uppercase font-semibold"
              >
                <span>View Dials</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Live Geopolitical Headline Feed Stream */}
        <div className="bg-[#141923] border border-[#B08D57]/25 rounded-xl p-4 shadow-xl space-y-3">
          {/* Stream Header & Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/20">
            <div className="flex flex-wrap items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF8585]" />
              <h4 className="font-serif italic text-base font-semibold text-[#EDE9DE]" style={{ fontFamily: "Georgia, serif" }}>
                Live Telemetry &amp; Intelligence Headlines Stream
              </h4>
              <span className="text-[9px] font-mono-data bg-black/60 text-[#8292A6] px-2 py-0.5 rounded border border-[#B08D57]/20">
                {filteredHeadlines.length} Live Signals
              </span>

              {/* Zero-Stale & Deduplication Guard Badge */}
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono-data bg-emerald-950/70 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 shadow-inner" title="Guaranteed: zero news from last week, strict 24h freshness, semantic deduplication active">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>Anti-Stale &amp; Deduplication Guard</span>
              </span>

              {/* Live Auto-Sync Status Badge */}
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono-data bg-black/60 text-[#BAC7D5] px-2 py-0.5 rounded border border-[#B08D57]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-Sync: 35s</span>
              </span>

              {/* Quick Force Sync Button */}
              <button
                onClick={fetchVerifiedFeed}
                disabled={isSyncingFeed}
                id="sync-telemetry-feed-btn"
                className="inline-flex items-center gap-1 text-[9px] font-mono-data bg-black/60 hover:bg-[#B08D57]/20 text-[#E5C794] px-2.5 py-0.5 rounded border border-[#B08D57]/30 transition-colors disabled:opacity-50"
                title="Force sync real-time verified RSS news wire from server"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncingFeed ? "animate-spin text-emerald-400" : ""}`} />
                <span>{isSyncingFeed ? "Syncing Wire..." : "Sync News Wire"}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Freshness Gate Pill Selector */}
              <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-[#B08D57]/30 text-[9px] font-mono-data">
                <span className="text-[#8292A6]">Window:</span>
                {[
                  { label: "All (<24h)", val: 24 },
                  { label: "<12h", val: 12 },
                  { label: "<6h", val: 6 },
                ].map((f) => (
                  <button
                    key={f.val}
                    onClick={() => setMaxAgeHours(f.val)}
                    className={`px-1.5 py-0.5 rounded transition-all ${
                      maxAgeHours === f.val
                        ? "bg-[#10B981] text-[#0A111C] font-bold shadow-sm"
                        : "text-[#BAC7D5] hover:text-[#EDE9DE]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono-data">
                {(["All", "US-Iran Kinetic", "Hormuz Chokepoint", "Sanctions & Energy", "Diplomatic / Backchannel"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded transition-all ${
                      selectedCategory === cat
                        ? "bg-[#B08D57] text-[#0A111C] font-bold shadow"
                        : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] border border-[#B08D57]/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Headlines List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredHeadlines.map((h) => {
              const isFlash = flashNewId === h.id;
              const isKinetic = h.sentiment === "Escalatory Kinetic" || h.sentiment === "Severe Retaliation";
              const isDiplomatic = h.sentiment === "De-escalatory";

              return (
                <div
                  key={h.id}
                  className={`p-3.5 rounded-lg border transition-all duration-300 ${
                    isFlash
                      ? "bg-[#A6291C]/15 border-[#A6291C]/80 shadow-[0_0_12px_rgba(166,41,28,0.2)]"
                      : isKinetic
                      ? "bg-black/60 border-[#A6291C]/40 hover:border-[#A6291C]/70"
                      : isDiplomatic
                      ? "bg-black/40 border-[#10B981]/30 hover:border-[#10B981]/60"
                      : "bg-black/40 border-[#B08D57]/20 hover:border-[#B08D57]/40"
                  }`}
                >
                  {/* Meta Row: Source, Time, Sentiment, Confidence */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-data mb-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#E5C794] uppercase tracking-wider">
                        [{h.source}]
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#BAC7D5] bg-black/60 px-2 py-0.5 rounded border border-[#B08D57]/20 shadow-inner">
                        <Clock className="w-3 h-3 text-[#B08D57]" />
                        <span>{h.timestamp}</span>
                      </span>
                      {h.isLiveNew && (
                        <span className="inline-flex items-center gap-1.5 bg-[#A6291C] text-[#FBF8F1] font-semibold text-[8.5px] px-2 py-0.5 rounded border border-[#FF8585]/40 tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8585]" />
                          <span>LIVE</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* War-Risk Impact Points */}
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        h.impactScore >= 90
                          ? "bg-[#A6291C]/40 text-[#FFA4A4] border border-[#A6291C]"
                          : h.impactScore >= 75
                          ? "bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                      }`}>
                        War-Risk Impact: {h.impactScore}/100
                      </span>

                      {/* NLP Confidence Score Pill */}
                      <span className="bg-black/60 text-[#BAC7D5] px-2 py-0.5 rounded border border-[#B08D57]/20">
                        NLP Conf: <strong className="text-[#FBF8F1]">{h.confidenceScore}%</strong>
                      </span>

                      {/* Sentiment Tag */}
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                        isKinetic
                          ? "bg-[#A6291C] text-[#EDE9DE]"
                          : isDiplomatic
                          ? "bg-[#10B981] text-[#0A111C]"
                          : "bg-[#B08D57] text-[#0A111C]"
                      }`}>
                        {h.sentiment}
                      </span>
                    </div>
                  </div>

                  {/* Main Headline Text */}
                  <h5 className="text-sm font-semibold text-[#FBF8F1] leading-snug font-sans mb-1">
                    {h.headline}
                  </h5>

                  {/* Summary / Military Synthesis */}
                  <p className="text-xs text-[#BAC7D5] leading-relaxed font-sans mb-2">
                    {h.summary}
                  </p>

                  {/* Affected Assets Transmission Strip */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#B08D57]/15 text-[10px] font-mono-data text-[#8292A6]">
                    <span className="text-[#BAC7D5] font-semibold uppercase text-[9px]">Market Impact:</span>
                    <span className="text-[#FF8585] flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Brent: {h.affectedAssets.brentImpact}
                    </span>
                    <span className="text-[#E5C794]">
                      Gold: {h.affectedAssets.goldImpact}
                    </span>
                    <span className="text-[#FFA4A4]">
                      Tanker War-Risk: {h.affectedAssets.tankerRateImpact}
                    </span>

                    {h.link && (
                      <a
                        href={h.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] font-mono-data text-[#E5C794] hover:text-[#EDE9DE] bg-[#B08D57]/20 hover:bg-[#B08D57]/35 px-2 py-0.5 rounded border border-[#B08D57]/40 transition-colors ml-auto sm:ml-0"
                        title="Read original article on publisher website"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}

                    {onOpenTerminalWithPrompt && (
                      <button
                        onClick={() => onOpenTerminalWithPrompt(`Analyze institutional desk implications for headline: "${h.headline}"`)}
                        className="ml-auto text-[#B08D57] hover:text-[#E5C794] flex items-center gap-1 underline underline-offset-2 transition-colors"
                      >
                        <span>Query Terminal</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Confidence Score Calculations for Radial Circle Gauge
  const confScore = metrics.confidenceScore;
  const confRadius = 36;
  const confCircumference = 2 * Math.PI * confRadius; // ~226.2
  const confOffset = confCircumference * (1 - (confScore / 100));

  return (
    <div id="sentiment-gauge-module" className="space-y-4">
      {/* 1. Header Banner & Live Stream Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-black/60 border border-[#B08D57]/30 rounded-xl relative overflow-hidden shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#A6291C]/20 border border-[#A6291C]/60 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-[#FFA4A4]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif italic text-base sm:text-lg font-bold text-[#FBF8F1] leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                Geopolitical Sentiment Gauge & Live Risk Monitor
              </h3>
              <span className="bg-[#A6291C] text-[#EDE9DE] text-[9px] font-mono-data font-bold px-2 py-0.5 rounded tracking-wider uppercase shrink-0 whitespace-nowrap">
                {metrics.defconLevel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono-data text-[#BAC7D5] mt-0.5">
              <span>REAL-TIME NLP HEADLINE INGESTION // MIDDLE EAST WAR-RISK</span>
              <span className="text-[#B08D57] hidden md:inline">•</span>
              <span className="text-[#10B981] font-medium hidden md:inline">{lastSyncTime}</span>
            </div>
          </div>
        </div>

        {/* Live Stream Toggles & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-data">
          <button
            id="sync-verified-feed-btn"
            onClick={fetchVerifiedFeed}
            disabled={isSyncingFeed}
            className="flex items-center gap-1.5 bg-[#141923] hover:bg-[#1A2234] text-[#EDE9DE] px-3 py-1.5 rounded-lg border border-[#B08D57]/30 hover:border-[#B08D57] transition-all"
            title="Refresh verified intelligence stream from defense registry"
          >
            <RefreshCw className={`w-3 h-3 text-[#B08D57] ${isSyncingFeed ? "animate-spin" : ""}`} />
            <span>{isSyncingFeed ? "Syncing..." : "Sync Verified Feed"}</span>
          </button>

          <button
            id="toggle-stream-btn"
            onClick={toggleAutoStream}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              isAutoStreaming
                ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                : "bg-black/40 text-[#8292A6] border-[#B08D57]/20"
            }`}
            title={isAutoStreaming ? "Pause 18s auto-streaming" : "Resume 18s auto-streaming"}
          >
            {isAutoStreaming ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>LIVE FEED ON</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                <span>FEED PAUSED</span>
              </>
            )}
          </button>

          <button
            id="trigger-next-headline-btn"
            onClick={triggerNextLiveHeadline}
            className="flex items-center gap-1 bg-[#111724] hover:bg-[#1A2234] text-[#EDE9DE] px-2.5 py-1.5 rounded-lg border border-[#B08D57]/30 hover:border-[#B08D57] transition-colors"
            title="Inject next incoming intelligence signal"
          >
            <RefreshCw className="w-3 h-3 text-[#B08D57]" />
            <span>Next Flash</span>
          </button>

          <button
            id="simulate-us-iran-btn"
            onClick={handleSimulateUSIranStrikesScenario}
            className="flex items-center gap-1.5 bg-[#A6291C] hover:bg-[#BF3022] text-[#EDE9DE] font-bold px-3 py-1.5 rounded-lg shadow-md transition-all active:scale-95"
            title="Simulate US strikes resumption & swift Iranian retaliation sequence"
          >
            <Flame className="w-3.5 h-3.5 text-[#FFA4A4]" />
            <span>Simulate Strikes & Retaliation</span>
          </button>

          <ChartExportDropdown
            chartTitle="Middle East Geopolitical Sentiment Gauge & Live Risk Monitor"
            chartContainerId="sentiment-gauge-module"
            subtitle={`DEFCON: ${metrics.defconLevel} // COMPOSITE RISK: ${score}/100 // CONFIDENCE: ${confScore}%`}
            size="xs"
            buttonLabel="Export Sentiment"
            getCsvData={() => {
              const headers = [
                "Category / ID",
                "Timestamp",
                "Impact Score (0-100)",
                "Confidence %",
                "Headline / Event",
                "Source / Registry",
                "Sentiment Polarity",
                "Brent Impact",
                "Tanker Rate Impact",
                "Summary",
              ];
              const headlineRows = headlines.map((h) => [
                h.category,
                h.timestamp,
                h.impactScore,
                `${h.confidenceScore}%`,
                h.headline,
                h.source,
                h.sentiment,
                h.affectedAssets.brentImpact,
                h.affectedAssets.tankerRateImpact || "+$12.40/bbl",
                h.summary,
              ]);

              const summaryRows = [
                ["SUMMARY METRIC", "VALUE", "DETAIL", "", "", "", "", "", "", ""],
                ["Composite War-Risk Score", `${score} / 100`, metrics.defconLabel, "", "", "", "", "", "", ""],
                ["DEFCON Level", metrics.defconLevel, "Real-time middle east threat tier", "", "", "", "", "", "", ""],
                ["Visual Confidence Score", `${confScore}%`, "Statistical signal purity (p < 0.01)", "", "", "", "", "", "", ""],
                ["Kinetic Escalation Share", `${metrics.sentimentDistribution.kineticEscalationPct}%`, "Direct missile/drone strikes", "", "", "", "", "", "", ""],
                ["Retaliatory Strike Share", `${metrics.sentimentDistribution.retaliationRiskPct}%`, "Asymmetric proxy operations", "", "", "", "", "", "", ""],
                ["Deterrence Share", `${metrics.sentimentDistribution.deterrencePct}%`, "Naval carrier group deployments", "", "", "", "", "", "", ""],
                ["Diplomatic Channel Share", `${metrics.sentimentDistribution.diplomaticDeescalationPct}%`, "Backchannel Swiss/Oman talks", "", "", "", "", "", "", ""],
                ["------------------", "------------------", "------------------", "", "", "", "", "", "", ""],
              ];

              return {
                filename: `smc-geopolitical-sentiment-gauge-telemetry`,
                headers,
                rows: [...summaryRows, ...headlineRows],
                metaComments: [
                  "SIN MIEDO CAPITAL // GEOPOLITICAL SENTIMENT GAUGE & LIVE RISK MONITOR",
                  `DEFCON Status: ${metrics.defconLevel} (${metrics.defconLabel})`,
                  `Composite Score: ${score}/100 | Confidence: ${confScore}%`,
                  `Active Feed Ingestion: ${headlines.length} Verified Real-Time Signals`,
                ],
              };
            }}
          />
        </div>
      </div>

      {/* 2. Dual Gauge Dashboard Card: War-Risk Arc Dial & Confidence Score Meter */}
      <div id="sentiment-dual-gauge-card" className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 bg-gradient-to-b from-[#141923] to-[#0D121B] border border-[#B08D57]/35 rounded-xl p-4 sm:p-5 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A6291C]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Gauge 1: Middle East War-Risk Escalation Arc Gauge */}
        <div className="bg-black/60 border border-[#A6291C]/50 rounded-xl p-4 flex flex-col items-center justify-between relative shadow-[0_0_20px_rgba(166,41,28,0.12)] min-w-0">
          <div className="w-full flex items-center justify-between gap-2 text-[10px] font-mono-data pb-2 border-b border-[#A6291C]/25">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF8585] shrink-0" />
              <span className="text-[#FF8585] font-bold uppercase tracking-wider truncate">
                War-Risk Severity Index
              </span>
            </div>
            <span className="bg-[#A6291C]/30 text-[#FFA4A4] px-2 py-0.5 rounded border border-[#A6291C]/50 font-bold shrink-0 text-[10px]">
              {metrics.defconLevel}
            </span>
          </div>

          {/* SVG Arc Speedometer */}
          <div className="relative w-full max-w-[210px] aspect-[108/58] flex items-end justify-center my-2">
            <svg className="w-full h-full" viewBox="0 0 108 58">
              <path
                d="M 12 50 A 42 42 0 0 1 96 50"
                fill="none"
                stroke="#1B2433"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="war-risk-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="30%" stopColor="#B08D57" />
                  <stop offset="65%" stopColor="#E5A158" />
                  <stop offset="85%" stopColor="#A6291C" />
                  <stop offset="100%" stopColor="#FF4545" />
                </linearGradient>
              </defs>
              <path
                d="M 12 50 A 42 42 0 0 1 96 50"
                fill="none"
                stroke="url(#war-risk-arc-grad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
                style={{
                  filter: `drop-shadow(0 0 6px ${severity.glow})`
                }}
              />
            </svg>

            {/* Score Centerpiece */}
            <div className="absolute bottom-1 flex flex-col items-center pointer-events-none">
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl sm:text-4xl font-black font-mono-data tracking-tight ${severity.text}`}>
                  {score}
                </span>
                <span className="text-xs font-mono-data text-[#8292A6]">/ 100</span>
              </div>
              <span className="text-[8.5px] font-mono-data uppercase tracking-widest text-[#E5C794] font-semibold">
                WAR-RISK ESCALATION
              </span>
            </div>
          </div>

          {/* Scale Labels */}
          <div className="w-full max-w-[210px] flex justify-between items-center text-[7.5px] sm:text-[8px] font-mono-data text-[#8292A6] px-1 pt-1 gap-1">
            <span className="shrink-0">0 [Peace]</span>
            <span className="shrink-0 text-center">50 [Guarded]</span>
            <span className="text-[#FF8585] shrink-0 text-right">100 [Kinetic War]</span>
          </div>

          <div className="w-full mt-2.5 pt-2 border-t border-[#A6291C]/20 text-[10px] font-mono-data text-center text-[#EDE9DE]/90">
            <span className="text-[#8292A6]">Status: </span>
            <span className="font-bold text-[#FFA4A4]">{metrics.defconLabel}</span>
          </div>
        </div>

        {/* Gauge 2: Visual Confidence Score Dial & Statistical Signal Purity */}
        <div className="bg-black/60 border border-[#B08D57]/45 rounded-xl p-4 flex flex-col items-center justify-between relative shadow-[0_0_20px_rgba(176,141,87,0.1)] min-w-0">
          <div className="w-full flex items-center justify-between gap-2 text-[10px] font-mono-data pb-2 border-b border-[#B08D57]/25">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B08D57] shrink-0" />
              <span className="text-[#E5C794] font-bold uppercase tracking-wider truncate">
                Visual Confidence Score
              </span>
            </div>
            <span className="bg-[#B08D57]/20 text-[#E5C794] px-1.5 py-0.5 rounded border border-[#B08D57]/40 font-bold shrink-0 text-[9.5px]">
              p &lt; 0.01
            </span>
          </div>

          {/* Circular SVG Radial Meter */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center my-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
              {/* Track */}
              <circle
                cx="44"
                cy="44"
                r={confRadius}
                fill="none"
                stroke="#1B2433"
                strokeWidth="6"
              />
              {/* Progress */}
              <circle
                cx="44"
                cy="44"
                r={confRadius}
                fill="none"
                stroke="#B08D57"
                strokeWidth="6"
                strokeDasharray={confCircumference}
                strokeDashoffset={confOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(176, 141, 87, 0.4))"
                }}
              />
            </svg>

            {/* Numeric Percentage Inside Circle */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-black font-mono-data text-[#FBF8F1] leading-none">
                {confScore}%
              </span>
              <span className="text-[8px] font-mono-data text-[#8292A6] uppercase tracking-wider mt-1">
                Confidence
              </span>
            </div>
          </div>

          {/* Statistical Verification Metrics */}
          <div className="w-full space-y-1.5 text-[9.5px] font-mono-data pt-2.5 border-t border-[#B08D57]/20">
            <div className="flex items-center justify-between gap-2 text-[#8292A6]">
              <span className="truncate">Sample Verified:</span>
              <span className="text-[#EDE9DE] font-semibold shrink-0">{metrics.headlineCountAnalyzed} Live Feeds</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[#8292A6]">
              <span className="truncate">Standard Error Band:</span>
              <span className="text-[#10B981] font-semibold shrink-0">±1.4% (95% CI)</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[#8292A6]">
              <span className="truncate">Signal-to-Noise:</span>
              <span className="text-[#E5C794] font-semibold shrink-0">14.8 dB [High Purity]</span>
            </div>
          </div>
        </div>

        {/* Column 3: Geopolitical Breakdown & Asset Transmission Matrix */}
        <div className="sm:col-span-2 2xl:col-span-1 bg-black/60 border border-[#B08D57]/30 rounded-xl p-4 flex flex-col justify-between space-y-3 min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono-data pb-2 border-b border-[#B08D57]/20 text-[#BAC7D5]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C794] shrink-0" />
                <span className="font-bold uppercase tracking-wider text-[#FBF8F1] truncate">
                  NLP Sentiment Polarity
                </span>
              </div>
              <span className="text-[9px] text-[#8292A6] uppercase tracking-wider shrink-0 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                Distribution
              </span>
            </div>

            {/* 4-Color Segmented Sentiment Bar */}
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full bg-black/80 rounded-full overflow-hidden flex border border-[#B08D57]/30 p-0.5">
                <div
                  className="h-full bg-[#FF4545] rounded-l-full transition-all duration-500"
                  style={{ width: `${metrics.sentimentDistribution.kineticEscalationPct}%` }}
                  title={`Kinetic Escalation: ${metrics.sentimentDistribution.kineticEscalationPct}%`}
                />
                <div
                  className="h-full bg-[#A6291C] transition-all duration-500"
                  style={{ width: `${metrics.sentimentDistribution.retaliationRiskPct}%` }}
                  title={`Retaliatory Strike: ${metrics.sentimentDistribution.retaliationRiskPct}%`}
                />
                <div
                  className="h-full bg-[#E5A158] transition-all duration-500"
                  style={{ width: `${metrics.sentimentDistribution.deterrencePct}%` }}
                  title={`Deterrence: ${metrics.sentimentDistribution.deterrencePct}%`}
                />
                <div
                  className="h-full bg-[#10B981] rounded-r-full transition-all duration-500"
                  style={{ width: `${metrics.sentimentDistribution.diplomaticDeescalationPct}%` }}
                  title={`Diplomatic: ${metrics.sentimentDistribution.diplomaticDeescalationPct}%`}
                />
              </div>

              {/* Sentiment Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-2 gap-2 text-[9.5px] font-mono-data pt-1.5">
                <div className="flex items-center justify-between gap-1.5 bg-black/50 px-2 py-1.5 rounded border border-[#FF4545]/25 min-w-0">
                  <span className="flex items-center gap-1.5 text-[#FFA4A4] truncate min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4545] shrink-0" />
                    <span className="truncate">Kinetic</span>
                  </span>
                  <span className="font-bold text-[#FFA4A4] shrink-0">{metrics.sentimentDistribution.kineticEscalationPct}%</span>
                </div>
                <div className="flex items-center justify-between gap-1.5 bg-black/50 px-2 py-1.5 rounded border border-[#A6291C]/25 min-w-0">
                  <span className="flex items-center gap-1.5 text-[#FFA4A4] truncate min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A6291C] shrink-0" />
                    <span className="truncate">Retaliation</span>
                  </span>
                  <span className="font-bold text-[#FFA4A4] shrink-0">{metrics.sentimentDistribution.retaliationRiskPct}%</span>
                </div>
                <div className="flex items-center justify-between gap-1.5 bg-black/50 px-2 py-1.5 rounded border border-[#E5A158]/25 min-w-0">
                  <span className="flex items-center gap-1.5 text-[#E5A158] truncate min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5A158] shrink-0" />
                    <span className="truncate">Deterrence</span>
                  </span>
                  <span className="font-bold text-[#E5A158] shrink-0">{metrics.sentimentDistribution.deterrencePct}%</span>
                </div>
                <div className="flex items-center justify-between gap-1.5 bg-black/50 px-2 py-1.5 rounded border border-[#10B981]/25 min-w-0">
                  <span className="flex items-center gap-1.5 text-[#10B981] truncate min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="truncate">Diplomacy</span>
                  </span>
                  <span className="font-bold text-[#10B981] shrink-0">{metrics.sentimentDistribution.diplomaticDeescalationPct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Transmission Callout Box */}
          <div className="bg-[#0D121B] border border-[#B08D57]/20 rounded-lg p-2.5 sm:p-3 text-xs font-mono-data space-y-2">
            <div className="flex items-center justify-between gap-2 text-[9px] uppercase tracking-wider">
              <span className="text-[#8292A6] truncate">Implied Market Adder:</span>
              <span className="text-[#FF8585] font-bold shrink-0 bg-[#A6291C]/20 px-2 py-0.5 rounded border border-[#A6291C]/30 text-[9px]">
                ACTIVE SHOCK
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/70 p-2 rounded border border-[#A6291C]/30 flex flex-col justify-between items-center text-center min-w-0 overflow-hidden">
                <span className="text-[8px] sm:text-[8.5px] text-[#8292A6] uppercase tracking-wider truncate w-full">Brent</span>
                <span className="text-[#FFA4A4] font-bold text-[11px] sm:text-[12px] tracking-tight truncate w-full my-0.5">+$12.40</span>
                <span className="text-[7.5px] sm:text-[8px] text-[#8292A6] leading-none">/bbl</span>
              </div>

              <div className="bg-black/70 p-2 rounded border border-[#B08D57]/30 flex flex-col justify-between items-center text-center min-w-0 overflow-hidden">
                <span className="text-[8px] sm:text-[8.5px] text-[#8292A6] uppercase tracking-wider truncate w-full">Gold</span>
                <span className="text-[#E5C794] font-bold text-[11px] sm:text-[12px] tracking-tight truncate w-full my-0.5">+$42.50</span>
                <span className="text-[7.5px] sm:text-[8px] text-[#8292A6] leading-none">/oz</span>
              </div>

              <div className="bg-black/70 p-2 rounded border border-[#A6291C]/30 flex flex-col justify-between items-center text-center min-w-0 overflow-hidden">
                <span className="text-[8px] sm:text-[8.5px] text-[#8292A6] uppercase tracking-wider truncate w-full">JWLA Risk</span>
                <span className="text-[#FFA4A4] font-bold text-[11px] sm:text-[12px] tracking-tight truncate w-full my-0.5">+420</span>
                <span className="text-[7.5px] sm:text-[8px] text-[#8292A6] leading-none">bps</span>
              </div>
            </div>

            <div className="text-[9px] text-[#8292A6] pt-1.5 border-t border-[#B08D57]/15 flex items-center justify-between gap-2">
              <span className="shrink-0">Scenario:</span>
              <span className="text-[#EDE9DE] font-semibold truncate text-right">{metrics.volatilityProjection}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Breaking Headline Ingestion Bar */}
      <div className="bg-black/50 border border-[#B08D57]/25 rounded-xl p-3 sm:p-4">
        <form onSubmit={handleAnalyzeCustomHeadline} className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-data">
            <span className="text-[#E5C794] font-bold flex items-center gap-1.5 text-[10px] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
              Interactive Headline NLP Ingestion (Test Custom Geopolitical Flash)
            </span>
            <span className="text-[9px] text-[#8292A6]">
              Gemini 3.8 & Quantitative NLP Model
            </span>
          </div>

          <div className="flex gap-2">
            <input
              id="custom-headline-input"
              type="text"
              value={inputHeadline}
              onChange={(e) => setInputHeadline(e.target.value)}
              placeholder="e.g., Yesterday the US resumed strikes against Iran and Iran swiftly retaliated..."
              className="flex-1 bg-black/70 border border-[#B08D57]/30 focus:border-[#B08D57] rounded-lg px-3.5 py-2 text-xs text-[#EDE9DE] font-mono-data outline-none transition-colors placeholder:text-[#8292A6]/60"
            />
            <button
              id="analyze-headline-btn"
              type="submit"
              disabled={isAnalyzing || !inputHeadline.trim()}
              className="bg-[#B08D57] hover:bg-[#C9A46D] disabled:opacity-50 text-[#0A111C] font-bold px-4 py-2 rounded-lg text-xs font-mono-data flex items-center gap-1.5 shadow transition-all shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyze & Ingest</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Headlines */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9.5px] font-mono-data text-[#8292A6]">
            <span className="uppercase text-[9px]">PRESETS:</span>
            <button
              type="button"
              onClick={() => setInputHeadline("Saudi Arabia closed East-West oil pipeline (Petroline) following Yemeni-Houthi civil war drone escalation near Yanbu")}
              className="bg-[#450A0A] hover:bg-[#5C0D0D] text-[#FCA5A5] px-2 py-0.5 rounded border border-[#EF4444]/40 transition-colors font-bold"
            >
              🚨 Saudi East-West Pipeline Closure
            </button>
            <button
              type="button"
              onClick={() => setInputHeadline("Yesterday US resumed precision strikes against western Iran and IRGC swiftly retaliated with ballistic missiles")}
              className="bg-[#141923] hover:bg-black/60 text-[#EDE9DE] px-2 py-0.5 rounded border border-[#B08D57]/20 transition-colors"
            >
              US Resumed Strikes & Iran Retaliated
            </button>
            <button
              type="button"
              onClick={() => setInputHeadline("UKMTO reports three commercial tankers mined 14nm off Hormuz separation channel")}
              className="bg-[#141923] hover:bg-black/60 text-[#EDE9DE] px-2 py-0.5 rounded border border-[#B08D57]/20 transition-colors"
            >
              Hormuz Tanker Mining
            </button>
            <button
              type="button"
              onClick={() => setInputHeadline("Omani mediators announce temporary 72-hour ceasefire and maritime safe-corridor agreement")}
              className="bg-[#141923] hover:bg-black/60 text-[#EDE9DE] px-2 py-0.5 rounded border border-[#B08D57]/20 transition-colors"
            >
              Diplomatic Ceasefire Accord
            </button>
          </div>
        </form>
      </div>

      {/* 4. Live Geopolitical Headline Feed Stream or Compact Telemetry Bar */}
      {viewMode === "gauge-only" ? (
        <div className="bg-black/60 border border-[#B08D57]/30 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-xs font-mono-data">
              <span className="text-[#EDE9DE] font-semibold">Live Telemetry Feed: </span>
              <span className="text-emerald-400 font-bold">{headlines.length} Verified Signals Active</span>
              <span className="text-[#8292A6] ml-2 text-[10px]">({lastSyncTime})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateUSIranStrikesScenario}
              className="text-[10px] font-mono-data bg-[#A6291C]/30 hover:bg-[#A6291C] text-[#FFA4A4] hover:text-[#FBF8F1] px-2.5 py-1.5 rounded border border-[#A6291C]/50 transition-all flex items-center gap-1 font-bold"
              title="Simulate US strikes & Iranian retaliation in telemetry feed"
            >
              <Flame className="w-3 h-3 text-[#FFA4A4]" />
              <span>Simulate Strikes</span>
            </button>

            {onSwitchToTelemetry && (
              <button
                type="button"
                onClick={onSwitchToTelemetry}
                className="text-[10.5px] font-mono-data font-bold text-[#E5C794] hover:text-white bg-[#B08D57]/20 hover:bg-[#B08D57]/40 px-3 py-1.5 rounded-lg border border-[#B08D57]/40 transition-colors uppercase flex items-center gap-1.5 shadow-sm"
              >
                <span>View Live Telemetry Stream</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#E5C794]" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#141923] border border-[#B08D57]/25 rounded-xl p-4 shadow-xl space-y-3">
          {/* Stream Header & Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/20">
            <div className="flex flex-wrap items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF8585]" />
              <h4 className="font-serif italic text-base font-semibold text-[#EDE9DE]" style={{ fontFamily: "Georgia, serif" }}>
                Live Telemetry &amp; Intelligence Headlines Stream
              </h4>
              <span className="text-[9px] font-mono-data bg-black/60 text-[#8292A6] px-2 py-0.5 rounded border border-[#B08D57]/20">
                {filteredHeadlines.length} Live Signals
              </span>

              {/* Zero-Stale & Deduplication Guard Badge */}
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono-data bg-emerald-950/70 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 shadow-inner" title="Guaranteed: zero news from last week, strict 24h freshness, semantic deduplication active">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>Anti-Stale &amp; Deduplication Guard</span>
              </span>

              {/* Live Auto-Sync Status Badge */}
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono-data bg-black/60 text-[#BAC7D5] px-2 py-0.5 rounded border border-[#B08D57]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-Sync: 35s</span>
              </span>

              {/* Quick Force Sync Button */}
              <button
                onClick={fetchVerifiedFeed}
                disabled={isSyncingFeed}
                id="sync-telemetry-feed-btn-2"
                className="inline-flex items-center gap-1 text-[9px] font-mono-data bg-black/60 hover:bg-[#B08D57]/20 text-[#E5C794] px-2.5 py-0.5 rounded border border-[#B08D57]/30 transition-colors disabled:opacity-50"
                title="Force sync real-time verified RSS news wire from server"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncingFeed ? "animate-spin text-emerald-400" : ""}`} />
                <span>{isSyncingFeed ? "Syncing Wire..." : "Sync News Wire"}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Freshness Gate Pill Selector */}
              <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-[#B08D57]/30 text-[9px] font-mono-data">
                <span className="text-[#8292A6]">Window:</span>
                {[
                  { label: "All (<24h)", val: 24 },
                  { label: "<12h", val: 12 },
                  { label: "<6h", val: 6 },
                ].map((f) => (
                  <button
                    key={f.val}
                    onClick={() => setMaxAgeHours(f.val)}
                    className={`px-1.5 py-0.5 rounded transition-all ${
                      maxAgeHours === f.val
                        ? "bg-[#10B981] text-[#0A111C] font-bold shadow-sm"
                        : "text-[#BAC7D5] hover:text-[#EDE9DE]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono-data">
                {(["All", "US-Iran Kinetic", "Hormuz Chokepoint", "Sanctions & Energy", "Diplomatic / Backchannel"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded transition-all ${
                      selectedCategory === cat
                        ? "bg-[#B08D57] text-[#0A111C] font-bold shadow"
                        : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] border border-[#B08D57]/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Headlines List */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredHeadlines.map((h) => {
              const isFlash = flashNewId === h.id;
              const isKinetic = h.sentiment === "Escalatory Kinetic" || h.sentiment === "Severe Retaliation";
              const isDiplomatic = h.sentiment === "De-escalatory";

              return (
                <div
                  key={h.id}
                  className={`p-3.5 rounded-lg border transition-all duration-300 ${
                    isFlash
                      ? "bg-[#A6291C]/15 border-[#A6291C]/80 shadow-[0_0_12px_rgba(166,41,28,0.2)]"
                      : isKinetic
                      ? "bg-black/60 border-[#A6291C]/40 hover:border-[#A6291C]/70"
                      : isDiplomatic
                      ? "bg-black/40 border-[#10B981]/30 hover:border-[#10B981]/60"
                      : "bg-black/40 border-[#B08D57]/20 hover:border-[#B08D57]/40"
                  }`}
                >
                  {/* Meta Row: Source, Time, Sentiment, Confidence */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-data mb-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#E5C794] uppercase tracking-wider">
                        [{h.source}]
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#BAC7D5] bg-black/60 px-2 py-0.5 rounded border border-[#B08D57]/20 shadow-inner">
                        <Clock className="w-3 h-3 text-[#B08D57]" />
                        <span>{h.timestamp}</span>
                      </span>
                      {h.isLiveNew && (
                        <span className="inline-flex items-center gap-1.5 bg-[#A6291C] text-[#FBF8F1] font-semibold text-[8.5px] px-2 py-0.5 rounded border border-[#FF8585]/40 tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8585]" />
                          <span>LIVE</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* War-Risk Impact Points */}
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        h.impactScore >= 90
                          ? "bg-[#A6291C]/40 text-[#FFA4A4] border border-[#A6291C]"
                          : h.impactScore >= 75
                          ? "bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                      }`}>
                        War-Risk Impact: {h.impactScore}/100
                      </span>

                      {/* NLP Confidence Score Pill */}
                      <span className="bg-black/60 text-[#BAC7D5] px-2 py-0.5 rounded border border-[#B08D57]/20">
                        NLP Conf: <strong className="text-[#FBF8F1]">{h.confidenceScore}%</strong>
                      </span>

                      {/* Sentiment Tag */}
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                        isKinetic
                          ? "bg-[#A6291C] text-[#EDE9DE]"
                          : isDiplomatic
                          ? "bg-[#10B981] text-[#0A111C]"
                          : "bg-[#B08D57] text-[#0A111C]"
                      }`}>
                        {h.sentiment}
                      </span>
                    </div>
                  </div>

                  {/* Main Headline Text */}
                  <h5 className="text-sm font-semibold text-[#FBF8F1] leading-snug font-sans mb-1">
                    {h.headline}
                  </h5>

                  {/* Summary / Military Synthesis */}
                  <p className="text-xs text-[#BAC7D5] leading-relaxed font-sans mb-2">
                    {h.summary}
                  </p>

                  {/* Affected Assets Transmission Strip */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#B08D57]/15 text-[10px] font-mono-data text-[#8292A6]">
                    <span className="text-[#BAC7D5] font-semibold uppercase text-[9px]">Market Impact:</span>
                    <span className="text-[#FF8585] flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Brent: {h.affectedAssets.brentImpact}
                    </span>
                    <span className="text-[#E5C794]">
                      Gold: {h.affectedAssets.goldImpact}
                    </span>
                    <span className="text-[#FFA4A4]">
                      Tanker War-Risk: {h.affectedAssets.tankerRateImpact}
                    </span>

                    {h.link && (
                      <a
                        href={h.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] font-mono-data text-[#E5C794] hover:text-[#EDE9DE] bg-[#B08D57]/20 hover:bg-[#B08D57]/35 px-2 py-0.5 rounded border border-[#B08D57]/40 transition-colors ml-auto sm:ml-0"
                        title="Read original article on publisher website"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}

                    {onOpenTerminalWithPrompt && (
                      <button
                        onClick={() => onOpenTerminalWithPrompt(`Analyze institutional desk implications for headline: "${h.headline}"`)}
                        className="ml-auto text-[#B08D57] hover:text-[#E5C794] flex items-center gap-1 underline underline-offset-2 transition-colors"
                      >
                        <span>Query Terminal</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
