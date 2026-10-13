import React, { useState } from "react";
import { MacroDataState } from "../../types";
import { Maximize2, Minimize2, AlertOctagon, ShieldAlert, Anchor, Compass, Radio, Zap, Activity, AlertTriangle, TrendingUp, Flame, Layers } from "lucide-react";
import { SentimentGauge } from "./SentimentGauge";
import { GprHistoricalChart } from "../GprHistoricalChart";
import { ChokepointRiskSparkline } from "../ChokepointRiskSparkline";

export type MiddleEastSubTab =
  | "Maritime Chokepoints"
  | "Sentiment Gauge"
  | "Live Telemetry"
  | "GPR 24M History"
  | "Risk Matrix"
  | "Insurance & Freight";

interface MiddleEastRiskEngineProps {
  data: MacroDataState["engines"]["middleEastWarRisk"];
  onExpandToggle?: () => void;
  onExpandWithTab?: (tab: MiddleEastSubTab) => void;
  isExpanded?: boolean;
  initialSubTab?: MiddleEastSubTab;
}

// Helper for severity theme based on 0-100 score
const getSeverityTheme = (score: number) => {
  if (score >= 90) {
    return {
      tier: "EXTREME CONFLICT",
      badgeText: "KINETIC DISRUPTION",
      defcon: "DEFCON 1",
      textColor: "text-[#FF8585]",
      accentBg: "bg-[#A6291C]",
      border: "border-[#A6291C]",
      boxShadow: "shadow-[0_0_18px_rgba(166,41,28,0.25)]",
      gradient: "from-[#B08D57] via-[#A6291C] to-[#FF4545]",
      gaugeColor: "#FF4545",
      glowColor: "rgba(255, 69, 69, 0.4)"
    };
  }
  if (score >= 80) {
    return {
      tier: "CRITICAL THREAT",
      badgeText: "SEVERELY ELEVATED",
      defcon: "DEFCON 2",
      textColor: "text-[#FFA4A4]",
      accentBg: "bg-[#A6291C]/80",
      border: "border-[#A6291C]/70",
      boxShadow: "shadow-[0_0_15px_rgba(166,41,28,0.18)]",
      gradient: "from-[#B08D57] via-[#E5A158] to-[#A6291C]",
      gaugeColor: "#A6291C",
      glowColor: "rgba(166, 41, 28, 0.35)"
    };
  }
  if (score >= 70) {
    return {
      tier: "HIGH ALERT",
      badgeText: "HIGH SURVEILLANCE",
      defcon: "DEFCON 3",
      textColor: "text-[#E5C794]",
      accentBg: "bg-[#B08D57]",
      border: "border-[#B08D57]/60",
      boxShadow: "shadow-[0_0_12px_rgba(176,141,87,0.15)]",
      gradient: "from-[#8292A6] via-[#B08D57] to-[#E5C794]",
      gaugeColor: "#B08D57",
      glowColor: "rgba(176, 141, 87, 0.3)"
    };
  }
  if (score >= 50) {
    return {
      tier: "ELEVATED WATCH",
      badgeText: "GUARDED TRANSIT",
      defcon: "DEFCON 4",
      textColor: "text-[#B08D57]",
      accentBg: "bg-[#B08D57]/60",
      border: "border-[#B08D57]/40",
      boxShadow: "",
      gradient: "from-[#10B981] via-[#8292A6] to-[#B08D57]",
      gaugeColor: "#B08D57",
      glowColor: "rgba(176, 141, 87, 0.2)"
    };
  }
  return {
    tier: "BASELINE TRANSIT",
    badgeText: "NORMAL PATROL",
    defcon: "DEFCON 5",
    textColor: "text-[#10B981]",
    accentBg: "bg-[#10B981]",
    border: "border-[#10B981]/40",
    boxShadow: "",
    gradient: "from-[#10B981] to-[#10B981]",
    gaugeColor: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.2)"
  };
};

