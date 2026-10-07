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
  ReferenceArea,
  ReferenceDot,
  CartesianGrid
} from "recharts";
import {
  ShieldAlert,
  Flame,
  Calendar,
  Layers,
  Maximize2,
  Minimize2,
  Info,
  TrendingUp,
  Activity,
  AlertTriangle,
  Radio,
  Zap,
  Crosshair,
  Newspaper
} from "lucide-react";
import {
  gpr24mHistoricalData,
  computeGprAnalytics,
  GprHistoricalPoint,
  GPR_WAR_START_MONTH,
  iranianEscalationEvents,
  IranianEscalationEvent,
  getIranianEscalationForMonth
} from "../data/gprHistoricalData";
import { GeopoliticalContextDossier } from "./GeopoliticalContextDossier";
import { ChartExportDropdown } from "./ChartExportDropdown";
import { exportGoldGprChartPdf, exportChartElementAsPng } from "../utils/chartExportUtils";

interface GprHistoricalChartProps {
  currentLiveGpr?: number;
  currentLiveBrent?: number;
  onExpandToggle?: () => void;
  isExpanded?: boolean;
}

type ViewFilter = "24M" | "WAR_PHASE" | "SPLIT";
type SecondaryOverlay = "none" | "brent" | "gold" | "premium";

