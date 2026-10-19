import React, { useState, useMemo, useEffect, useCallback } from "react";
import { apiFetch } from "../api";
import { createPortal } from "react-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Maximize2,
  Minimize2,
  Info,
  Scale,
  Activity,
  Sliders,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Landmark,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  BarChart3,
  Calendar,
  Clock,
  Zap,
  Check
} from "lucide-react";

interface LiquidityDriverTrackerProps {
  isCalmMode?: boolean;
  className?: string;
}

type ViewMode = "CURRENT_LEVELS" | "DEBT_BUYBACK" | "TRAJECTORY_SHIFT" | "NET_LIQUIDITY_INDEX";

interface LiquidityItem {
  id: "reserves" | "rrp" | "tga" | "netLiquidity";
  name: string;
  shortLabel: string;
  tickerCode: string;
  category: "RESERVES" | "DRAIN" | "TREASURY" | "SYNTHETIC";
  currentValueB: number; // in $ Billion
  prevMonthValueB: number;
  peakValueB: number;
  change7dB: number;
  change7dPct: number;
  operationalFloorB?: number;
  operationalTargetB?: number;
  color: string;
  accentColor: string;
  statusBadge: string;
  statusType: "emerald" | "amber" | "rose" | "cyan";
  transmissionDescription: string;
  marketImpact: string;
}