// SVG Arc Dial Gauge for 0-100 Severity Score
const ChokepointArcGauge: React.FC<{ score: number; label: string; subLabel: string }> = ({ score, label, subLabel }) => {
  const theme = getSeverityTheme(score);
  // Arc calculation for 180-degree top semi-circle (radius 36)
  const radius = 36;
  const strokeWidth = 6;
  const arcLength = Math.PI * radius; // ~113.1
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = arcLength * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center relative p-1 shrink-0">
      <div className="relative w-28 h-16 flex items-end justify-center">
        <svg className="w-28 h-16" viewBox="0 0 96 52">
          {/* Background Arc */}
          <path
            d="M 12 46 A 36 36 0 0 1 84 46"
            fill="none"
            stroke="#253347"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Gauge Color Gradient Definitions */}
          <defs>
            <linearGradient id={`gauge-grad-${label.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="35%" stopColor="#B08D57" />
              <stop offset="70%" stopColor="#E5A158" />
              <stop offset="90%" stopColor="#A6291C" />
              <stop offset="100%" stopColor="#FF4545" />
            </linearGradient>
          </defs>
          {/* Active Progress Arc */}
          <path
            d="M 12 46 A 36 36 0 0 1 84 46"
            fill="none"
            stroke={`url(#gauge-grad-${label.replace(/\s+/g, '')})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 4px ${theme.glowColor})`
            }}
          />
        </svg>

        {/* Center Live Numeric Value */}
        <div className="absolute bottom-0 flex flex-col items-center translate-y-0.5 pointer-events-none">
          <div className="flex items-baseline gap-0.5">
            <span className={`text-2xl font-black font-mono-data leading-none ${theme.textColor}`}>
              {score}
            </span>
            <span className="text-[10px] font-mono-data text-[#8292A6]">/100</span>
          </div>
          <span className="text-[7.5px] font-mono-data text-[#8292A6] uppercase tracking-wider">
            {subLabel}
          </span>
        </div>
      </div>

      {/* Scale Baseline Labels */}
      <div className="w-28 flex justify-between text-[7.5px] font-mono-data text-[#8292A6] px-1 mt-0.5">
        <span>0 [Peace]</span>
        <span>50</span>
        <span className="text-[#FF8585]">100 [War]</span>
      </div>
    </div>
  );
};