export const GprHistoricalChart: React.FC<GprHistoricalChartProps> = ({
  currentLiveGpr = 364.5,
  currentLiveBrent,
  onExpandToggle,
  isExpanded = false
}) => {
  const [viewFilter, setViewFilter] = useState<ViewFilter>("24M");
  const [secondaryOverlay, setSecondaryOverlay] = useState<SecondaryOverlay>("none");
  const [showGprThreats, setShowGprThreats] = useState<boolean>(true);
  const [showGprActs, setShowGprActs] = useState<boolean>(true);
  const [showGeopoliticalContext, setShowGeopoliticalContext] = useState<boolean>(true);
  const [selectedEscalationId, setSelectedEscalationId] = useState<string>("escalation-2026-02");
  const [hoveredPoint, setHoveredPoint] = useState<GprHistoricalPoint | null>(null);
  const [selectedMilestoneMonth, setSelectedMilestoneMonth] = useState<string | null>(null);

  // Compute analytics dynamically with any live GPR feed
  const analytics = useMemo(() => {
    return computeGprAnalytics(currentLiveGpr);
  }, [currentLiveGpr]);

  // Adjust the dataset with live GPR tick & live Brent on the last item
  const fullDataset: GprHistoricalPoint[] = useMemo(() => {
    return gpr24mHistoricalData.map((item, idx) => {
      if (idx === gpr24mHistoricalData.length - 1) {
        return {
          ...item,
          gpr: currentLiveGpr || item.gpr,
          brentPrice: typeof currentLiveBrent === "number" && !isNaN(currentLiveBrent) ? currentLiveBrent : item.brentPrice
        };
      }
      return item;
    });
  }, [currentLiveGpr, currentLiveBrent]);

  // Filtered dataset based on view mode
  const filteredData = useMemo(() => {
    if (viewFilter === "WAR_PHASE") {
      // Show from Jan '26 (pre-war baseline) through Sep '26
      return fullDataset.filter(d => d.month >= "2026-01");
    }
    return fullDataset;
  }, [viewFilter, fullDataset]);

  // Active point for the milestone detail card (either clicked, hovered, or latest)
  const activeDetailPoint = useMemo(() => {
    if (selectedMilestoneMonth) {
      const match = fullDataset.find(d => d.month === selectedMilestoneMonth);
      if (match) return match;
    }
    if (hoveredPoint) return hoveredPoint;
    return fullDataset[fullDataset.length - 1];
  }, [selectedMilestoneMonth, hoveredPoint, fullDataset]);

  // Active escalation event for the Geopolitical Context overlay
  const activeEscalation = useMemo(() => {
    const found = iranianEscalationEvents.find(e => e.id === selectedEscalationId);
    if (found) return found;
    return iranianEscalationEvents.find(e => e.month === activeDetailPoint.month) || iranianEscalationEvents[6];
  }, [selectedEscalationId, activeDetailPoint.month]);

  // Specific rise of active point vs baseline
  const startGpr = fullDataset[0].gpr; // 148.5
  const preWarGpr = fullDataset.find(d => d.month === "2026-01")?.gpr || 224.5;
  const febWarGpr = fullDataset.find(d => d.month === "2026-02")?.gpr || 286.0;

  return (
    <div
      id="gpr-historical-chart-container"
      className="bg-black/60 border border-[#B08D57]/30 rounded-xl p-3.5 sm:p-5 relative shadow-xl overflow-hidden backdrop-blur-sm"
    >
      {/* Decorative ambient top glow */}
      <div className="absolute top-0 right-1/4 w-96 h-28 bg-[#A6291C]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Badges Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/20 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[9px] font-mono-data font-bold uppercase tracking-widest bg-[#A6291C]/30 text-[#FF8585] border border-[#A6291C]/70 px-2 py-0.5 rounded shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF8585] animate-pulse" />
              DEFCON 2 // CRITICAL THREAT
            </span>
            <span className="text-[9px] font-mono-data text-[#8292A6] uppercase tracking-wider">
              Caldara-Iacoviello Benchmark • 24M Time Series
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#FBF8F1] tracking-tight flex items-center gap-2">
            <span>Geopolitical Risk (GPR) Index 24-Month Trajectory</span>
            <span className="text-xs font-mono-data font-normal text-[#E5C794] bg-[#B08D57]/15 px-2 py-0.5 rounded border border-[#B08D57]/30">
              Sep 2024 → Sep 2026
            </span>
          </h3>
          <p className="text-[10px] font-mono-data text-[#BAC7D5] tracking-wide">
            TRACKING 24-MONTH REGIME EXPANSION & THE KINETIC SURGE SINCE THE OUTBREAK OF WAR IN IRAN (FEB 2026)
          </p>
        </div>

        {/* Action Controls: View switcher & Fullscreen */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Filter Switcher */}
          <div className="flex items-center bg-black/80 p-1 rounded-lg border border-[#B08D57]/30 text-[10px] font-mono-data shadow-inner">
            <button
              id="gpr-view-24m"
              onClick={() => {
                setViewFilter("24M");
                setSelectedMilestoneMonth(null);
              }}
              className={`px-2.5 py-1 rounded transition-all uppercase font-medium ${
                viewFilter === "24M"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md"
                  : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
              }`}
            >
              24M Timeline
            </button>
            <button
              id="gpr-view-war"
              onClick={() => {
                setViewFilter("WAR_PHASE");
                setSelectedMilestoneMonth(null);
              }}
              className={`px-2.5 py-1 rounded transition-all uppercase font-medium flex items-center gap-1 ${
                viewFilter === "WAR_PHASE"
                  ? "bg-[#A6291C] text-[#EDE9DE] font-bold shadow-md"
                  : "text-[#BAC7D5] hover:text-[#FFA4A4] hover:bg-white/5"
              }`}
            >
              <Flame className="w-3 h-3 text-[#FFA4A4]" />
              War Phase (Feb &apos;26+)
            </button>
            <button
              id="gpr-view-split"
              onClick={() => {
                setViewFilter("SPLIT");
                setSelectedMilestoneMonth(null);
              }}
              className={`px-2.5 py-1 rounded transition-all uppercase font-medium ${
                viewFilter === "SPLIT"
                  ? "bg-[#3B82F6] text-white font-bold shadow-md"
                  : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
              }`}
            >
              Regime Split
            </button>
          </div>

          {/* Export Visual & Data Dropdown */}
          <ChartExportDropdown
            chartTitle="Geopolitical Risk (GPR) Index 24M Trajectory"
            chartContainerId="gpr-historical-chart-container"
            subtitle={`SMC GEOPOLITICAL RISK // CURRENT GPR: ${(currentLiveGpr || fullDataset[fullDataset.length - 1].gpr).toFixed(1)} PTS // VIEW: ${viewFilter}`}
            customPngOptions={[
              {
                id: "gpr-kpi-cards-png",
                label: "Photo 1: Growth KPIs & War Surge Summary",
                sublabel: "24M Expansion, Rise Since War in Iran & Baseline Alert",
                iconColor: "#E5C794",
                onExport: async () => {
                  await exportChartElementAsPng(
                    "gpr-kpi-summary-cards",
                    `smc-gpr-expansion-kpis-${viewFilter.toLowerCase()}`,
                    "Geopolitical Risk (GPR) 24M Expansion & War Surge Summary",
                    `CALDARA-IACOVIELLO BENCHMARK // CURRENT GPR: ${(currentLiveGpr || fullDataset[fullDataset.length - 1].gpr).toFixed(1)} PTS`
                  );
                },
              },
              {
                id: "gpr-chart-area-png",
                label: "Photo 2: 24M Trajectory Chart Area",
                sublabel: "Historical curve, War outbreak point, MacroMicro sub-indices",
                iconColor: "#38BDF8",
                onExport: async () => {
                  await exportChartElementAsPng(
                    "gpr-main-chart-area",
                    `smc-gpr-trajectory-chart-${viewFilter.toLowerCase()}`,
                    "Geopolitical Risk (GPR) Index 24M Trajectory & War Outbreak Curve",
                    `DEFCON 2 REGIME // WAR OUTBREAK FEB 2026 // VIEW: ${viewFilter}`
                  );
                },
              },
              {
                id: "gpr-complete-dashboard-png",
                label: "Full GPR Visual Dashboard",
                sublabel: "Complete stacked report with cards, chart & timeline",
                iconColor: "#B08D57",
                onExport: async () => {
                  await exportChartElementAsPng(
                    "gpr-historical-chart-container",
                    `smc-gpr-full-dashboard-${viewFilter.toLowerCase()}`,
                    "Geopolitical Risk (GPR) Index 24M Trajectory & Telemetry",
                    `SIN MIEDO CAPITAL // VIEW: ${viewFilter}`
                  );
                },
              }
            ]}
            getCsvData={() => {
              const headers = [
                "Month",
                "GPR Composite (pts)",
                "GPR Threats (GPRT)",
                "GPR Acts (GPRA)",
                "Brent Spot ($/bbl)",
                "Brent War Premium ($/bbl)",
                "Gold Spot ($/oz)",
                "Risk Category",
                "Historical Milestone Event",
              ];
              const rows = filteredData.map((d) => [
                d.month,
                d.gpr.toFixed(1),
                d.gprThreats.toFixed(1),
                d.gprActs.toFixed(1),
                d.brentPrice.toFixed(2),
                d.warRiskPremium ? d.warRiskPremium.toFixed(2) : "0.00",
                d.goldPrice.toFixed(2),
                d.category,
                d.event || "-",
              ]);

              return {
                filename: `smc-gpr-index-trajectory-${viewFilter.toLowerCase()}`,
                headers,
                rows,
                metaComments: [
                  "SIN MIEDO CAPITAL // GEOPOLITICAL RISK (GPR) 24M TRAJECTORY",
                  `Caldara-Iacoviello Index: ${(currentLiveGpr || fullDataset[fullDataset.length - 1].gpr).toFixed(1)} pts (DEFCON 2)`,
                  `Active Filter: ${viewFilter}`,
                  "Energy & Shipping Shock: Strait of Hormuz / Bab el-Mandeb AIS Spoofing & Cape Diversions",
                ],
              };
            }}
            onExportPdf={() => {
              exportGoldGprChartPdf(
                filteredData[filteredData.length - 1].goldPrice,
                currentLiveGpr || filteredData[filteredData.length - 1].gpr
              );
            }}
          />

          {onExpandToggle && (
            <button
              data-export-ignore="true"
              onClick={onExpandToggle}
              title={isExpanded ? "Collapse View" : "Expand Fullscreen"}
              aria-label={isExpanded ? "Collapse View" : "Expand Fullscreen"}
              className="p-1.5 rounded-lg bg-black/70 border border-[#B08D57]/30 text-[#BAC7D5] hover:text-[#E5C794] transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary KPI Growth Cards (Specifically Addressing User's 2 Questions) */}
      <div id="gpr-kpi-summary-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        {/* Card 1: 24-Month Total Growth */}
        <div className="bg-black/50 border border-[#B08D57]/40 rounded-lg p-3 relative overflow-hidden group hover:border-[#B08D57] transition-all">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#E5C794] mb-1">
            <span className="uppercase tracking-wider font-semibold">24-Month Expansion</span>
            <span className="text-[#B08D57] bg-[#B08D57]/20 px-1.5 py-0.5 rounded text-[9px]">
              Sep &apos;24 → Sep &apos;26
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-data text-[#E5C794] leading-tight">
              +{analytics.growth24mPct}%
            </span>
            <span className="text-xs font-mono-data text-[#BAC7D5]">
              (+{analytics.growth24mPts} pts)
            </span>
          </div>
          <div className="text-[9.5px] font-mono-data text-[#BAC7D5] mt-1.5 pt-1.5 border-t border-[#B08D57]/20 flex justify-between">
            <span>Start: {analytics.startGpr24m} pts</span>
            <span className="text-[#EDE9DE] font-semibold">Peak: {analytics.currentGpr} pts</span>
          </div>
        </div>

        {/* Card 2: Rise Since Start of War in Iran (Feb 2026) - USER's EXACT FOCUS */}
        <div className="bg-gradient-to-br from-[#A6291C]/35 to-black/70 border border-[#A6291C]/80 rounded-lg p-3 relative overflow-hidden shadow-[0_0_18px_rgba(166,41,28,0.2)] group hover:border-[#FF4545] transition-all">
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#FF4545]/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#FF8585] mb-1">
            <span className="uppercase tracking-wider font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#FF4545]" />
              Rise Since War in Iran
            </span>
            <span className="bg-[#A6291C] text-[#EDE9DE] font-bold text-[8.5px] px-1.5 py-0.5 rounded">
              Feb &apos;26 Outbreak
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-data text-[#FF8585] leading-tight">
              +{analytics.growthSincePreWarPct}%
            </span>
            <span className="text-xs font-mono-data text-[#FFA4A4]">
              (+{analytics.growthSincePreWarPts} pts)
            </span>
          </div>
          <div className="text-[9.5px] font-mono-data text-[#FFA4A4]/90 mt-1.5 pt-1.5 border-t border-[#A6291C]/40 flex justify-between">
            <span>Pre-War: {analytics.preWarBaselineGpr} pts</span>
            <span className="font-semibold text-white">+{analytics.growthSinceWarStartPts} pts since Feb print</span>
          </div>
        </div>

        {/* Card 3: War Share of Total Expansion */}
        <div className="bg-black/50 border border-[#B08D57]/30 rounded-lg p-3 relative overflow-hidden group hover:border-[#B08D57] transition-all">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#BAC7D5] mb-1">
            <span className="uppercase tracking-wider font-semibold">War Surge Share</span>
            <span className="text-[#FF8585] bg-[#A6291C]/20 px-1.5 py-0.5 rounded text-[9px]">
              Last 7 Months
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight">
              {analytics.warShareOfTotalGrowthPct}%
            </span>
            <span className="text-xs font-mono-data text-[#8292A6]">
              of all 24M growth
            </span>
          </div>
          <div className="text-[9.5px] font-mono-data text-[#BAC7D5] mt-1.5 pt-1.5 border-t border-[#B08D57]/20 flex justify-between">
            <span>Velocity:</span>
            <span className="text-[#FF8585] font-semibold">{analytics.accelerationFactor}x acceleration</span>
          </div>
        </div>

        {/* Card 4: Current Benchmark Status */}
        <div className="bg-black/50 border border-[#A6291C]/50 rounded-lg p-3 relative overflow-hidden group hover:border-[#A6291C] transition-all">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] mb-1">
            <span className="uppercase tracking-wider font-semibold">Current GPR Index</span>
            <span className="text-[#FF8585] font-bold text-[9px] bg-[#A6291C]/30 px-1.5 py-0.5 rounded border border-[#A6291C]/60">
              &gt;360 ALERT
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-data text-[#FF8585] leading-tight">
              {analytics.currentGpr}
            </span>
            <span className="text-xs font-mono-data text-[#8292A6]">
              / 100 base
            </span>
          </div>
          <div className="text-[9.5px] font-mono-data text-[#BAC7D5] mt-1.5 pt-1.5 border-t border-[#B08D57]/20 flex justify-between">
            <span>Historical baseline:</span>
            <span className="text-[#FF8585] font-semibold">+264.5% vs peacetime</span>
          </div>
        </div>
      </div>

      {/* Chart Section Container for Photo 2 Export */}
      <div id="gpr-main-chart-area" className="space-y-2.5">
        {/* Secondary Overlays & MacroMicro Decomposition Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5 px-1 text-[10px] font-mono-data text-[#8292A6]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* MacroMicro Sub-Index Toggles (User Request) */}
          <div className="flex items-center gap-1 bg-black/80 p-1 rounded-lg border border-[#38BDF8]/40 shadow-inner">
            <span className="text-[#38BDF8] uppercase font-bold text-[9px] px-1.5 flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#38BDF8]" />
              MacroMicro Index:
            </span>
            <button
              id="gpr-toggle-threats"
              onClick={() => setShowGprThreats(!showGprThreats)}
              className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1.5 ${
                showGprThreats
                  ? "bg-[#EF4444]/25 text-[#FCA5A5] border-[#EF4444] font-bold shadow-sm"
                  : "bg-black/40 text-[#8292A6] border-white/10 hover:text-[#EDE9DE]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showGprThreats ? "bg-[#EF4444]" : "bg-[#8292A6]"}`} />
              <span>GPR Index: Threats</span>
            </button>
            <button
              id="gpr-toggle-acts"
              onClick={() => setShowGprActs(!showGprActs)}
              className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1.5 ${
                showGprActs
                  ? "bg-[#EAB308]/25 text-[#FEF08A] border-[#EAB308] font-bold shadow-sm"
                  : "bg-black/40 text-[#8292A6] border-white/10 hover:text-[#EDE9DE]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showGprActs ? "bg-[#EAB308]" : "bg-[#8292A6]"}`} />
              <span>GPR Index: Acts</span>
            </button>
            <button
              id="gpr-toggle-both-subindices"
              onClick={() => {
                const enableBoth = !(showGprThreats && showGprActs);
                setShowGprThreats(enableBoth);
                setShowGprActs(enableBoth);
              }}
              title="Toggle Both Threats and Acts"
              className={`px-1.5 py-0.5 rounded border text-[8.5px] uppercase font-semibold transition-all ${
                showGprThreats && showGprActs
                  ? "bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/50"
                  : "bg-black/30 text-[#8292A6] border-white/10 hover:text-white"
              }`}
            >
              {showGprThreats && showGprActs ? "Hide Both" : "Both"}
            </button>
          </div>

          {/* Cross-Asset Transmission Overlays */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-[#B08D57]/30">
            <span className="text-[#BAC7D5] uppercase font-semibold text-[9px] px-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#B08D57]" />
              Assets:
            </span>
            <button
              id="gpr-toggle-brent"
              onClick={() => setSecondaryOverlay(secondaryOverlay === "brent" ? "none" : "brent")}
              className={`px-2 py-0.5 rounded border transition-all ${
                secondaryOverlay === "brent"
                  ? "bg-[#E5A158]/30 text-[#E5A158] border-[#E5A158] font-bold"
                  : "bg-black/40 text-[#8292A6] border-[#B08D57]/20 hover:text-[#EDE9DE]"
              }`}
            >
              Brent ($/bbl)
            </button>
            <button
              id="gpr-toggle-gold"
              onClick={() => setSecondaryOverlay(secondaryOverlay === "gold" ? "none" : "gold")}
              className={`px-2 py-0.5 rounded border transition-all ${
                secondaryOverlay === "gold"
                  ? "bg-[#B08D57]/30 text-[#E5C794] border-[#B08D57] font-bold"
                  : "bg-black/40 text-[#8292A6] border-[#B08D57]/20 hover:text-[#EDE9DE]"
              }`}
            >
              Gold ($/oz)
            </button>
            <button
              id="gpr-toggle-premium"
              onClick={() => setSecondaryOverlay(secondaryOverlay === "premium" ? "none" : "premium")}
              className={`px-2 py-0.5 rounded border transition-all ${
                secondaryOverlay === "premium"
                  ? "bg-[#A6291C]/30 text-[#FFA4A4] border-[#A6291C] font-bold"
                  : "bg-black/40 text-[#8292A6] border-[#B08D57]/20 hover:text-[#EDE9DE]"
              }`}
            >
              War Premium ($)
            </button>
          </div>

          {/* Geopolitical Context Overlay Toggle (User Request) */}
          <div className="flex items-center gap-1 bg-black/80 p-1 rounded-lg border border-[#A6291C]/50 shadow-inner">
            <button
              id="gpr-toggle-geopolitical-context"
              onClick={() => setShowGeopoliticalContext(!showGeopoliticalContext)}
              className={`px-2.5 py-0.5 rounded border transition-all flex items-center gap-1.5 ${
                showGeopoliticalContext
                  ? "bg-[#A6291C]/40 text-[#FFA4A4] border-[#FF4545] font-bold shadow-sm"
                  : "bg-black/40 text-[#8292A6] border-white/10 hover:text-[#EDE9DE]"
              }`}
            >
              <Newspaper className={`w-3 h-3 ${showGeopoliticalContext ? "text-[#FF8585]" : "text-[#8292A6]"}`} />
              <span>Geopolitical Context</span>
              <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                showGeopoliticalContext ? "bg-[#FF4545] text-black" : "bg-white/10 text-[#8292A6]"
              }`}>
                {iranianEscalationEvents.length}
              </span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap text-[9px]">
          <div className="flex items-center gap-1">
            <span className="w-3 h-1 bg-[#38BDF8] rounded-full inline-block" />
            <span className="text-[#38BDF8] font-bold">GPR Index</span>
          </div>
          {showGprThreats && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-1 bg-[#EF4444] rounded-full inline-block" />
              <span className="text-[#FCA5A5] font-semibold">Threats (GPRT)</span>
            </div>
          )}
          {showGprActs && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-1 bg-[#EAB308] rounded-full inline-block" />
              <span className="text-[#FEF08A] font-semibold">Acts (GPRA)</span>
            </div>
          )}
          {showGeopoliticalContext && (
            <div className="flex items-center gap-1 bg-[#A6291C]/20 border border-[#A6291C]/50 px-1.5 py-0.5 rounded text-[8.5px] text-[#FFA4A4]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4545]" />
              <span>Iranian Escalation Wire Overlay</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 bg-[#B08D57] rounded-full inline-block" />
            <span className="text-[#8292A6]">Pre-War Era</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 bg-[#FF4545] rounded-full inline-block" />
            <span className="text-[#FF8585] font-semibold">⚡ War in Iran (Feb &apos;26+)</span>
          </div>
        </div>
      </div>

      {/* MacroMicro Acts & Threats Insight Banner */}
      {(showGprThreats || showGprActs) && (
        <div
          id="gpr-macromicro-banner"
          className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 mb-2.5 bg-gradient-to-r from-[#0E1A2B] via-black/80 to-[#1F1610] border border-[#38BDF8]/40 rounded-lg text-[10px] font-mono-data shadow-inner"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span className="text-[#38BDF8] font-bold uppercase tracking-wider">
              MacroMicro Decomposition:
            </span>
            <span className="text-[#EDE9DE]">
              <strong className="text-[#38BDF8]">GPR Benchmark ({analytics.currentGpr} pts)</strong>
              {showGprThreats && (
                <>
                  <span className="text-[#8292A6] mx-1.5">•</span>
                  <strong className="text-[#FCA5A5]">Threats: {analytics.currentGprThreats} pts (+{analytics.threatsGrowthSincePreWarPct}% vs pre-war)</strong>
                </>
              )}
              {showGprActs && (
                <>
                  <span className="text-[#8292A6] mx-1.5">•</span>
                  <strong className="text-[#FEF08A]">Acts: {analytics.currentGprActs} pts (+{analytics.actsGrowthSincePreWarPct}% vs pre-war)</strong>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-[#FEF08A] bg-[#EAB308]/20 px-2 py-0.5 rounded border border-[#EAB308]/40 font-semibold">
            ⚡ Kinetic War Signature: Acts exploded from 207 → 314 pts in Feb &apos;26 (+51.7%), overtaking Threats
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 bg-black/70 rounded-lg border border-[#B08D57]/20 p-2 sm:p-3">
        {/* SVG War Phase Callout Badge floating top-center */}
        <div className="absolute top-4 right-4 sm:right-8 z-10 pointer-events-none bg-black/80 border border-[#A6291C]/70 px-2.5 py-1 rounded shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF4545]" />
          <span className="text-[9.5px] font-mono-data text-[#FFA4A4] font-bold">
            WAR OUTBREAK POINT: FEB 2026 (+140.0 PTS SURGE)
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 25, right: 30, left: 0, bottom: 5 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                setHoveredPoint(state.activePayload[0].payload as GprHistoricalPoint);
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              {/* MacroMicro Sky Blue Gradient for Composite GPR */}
              <linearGradient id="gprCompositeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#0284C7" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
              </linearGradient>

              {/* Pre-War Gold/Bronze Gradient */}
              <linearGradient id="gprPreWarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B08D57" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#B08D57" stopOpacity={0.02} />
              </linearGradient>

              {/* Kinetic War Crimson Gradient */}
              <linearGradient id="gprWarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4545" stopOpacity={0.75} />
                <stop offset="50%" stopColor="#A6291C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#A6291C" stopOpacity={0.05} />
              </linearGradient>

              {/* War Shaded Background Zone */}
              <linearGradient id="warZonePattern" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A6291C" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#A6291C" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#B08D57" strokeOpacity={0.12} />

            <XAxis
              dataKey="displayMonth"
              stroke="#8292A6"
              tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#B08D57", strokeOpacity: 0.3 }}
              axisLine={{ stroke: "#B08D57", strokeOpacity: 0.3 }}
            />

            <YAxis
              domain={[100, 420]}
              stroke="#8292A6"
              tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#B08D57", strokeOpacity: 0.3 }}
              axisLine={{ stroke: "#B08D57", strokeOpacity: 0.3 }}
              tickFormatter={(v) => `${v}`}
              width={42}
            />

            {/* Secondary YAxis if overlay enabled */}
            {secondaryOverlay !== "none" && (
              <YAxis
                yAxisId="secondary"
                orientation="right"
                domain={
                  secondaryOverlay === "brent"
                    ? [65, 105]
                    : secondaryOverlay === "gold"
                    ? [2400, 4300]
                    : [0, 20]
                }
                stroke={
                  secondaryOverlay === "brent"
                    ? "#E5A158"
                    : secondaryOverlay === "gold"
                    ? "#E5C794"
                    : "#FFA4A4"
                }
                tick={{ fontSize: 9, fontFamily: "monospace" }}
                tickFormatter={(v) =>
                  secondaryOverlay === "gold"
                    ? `$${v}`
                    : secondaryOverlay === "brent"
                    ? `$${v}`
                    : `+$${v}`
                }
                width={48}
              />
            )}

            {/* Critical GPR Alert Threshold Line (>360) */}
            <ReferenceLine
              y={360}
              stroke="#FF4545"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "CRITICAL THREAT ALERT (>360)",
                fill: "#FFA4A4",
                fontSize: 9,
                position: "insideTopRight",
                fontFamily: "monospace"
              }}
            />

            {/* Elevated Baseline Line (200) */}
            <ReferenceLine
              y={200}
              stroke="#B08D57"
              strokeDasharray="2 2"
              strokeOpacity={0.4}
              label={{
                value: "Severe Risk (200)",
                fill: "#8292A6",
                fontSize: 8,
                position: "insideBottomLeft",
                fontFamily: "monospace"
              }}
            />

            {/* Historical Peacetime Baseline (100) */}
            <ReferenceLine
              y={100}
              stroke="#10B981"
              strokeDasharray="3 3"
              strokeOpacity={0.3}
              label={{
                value: "Peacetime Baseline (100)",
                fill: "#10B981",
                fontSize: 8,
                position: "insideBottomLeft",
                fontFamily: "monospace"
              }}
            />

            {/* WAR IN IRAN OUTBREAK VERTICAL REFERENCE LINE (FEB 2026) */}
            {viewFilter !== "WAR_PHASE" && (
              <ReferenceLine
                x="Feb '26"
                stroke="#FF4545"
                strokeWidth={2.5}
                label={{
                  value: "⚡ WAR IN IRAN (FEB '26)",
                  fill: "#FF8585",
                  fontSize: 10,
                  position: "top",
                  fontWeight: "bold",
                  fontFamily: "monospace"
                }}
              />
            )}

            {/* Geopolitical Context Active Escalation Reference Line */}
            {showGeopoliticalContext && activeEscalation && activeEscalation.displayMonth !== "Feb '26" && (
              <ReferenceLine
                x={activeEscalation.displayMonth}
                stroke="#FF8585"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `WIRE: ${activeEscalation.displayMonth}`,
                  fill: "#FFA4A4",
                  fontSize: 8.5,
                  position: "top",
                  fontWeight: "bold",
                  fontFamily: "monospace"
                }}
              />
            )}

            {/* Shaded War Escalation Regime Area */}
            {viewFilter !== "WAR_PHASE" && (
              <ReferenceArea
                x1="Feb '26"
                x2="Sep '26"
                fill="url(#warZonePattern)"
                fillOpacity={1}
                stroke="#A6291C"
                strokeOpacity={0.3}
              />
            )}

            {/* Custom Tooltip */}
            <Tooltip
              content={<CustomGprTooltip showGeopoliticalContext={showGeopoliticalContext} />}
              cursor={{ stroke: "#38BDF8", strokeWidth: 1, strokeDasharray: "4 4" }}
            />

            {/* Main Benchmark Area: Composite GPR Index (MacroMicro Sky Blue) */}
            <Area
              type="monotone"
              dataKey="gpr"
              stroke="#38BDF8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gprCompositeGradient)"
              activeDot={{ r: 6, fill: "#38BDF8", stroke: "#EDE9DE", strokeWidth: 2 }}
              name="Geopolitical Risk Index"
            />

            {/* Geopolitical Context Overlay Reference Dots for Major Iranian Escalation Dates */}
            {showGeopoliticalContext &&
              iranianEscalationEvents
                .filter(evt => viewFilter !== "WAR_PHASE" || evt.month >= "2026-01")
                .map((evt) => {
                  const isSelected = evt.id === activeEscalation.id;
                  const isWar = evt.phase !== "pre-war";
                  const isOutbreak = evt.month === "2026-02";

                  return (
                    <ReferenceDot
                      key={`geo-dot-${evt.id}`}
                      x={evt.displayMonth}
                      y={evt.gprLevel}
                      r={isSelected ? 6.5 : isOutbreak ? 5.5 : 4}
                      fill={isSelected ? "#FFFFFF" : isOutbreak ? "#FF4545" : isWar ? "#EF4444" : "#EAB308"}
                      stroke={isSelected ? "#FF4545" : "#0A111C"}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                  );
                })}

            {/* Geopolitical Risk Index: Threats (MacroMicro Red) */}
            {showGprThreats && (
              <Line
                type="monotone"
                dataKey="gprThreats"
                stroke="#EF4444"
                strokeWidth={2.2}
                dot={{ r: 2.5, fill: "#DC2626", stroke: "#FCA5A5", strokeWidth: 1 }}
                activeDot={{ r: 5, fill: "#EF4444", stroke: "#FFF", strokeWidth: 2 }}
                name="Geopolitical Risk Index: Threats"
              />
            )}

            {/* Geopolitical Risk Index: Acts (MacroMicro Yellow / Gold) */}
            {showGprActs && (
              <Line
                type="monotone"
                dataKey="gprActs"
                stroke="#EAB308"
                strokeWidth={2.2}
                dot={{ r: 2.5, fill: "#CA8A04", stroke: "#FEF08A", strokeWidth: 1 }}
                activeDot={{ r: 5, fill: "#EAB308", stroke: "#FFF", strokeWidth: 2 }}
                name="Geopolitical Risk Index: Acts"
              />
            )}

            {/* Secondary Overlays */}
            {secondaryOverlay === "brent" && (
              <Line
                yAxisId="secondary"
                type="monotone"
                dataKey="brentPrice"
                stroke="#E5A158"
                strokeWidth={1.8}
                dot={false}
                name="Brent Crude ($/bbl)"
              />
            )}

            {secondaryOverlay === "gold" && (
              <Line
                yAxisId="secondary"
                type="monotone"
                dataKey="goldPrice"
                stroke="#E5C794"
                strokeWidth={1.8}
                strokeDasharray="3 2"
                dot={false}
                name="Gold Spot ($/oz)"
              />
            )}

            {secondaryOverlay === "premium" && (
              <Line
                yAxisId="secondary"
                type="monotone"
                dataKey="warRiskPremium"
                stroke="#FFA4A4"
                strokeWidth={1.8}
                dot={false}
                name="War Premium ($/bbl)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      </div>

      {/* Interactive Milestone Rail & Active Point Details */}
      <div className="mt-4 pt-3 border-t border-[#B08D57]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono-data text-[#E5C794] font-semibold uppercase tracking-wider">
            <Crosshair className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>Historical Geopolitical Event Timeline (Click Month to Inspect)</span>
          </div>
          <span className="text-[9px] font-mono-data text-[#8292A6]">
            Selected: <strong className="text-[#EDE9DE]">{activeDetailPoint.displayMonth}</strong> ({activeDetailPoint.gpr} pts)
          </span>
        </div>

        {/* Scrollable Month Pills Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#B08D57]/30">
          {fullDataset.map((point) => {
            const isSelected = activeDetailPoint.month === point.month;
            const isWarPoint = point.month >= GPR_WAR_START_MONTH;
            const isOutbreak = point.month === GPR_WAR_START_MONTH;
            const escalation = getIranianEscalationForMonth(point.month);

            return (
              <button
                key={point.month}
                onClick={() => {
                  setSelectedMilestoneMonth(point.month);
                  if (escalation) {
                    setSelectedEscalationId(escalation.id);
                  }
                }}
                title={escalation ? `⚡ Iranian Escalation Wire: ${escalation.title}` : undefined}
                className={`px-2 py-1 rounded text-[9.5px] font-mono-data whitespace-nowrap transition-all border shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? isWarPoint
                      ? "bg-[#A6291C] text-white border-[#FF4545] font-bold shadow-md scale-105 ring-1 ring-[#FF8585]"
                      : "bg-[#B08D57] text-[#0A111C] border-[#B08D57] font-bold shadow-md scale-105"
                    : escalation
                    ? isOutbreak
                      ? "bg-[#A6291C]/50 text-[#FFA4A4] border-[#FF4545] font-semibold"
                      : "bg-black/70 text-[#FFA4A4] border-[#A6291C]/50 hover:bg-[#A6291C]/30"
                    : isWarPoint
                    ? "bg-black/50 text-[#FF8585] border-[#A6291C]/40 hover:bg-[#A6291C]/20"
                    : "bg-black/40 text-[#BAC7D5] border-[#B08D57]/20 hover:bg-white/5"
                }`}
              >
                {isOutbreak ? (
                  <Flame className="w-3 h-3 text-[#FF4545] animate-pulse" />
                ) : escalation ? (
                  <Radio className="w-2.5 h-2.5 text-[#FF8585]" />
                ) : null}
                <span>{point.displayMonth}</span>
                <span className="opacity-80 text-[8.5px]">({point.gpr})</span>
              </button>
            );
          })}
        </div>

        {/* Highlighted Event Detail Card */}
        <div className={`mt-2 p-3 rounded-lg border transition-all ${
          activeDetailPoint.phase === "war-escalation"
            ? "bg-gradient-to-r from-[#A6291C]/25 to-black/60 border-[#A6291C]/60"
            : "bg-black/60 border-[#B08D57]/30"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono-data font-bold px-2 py-0.5 rounded border uppercase ${
                activeDetailPoint.phase === "war-escalation"
                  ? "bg-[#A6291C] text-white border-[#FF4545]"
                  : "bg-[#B08D57]/30 text-[#E5C794] border-[#B08D57]/50"
              }`}>
                {activeDetailPoint.phase === "war-escalation" ? "⚡ KINETIC WAR ESCALATION" : "PRE-WAR MARITIME FRICTION"}
              </span>
              <span className="text-xs font-mono-data font-bold text-[#FBF8F1]">
                {activeDetailPoint.displayMonth} • GPR Index {activeDetailPoint.gpr} pts
              </span>
            </div>

            {/* Delta metrics relative to user queries */}
            <div className="flex items-center gap-3 text-[10px] font-mono-data">
              <span className="text-[#8292A6]">
                vs 24M Start (Sep &apos;24):{" "}
                <strong className="text-[#E5C794]">
                  +{Number((activeDetailPoint.gpr - startGpr).toFixed(1))} pts (+{Number(((activeDetailPoint.gpr - startGpr)/startGpr * 100).toFixed(1))}%)
                </strong>
              </span>
              {activeDetailPoint.month >= "2026-01" && (
                <span className="text-[#FFA4A4]">
                  vs Pre-War (Jan &apos;26):{" "}
                  <strong className="text-[#FF8585]">
                    +{Number((activeDetailPoint.gpr - preWarGpr).toFixed(1))} pts (+{Number(((activeDetailPoint.gpr - preWarGpr)/preWarGpr * 100).toFixed(1))}%)
                  </strong>
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-[#EDE9DE] font-sans leading-relaxed">
            {activeDetailPoint.event}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-2 pt-2 border-t border-[#B08D57]/15 text-[9.5px] font-mono-data">
            <div>
              <span className="text-[#38BDF8] block">Composite GPR:</span>
              <span className="text-[#38BDF8] font-bold">{activeDetailPoint.gpr} pts</span>
            </div>
            <div>
              <span className="text-[#FCA5A5] block">Threats (GPRT):</span>
              <span className="text-[#FCA5A5] font-bold">{activeDetailPoint.gprThreats} pts</span>
            </div>
            <div>
              <span className="text-[#FEF08A] block">Acts (GPRA):</span>
              <span className="text-[#FEF08A] font-bold">{activeDetailPoint.gprActs} pts</span>
            </div>
            <div>
              <span className="text-[#8292A6] block">Brent Crude:</span>
              <span className="text-[#E5A158] font-semibold">${activeDetailPoint.brentPrice.toFixed(2)}/bbl</span>
            </div>
            <div>
              <span className="text-[#8292A6] block">Gold Spot:</span>
              <span className="text-[#E5C794] font-semibold">${activeDetailPoint.goldPrice.toFixed(2)}/oz</span>
            </div>
            <div>
              <span className="text-[#8292A6] block">War Risk Premium:</span>
              <span className="text-[#FF8585] font-semibold">+${activeDetailPoint.warRiskPremium.toFixed(2)}/bbl</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geopolitical Context Overlay: Iranian Escalation Intelligence Wire & News Snippets */}
      {showGeopoliticalContext && (
        <GeopoliticalContextDossier
          selectedEventId={activeEscalation.id}
          onSelectEvent={(evt) => {
            setSelectedEscalationId(evt.id);
            setSelectedMilestoneMonth(evt.month);
          }}
          onClose={() => setShowGeopoliticalContext(false)}
          onJumpToChartMilestone={(month) => {
            setSelectedMilestoneMonth(month);
          }}
        />
      )}
    </div>
  );
};

// Custom Tooltip Component for GPR Chart with Geopolitical News Wire Integration
interface CustomGprTooltipProps {
  active?: boolean;
  payload?: any[];
  showGeopoliticalContext?: boolean;
}

const CustomGprTooltip = ({ active, payload, showGeopoliticalContext = true }: CustomGprTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as GprHistoricalPoint;
    const isWar = data.phase === "war-escalation";
    const startGpr = 148.5;
    const preWarBaseline = 224.5;

    const deltaFromStart = Number((data.gpr - startGpr).toFixed(1));
    const deltaFromStartPct = Number(((deltaFromStart / startGpr) * 100).toFixed(1));

    const deltaFromWar = Number((data.gpr - preWarBaseline).toFixed(1));
    const deltaFromWarPct = Number(((deltaFromWar / preWarBaseline) * 100).toFixed(1));

    const escalation = getIranianEscalationForMonth(data.month);

    return (
      <div className="bg-[#0A111C]/95 border border-[#38BDF8]/60 p-3 rounded-lg shadow-2xl backdrop-blur-md max-w-sm z-50 text-left font-mono-data">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-[#38BDF8]/20">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-[#FBF8F1]">{data.displayMonth}</span>
            {escalation && (
              <span className="text-[8px] bg-[#A6291C]/40 text-[#FFA4A4] border border-[#FF4545]/60 px-1 py-0.2 rounded font-bold">
                ⚡ WIRE
              </span>
            )}
          </div>
          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase ${
            isWar ? "bg-[#A6291C] text-white" : "bg-[#B08D57]/30 text-[#E5C794]"
          }`}>
            {isWar ? "⚡ WAR ESCALATION" : "PRE-WAR"}
          </span>
        </div>

        {/* MacroMicro Decomposition Series */}
        <div className="space-y-1 mb-2 bg-black/50 p-2 rounded border border-white/5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] text-[#38BDF8] uppercase font-bold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-[#38BDF8]" />
              GPR Index:
            </span>
            <span className="text-sm font-bold text-[#38BDF8]">
              {data.gpr} pts
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] text-[#FCA5A5] uppercase font-semibold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-[#EF4444]" />
              Threats (GPRT):
            </span>
            <span className="text-xs font-bold text-[#FCA5A5]">
              {data.gprThreats} pts
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] text-[#FEF08A] uppercase font-semibold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-[#EAB308]" />
              Acts (GPRA):
            </span>
            <span className="text-xs font-bold text-[#FEF08A]">
              {data.gprActs} pts
            </span>
          </div>
        </div>

        {/* Two Growth Questions: 24M Growth & Rise Since War */}
        <div className="space-y-1 text-[9.5px] py-1.5 border-y border-[#B08D57]/15">
          <div className="flex justify-between items-center text-[#8292A6]">
            <span>24M Growth (vs Sep &apos;24):</span>
            <span className="text-[#38BDF8] font-bold">
              +{deltaFromStartPct}% (+{deltaFromStart} pts)
            </span>
          </div>

          {data.month >= "2026-01" ? (
            <div className="flex justify-between items-center text-[#FFA4A4]">
              <span>Rise Since War in Iran:</span>
              <span className="text-[#FF8585] font-bold">
                +{deltaFromWarPct}% (+{deltaFromWar} pts)
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center text-[#8292A6]">
              <span>To War Start (Feb &apos;26):</span>
              <span className="text-[#8292A6]">Pre-war build-up</span>
            </div>
          )}
        </div>

        {/* Geopolitical Context Escalation Wire Snippet */}
        {showGeopoliticalContext && escalation && (
          <div className="my-2 p-2 rounded bg-[#A6291C]/25 border border-[#FF4545]/60 text-left">
            <div className="flex items-center justify-between text-[8px] text-[#FFA4A4] uppercase font-bold mb-1">
              <span className="flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-[#FF8585] animate-pulse" />
                {escalation.source}
              </span>
              <span className="text-[#EDE9DE] font-mono">{escalation.exactDate}</span>
            </div>
            <div className="text-[10px] font-serif font-bold text-[#FBF8F1] leading-tight mb-1">
              {escalation.headline}
            </div>
            <div className="text-[9px] font-sans text-[#EDE9DE]/90 leading-snug line-clamp-3">
              &ldquo;{escalation.newsSnippet}&rdquo;
            </div>
          </div>
        )}

        {/* Baseline milestone event */}
        {!escalation && (
          <div className="mt-2 text-[9.5px] text-[#EDE9DE] font-sans leading-tight">
            {data.event}
          </div>
        )}

        {/* Correlated Assets */}
        <div className="flex justify-between items-center text-[9px] text-[#8292A6] mt-2 pt-1 border-t border-[#B08D57]/15">
          <span>Brent: ${data.brentPrice.toFixed(2)}</span>
          <span>Gold: ${data.goldPrice.toFixed(0)}</span>
          <span>War Premium: +${data.warRiskPremium.toFixed(1)}</span>
        </div>
      </div>
    );
  }
  return null;
};