export const LiquidityDriverTracker: React.FC<LiquidityDriverTrackerProps> = ({
  isCalmMode = false,
  className = ""
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("CURRENT_LEVELS");
  const [unitMode, setUnitMode] = useState<"BILLION" | "TRILLION">("BILLION");
  const [simulatedTgaShiftB, setSimulatedTgaShiftB] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);

  // US Debt Buyback Program State (Last week, the US doubled bond buybacks to $6 billion)
  const [buybackSimWeeklyB, setBuybackSimWeeklyB] = useState<number>(6.0);
  const [buybackApiData, setBuybackApiData] = useState<any>(null);
  const [isBuybackLoading, setIsBuybackLoading] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  // Fetch live buyback telemetry from /api/liquidity/debt-buyback with auto-polling
  const loadDebtBuyback = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsBuybackLoading(true);
    try {
      const res = await apiFetch("/api/liquidity/debt-buyback");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBuybackApiData(data);
          // If the user hasn't overridden with a custom value, reflect the active API pace
          if (typeof data.weeklyPaceB === "number" && !isBackground) {
            setBuybackSimWeeklyB(data.weeklyPaceB);
          }
          setLastSyncTime(new Date().toTimeString().split(" ")[0] + " UTC");
        }
      }
    } catch {
      // Fallback gracefully
    } finally {
      if (!isBackground) {
        setTimeout(() => setIsBuybackLoading(false), 250);
      }
    }
  }, []);

  // Periodic Auto-Refresh for future Treasury decisions (every 15s)
  useEffect(() => {
    loadDebtBuyback(false);
    const interval = setInterval(() => {
      loadDebtBuyback(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadDebtBuyback]);

  const handleManualRefreshBuyback = () => {
    loadDebtBuyback(false);
  };

  // Submit or Apply a Future Treasury Decision
  const handleApplyDecisionScenario = async (paceB: number, title?: string, note?: string) => {
    setIsSubmittingDecision(true);
    try {
      const res = await apiFetch("/api/liquidity/debt-buyback/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyPaceB: paceB, title, note })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setBuybackApiData(result.data);
          setBuybackSimWeeklyB(result.data.weeklyPaceB);
          setLastSyncTime(new Date().toTimeString().split(" ")[0] + " UTC");
          setDecisionFeedback(`Decision applied: $${paceB.toFixed(1)}B/wk active`);
          setTimeout(() => setDecisionFeedback(null), 3500);
        }
      } else {
        throw new Error("Failed to post decision");
      }
    } catch {
      setBuybackSimWeeklyB(paceB);
      setDecisionFeedback(`Simulated locally: $${paceB.toFixed(1)}B/wk`);
      setTimeout(() => setDecisionFeedback(null), 3000);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleResetDecision = async () => {
    setIsSubmittingDecision(true);
    try {
      const res = await apiFetch("/api/liquidity/debt-buyback/reset", { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setBuybackApiData(result.data);
          setBuybackSimWeeklyB(result.data.weeklyPaceB);
          setLastSyncTime(new Date().toTimeString().split(" ")[0] + " UTC");
          setDecisionFeedback("Reset to official baseline ($6.0B doubled)");
          setTimeout(() => setDecisionFeedback(null), 3000);
        }
      }
    } catch {
      setBuybackSimWeeklyB(6.0);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // US Debt Buyback Derived Calculations
  const activeWeeklyBuybackB = buybackSimWeeklyB;
  const activeAnnualizedBuybackB = activeWeeklyBuybackB * 52;
  const activeMonthlyLiquidityB = activeWeeklyBuybackB * 4;
  const activeDv01ExtractedM = Number((activeWeeklyBuybackB * 7.8).toFixed(1));
  const activeTermPremiumImpactBps = Number((-2.37 * activeWeeklyBuybackB).toFixed(1));
  const activeDealerReliefB = Number((activeWeeklyBuybackB * 3.07).toFixed(1));
  const activeFedQtOffsetPct = Math.min(100, Math.round((activeMonthlyLiquidityB / 25) * 100));

  // Trajectory series: 6 weeks tracking the ramp from $3.0B to $6.0B doubled pace
  const defaultBuybackTrajectory = useMemo(() => [
    { week: "Wk -4", amountB: 2.5, type: "Baseline Test", isDoubled: false, color: "#64748B" },
    { week: "Wk -3", amountB: 3.0, type: "Regular Schedule", isDoubled: false, color: "#64748B" },
    { week: "Wk -2", amountB: 3.0, type: "Regular Schedule", isDoubled: false, color: "#64748B" },
    { week: "Last Wk (Doubled)", amountB: 6.0, type: "EXPANSION TRIGGER (+100%)", isDoubled: true, color: "#B08D57" },
    { week: "Current Wk", amountB: buybackSimWeeklyB, type: "Active Window", isDoubled: buybackSimWeeklyB >= 5.0, color: "#E5C794" },
    { week: "Next Wk (Proj)", amountB: buybackSimWeeklyB, type: "Scheduled Operations", isDoubled: buybackSimWeeklyB >= 5.0, color: "#10B981" }
  ], [buybackSimWeeklyB]);

  const buybackTrajectory = useMemo(() => {
    if (buybackApiData?.weeklyTrajectory) {
      return buybackApiData.weeklyTrajectory.map((t: any) => ({
        ...t,
        amountB: t.week.includes("Current") || t.week.includes("Next") ? buybackSimWeeklyB : t.amountB,
        color: t.isDoubled ? "#B08D57" : "#64748B"
      }));
    }
    return defaultBuybackTrajectory;
  }, [buybackApiData, buybackSimWeeklyB, defaultBuybackTrajectory]);

  // Maturity Buckets Allocation
  const buybackBuckets = useMemo(() => [
    {
      bucket: "2Y – 5Y Off-The-Run Notes",
      shortLabel: "2Y-5Y Notes",
      allocatedB: Number((buybackSimWeeklyB * 0.30).toFixed(2)),
      pctShare: 30.0,
      eligibleCusips: 14,
      dealerAbsorption: "High",
      purpose: "Relieves short-dated inventory backlog from primary dealer balance sheets"
    },
    {
      bucket: "5Y – 10Y Benchmark Notes",
      shortLabel: "5Y-10Y Notes",
      allocatedB: Number((buybackSimWeeklyB * 0.35).toFixed(2)),
      pctShare: 35.0,
      eligibleCusips: 18,
      dealerAbsorption: "Maximum",
      purpose: "Anchor liquidity support for the core belly of the US Treasury curve"
    },
    {
      bucket: "10Y – 30Y Long Bonds",
      shortLabel: "10Y-30Y Bonds",
      allocatedB: Number((buybackSimWeeklyB * 0.183).toFixed(2)),
      pctShare: 18.3,
      eligibleCusips: 12,
      dealerAbsorption: "Moderate",
      purpose: "Extracts ultra-long duration, suppressing term premium and anchoring 30Y yields"
    },
    {
      bucket: "TIPS (1Y – 30Y Real)",
      shortLabel: "TIPS Real",
      allocatedB: Number((buybackSimWeeklyB * 0.083).toFixed(2)),
      pctShare: 8.3,
      eligibleCusips: 8,
      dealerAbsorption: "Targeted",
      purpose: "Backstops secondary market liquidity in inflation-protected securities"
    },
    {
      bucket: "Cash Management (<1Y Bills/Notes)",
      shortLabel: "Cash Mgmt",
      allocatedB: Number((buybackSimWeeklyB * 0.083).toFixed(2)),
      pctShare: 8.3,
      eligibleCusips: 6,
      dealerAbsorption: "Operational",
      purpose: "Smooths TGA cash volatility around corporate tax remittance dates"
    }
  ], [buybackSimWeeklyB]);

  // Keyboard escape listener for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  // Lock body scroll when in fullscreen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  // Base Data Model (benchmarked to Federal Reserve H.4.1 & Treasury TIC telemetry)
  const fedTotalAssets = 6980; // $6.98 Trillion
  const baseReserves = 3280; // $3.28 Trillion
  const baseRrp = 215; // $215 Billion
  const baseTga = 785; // $785 Billion

  // Dynamic simulation values (e.g. if Treasury refills TGA by +$100B, because RRP is drained <$250B, reserves absorb ~85% of shock)
  const simulatedTga = baseTga + simulatedTgaShiftB;
  const simulatedRrp = Math.max(25, baseRrp - (simulatedTgaShiftB > 0 ? simulatedTgaShiftB * 0.15 : 0));
  const simulatedReserves = Math.max(
    2500,
    baseReserves - (simulatedTgaShiftB > 0 ? simulatedTgaShiftB * 0.85 : simulatedTgaShiftB)
  );

  // Synthetic Net Liquidity = Fed Assets - TGA - RRP
  const netFedLiquidity = fedTotalAssets - simulatedTga - simulatedRrp;
  const netLiquidityWoWDelta = -38.4 - (simulatedTgaShiftB > 0 ? simulatedTgaShiftB * 0.85 : 0);

  // Drivers Metadata
  const drivers: LiquidityItem[] = useMemo(
    () => [
      {
        id: "reserves",
        name: "Fed Bank Reserves",
        shortLabel: "Bank Reserves",
        tickerCode: "H.4.1 WRESBAL",
        category: "RESERVES",
        currentValueB: simulatedReserves,
        prevMonthValueB: 3245,
        peakValueB: 4290,
        change7dB: +14.2,
        change7dPct: +0.43,
        operationalFloorB: 3000,
        operationalTargetB: 3200,
        color: "#10B981", // Emerald
        accentColor: "#34D399",
        statusBadge: simulatedReserves >= 3000 ? "AMPLE RESERVES" : "NEAR FLOOR",
        statusType: simulatedReserves >= 3000 ? "emerald" : "amber",
        transmissionDescription:
          "Commercial bank liquidity at the 12 Federal Reserve Banks. When above $3,000B, interbank lending (SOFR) remains anchored without repo facility panic.",
        marketImpact:
          "High positive correlation (+0.88) with S&P 500 and risk assets. Reserves cushion against treasury auction settlement volatility."
      },
      {
        id: "rrp",
        name: "Overnight Reverse Repo (RRP)",
        shortLabel: "Reverse Repo",
        tickerCode: "NY FED ON-RRP",
        category: "DRAIN",
        currentValueB: simulatedRrp,
        prevMonthValueB: 280,
        peakValueB: 2554,
        change7dB: -8.7,
        change7dPct: -3.89,
        operationalFloorB: 150,
        operationalTargetB: 500,
        color: "#F59E0B", // Amber Gold
        accentColor: "#FBBF24",
        statusBadge: "BUFFER EXHAUSTED",
        statusType: "rose",
        transmissionDescription:
          "Cash parked by money market funds at the Fed. Formerly absorbed over $2.5T in liquidity, shielding bank reserves during the 2022-2024 QT cycle.",
        marketImpact:
          "Because RRP is down 91.5% from peak, it can no longer cushion new Treasury bond issuance; upcoming TGA rebuilds will drain bank reserves 1:1."
      },
      {
        id: "tga",
        name: "Treasury General Account (TGA)",
        shortLabel: "Treasury TGA",
        tickerCode: "WTGAC US TRSY",
        category: "TREASURY",
        currentValueB: simulatedTga,
        prevMonthValueB: 742,
        peakValueB: 1780,
        change7dB: +46.8 + simulatedTgaShiftB,
        change7dPct: +6.34,
        operationalFloorB: 750,
        operationalTargetB: 850,
        color: "#0284C7", // Sky Blue
        accentColor: "#38BDF8",
        statusBadge: simulatedTga >= 750 ? "TARGET BAND" : "BELOW TARGET",
        statusType: "cyan",
        transmissionDescription:
          "The US Department of the Treasury's operating checking account held at the NY Fed. Rising TGA sucks cash out of the private financial banking system.",
        marketImpact:
          "TGA build is a direct liquidity drain (inverse correlation with crypto and equities). Weekly tax inflows or debt sales drain private deposits."
      }
    ],
    [simulatedReserves, simulatedRrp, simulatedTga, simulatedTgaShiftB]
  );

  // Formatted Chart Data for the 3 distinct modes
  const trajectoryShiftData = useMemo(() => [
    {
      name: "Fed Bank Reserves",
      shortName: "Bank Reserves",
      current: unitMode === "TRILLION" ? simulatedReserves / 1000 : simulatedReserves,
      prevMonth: unitMode === "TRILLION" ? 3245 / 1000 : 3245,
      peak: unitMode === "TRILLION" ? 4290 / 1000 : 4290,
      color: "#10B981"
    },
    {
      name: "Reverse Repo (RRP)",
      shortName: "Reverse Repo",
      current: unitMode === "TRILLION" ? simulatedRrp / 1000 : simulatedRrp,
      prevMonth: unitMode === "TRILLION" ? 280 / 1000 : 280,
      peak: unitMode === "TRILLION" ? 2554 / 1000 : 2554,
      color: "#F59E0B"
    },
    {
      name: "Treasury General Account",
      shortName: "Treasury (TGA)",
      current: unitMode === "TRILLION" ? simulatedTga / 1000 : simulatedTga,
      prevMonth: unitMode === "TRILLION" ? 742 / 1000 : 742,
      peak: unitMode === "TRILLION" ? 1780 / 1000 : 1780,
      color: "#0284C7"
    }
  ], [unitMode, simulatedReserves, simulatedRrp, simulatedTga]);

  const netLiquidityIndexData = useMemo(() => [
    {
      name: "Fed Total Assets",
      shortName: "Fed Assets",
      value: unitMode === "TRILLION" ? fedTotalAssets / 1000 : fedTotalAssets,
      color: "#8292A6",
      category: "Asset Base"
    },
    {
      name: "Net Fed Liquidity",
      shortName: "Net Liquidity",
      value: unitMode === "TRILLION" ? netFedLiquidity / 1000 : netFedLiquidity,
      color: "#E5C794",
      category: "Synthetic Metric"
    },
    {
      name: "Fed Bank Reserves",
      shortName: "Bank Reserves",
      value: unitMode === "TRILLION" ? simulatedReserves / 1000 : simulatedReserves,
      color: "#10B981",
      category: "Ample Reserves"
    },
    {
      name: "Treasury Account (TGA)",
      shortName: "TGA",
      value: unitMode === "TRILLION" ? simulatedTga / 1000 : simulatedTga,
      color: "#0284C7",
      category: "Liquidity Drain"
    },
    {
      name: "Reverse Repo (RRP)",
      shortName: "ON RRP",
      value: unitMode === "TRILLION" ? simulatedRrp / 1000 : simulatedRrp,
      color: "#F59E0B",
      category: "Exhausted Buffer"
    }
  ], [unitMode, fedTotalAssets, netFedLiquidity, simulatedReserves, simulatedTga, simulatedRrp]);

  const currentDriversData = useMemo(() => {
    return drivers.map((d) => ({
      id: d.id,
      name: d.name,
      shortName: d.shortLabel,
      ticker: d.tickerCode,
      value: unitMode === "TRILLION" ? d.currentValueB / 1000 : d.currentValueB,
      rawB: d.currentValueB,
      floor: d.operationalFloorB
        ? unitMode === "TRILLION"
          ? d.operationalFloorB / 1000
          : d.operationalFloorB
        : undefined,
      target: d.operationalTargetB
        ? unitMode === "TRILLION"
          ? d.operationalTargetB / 1000
          : d.operationalTargetB
        : undefined,
      color: d.color,
      accentColor: d.accentColor,
      status: d.statusBadge,
      change7dB: d.change7dB,
      change7dPct: d.change7dPct
    }));
  }, [drivers, unitMode]);

  // Custom Chart Tooltip
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const displayVal =
        unitMode === "TRILLION"
          ? `$${Number(data.value || payload[0].value).toFixed(2)} Trillion`
          : `$${Number(data.value || payload[0].value).toLocaleString()} Billion`;

      const driverMatch = drivers.find(
        (d) => d.shortLabel === data.shortName || d.name === data.name
      );

      return (
        <div className="bg-[#0A111C]/95 border border-[#B08D57]/45 rounded-lg p-3 shadow-2xl backdrop-blur-md font-mono-data text-xs max-w-xs z-50">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#1E2738] text-[10px]">
            <span className="font-bold text-[#EDE9DE] uppercase tracking-wider">
              {data.name}
            </span>
            {driverMatch && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 border border-[#2B3545] text-[#BAC7D5]">
                {driverMatch.tickerCode}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[#8292A6]">Current Level:</span>
              <span className="text-sm font-bold text-[#EDE9DE] font-sans">{displayVal}</span>
            </div>

            {driverMatch && (
              <>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#8292A6]">7-Day Shift:</span>
                  <span
                    className={`font-semibold flex items-center gap-0.5 ${
                      driverMatch.change7dB >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {driverMatch.change7dB >= 0 ? "+" : ""}
                    {driverMatch.change7dB.toFixed(1)}B ({driverMatch.change7dPct >= 0 ? "+" : ""}
                    {driverMatch.change7dPct}%)
                  </span>
                </div>

                {driverMatch.operationalFloorB && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#8292A6]">Operating Floor:</span>
                    <span className="text-[#E5C794]">${driverMatch.operationalFloorB}B</span>
                  </div>
                )}

                <div className="pt-1.5 border-t border-[#1E2738] text-[9px] text-[#BAC7D5] leading-relaxed">
                  {driverMatch.transmissionDescription}
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Buyback Bar Tooltip
  const CustomBuybackBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0A111C]/95 border border-[#B08D57]/50 rounded-lg p-3 shadow-2xl backdrop-blur-md font-mono-data text-xs max-w-xs z-50">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#1E2738] text-[10px]">
            <span className="font-bold text-[#EDE9DE] uppercase tracking-wider">
              {data.week}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                data.isDoubled
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-black/60 text-[#BAC7D5] border border-[#2B3545]"
              }`}
            >
              {data.type}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[#8292A6]">Weekly Volume:</span>
              <span className="text-sm font-bold text-[#E5C794] font-sans">
                ${data.amountB.toFixed(1)} Billion
              </span>
            </div>
            {data.isDoubled && (
              <div className="text-[9.5px] text-emerald-400 font-semibold pt-1 border-t border-[#1E2738] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#B08D57]" />
                <span>Doubled by Treasury (+100% WoW Expansion)</span>
              </div>
            )}
            <div className="text-[9px] text-[#8292A6]">
              Annualized Run-Rate: ${(data.amountB * 52).toFixed(0)}B / year
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderContent = (inFullscreen: boolean) => (
    <div
      id={inFullscreen ? "liquidity-driver-tracker-fullscreen" : "liquidity-driver-tracker-card"}
      className={`bg-[#0F1622] border border-[#B08D57]/35 rounded-xl shadow-2xl overflow-hidden transition-all relative ${
        inFullscreen
          ? "w-full max-w-7xl max-h-[94vh] overflow-y-auto bg-[#0A111C] p-4 sm:p-6 border-[#B08D57]/60 shadow-[0_0_80px_rgba(0,0,0,0.95)]"
          : "p-4 sm:p-5"
      } ${className}`}
    >
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #B08D57 1px, transparent 1px),
            linear-gradient(to bottom, #B08D57 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px"
        }}
      />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#B08D57]/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black/70 border border-[#B08D57]/40 flex items-center justify-center shadow-inner">
            <DollarSign className="w-5 h-5 text-[#B08D57]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-[#EDE9DE] uppercase font-sans flex items-center gap-2">
                <span>US Liquidity Driver Telemetry</span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono-data px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>FED H.4.1 // NY FED REPO FEED</span>
              </span>
            </div>
            <p className="text-[10px] font-mono-data text-[#8292A6]">
              FED BANK RESERVES • REVERSE REPO FACILITY (RRP) • TREASURY GENERAL ACCOUNT (TGA)
            </p>
          </div>
        </div>

        {/* View Mode Controls & Unit Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-data">
          {/* Unit Switcher */}
          <div className="flex items-center bg-black/60 p-0.5 rounded border border-[#2B3545]">
            <button
              onClick={() => setUnitMode("BILLION")}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                unitMode === "BILLION"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              $B
            </button>
            <button
              onClick={() => setUnitMode("TRILLION")}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                unitMode === "TRILLION"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              $T
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-black/60 p-0.5 rounded border border-[#2B3545]">
            <button
              onClick={() => setViewMode("CURRENT_LEVELS")}
              className={`px-2.5 py-1 rounded text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "CURRENT_LEVELS"
                  ? "bg-[#1E2738] text-[#EDE9DE] font-bold border border-[#B08D57]/40 shadow"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <span>Current Drivers</span>
            </button>
            <button
              id="liquidity-mode-debt-buyback-btn"
              onClick={() => setViewMode("DEBT_BUYBACK")}
              className={`px-2.5 py-1 rounded text-[10px] transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "DEBT_BUYBACK"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md"
                  : "text-[#E5C794] hover:text-[#FBF8F1] hover:bg-white/5"
              }`}
            >
              <Landmark className="w-3 h-3" />
              <span>Debt Buybacks ($6.0B/Wk)</span>
              <span className={`text-[8.5px] px-1 py-0.2 rounded font-bold ${
                viewMode === "DEBT_BUYBACK"
                  ? "bg-black/30 text-[#0A111C]"
                  : "bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse"
              }`}>
                DOUBLED
              </span>
            </button>
            <button
              onClick={() => setViewMode("TRAJECTORY_SHIFT")}
              className={`px-2.5 py-1 rounded text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "TRAJECTORY_SHIFT"
                  ? "bg-[#1E2738] text-[#EDE9DE] font-bold border border-[#B08D57]/40 shadow"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <span>Trajectory Shift</span>
            </button>
            <button
              onClick={() => setViewMode("NET_LIQUIDITY_INDEX")}
              className={`px-2.5 py-1 rounded text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "NET_LIQUIDITY_INDEX"
                  ? "bg-[#1E2738] text-[#EDE9DE] font-bold border border-[#B08D57]/40 shadow"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <span>Net Index ($5.98T)</span>
            </button>
          </div>

          {/* Fullscreen Expand Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
              inFullscreen
                ? "bg-[#A6291C]/20 border-[#A6291C]/50 text-[#FFA4A4] hover:bg-[#A6291C]/40"
                : "bg-black/60 border-[#2B3545] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#B08D57]/40"
            }`}
            title={inFullscreen ? "Exit Fullscreen [ESC]" : "Expand to Fullscreen"}
            aria-label={inFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen"}
          >
            {inFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline text-[10px] font-mono-data font-bold">CLOSE [ESC]</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] font-mono-data">EXPAND</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Banner: US Treasury Bond Buyback Acceleration Bulletin */}
      <div className="relative z-10 mb-4 p-3 bg-gradient-to-r from-[#17130B] via-[#1C1811] to-[#0E1522] border border-[#B08D57]/50 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#B08D57]/20 border border-[#B08D57]/50 flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4 text-[#E5C794]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded bg-[#B08D57] text-[#0A111C] uppercase tracking-wider">
                US TREASURY ACTION // $6.0B/WEEK
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#FBF8F1]">
                Weekly Bond Buybacks Doubled to $6.0 Billion ($312B/Yr Pace)
              </span>
              <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ACTIVE LIQUIDITY SUPPORT
              </span>
            </div>
            <p className="text-[10.5px] font-mono-data text-[#BAC7D5] mt-0.5 leading-relaxed">
              Last week, the US Treasury doubled its weekly bond buyback operations to $6.0 billion ($312B annualized), providing crucial liquidity support across off-the-run notes and long bonds. This extracts duration from Primary Dealer balance sheets (DV01 -$46.8M/bp/wk), serving as a direct stealth QE proxy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode !== "DEBT_BUYBACK" ? (
            <button
              onClick={() => setViewMode("DEBT_BUYBACK")}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono-data font-bold uppercase tracking-wider bg-[#B08D57] hover:bg-[#C9A46D] text-[#0A111C] shadow-[0_0_15px_rgba(176,141,87,0.3)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Landmark className="w-3 h-3" />
              <span>Inspect Buybacks ($6.0B)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => setViewMode("CURRENT_LEVELS")}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono-data font-semibold text-[#8292A6] hover:text-[#EDE9DE] bg-black/60 border border-[#2B3545] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Back to Current Drivers</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards: The 3 Core Drivers or Debt Buyback Transmission */}
      {viewMode === "DEBT_BUYBACK" ? (
        /* Debt Buyback 4 Specialized KPIs */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 relative z-10 font-mono-data">
          {/* Card 1: Weekly Buyback Velocity */}
          <div className="p-3 rounded-lg border border-[#B08D57]/60 bg-[#B08D57]/15 shadow-[0_0_20px_rgba(176,141,87,0.15)]">
            <div className="flex items-center justify-between text-[10px] text-[#8292A6] mb-1">
              <span className="font-semibold text-[#E5C794]">WEEKLY BUYBACK PACE</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[9px] animate-pulse">
                +100% DOUBLED
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-[#FBF8F1]">
                ${activeWeeklyBuybackB.toFixed(2)}
                <span className="text-xs font-normal text-[#8292A6] ml-1">B / Wk</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                Doubled from $3.0B
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#B08D57]/30 flex items-center justify-between text-[9px] text-[#BAC7D5]">
              <span>Prior Baseline: $3.0B/wk</span>
              <span className="text-[#E5C794] font-semibold">Active Run-Rate</span>
            </div>
          </div>

          {/* Card 2: Annualized Absorption Run-Rate */}
          <div className="p-3 rounded-lg border border-[#1E2738] bg-black/45">
            <div className="flex items-center justify-between text-[10px] text-[#8292A6] mb-1">
              <span className="font-semibold text-[#EDE9DE]">ANNUALIZED ABSORPTION</span>
              <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-bold border border-sky-500/30 text-[9px]">
                STEALTH QE PROXY
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-sky-400">
                ${activeAnnualizedBuybackB.toFixed(1)}
                <span className="text-xs font-normal text-[#8292A6] ml-1">B / Yr</span>
              </span>
              <span className="text-[10px] text-[#BAC7D5]">
                ~4.5% of Fed Assets
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1E2738] flex items-center justify-between text-[9px] text-[#8292A6]">
              <span>Fed QT Offset:</span>
              <span className="text-emerald-400 font-bold">{activeFedQtOffsetPct}% of Monthly QT</span>
            </div>
          </div>

          {/* Card 3: Primary Dealer Bid-to-Cover */}
          <div className="p-3 rounded-lg border border-[#1E2738] bg-black/45">
            <div className="flex items-center justify-between text-[10px] text-[#8292A6] mb-1">
              <span className="font-semibold text-[#EDE9DE]">DEALER BID-TO-COVER</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 text-[9px]">
                HIGH PARTICIPATION
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-amber-300">
                3.42x
                <span className="text-xs font-normal text-[#8292A6] ml-1">Cover</span>
              </span>
              <span className="text-[10px] text-[#8292A6]">
                $20.5B Tendered
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1E2738] flex items-center justify-between text-[9px] text-[#8292A6]">
              <span>Dealer Relief:</span>
              <span className="text-[#EDE9DE] font-semibold">+{activeDealerReliefB}B Headroom</span>
            </div>
          </div>

          {/* Card 4: Net Duration Extraction (DV01) */}
          <div className="p-3 rounded-lg border border-[#1E2738] bg-black/45">
            <div className="flex items-center justify-between text-[10px] text-[#8292A6] mb-1">
              <span className="font-semibold text-[#EDE9DE]">DURATION EXTRACTED (DV01)</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30 text-[9px]">
                TERM PREMIUM
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-rose-300">
                -{activeDv01ExtractedM}
                <span className="text-xs font-normal text-[#8292A6] ml-1">M / bp</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {activeTermPremiumImpactBps} bps
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1E2738] flex items-center justify-between text-[9px] text-[#8292A6]">
              <span>WAM Retired: 7.8 Years</span>
              <span className="text-emerald-400">MOVE Vol -22 pts</span>
            </div>
          </div>
        </div>
      ) : (
        /* Standard 4 KPI Cards: Reserves, RRP, TGA, Net Fed Liquidity */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 relative z-10">
          {/* Card 1: Fed Bank Reserves */}
          <div
            onClick={() => setActiveDriverId(activeDriverId === "reserves" ? null : "reserves")}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              activeDriverId === "reserves"
                ? "bg-[#10B981]/15 border-[#10B981]/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-black/45 border-[#1E2738] hover:border-[#10B981]/40"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] mb-1">
              <span className="font-semibold text-[#EDE9DE]">FED BANK RESERVES</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 text-[9px]">
                AMPLE &gt;$3.0T
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE]">
                ${(simulatedReserves / (unitMode === "TRILLION" ? 1000 : 1)).toLocaleString(undefined, {
                  minimumFractionDigits: unitMode === "TRILLION" ? 2 : 0,
                  maximumFractionDigits: unitMode === "TRILLION" ? 3 : 0
                })}
                <span className="text-xs font-normal text-[#8292A6] ml-1">
                  {unitMode === "TRILLION" ? "T" : "B"}
                </span>
              </span>
              <span className="text-[10px] font-mono-data text-emerald-400 font-semibold flex items-center">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                +$14.2B WoW
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1E2738] flex items-center justify-between text-[9px] font-mono-data text-[#8292A6]">
              <span>Operating Floor: $3,000B</span>
              <span className="text-[#EDE9DE]">Threshold: &lt;$2,800B</span>
            </div>
          </div>

          {/* Card 2: Reverse Repo Facility (RRP) */}
          <div
            onClick={() => setActiveDriverId(activeDriverId === "rrp" ? null : "rrp")}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              activeDriverId === "rrp"
                ? "bg-[#F59E0B]/15 border-[#F59E0B]/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-black/45 border-[#1E2738] hover:border-[#F59E0B]/40"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] mb-1">
              <span className="font-semibold text-[#EDE9DE]">REVERSE REPO (ON RRP)</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30 text-[9px]">
                -91.5% OFF PEAK
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold font-mono-data text-amber-300">
                ${(simulatedRrp / (unitMode === "TRILLION" ? 1000 : 1)).toLocaleString(undefined, {
                  minimumFractionDigits: unitMode === "TRILLION" ? 3 : 0,
                  maximumFractionDigits: unitMode === "TRILLION" ? 3 : 0
                })}
                <span className="text-xs font-normal text-[#8292A6] ml-1">
                  {unitMode === "TRILLION" ? "T" : "B"}
                </span>
              </span>
              <span className="text-[10px] font-mono-data text-rose-400 font-semibold flex items-center">
                <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                -$8.7B WoW
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1E2738] flex items-center justify-between text-[9px] font-mono-data text-[#8292A6]">
              <span>Peak: $2,554B</span>
              <span className="text-rose-400 font-bold">Buffer Depleted</span>
            </div>
          </div>

          {/* Card 3: Treasury General Account (TGA) */}
          <div
            onClick={() => setActiveDriverId(activeDriverId === "tga" ? null : "tga")}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              activeDriverId === "tga"
                ? "bg-[#0284C7]/15 border-[#0284C7]/60 shadow-[0_0_15px_rgba(2,132,199,0.2)]"
                : "bg-black/45 border-[#1E2738] hover:border-[#0284C7]/40"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] mb-1">
              <span className="font-semibold text-[#EDE9DE]">TREASURY (TGA)</span>
              <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-bold border border-sky-500/30 text-[9px]">
                TARGET $750-$850B
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold font-mono-data text-sky-400">
                ${(simulatedTga / (unitMode === "TRILLION" ? 1000 : 1)).toLocaleString(undefined, {
                  minimumFractionDigits: unitMode === "TRILLION" ? 3 : 0,
                  maximumFractionDigits: unitMode === "TRILLION" ? 3 : 0
                })}
                <span className="text-xs font-normal text-[#8292A6] ml-1">
                  {unitMode === "TRILLION" ? "T" : "B"}
                </span>
              </span>
              <span className="text-[10px] font-mono-data text-amber-300 font-semibold flex items-center">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                +${(46.8 + simulatedTgaShiftB).toFixed(1)}B WoW
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1E2738] flex items-center justify-between text-[9px] font-mono-data text-[#8292A6]">
              <span>Held at NY Fed</span>
              <span className="text-amber-300">TGA ↑ = Liquidity ↓</span>
            </div>
          </div>

          {/* Card 4: Net Fed Liquidity Index (Synthetic Output) */}
          <div className="p-3 rounded-lg border border-[#B08D57]/45 bg-[#B08D57]/10 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] mb-1">
              <span className="font-semibold text-[#E5C794]">NET FED LIQUIDITY</span>
              <span className="px-1.5 py-0.5 rounded bg-[#B08D57]/25 text-[#EDE9DE] font-bold border border-[#B08D57]/40 text-[9px]">
                SYNTHETIC
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE]">
                ${(netFedLiquidity / (unitMode === "TRILLION" ? 1000 : 1)).toLocaleString(undefined, {
                  minimumFractionDigits: unitMode === "TRILLION" ? 2 : 0,
                  maximumFractionDigits: unitMode === "TRILLION" ? 3 : 0
                })}
                <span className="text-xs font-normal text-[#E5C794] ml-1">
                  {unitMode === "TRILLION" ? "T" : "B"}
                </span>
              </span>
              <span className="text-[10px] font-mono-data text-rose-400 font-semibold flex items-center">
                <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                {netLiquidityWoWDelta.toFixed(1)}B WoW
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#B08D57]/20 flex items-center justify-between text-[9px] font-mono-data text-[#BAC7D5]">
              <span>Formula: Assets - TGA - RRP</span>
              <span className="text-[#E5C794] font-semibold">TIGHTENING BIAS</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      <div className="bg-[#0B1019] border border-[#222C3D] rounded-xl p-4 mb-4 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1E2738]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#B08D57]" />
            <h4 className="text-xs font-bold text-[#EDE9DE] uppercase tracking-wider font-sans">
              {viewMode === "DEBT_BUYBACK" && "US Treasury Weekly Bond Buyback Operations // $6.0B Doubled Pacing"}
              {viewMode === "CURRENT_LEVELS" && "Current Balances vs Operating Thresholds"}
              {viewMode === "TRAJECTORY_SHIFT" && "3-Phase Trajectory: Current vs 1M Ago vs Historical Peak Buffer"}
              {viewMode === "NET_LIQUIDITY_INDEX" && "Complete Fed Balance Sheet & Net Liquidity Decomposition"}
            </h4>
          </div>

          {viewMode === "DEBT_BUYBACK" ? (
            <div className="flex items-center gap-3 text-[10px] font-mono-data text-[#8292A6]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]" />
                <span>Base Schedule ($3.0B/wk)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#B08D57]" />
                <span className="text-[#E5C794] font-bold">Doubled Pace ($6.0B/wk)</span>
              </div>
              <button
                onClick={handleManualRefreshBuyback}
                disabled={isBuybackLoading}
                className="p-1 rounded bg-black/60 hover:bg-white/5 border border-[#2B3545] text-[#BAC7D5] hover:text-[#EDE9DE] transition-colors"
                title="Refresh Buyback Telemetry"
              >
                <RefreshCw className={`w-3 h-3 ${isBuybackLoading ? "animate-spin text-[#B08D57]" : ""}`} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[10px] font-mono-data text-[#8292A6]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
                <span>Reserves ($3.28T)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                <span>ON RRP ($215B)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0284C7]" />
                <span>TGA ($785B)</span>
              </div>
            </div>
          )}
        </div>

        {/* The Recharts Bar Chart */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "DEBT_BUYBACK" ? (
              <BarChart
                data={buybackTrajectory}
                margin={{ top: 15, right: 20, left: 10, bottom: 20 }}
                barCategoryGap="22%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#8292A6"
                  tick={{ fill: "#BAC7D5", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#2B3545" }}
                  tickLine={{ stroke: "#2B3545" }}
                />
                <YAxis
                  stroke="#8292A6"
                  domain={[0, 8.0]}
                  tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#2B3545" }}
                  tickLine={{ stroke: "#2B3545" }}
                  tickFormatter={(val) => `$${val}B`}
                />
                <Tooltip content={<CustomBuybackBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                
                {/* Prior Baseline Reference Line */}
                <ReferenceLine
                  y={3.0}
                  stroke="#64748B"
                  strokeDasharray="4 4"
                  strokeOpacity={0.8}
                  label={{
                    value: "Prior Base Pace ($3.0B/wk)",
                    fill: "#94A3B8",
                    fontSize: 9,
                    position: "insideTopLeft",
                    fontFamily: "monospace"
                  }}
                />

                {/* Doubled Target Reference Line */}
                <ReferenceLine
                  y={6.0}
                  stroke="#B08D57"
                  strokeDasharray="4 4"
                  strokeOpacity={0.8}
                  label={{
                    value: "Doubled Pacing Target ($6.0B/wk)",
                    fill: "#E5C794",
                    fontSize: 9,
                    position: "insideTopRight",
                    fontFamily: "monospace"
                  }}
                />

                <Bar dataKey="amountB" name="Weekly Buyback" radius={[4, 4, 0, 0]}>
                  {buybackTrajectory.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-buyback-${index}`}
                      fill={entry.color || (entry.isDoubled ? "#B08D57" : "#64748B")}
                      stroke={entry.isDoubled ? "#E5C794" : undefined}
                      strokeWidth={entry.isDoubled ? 1.5 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : viewMode === "TRAJECTORY_SHIFT" ? (
              <BarChart
                data={trajectoryShiftData}
                margin={{ top: 15, right: 20, left: 10, bottom: 20 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#8292A6"
                  tick={{ fill: "#BAC7D5", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#2B3545" }}
                  tickLine={{ stroke: "#2B3545" }}
                />
                <YAxis
                  stroke="#8292A6"
                  tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#2B3545" }}
                  tickLine={{ stroke: "#2B3545" }}
                  tickFormatter={(val) =>
                    unitMode === "TRILLION" ? `$${val}T` : `$${val}B`
                  }
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="peak" name="Historical Peak" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prevMonth" name="1M Ago" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" name="Current Level" fill="#B08D57" radius={[4, 4, 0, 0]}>
                  {trajectoryShiftData.map((entry: any, index: number) => (
                    <Cell key={`cell-shift-${index}`} fill={entry.color || "#B08D57"} />
                  ))}
                </Bar>
              </BarChart>
            ) : viewMode === "NET_LIQUIDITY_INDEX" ? (
              <BarChart
                data={netLiquidityIndexData}
                margin={{ top: 15, right: 20, left: 10, bottom: 20 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#8292A6"
                  tick={{ fill: "#BAC7D5", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#2B3545" }}
                  tickLine={{ stroke: "#2B3545" }}
                />
                <YAxis
                  stroke="#8292A6"
                  tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#2B3545" }}
                  tickLine={{ stroke: "#2B3545" }}
                  tickFormatter={(val) =>
                    unitMode === "TRILLION" ? `$${val}T` : `$${val}B`
                  }
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" name="Balance ($)" radius={[4, 4, 0, 0]}>
                  {netLiquidityIndexData.map((entry: any, index: number) => (
                    <Cell key={`cell-index-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart
                data={currentDriversData}
                margin={{ top: 20, right: 25, left: 10, bottom: 20 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#8292A6"
                  tick={{ fill: "#BAC7D5", fontSize: 12, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#2B3545" }}
                  tickLine={{ stroke: "#2B3545" }}
                />
                <YAxis
                  stroke="#8292A6"
                  tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#2B3545" }}
                  tickLine={{ stroke: "#2B3545" }}
                  domain={[0, unitMode === "TRILLION" ? 4.0 : 4000]}
                  tickFormatter={(val) =>
                    unitMode === "TRILLION" ? `$${val}T` : `$${val}B`
                  }
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

                {/* Benchmark Reference Lines */}
                <ReferenceLine
                  y={unitMode === "TRILLION" ? 3.0 : 3000}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: "Ample Reserves Floor ($3.0T)",
                    fill: "#34D399",
                    fontSize: 9,
                    position: "insideTopRight",
                    fontFamily: "monospace"
                  }}
                />
                <ReferenceLine
                  y={unitMode === "TRILLION" ? 0.75 : 750}
                  stroke="#0284C7"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: "TGA Target Floor ($750B)",
                    fill: "#38BDF8",
                    fontSize: 9,
                    position: "insideBottomRight",
                    fontFamily: "monospace"
                  }}
                />

                <Bar dataKey="value" name="Current Level" radius={[4, 4, 0, 0]}>
                  {currentDriversData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${entry.id || index}`}
                      fill={entry.color}
                      stroke={entry.accentColor}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Context Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#1E2738] text-[10px] font-mono-data text-[#8292A6]">
          {viewMode === "DEBT_BUYBACK" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[#E5C794] font-semibold">Institutional Takeaway:</span>
                <span>
                  Last week's doubling to $6.0B/week injects $24B/month in cash velocity into Primary Dealer balance sheets, neutralizing 96% of Fed QT.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Annualized Pace:</span>
                <span className="text-emerald-400 font-bold uppercase">${activeAnnualizedBuybackB}B / Year</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[#E5C794] font-semibold">Institutional Insight:</span>
                <span>
                  Bank Reserves ($3.28T) remain ample &gt;$3.0T, but RRP depletion ($215B) removes the buffer against Treasury debt sales.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>RRP Buffer Status:</span>
                <span className="text-rose-400 font-bold uppercase">8.4% Remaining</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Debt Buyback Dedicated Sections (Maturity Buckets, Scenario Simulator, 3-Pillar Transmission, Docket) */}
      {viewMode === "DEBT_BUYBACK" && (
        <div className="space-y-4 mb-4 relative z-10 font-mono-data">
          {/* Section A: Maturity Buckets Allocation (Where the $6.0B Flows) */}
          <div className="bg-[#0B1019] border border-[#222C3D] rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#1E2738]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#B08D57]" />
                <span className="text-xs font-bold text-[#EDE9DE] uppercase tracking-wider font-sans">
                  Maturity Buckets Allocation // Where the ${activeWeeklyBuybackB.toFixed(1)}B Weekly Purchases Flow
                </span>
              </div>
              <span className="text-[10px] text-[#BAC7D5] bg-black/60 px-2 py-0.5 rounded border border-[#2B3545]">
                5 ACTIVE TRANCHES • {buybackBuckets.reduce((acc, b) => acc + b.eligibleCusips, 0)} ELIGIBLE CUSIPs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {buybackBuckets.map((bucket, idx) => (
                <div
                  key={bucket.bucket}
                  className="p-3 rounded-lg bg-black/40 border border-[#1E2738] hover:border-[#B08D57]/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#8292A6] mb-1">
                    <span className="font-semibold text-[#EDE9DE] truncate">{bucket.shortLabel}</span>
                    <span className="text-[#E5C794] font-bold">{bucket.pctShare}% Share</span>
                  </div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-lg font-bold text-[#FBF8F1]">
                      ${bucket.allocatedB.toFixed(2)}B
                    </span>
                    <span className="text-[9px] text-[#8292A6]">
                      {bucket.eligibleCusips} Target CUSIPs
                    </span>
                  </div>

                  {/* Progress bar visual */}
                  <div className="w-full bg-[#1E2738] h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-[#B08D57] to-[#E5C794] h-full rounded-full"
                      style={{ width: `${Math.min(100, bucket.pctShare * 2.5)}%` }}
                    />
                  </div>

                  <p className="text-[9px] text-[#BAC7D5] leading-relaxed line-clamp-2">
                    {bucket.purpose}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-[#1E2738] flex justify-between items-center text-[8.5px] text-[#8292A6]">
                    <span>Dealer Absorption:</span>
                    <span className="text-emerald-400 font-semibold">{bucket.dealerAbsorption}</span>
                  </div>
                </div>
              ))}

              {/* Summary Card for Execution Desk */}
              <div className="p-3 rounded-lg bg-[#B08D57]/10 border border-[#B08D57]/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#E5C794] mb-1 font-bold">
                    <span>EXECUTION SUMMARY</span>
                    <span>T+1 FEDWIRE</span>
                  </div>
                  <div className="text-xs text-[#EDE9DE] font-sans font-bold mb-1">
                    Off-The-Run Liquidity Backstop
                  </div>
                  <p className="text-[9px] text-[#BAC7D5] leading-relaxed">
                    Treasury acts as "buyer of last resort" for illiquid older paper, allowing dealers to recycle capital into upcoming new-issue auctions.
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-[#B08D57]/20 flex justify-between items-center text-[9px] text-[#E5C794]">
                  <span>Total Weekly Volume:</span>
                  <span className="font-bold text-sm text-[#FBF8F1]">${activeWeeklyBuybackB.toFixed(1)}B / Wk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Interactive Buyback Pacing Stress Simulator */}
          <div className="bg-black/50 border border-[#1E2738] rounded-xl p-3.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#B08D57]" />
                <span className="font-bold text-[#EDE9DE] uppercase tracking-wide">
                  Treasury Buyback Pacing Stress Simulator // Macro Sensitivity Tester
                </span>
              </div>
              {buybackSimWeeklyB !== 6.0 && (
                <button
                  onClick={() => setBuybackSimWeeklyB(6.0)}
                  className="flex items-center gap-1 text-[10px] text-[#8292A6] hover:text-[#EDE9DE] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Doubled Pacing ($6.0B)</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] mb-3">
              <span className="text-[#8292A6]">Simulate Weekly Program Pace:</span>
              {[
                { label: "Prior Baseline ($3.0B/wk)", value: 3.0 },
                { label: "Current Doubled Pace ($6.0B/wk)", value: 6.0, isDefault: true },
                { label: "Expanded Support ($8.0B/wk)", value: 8.0 },
                { label: "Max Stealth Twist ($10.0B/wk)", value: 10.0 }
              ].map((scenario) => (
                <button
                  key={scenario.label}
                  onClick={() => setBuybackSimWeeklyB(scenario.value)}
                  className={`px-2.5 py-1 rounded text-[10px] transition-all cursor-pointer flex items-center gap-1 ${
                    buybackSimWeeklyB === scenario.value
                      ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md"
                      : "bg-[#1E2738]/80 text-[#8292A6] hover:text-[#EDE9DE] border border-[#2B3545]"
                  }`}
                >
                  <span>{scenario.label}</span>
                  {scenario.isDefault && (
                    <span className="text-[8px] px-1 rounded bg-black/30 font-mono-data">ACTIVE</span>
                  )}
                </button>
              ))}
            </div>

            {/* Readout of Simulated Sensitivity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1E2738] text-[10px]">
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <span className="text-[#8292A6] block text-[9px]">ANNUALIZED RETIREMENT</span>
                <span className="text-sm font-bold text-[#EDE9DE] font-sans">${activeAnnualizedBuybackB}B / yr</span>
              </div>
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <span className="text-[#8292A6] block text-[9px]">MONTHLY GROSS CASH TO DEALERS</span>
                <span className="text-sm font-bold text-emerald-400 font-sans">+${activeMonthlyLiquidityB}B / mo</span>
              </div>
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <span className="text-[#8292A6] block text-[9px]">DEALER BALANCE SHEET HEADROOM</span>
                <span className="text-sm font-bold text-[#E5C794] font-sans">+{activeDealerReliefB}B</span>
              </div>
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <span className="text-[#8292A6] block text-[9px]">10Y TERM PREMIUM IMPACT</span>
                <span className="text-sm font-bold text-rose-300 font-sans">{activeTermPremiumImpactBps} bps</span>
              </div>
            </div>
          </div>

          {/* Section C: 3 Institutional Transmission Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
            <div className="p-3 bg-black/40 rounded-lg border border-[#1E2738]">
              <div className="text-[#8292A6] uppercase text-[9px] mb-1 flex items-center justify-between">
                <span>PILLAR 1: DEALER BALANCE SHEET RELIEF</span>
                <span className="text-emerald-400 font-bold">CRITICAL</span>
              </div>
              <div className="text-emerald-400 font-bold text-xs mb-1">
                Clearing Clogged Intermediary Desks
              </div>
              <p className="text-[9.5px] text-[#BAC7D5] leading-relaxed">
                Record US deficits flooded primary dealers with off-the-run inventory. Doubling buybacks to $6B/wk clears dealer balance sheets, keeping interbank repo spreads anchored and preventing auction tails.
              </p>
            </div>

            <div className="p-3 bg-black/40 rounded-lg border border-[#1E2738]">
              <div className="text-[#8292A6] uppercase text-[9px] mb-1 flex items-center justify-between">
                <span>PILLAR 2: STEALTH QE &amp; DURATION EXTRACTION</span>
                <span className="text-amber-300 font-bold">DURATION</span>
              </div>
              <div className="text-amber-300 font-bold text-xs mb-1">
                T-Bills Funded vs Long Coupons Retired
              </div>
              <p className="text-[9.5px] text-[#BAC7D5] leading-relaxed">
                Treasury issues ultra-short T-bills (absorbed by MMFs) and buys back 5Y-30Y coupons. This pulls DV01 duration out of the private market, compressing 10Y/30Y term premiums by ~14.2 bps.
              </p>
            </div>

            <div className="p-3 bg-black/40 rounded-lg border border-[#1E2738]">
              <div className="text-[#8292A6] uppercase text-[9px] mb-1 flex items-center justify-between">
                <span>PILLAR 3: NET LIQUIDITY IMPULSE</span>
                <span className="text-sky-300 font-bold">ASSET BETA</span>
              </div>
              <div className="text-sky-300 font-bold text-xs mb-1">
                Counter-Balancing Fed QT Drag
              </div>
              <p className="text-[9.5px] text-[#BAC7D5] leading-relaxed">
                $24B/month in cash buybacks neutralizes 96% of the Fed's $25B/mo Treasury QT runoff. Provides a persistent monetary floor under high-multiple equities, credit, and debasement hedges (Gold &amp; $BTC).
              </p>
            </div>
          </div>

          {/* Section D: Upcoming Buyback Operation Docket */}
          <div className="p-3 bg-[#111722] rounded-xl border border-[#B08D57]/30 flex flex-wrap items-center justify-between gap-3 text-[10px]">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#B08D57]" />
              <div>
                <span className="text-[#8292A6] uppercase text-[9px] block">NEXT SCHEDULED OPERATION DOCKET:</span>
                <span className="text-[#EDE9DE] font-bold text-xs">
                  {buybackApiData?.nextOperation?.type || "Liquidity Support: 5-Year to 10-Year Off-The-Run Nominal Notes"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <div>
                <span className="text-[#8292A6] block">Window:</span>
                <span className="text-[#E5C794] font-semibold">
                  {buybackApiData?.nextOperation?.dateLabel || "Next Tuesday 10:30 AM EST"}
                </span>
              </div>
              <div>
                <span className="text-[#8292A6] block">Maximum Purchase:</span>
                <span className="text-emerald-400 font-bold">
                  ${buybackApiData?.nextOperation?.maxPurchaseB?.toFixed(2) || (activeWeeklyBuybackB * 0.35).toFixed(2)} Billion
                </span>
              </div>
              <div>
                <span className="text-[#8292A6] block">Settlement:</span>
                <span className="text-[#EDE9DE]">{buybackApiData?.nextOperation?.settlementType || "Fedwire T+1 DVP"}</span>
              </div>
            </div>
          </div>

          {/* Section E: Official Treasury Decisions & Future Policy Action Control Engine */}
          <div className="bg-[#111722] rounded-xl border border-[#B08D57]/40 p-4 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#B08D57]/20">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#E5C794]" />
                <span className="text-xs font-bold text-[#FBF8F1] uppercase tracking-wider font-sans">
                  Treasury Decision Feed &amp; Future Policy Action Engine
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono-data">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>FEED LIVE: {lastSyncTime || "SYNCED"}</span>
                </span>
                <button
                  onClick={handleManualRefreshBuyback}
                  disabled={isBuybackLoading}
                  className="px-2 py-0.5 rounded bg-black/60 hover:bg-black/90 text-[#BAC7D5] hover:text-[#FBF8F1] border border-[#2B3545] flex items-center gap-1 transition-all cursor-pointer"
                  title="Check for newly released Treasury ODM decisions and TBAC refunding statements"
                >
                  <RefreshCw className={`w-3 h-3 text-[#B08D57] ${isBuybackLoading ? "animate-spin" : ""}`} />
                  <span>Check Decisions</span>
                </button>
              </div>
            </div>

            {/* Decision Status Banner */}
            <div className="p-3 rounded-lg bg-black/50 border border-[#B08D57]/30 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[9px] text-[#8292A6] uppercase block">ACTIVE POLICY DIRECTIVE:</span>
                <span className="text-xs sm:text-sm font-bold text-[#E5C794]">
                  {buybackApiData?.statusHeadline || "WEEKLY BOND BUYBACKS DOUBLED TO $6.0 BILLION"}
                </span>
                <p className="text-[10px] text-[#BAC7D5] mt-0.5">
                  {buybackApiData?.tbacStatement || "TBAC advises maintaining $6.0B weekly liquidity support to relieve primary dealer balance sheet strain ahead of upcoming 10Y/30Y refunding auctions."}
                </p>
              </div>
              {decisionFeedback && (
                <div className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold animate-in fade-in flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{decisionFeedback}</span>
                </div>
              )}
            </div>

            {/* Quick Future Decision Switcher */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#8292A6] uppercase block">
                Simulate / Apply Future Treasury Decisions Across Dashboard:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  {
                    title: "Official Doubled Pace",
                    pace: 6.0,
                    badge: "CURRENT ACTIVE",
                    color: "border-[#B08D57] bg-[#B08D57]/15",
                    note: "Last week's doubling to $6.0B weekly ($312B annualized run-rate)"
                  },
                  {
                    title: "TBAC Refunding Expansion",
                    pace: 7.5,
                    badge: "PROJECTED Q4",
                    color: "border-sky-500/40 bg-sky-950/20",
                    note: "Quarterly refunding statement expands weekly support to $7.5B ($390B/yr)"
                  },
                  {
                    title: "Crisis Stealth Twist",
                    pace: 10.0,
                    badge: "EMERGENCY RAMP",
                    color: "border-purple-500/40 bg-purple-950/20",
                    note: "Surges buybacks to $10.0B/wk ($520B/yr) to absorb massive auction indigestion"
                  },
                  {
                    title: "Baseline Normalization",
                    pace: 3.0,
                    badge: "PRE-DOUBLED",
                    color: "border-slate-500/40 bg-slate-900/40",
                    note: "Returns to standard baseline pacing of $3.0B per week"
                  }
                ].map((item) => {
                  const isSelected = Math.abs(activeWeeklyBuybackB - item.pace) < 0.2;
                  return (
                    <button
                      key={item.title}
                      onClick={() => handleApplyDecisionScenario(item.pace, item.title, item.note)}
                      disabled={isSubmittingDecision}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#B08D57] bg-[#B08D57]/20 shadow-[0_0_15px_rgba(176,141,87,0.25)] ring-1 ring-[#B08D57]"
                          : "border-[#1E2738] bg-black/40 hover:border-[#B08D57]/40 hover:bg-black/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#FBF8F1]">${item.pace.toFixed(1)}B / Wk</span>
                        <span className="text-[8px] font-mono-data px-1.5 py-0.5 rounded font-bold uppercase bg-black/50 text-[#E5C794] border border-white/10">
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#EDE9DE] font-semibold truncate">{item.title}</div>
                      <div className="text-[9px] text-[#8292A6] mt-0.5 line-clamp-1">{item.note}</div>
                      {isSelected && (
                        <div className="mt-2 pt-1.5 border-t border-[#B08D57]/30 flex items-center gap-1 text-[8.5px] text-[#10B981] font-bold">
                          <Check className="w-2.5 h-2.5" />
                          <span>ACTIVE TRANSMISSION BROADCAST</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Decisions History Log */}
            {buybackApiData?.decisionsHistory && buybackApiData.decisionsHistory.length > 0 && (
              <div className="pt-2 border-t border-[#B08D57]/15">
                <span className="text-[9px] text-[#8292A6] uppercase block mb-1.5">
                  Treasury Decision Log &amp; Policy Milestones:
                </span>
                <div className="space-y-1.5">
                  {buybackApiData.decisionsHistory.slice(0, 3).map((dec: any) => (
                    <div
                      key={dec.id}
                      className="p-2 rounded bg-black/40 border border-[#1E2738] flex items-center justify-between gap-3 text-[9.5px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[#E5C794] font-bold shrink-0">{dec.date}:</span>
                        <span className="text-[#EDE9DE] font-semibold">{dec.title}</span>
                        <span className="text-[#8292A6] hidden sm:inline">• {dec.description}</span>
                      </div>
                      <span className="text-emerald-400 font-bold shrink-0 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {dec.pacing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Scenario Stress Tester (Treasury TGA Refill / Drain Simulator) */}
      {viewMode !== "DEBT_BUYBACK" && (
        <div className="bg-black/50 border border-[#1E2738] rounded-xl p-3.5 mb-4 relative z-10 text-xs font-mono-data">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#B08D57]" />
              <span className="font-bold text-[#EDE9DE] uppercase tracking-wide">
                Treasury Cash Refill / Issuance Stress Simulator
              </span>
            </div>
            {simulatedTgaShiftB !== 0 && (
              <button
                onClick={() => setSimulatedTgaShiftB(0)}
                className="flex items-center gap-1 text-[10px] text-[#8292A6] hover:text-[#EDE9DE] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Live Telemetry</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-[#8292A6]">Simulate TGA Balance Shift:</span>
            {[
              { label: "Live Telemetry", value: 0 },
              { label: "+$50B TGA Refill", value: 50 },
              { label: "+$100B Debt Sale", value: 100 },
              { label: "+$200B Major Tax Wave", value: 200 },
              { label: "-$100B Fiscal Outflow", value: -100 }
            ].map((scenario) => (
              <button
                key={scenario.label}
                onClick={() => setSimulatedTgaShiftB(scenario.value)}
                className={`px-2 py-1 rounded text-[10px] transition-all cursor-pointer ${
                  simulatedTgaShiftB === scenario.value
                    ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md"
                    : "bg-[#1E2738]/80 text-[#8292A6] hover:text-[#EDE9DE] border border-[#2B3545]"
                }`}
              >
                {scenario.label}
              </button>
            ))}
          </div>

          {simulatedTgaShiftB !== 0 && (
            <div className="mt-2.5 pt-2 border-t border-[#1E2738] flex flex-wrap items-center justify-between text-[10px] text-[#BAC7D5]">
              <span>
                Simulated Transmission: A <strong>+${simulatedTgaShiftB}B</strong> TGA increase drains{" "}
                <strong className="text-rose-400">
                  -${(simulatedTgaShiftB * 0.85).toFixed(0)}B
                </strong>{" "}
                from Bank Reserves (down to ${(simulatedReserves / 1000).toFixed(2)}T), directly tightening equity financial conditions.
              </span>
              <span className="text-[#E5C794] font-bold">
                Net Liquidity: ${(netFedLiquidity / 1000).toFixed(2)}T
              </span>
            </div>
          )}
        </div>
      )}

      {/* Macro Asset Correlation Transmission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10 text-[10px] font-mono-data">
        <div className="p-2.5 bg-black/40 rounded-lg border border-[#1E2738]">
          <div className="text-[#8292A6] uppercase text-[9px] mb-0.5">S&amp;P 500 / NASDAQ</div>
          <div className="text-emerald-400 font-bold text-xs flex items-center justify-between">
            <span>+0.88 CORRELATION</span>
            <span className="text-[9px] text-[#BAC7D5]">60D Rolling</span>
          </div>
          <p className="text-[9px] text-[#8292A6] mt-1 leading-tight">
            Equities trade 1:1 with Net Fed Liquidity. Every $100B net liquidity drain has historically knocked ~1.8% off high-multiple indices.
          </p>
        </div>

        <div className="p-2.5 bg-black/40 rounded-lg border border-[#1E2738]">
          <div className="text-[#8292A6] uppercase text-[9px] mb-0.5">SOFR REPO RATE / SPREAD</div>
          <div className="text-amber-300 font-bold text-xs flex items-center justify-between">
            <span>VOLATILITY ANCHOR</span>
            <span className="text-[9px] text-[#BAC7D5]">4.32% Effective</span>
          </div>
          <p className="text-[9px] text-[#8292A6] mt-1 leading-tight">
            When Bank Reserves breach $3.0T, private repo rates (SOFR) tail higher than Fed IORB, inducing interbank collateral hoarding.
          </p>
        </div>

        <div className="p-2.5 bg-black/40 rounded-lg border border-[#1E2738]">
          <div className="text-[#8292A6] uppercase text-[9px] mb-0.5">GOLD &amp; BITCOIN (DEBASEMENT)</div>
          <div className="text-emerald-400 font-bold text-xs flex items-center justify-between">
            <span>+0.81 MONETARY SENSITIVITY</span>
            <span className="text-[9px] text-[#BAC7D5]">Persistent</span>
          </div>
          <p className="text-[9px] text-[#8292A6] mt-1 leading-tight">
            Hard assets rally aggressively whenever Fed pauses QT or provides emergency repo liquidity facilities to prevent Treasury auctions tailing.
          </p>
        </div>
      </div>

      {/* Footer Telemetry Stamp */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 mt-4 border-t border-[#1E2738] text-[9px] font-mono-data text-[#8292A6]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>DATA SOURCE: FEDERAL RESERVE BOARD H.4.1 RELEASE, US TREASURY BUYBACK DESK &amp; TIC TELEMETRY</span>
        </div>
        <div className="text-[#BAC7D5] flex flex-wrap items-center gap-3">
          <span>Weekly Debt Buybacks: <strong className="text-[#E5C794]">${activeWeeklyBuybackB.toFixed(1)}B/wk</strong> (Doubled)</span>
          <span>Net Fed Liquidity Index: <strong className="text-[#EDE9DE]">${netFedLiquidity.toLocaleString()}B</strong></span>
        </div>
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <>
        {/* Stable Inline Placeholder in dashboard grid */}
        <div className="bg-[#0F1622]/50 border border-dashed border-[#B08D57]/40 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 font-mono-data text-xs text-[#8292A6]">
          <div className="w-9 h-9 rounded-full bg-[#B08D57]/15 border border-[#B08D57]/40 flex items-center justify-center text-[#B08D57]">
            <Maximize2 className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-xs text-[#EDE9DE] font-bold uppercase tracking-wider">
            US Liquidity Driver Telemetry (Fullscreen View Active)
          </div>
          <button
            onClick={() => setIsFullScreen(false)}
            className="mt-2 px-3 py-1.5 bg-[#B08D57] hover:bg-[#C9A46D] text-[#0A111C] rounded font-bold text-[11px] transition-colors"
          >
            Return to Dashboard Grid
          </button>
        </div>

        {/* Viewport-level portal overlay mounted to document.body */}
        {createPortal(
          <div
            id="liquidity-driver-fullscreen-overlay"
            className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFullScreen(false);
            }}
          >
            {renderContent(true)}
          </div>,
          document.body
        )}
      </>
    );
  }

  return renderContent(false);
};
export default LiquidityDriverTracker;