export const MiddleEastRiskEngine: React.FC<MiddleEastRiskEngineProps> = ({
  data,
  onExpandToggle,
  onExpandWithTab,
  isExpanded = false,
  initialSubTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<MiddleEastSubTab>(
    initialSubTab || (isExpanded ? "Sentiment Gauge" : "Maritime Chokepoints")
  );

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const regularTabs = [
    { id: "Maritime Chokepoints" as const, full: "Maritime Chokepoints", short: "Chokepoints" },
    { id: "GPR 24M History" as const, full: "GPR 24M History", short: "GPR 24M", flame: true },
    { id: "Risk Matrix" as const, full: "Risk Matrix", short: "Risk Matrix" },
    { id: "Insurance & Freight" as const, full: "Insurance & Freight", short: "Insurance" },
  ];

  const expandedTabs = [
    { id: "Sentiment Gauge" as const, full: "NLP Sentiment Gauge", short: "Sentiment", dot: true },
    { id: "Live Telemetry" as const, full: "Live Telemetry Feed", short: "Telemetry", radio: true },
    { id: "Maritime Chokepoints" as const, full: "Maritime Chokepoints", short: "Chokepoints" },
    { id: "GPR 24M History" as const, full: "GPR 24M History", short: "GPR 24M", flame: true },
    { id: "Risk Matrix" as const, full: "Risk Matrix", short: "Risk Matrix" },
    { id: "Insurance & Freight" as const, full: "Insurance & Freight", short: "Insurance" },
  ];

  const currentTabs = isExpanded ? expandedTabs : regularTabs;

  // Extract Strait of Hormuz and Red Sea (Bab el-Mandeb) Chokepoint Data
  const hormuzData = data.chokepoints.find((cp) => cp.name.toLowerCase().includes("hormuz")) || {
    name: "Strait of Hormuz",
    status: "SEVERELY ELEVATED",
    riskScore: 80,
    threat: "IRGC Fast Attack Craft Drills & GPS Jamming",
    flow: "18.2M bpd at critical risk"
  };

  const redSeaData = data.chokepoints.find((cp) => cp.name.toLowerCase().includes("red sea") || cp.name.toLowerCase().includes("bab")) || {
    name: "Bab el-Mandeb (Red Sea)",
    status: "ACTIVE DISRUPTION",
    riskScore: 90,
    threat: "Houthi Anti-Ship Missile Vectors & Drone Swarms",
    flow: "Rerouting around Africa (74.8%)"
  };

  const hormuzScore = hormuzData.riskScore ?? 80;
  const redSeaScore = redSeaData.riskScore ?? 90;
  const hormuzTheme = getSeverityTheme(hormuzScore);
  const redSeaTheme = getSeverityTheme(redSeaScore);

  return (
    <div
      id="middle-east-risk-engine-card"
      className={
        isExpanded
          ? "space-y-6 text-[#EDE9DE]"
          : "bg-[#0E1624] border border-[#1E293B] hover:border-[#B08D57]/40 rounded-sm p-3.5 sm:p-5 transition-all shadow-none flex flex-col justify-between relative group overflow-hidden"
      }
    >
      {/* Subtle top brass highlight */}
      {!isExpanded && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/40 to-transparent pointer-events-none" />
      )}

      {/* Top Header & Sub-Tabs */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <h3 className="font-serif italic text-xl sm:text-2xl font-bold tracking-tight text-[#FBF8F1]" style={{ fontFamily: "Georgia, 'Newsreader', serif" }}>
              Middle East War-Risk &amp; Maritime
            </h3>
            <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider bg-[#A6291C]/20 text-[#FFA4A4] border border-[#A6291C]/50 px-2 py-0.5 rounded-sm flex items-center gap-1 shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-none bg-[#FFA4A4]" />
              DEFCON 2
            </span>
          </div>

          {/* Sub Tab Switcher & Fullscreen */}
          <div className="flex items-center gap-2 max-w-full min-w-0 w-full xl:w-auto">
            <div className="flex items-center bg-[#080E18] p-0.5 rounded-sm border border-[#1E293B] text-[10px] font-mono-data overflow-x-auto no-scrollbar max-w-full min-w-0 flex-1 scroll-smooth">
              {currentTabs.map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setActiveSubTab(tabItem.id)}
                  className={`px-2 sm:px-2.5 py-1 rounded-sm transition-all uppercase font-medium flex items-center gap-1 shrink-0 whitespace-nowrap text-[9px] sm:text-[10px] ${
                    activeSubTab === tabItem.id
                      ? tabItem.id === "Sentiment Gauge" || tabItem.id === "GPR 24M History" || tabItem.id === "Live Telemetry"
                        ? "bg-[#A6291C] text-[#EDE9DE] font-bold"
                        : "bg-[#B08D57] text-[#0A111C] font-bold"
                      : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
                  }`}
                  title={tabItem.full}
                >
                  {"dot" in tabItem && tabItem.dot && <span className="w-1.5 h-1.5 rounded-none bg-[#FFA4A4] shrink-0" />}
                  {"radio" in tabItem && tabItem.radio && <Radio className="w-2.5 h-2.5 text-[#FFA4A4] shrink-0" />}
                  {"flame" in tabItem && tabItem.flame && <Flame className="w-2.5 h-2.5 text-[#FFA4A4] shrink-0" />}
                  <span className={isExpanded ? "inline" : "hidden 2xl:inline"}>{tabItem.full}</span>
                  <span className={isExpanded ? "hidden" : "2xl:hidden"}>{tabItem.short}</span>
                </button>
              ))}

              {/* In unexpanded view, show a direct button to expand into Sentiment & Telemetry */}
              {!isExpanded && (
                <button
                  type="button"
                  onClick={() => {
                    if (onExpandWithTab) {
                      onExpandWithTab("Sentiment Gauge");
                    } else if (onExpandToggle) {
                      onExpandToggle();
                    }
                  }}
                  className="px-2 sm:px-2.5 py-1 rounded transition-all uppercase font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap text-[9px] sm:text-[10px] bg-[#A6291C]/25 hover:bg-[#A6291C] text-[#FFA4A4] hover:text-white border border-[#A6291C]/50 shadow-sm ml-1 group"
                  title="Expand Fullscreen: Real-Time NLP Sentiment Gauge & Live Telemetry Feed"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4545] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF4545]"></span>
                  </span>
                  <span className="font-bold">Sentiment &amp; Telemetry</span>
                  <Maximize2 className="w-2.5 h-2.5 text-[#E5C794] group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>

            {onExpandToggle && (
              <button
                onClick={() => {
                  if (!isExpanded && onExpandWithTab) {
                    onExpandWithTab(activeSubTab);
                  } else {
                    onExpandToggle();
                  }
                }}
                title={isExpanded ? "Collapse View" : "Expand Fullscreen"}
                aria-label={isExpanded ? "Collapse View" : "Expand Fullscreen"}
                className="p-1.5 rounded-lg bg-black/70 border border-[#B08D57]/30 text-[#BAC7D5] hover:text-[#E5C794] transition-colors shrink-0 flex items-center justify-center shadow-sm"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-[10px] font-mono-data tracking-widest text-[#BAC7D5] mt-2 mb-4 uppercase font-semibold">
          MARITIME CHOKEPOINT & HORMUZ ESCALATION INDEX
        </p>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
          {/* 1. GPR Global Index (Benchmark >360) - Clickable to open 24M History */}
          <button
            type="button"
            id="gpr-stat-card-button"
            onClick={() => setActiveSubTab("GPR 24M History")}
            className="text-left bg-black/50 border border-[#A6291C]/60 hover:border-[#FF4545] rounded-lg p-2.5 sm:p-3 relative shadow-[0_0_15px_rgba(166,41,28,0.15)] hover:shadow-[0_0_20px_rgba(255,69,69,0.25)] flex flex-col justify-between cursor-pointer group transition-all min-w-0 overflow-hidden"
          >
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#FF8585] gap-1">
              <span className="uppercase tracking-wider font-medium truncate">GPR Index</span>
              <span className="h-2 w-2 rounded-full bg-[#A6291C] group-hover:bg-[#FF4545] animate-pulse shrink-0" />
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#FF8585] leading-tight truncate group-hover:text-white transition-colors">
                {data.gprIndex || 364.5}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
                <span className="text-[#FF8585] font-semibold truncate">+18.4 pts</span>
                <span className="text-[#EDE9DE]/70 truncate">&gt;360 Alert</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#A6291C]/30 pt-1 truncate">
              Geopolitical Benchmark
            </div>
          </button>

          {/* 2. ME Regional Conflict Index (0-100 scale) */}
          <div className="bg-black/50 border border-[#B08D57]/40 rounded-lg p-2.5 sm:p-3 relative shadow-[0_0_15px_rgba(176,141,87,0.12)] flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#E5C794] gap-1">
              <span className="uppercase tracking-wider font-medium truncate">ME Conflict</span>
              <span className="text-[9px] font-bold text-[#FFA4A4] bg-[#A6291C]/30 px-1.5 py-0.5 rounded border border-[#A6291C]/50 shrink-0 whitespace-nowrap">
                DEFCON 2
              </span>
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#E5C794] leading-tight flex items-baseline gap-1 truncate">
                <span>{data.riskIndex}</span>
                <span className="text-[11px] text-[#8292A6] font-normal">/ 100</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
                <span className="text-[#FFA4A4] font-semibold truncate">Critical Threat</span>
                <span className="text-[#8292A6] truncate">Scale 0-100</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/20 pt-1 truncate">
              Regime: <span className="text-[#FFA4A4] font-semibold">DEFCON 2</span>
            </div>
          </div>

          {/* 3. Cape Rerouting */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium truncate">
              Cape Route
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#B08D57] leading-tight truncate">
                {data.redSeaRerouteRate ? data.redSeaRerouteRate.split(' ')[0] : '74.8%'}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
                <span className="text-[#B08D57] font-semibold truncate">Africa Divert</span>
                <span className="text-[#8292A6] truncate">Red Sea</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/15 pt-1 truncate">
              Traffic: <span className="text-[#B08D57] font-semibold">Diverted Cape</span>
            </div>
          </div>

          {/* 4. Brent War Premium */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium truncate">
              Brent War Risk
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#EDE9DE] leading-tight flex items-baseline gap-1 truncate">
                <span>{data.brentGeopoliticalPremium.replace(' / bbl', '').replace('/bbl', '')}</span>
                <span className="text-xs text-[#8292A6] font-normal">/bbl</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
                <span className="text-[#A6291C] font-semibold truncate">Risk +420bps</span>
                <span className="text-[#8292A6] truncate">JWLA</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/15 pt-1 truncate">
              Adder Code: <span className="text-[#EDE9DE] font-semibold">JWLA-030</span>
            </div>
          </div>
        </div>

        {/* Tab Content 0: LIVE SENTIMENT GAUGE (Real-Time Geopolitical NLP & Confidence Score) */}
        {activeSubTab === "Sentiment Gauge" && (
          <div className="space-y-4">
            <SentimentGauge
              viewMode={isExpanded ? "all" : "gauge-only"}
              onSwitchToTelemetry={() => setActiveSubTab("Live Telemetry")}
            />
          </div>
        )}

        {/* Tab Content 0.1: LIVE TELEMETRY & INTELLIGENCE HEADLINES STREAM */}
        {activeSubTab === "Live Telemetry" && (
          <div className="space-y-4">
            <SentimentGauge
              viewMode="telemetry-only"
              onSwitchToSentiment={() => setActiveSubTab("Sentiment Gauge")}
            />

            {/* Tactical Combat & Chokepoint Briefing Logs */}
            <div className="bg-black/40 border border-[#B08D57]/25 rounded-lg p-3.5 space-y-2.5 font-mono-data text-xs shadow-inner">
              <div className="flex items-center gap-2 border-b border-[#B08D57]/20 pb-2">
                <span className="w-2 h-2 rounded-full bg-[#FF4545] animate-ping" />
                <span className="text-[11px] font-bold text-[#EDE9DE] uppercase tracking-wider">
                  UKMTO &amp; CENTCOM Tactical Combat Flash Logs
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#BAC7D5]">
                <div className="p-2.5 rounded bg-black/60 border border-[#EF4444]/60 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#FF8585] font-bold flex items-center gap-1.5">
                      <Flame className="w-3 h-3 text-[#EF4444] animate-pulse" />
                      Saudi Aramco Flash: East-West Petroline Shutdown
                    </span>
                    <span className="text-[#8292A6]">Just now • Verified</span>
                  </div>
                  <p className="text-[#EDE9DE] font-sans text-xs">
                    Precautionary operational halt of 5.0M bpd East-West pipeline following drone interdiction near Yanbu. All Gulf crude transit routed via Hormuz.
                  </p>
                  <div className="text-[9px] text-[#FCA5A5] font-mono-data">
                    Operational Impact: Brent backwardation widens +$2.80/bbl.
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-[#A6291C]/40 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#FF8585] font-bold">UKMTO Incident 049 (Active)</span>
                    <span className="text-[#8292A6]">Today • 09:30 UTC</span>
                  </div>
                  <p className="text-[#EDE9DE] font-sans text-xs">
                    Greek-flagged VLCC repels explosive USV approach 21nm SW of Hormuz; severe electronic GPS spoofing active across 45nm corridor.
                  </p>
                  <div className="text-[9px] text-[#FFA4A4]">
                    Impact: Lloyd's JWC additional war-risk breach adder surges to 0.85%.
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-[#B08D57]/30 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#E5C794] font-bold">CENTCOM Strike Telemetry (Sentinel Surge)</span>
                    <span className="text-[#8292A6]">Today • 13:22 UTC</span>
                  </div>
                  <p className="text-[#EDE9DE] font-sans text-xs">
                    Operation Sentinel Surge: Carrier air wings neutralize 8 IRGC mobile ballistic launchers and coastal radar nodes near Bandar Abbas.
                  </p>
                  <div className="text-[9px] text-[#E5C794]">
                    BDA: Secondary fires confirmed at subterranean launch pads; DEFCON 2 posture maintained.
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-[#8292A6]/30 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#BAC7D5] font-bold">Pentagon B-2 Deep Strike Ingestion</span>
                    <span className="text-[#8292A6]">Yesterday • 21:40 UTC</span>
                  </div>
                  <p className="text-[#EDE9DE] font-sans text-xs">
                    Coordinated stealth B-2 strikes penetrate underground missile fabrication silos in Isfahan and Natanz perimeter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 0.5: GPR 24-MONTH HISTORICAL CHART & WAR SURGE */}
        {activeSubTab === "GPR 24M History" && (
          <div className="space-y-4">
            <GprHistoricalChart
              currentLiveGpr={data.gprIndex}
              isExpanded={isExpanded}
              onExpandToggle={onExpandToggle}
            />
          </div>
        )}

        {/* Tab Content 1: MARITIME CHOKEPOINTS */}
        {activeSubTab === "Maritime Chokepoints" && (
          <div className="space-y-4">
            {/* Color-Coded Dual Gauge Showcase for Strait of Hormuz & Red Sea */}
            <div className="bg-black/60 border border-[#B08D57]/25 rounded-lg p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#B08D57]/15">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#FF8585]" />
                  <span className="text-xs font-mono-data font-bold text-[#EDE9DE] uppercase tracking-wider">
                    PRIMARY CHOKEPOINT SEVERITY GAUGES (0-100 SEVERITY)
                  </span>
                </div>
                <span className="text-[9px] font-mono-data text-[#8292A6]">
                  Live Telemetry Updates Every 15s
                </span>
              </div>

              {/* 2 Dedicated Gauge Cards for Hormuz & Red Sea */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {/* 1. Strait of Hormuz Gauge Card */}
                <div className={`bg-black/70 rounded-lg p-3.5 border transition-all overflow-hidden ${hormuzTheme.border} ${hormuzTheme.boxShadow}`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Anchor className={`w-4 h-4 shrink-0 ${hormuzTheme.textColor}`} />
                      <span className="font-mono-data font-bold text-sm text-[#EDE9DE] truncate">
                        Strait of Hormuz
                      </span>
                    </div>
                    <span className={`text-[8.5px] font-mono-data font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      hormuzScore >= 80 ? "bg-[#A6291C]/30 text-[#FFA4A4] border-[#A6291C]" : "bg-[#B08D57]/20 text-[#E5C794] border-[#B08D57]/40"
                    }`}>
                      {hormuzData.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    {/* SVG Arc Dial */}
                    <ChokepointArcGauge score={hormuzScore} label="Hormuz" subLabel="Hormuz Index" />

                    {/* Progress Bar & Vectors */}
                    <div className="flex-1 w-full min-w-0 space-y-2">
                      {/* Calibrated Severity Bar */}
                      <div>
                        <div className="flex justify-between text-[9px] font-mono-data mb-1">
                          <span className="text-[#8292A6]">Severity Gauge:</span>
                          <span className={`font-bold ${hormuzTheme.textColor}`}>
                            {hormuzScore}/100 [{hormuzTheme.tier}]
                          </span>
                        </div>

                        {/* 10-Segmented Color-Coded LED Level Bar */}
                        <div className="flex items-center gap-1 mb-1">
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((step) => {
                            const isLit = hormuzScore >= step;
                            return (
                              <div
                                key={step}
                                className={`h-2 flex-1 rounded-xs transition-all duration-500 ${
                                  isLit
                                    ? step >= 90
                                      ? "bg-[#FF4545] shadow-[0_0_6px_rgba(255,69,69,0.5)]"
                                      : step >= 80
                                      ? "bg-[#A6291C] shadow-[0_0_4px_rgba(166,41,28,0.4)]"
                                      : step >= 70
                                      ? "bg-[#E5A158]"
                                      : step >= 40
                                      ? "bg-[#B08D57]"
                                      : "bg-[#10B981]"
                                    : "bg-[#1F2937]"
                                }`}
                              />
                            );
                          })}
                        </div>

                        {/* Continuous Dynamic Gradient Bar with Needle */}
                        <div className="relative h-2 w-full bg-black/80 rounded-full overflow-hidden border border-[#B08D57]/20">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${hormuzTheme.gradient} transition-all duration-700 ease-out`}
                            style={{ width: `${hormuzScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Vector Metadata */}
                      <div className="space-y-1 text-[9.5px] font-mono-data pt-1 border-t border-[#B08D57]/10">
                        <div className="flex justify-between items-center text-[#8292A6] gap-2">
                          <span className="shrink-0">Disrupted Flow:</span>
                          <span className="text-[#B08D57] font-semibold truncate">{hormuzData.flow}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#8292A6] gap-2">
                          <span className="shrink-0">Threat Vector:</span>
                          <span className="text-[#EDE9DE] truncate" title={hormuzData.threat}>
                            {hormuzData.threat}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Red Sea / Bab el-Mandeb Gauge Card */}
                <div className={`bg-black/70 rounded-lg p-3.5 border transition-all overflow-hidden ${redSeaTheme.border} ${redSeaTheme.boxShadow}`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Anchor className={`w-4 h-4 shrink-0 ${redSeaTheme.textColor}`} />
                      <span className="font-mono-data font-bold text-sm text-[#EDE9DE] truncate">
                        Bab el-Mandeb (Red Sea)
                      </span>
                    </div>
                    <span className={`text-[8.5px] font-mono-data font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      redSeaScore >= 85 ? "bg-[#A6291C] text-[#EDE9DE] border-[#A6291C]" : "bg-[#B08D57]/30 text-[#E5C794] border-[#B08D57]/50"
                    }`}>
                      {redSeaData.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    {/* SVG Arc Dial */}
                    <ChokepointArcGauge score={redSeaScore} label="RedSea" subLabel="Red Sea Index" />

                    {/* Progress Bar & Vectors */}
                    <div className="flex-1 w-full min-w-0 space-y-2">
                      {/* Calibrated Severity Bar */}
                      <div>
                        <div className="flex justify-between text-[9px] font-mono-data mb-1">
                          <span className="text-[#8292A6]">Severity Gauge:</span>
                          <span className={`font-bold ${redSeaTheme.textColor}`}>
                            {redSeaScore}/100 [{redSeaTheme.tier}]
                          </span>
                        </div>

                        {/* 10-Segmented Color-Coded LED Level Bar */}
                        <div className="flex items-center gap-1 mb-1">
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((step) => {
                            const isLit = redSeaScore >= step;
                            return (
                              <div
                                key={step}
                                className={`h-2 flex-1 rounded-xs transition-all duration-500 ${
                                  isLit
                                    ? step >= 90
                                      ? "bg-[#FF4545] shadow-[0_0_6px_rgba(255,69,69,0.5)]"
                                      : step >= 80
                                      ? "bg-[#A6291C] shadow-[0_0_4px_rgba(166,41,28,0.4)]"
                                      : step >= 70
                                      ? "bg-[#E5A158]"
                                      : step >= 40
                                      ? "bg-[#B08D57]"
                                      : "bg-[#10B981]"
                                    : "bg-[#1F2937]"
                                }`}
                              />
                            );
                          })}
                        </div>

                        {/* Continuous Dynamic Gradient Bar with Needle */}
                        <div className="relative h-2 w-full bg-black/80 rounded-full overflow-hidden border border-[#B08D57]/20">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${redSeaTheme.gradient} transition-all duration-700 ease-out`}
                            style={{ width: `${redSeaScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Vector Metadata */}
                      <div className="space-y-1 text-[9.5px] font-mono-data pt-1 border-t border-[#B08D57]/10">
                        <div className="flex justify-between items-center text-[#8292A6] gap-2">
                          <span className="shrink-0">Disrupted Flow:</span>
                          <span className="text-[#B08D57] font-semibold truncate">{redSeaData.flow}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#8292A6] gap-2">
                          <span className="shrink-0">Threat Vector:</span>
                          <span className="text-[#EDE9DE] truncate" title={redSeaData.threat}>
                            {redSeaData.threat}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color-Coded Severity Scale Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#B08D57]/10 text-[9px] font-mono-data text-[#8292A6]">
                <span className="text-[#EDE9DE] font-semibold">0-100 SEVERITY CALIBRATION:</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
                    0-29 Normal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#B08D57]" />
                    30-59 Guarded
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#E5A158]" />
                    60-79 Elevated
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#A6291C]" />
                    80-89 Critical
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#FF4545]" />
                    90-100 Kinetic
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Fullscreen Launcher Banner in Regular (Unexpanded) View */}
            {!isExpanded && (
              <div className="rounded-lg p-3 bg-black/60 border border-[#B08D57]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#B08D57]/15 border border-[#B08D57]/40 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-[#E5C794]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-data font-bold text-[#EDE9DE]">
                        All Monitored Regional Chokepoints
                      </span>
                      <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-[#A6291C]/30 text-[#FFA4A4] border border-[#A6291C]/50 font-semibold">
                        5 Active Nodes
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8292A6] font-mono-data truncate">
                      Saudi Petroline • Bab el-Mandeb • Hormuz • Kharg • Suez
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onExpandWithTab) {
                      onExpandWithTab("Maritime Chokepoints");
                    } else if (onExpandToggle) {
                      onExpandToggle();
                    }
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 rounded bg-[#B08D57]/20 hover:bg-[#B08D57] text-[#E5C794] hover:text-[#0A111C] border border-[#B08D57]/50 text-[10px] font-mono-data font-bold uppercase transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <span>View Full Roster &amp; Sparklines In Full Screen</span>
                  <Maximize2 className="w-3 h-3 text-[#E5C794]" />
                </button>
              </div>
            )}

            {/* Complete Regional Chokepoint Roster with Enhanced Gauge Bars — Full Screen View */}
            {isExpanded && (
              <div className="space-y-2.5">
                <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#B08D57] font-semibold">
                  ALL MONITORED MIDDLE EAST & GULF CHOKEPOINTS (FULL INTELLIGENCE ROSTER)
                </div>

                {data.chokepoints.map((cp, idx) => {
                  const score = cp.riskScore ?? (cp.name.includes("Bab") || cp.name.includes("Red Sea") ? 90 : cp.name.includes("Hormuz") ? 80 : cp.name.includes("Kharg") ? 75 : 65);
                  const theme = getSeverityTheme(score);
                  const isCritical = score >= 80;

                  return (
                    <div
                      key={idx}
                      className={`rounded p-3.5 border transition-all ${
                        isCritical
                          ? "bg-black/60 border-[#A6291C]/70 shadow-[0_0_12px_rgba(166,41,28,0.15)]"
                          : "bg-black/40 border-[#B08D57]/20 hover:border-[#B08D57]/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {cp.name.includes("Pipeline") || cp.name.includes("Petroline") ? (
                            <Flame className={`w-4 h-4 ${theme.textColor}`} />
                          ) : (
                            <Anchor className={`w-4 h-4 ${theme.textColor}`} />
                          )}
                          <span className="font-mono-data font-bold text-sm text-[#EDE9DE]">
                            {cp.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* 0-100 Score Badge */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-mono-data font-bold ${
                            isCritical
                              ? "bg-[#A6291C]/30 text-[#FFA4A4] border-[#A6291C]"
                              : "bg-[#B08D57]/25 text-[#E5C794] border-[#B08D57]/50"
                          }`}>
                            <span>SEVERITY:</span>
                            <span className="text-xs font-black">{score}</span>
                            <span className="text-[9px] font-normal text-[#8292A6]">/ 100</span>
                          </div>

                          <span
                            className={`text-[9px] font-mono-data font-bold px-2 py-0.5 rounded uppercase ${
                              isCritical
                                ? "bg-[#A6291C] text-[#EDE9DE]"
                                : "bg-[#B08D57] text-[#0E1A2B]"
                            }`}
                          >
                            {cp.status}
                          </span>
                        </div>
                      </div>

                      {/* Visual Color-Coded Risk Gauge Meter Bar (0-100) */}
                      <div className="mt-2.5 space-y-1">
                        <div className="flex justify-between text-[9px] font-mono-data text-[#8292A6]">
                          <span>Escalation Vector</span>
                          <span className={`font-bold ${theme.textColor}`}>
                            {score}/100 — {theme.tier}
                          </span>
                        </div>

                        {/* Linear Bar with Calibration Marks */}
                        <div className="h-2 w-full bg-black/80 rounded-full overflow-hidden border border-[#B08D57]/20 p-0.5">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-700 ease-out`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>

                      {/* 7-Day Threat Score Progression Sparkline */}
                      <div className="mt-2.5">
                        <ChokepointRiskSparkline
                          data={
                            cp.name.includes("Bab") || cp.name.includes("Red Sea")
                              ? [87, 88, 86, 89, 90, 92, score]
                              : cp.name.includes("Hormuz")
                              ? [76, 78, 81, 85, 84, 87, score]
                              : cp.name.includes("Kharg")
                              ? [74, 75, 78, 80, 81, 83, score]
                              : [65, 67, 69, 72, 73, 75, score]
                          }
                          chokepointName={cp.name}
                          variant="detailed"
                          height={46}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#B08D57]/10 text-xs font-mono-data">
                        <div>
                          <span className="text-[#8292A6] text-[9px] block uppercase tracking-wider">Threat Vector:</span>
                          <span className="text-[#EDE9DE]">{cp.threat}</span>
                        </div>
                        <div>
                          <span className="text-[#8292A6] text-[9px] block uppercase tracking-wider">Disrupted Flow:</span>
                          <span className="text-[#B08D57] font-semibold">{cp.flow}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: RISK MATRIX */}
        {activeSubTab === "Risk Matrix" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-data font-bold text-[#EDE9DE] uppercase">
                Geopolitical Escalation Probability Matrix
              </span>
              <span className="text-xs font-mono-data text-[#FFA4A4]">DEFCON 2 Active</span>
            </div>
            <p className="text-xs text-[#8292A6] leading-relaxed">
              Our automated macro matrix aggregates satellite optical density over Bandar Abbas, IRGC naval radio telemetry, and Lloyd's War Risk syndicate underwriting spreads to price tail risk into energy markets.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-data pt-2">
              <div className="bg-black/50 p-2 rounded border border-[#B08D57]/15 text-center min-w-0">
                <span className="text-[9px] text-[#8292A6] block truncate">Hormuz Blockade (24h)</span>
                <span className="text-[#A6291C] font-bold text-[11px] sm:text-xs truncate block">24% Probability</span>
              </div>
              <div className="bg-black/50 p-2 rounded border border-[#B08D57]/15 text-center min-w-0">
                <span className="text-[9px] text-[#8292A6] block truncate">Brent Spike Target</span>
                <span className="text-[#EDE9DE] font-bold text-[11px] sm:text-xs truncate block">$105 - $115/bbl</span>
              </div>
              <div className="bg-black/50 p-2 rounded border border-[#B08D57]/15 text-center min-w-0">
                <span className="text-[9px] text-[#8292A6] block truncate">Freight Rate Surge</span>
                <span className="text-[#B08D57] font-bold text-[11px] sm:text-xs truncate block">+185% W/W</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: INSURANCE & FREIGHT */}
        {activeSubTab === "Insurance & Freight" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-3 text-xs font-mono-data">
            <div className="text-[10px] font-bold text-[#B08D57] uppercase">
              War-Risk Additional Premium (JWLA-030 Listed Area)
            </div>
            <div className="space-y-2 text-[#8292A6]">
              <div className="flex flex-wrap sm:flex-nowrap justify-between gap-1 border-b border-[#B08D57]/15 pb-1">
                <span>VLCC Hull & Machinery (H&M) Surcharge:</span>
                <span className="text-[#A6291C] font-semibold whitespace-nowrap">1.15% (was 0.05%)</span>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap justify-between gap-1 border-b border-[#B08D57]/15 pb-1">
                <span>Cape of Good Hope Fuel Differential:</span>
                <span className="text-[#EDE9DE] font-semibold whitespace-nowrap">+$850,000 / voyage</span>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap justify-between gap-1 border-b border-[#B08D57]/15 pb-1">
                <span>Clean Tanker Day Rate (Ras Tanura to Singapore):</span>
                <span className="text-[#B08D57] font-semibold whitespace-nowrap">WS 142 ($68,500/d)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desk Action Footer */}
      <div className="mt-5 pt-3 border-t border-[#B08D57]/15 flex flex-wrap items-center justify-between text-xs font-mono-data gap-2 text-[#8292A6]">
        <div className="flex items-center gap-2 text-[#EDE9DE]">
          <Zap className="w-3.5 h-3.5 text-[#B08D57]" />
          <span>
            <strong className="text-[#B08D57]">DESK:</strong> {data.deskPosition}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#8292A6]">{data.deskCode}</span>
          {!isExpanded && (
            <button
              onClick={() => {
                if (onExpandWithTab) {
                  onExpandWithTab(activeSubTab);
                } else if (onExpandToggle) {
                  onExpandToggle();
                }
              }}
              className="text-[9px] bg-[#B08D57]/20 hover:bg-[#B08D57] text-[#E5C794] hover:text-[#0A111C] px-2 py-0.5 rounded border border-[#B08D57]/40 font-bold transition-all uppercase flex items-center gap-1 cursor-pointer"
            >
              <span>Fullscreen Engine</span>
              <Maximize2 className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
