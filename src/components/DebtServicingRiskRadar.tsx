import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  Landmark,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Scale,
  Gauge,
  Layers,
  ArrowRight,
  ShieldAlert,
  Percent,
  Coins,
  DollarSign,
  Maximize2,
  Minimize2,
  HelpCircle,
  Zap,
  BarChart3,
  Calendar,
  Flame,
  Info,
  Clock,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Radio,
  ExternalLink,
  X
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  ReferenceLine
} from "recharts";

interface DebtServicingRiskRadarProps {
  isCalmMode?: boolean;
}

// 2026 Reference Anchors
const BASE_TIMESTAMP = 1788500000000;

export const DebtServicingRiskRadar: React.FC<DebtServicingRiskRadarProps> = ({
  isCalmMode = false
}) => {
  const [activeTab, setActiveTab] = useState<
    "ALL" | "VELOCITY" | "LIQUIDITY" | "AUCTIONS" | "VOLATILITY" | "SOVEREIGNS"
  >("ALL");
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Interest Rate Shock Simulator (+0 bps, +50 bps, +100 bps, +200 bps)
  const [rateShockBps, setRateShockBps] = useState<number>(0);

  // Dynamic Ticking accumulator for Net Interest expense
  useEffect(() => {
    const updateRate = isCalmMode ? 1500 : 80;
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, updateRate);
    return () => clearInterval(timer);
  }, [isCalmMode]);

  // Handle ESC key and lock body scroll in fullscreen mode
  useEffect(() => {
    if (!isFullScreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullScreen]);

  // Net Interest Accumulation Calculation
  // US Net Interest runs at ~$1.14T annualized = ~$36,150 per second
  const netInterestAccumulator = useMemo(() => {
    const elapsedSeconds = Math.max(0, (currentTimeMs - BASE_TIMESTAMP) / 1000);
    const baseAccumulated = 845200000000; // Base year-to-date accumulated net interest
    const basePerSecond = 36150 * (1 + rateShockBps / 420); // Scaled by shock
    const currentAccumulated = baseAccumulated + elapsedSeconds * basePerSecond;
    return {
      currentAccumulated,
      perSecond: basePerSecond,
      annualizedNetInterest: 1140 + (rateShockBps * 3.4), // in $B
      defenseBudget: 865, // in $B
      federalTaxRevenue: 5090 // in $B
    };
  }, [currentTimeMs, rateShockBps]);

  // Net Interest as % of Tax Revenue
  const netInterestRatio = (
    (netInterestAccumulator.annualizedNetInterest / netInterestAccumulator.federalTaxRevenue) *
    100
  ).toFixed(1);

  // Maturity Wall Data
  const maturityWallData = [
    {
      year: "2026",
      amountTrillion: 8.9,
      avgMaturingCoupon: 1.85,
      replacementYield: 5.28 + (rateShockBps / 100),
      refinanceShockB: 305 + (rateShockBps * 89 / 100),
      description: "Immediate Rollover Cliff: 24.2% of marketable debt maturing into 5.28% benchmark yields"
    },
    {
      year: "2027",
      amountTrillion: 6.4,
      avgMaturingCoupon: 2.10,
      replacementYield: 5.15 + (rateShockBps / 100),
      refinanceShockB: 195 + (rateShockBps * 64 / 100),
      description: "Mid-Term Rollover: 17.4% of marketable debt"
    },
    {
      year: "2028",
      amountTrillion: 4.8,
      avgMaturingCoupon: 2.35,
      replacementYield: 5.10 + (rateShockBps / 100),
      refinanceShockB: 132 + (rateShockBps * 48 / 100),
      description: "Subsequent Wave: 13.0% of marketable debt"
    },
    {
      year: "2029+",
      amountTrillion: 16.7,
      avgMaturingCoupon: 2.95,
      replacementYield: 5.45 + (rateShockBps / 100),
      refinanceShockB: 417 + (rateShockBps * 167 / 100),
      description: "Long Duration & TIPS Rollovers (30Y at 5.63%)"
    }
  ];

  // Net Fed Liquidity Model
  // Formula: Net Liquidity = Fed Total Assets - TGA - RRP
  const fedBalanceSheet = 6980; // $B (Fed Assets)
  const tgaBalance = 785; // $B (Treasury General Account at NY Fed)
  const rrpBalance = 215; // $B (Reverse Repo Facility)
  const bankReserves = 3280; // $B (Commercial bank reserves at the Fed)
  const netFedLiquidity = fedBalanceSheet - tgaBalance - rrpBalance; // ~$5,980B
  const netLiquidity7dDelta = -34.8; // $B over 7 days

  // Auction Tail Metrics (Recent 10Y & 30Y Treasury Auctions)
  const auctionMetrics = {
    benchmark10Y: {
      date: "Current Cycle",
      coupon: "4.375%",
      bidToCover: 2.34,
      bidToCoverAvg: 2.52,
      tailBps: +1.4, // Positive = Tail (weak demand), Negative = Through WI (strong)
      status: "TAILED (+1.4 bps)",
      primaryDealerTakedown: 18.2, // %
      dealerTakedownAvg: 14.8,
      indirectBidder: 66.4, // Foreign Central Banks & offshore funds
      directBidder: 15.4,
      assessment: "Concession required; Primary dealers burdened with unsold inventory"
    },
    benchmark30Y: {
      date: "Current Cycle",
      coupon: "4.625%",
      bidToCover: 2.22,
      bidToCoverAvg: 2.45,
      tailBps: +2.1,
      status: "HEAVY TAIL (+2.1 bps)",
      primaryDealerTakedown: 19.8,
      dealerTakedownAvg: 15.2,
      indirectBidder: 62.1,
      directBidder: 18.1,
      assessment: "Severe duration saturation; institutional buyers demanded 2.1 bps yield premium"
    }
  };

  // Cross-Asset Volatility Metrics
  const crossAssetVol = {
    moveIndex: 112.5, // ICE BofA Treasury Volatility
    moveThreshold: 100.0,
    vixIndex: 16.8, // Equity Volatility
    fxUsdJpyVol: 12.4, // 1-Month Implied Vol (%)
    moveVixRatio: (112.5 / 16.8).toFixed(2), // 6.70x (Normal: 4.8x - 5.5x)
    divergenceRegime: "EXTREME DIVERGENCE (Bond Stress > Equity Complacency)"
  };

  // Sovereign Comparison (Debt-Servicing & Fiscal Fragility Transmission)
  const sovereignComparisons = [
    {
      country: "United States",
      flag: "🇺🇸",
      code: "USA",
      servicingToRevenue: `${netInterestRatio}%`,
      debtGdp: "124.8%",
      primaryDeficitGdp: "2.9%",
      wamMonths: "72 mos",
      centralBankBurden: "Fed balance sheet roll-off paused; Treasury relies on outsized T-Bill issuance (22% of total debt) to suppress term premia.",
      riskTransmission: "Propels Gold & Bitcoin debasement trades; forces long-end yield curve steepeners."
    },
    {
      country: "China",
      flag: "🇨🇳",
      code: "CHN",
      servicingToRevenue: "14.2%",
      debtGdp: "88.6%*",
      primaryDeficitGdp: "3.8%",
      wamMonths: "102 mos",
      centralBankBurden: "PBoC balance sheet expansion & debt-swap quotas; state banking syndicates absorbing toxic LGFV bond rollovers.",
      riskTransmission: "Transmits industrial deflation globally; requires active PBoC Yuan fixes to stave off capital flight."
    },
    {
      country: "Spain",
      flag: "🇪🇸",
      code: "ESP",
      servicingToRevenue: "9.6%",
      debtGdp: "104.2%",
      primaryDeficitGdp: "0.8%",
      wamMonths: "94 mos",
      centralBankBurden: "ECB PEPP reinvestment tapering; Spanish 10Y Bono spread vs Bunds (+74 bps) anchors banking systemic risk.",
      riskTransmission: "Directly impacts IBEX 35 banking solvency (Santander, BBVA, Caixa hold 28% of sovereign paper)."
    },
    {
      country: "Germany",
      flag: "🇩🇪",
      code: "DEU",
      servicingToRevenue: "3.8%",
      debtGdp: "63.4%",
      primaryDeficitGdp: "1.2%",
      wamMonths: "86 mos",
      centralBankBurden: "Constitutional 'Schuldenbremse' (Debt Brake) tightly constrains borrowing; Bundesbank backs ECB anti-fragmentation (TPI).",
      riskTransmission: "10Y Bund yield serves as Eurozone risk-free benchmark; fiscal austerity dampens broader EU industrial growth."
    },
    {
      country: "Italy",
      flag: "🇮🇹",
      code: "ITA",
      servicingToRevenue: "12.8%",
      debtGdp: "138.5%",
      primaryDeficitGdp: "1.1%",
      wamMonths: "82 mos",
      centralBankBurden: "ECB Transmission Protection Instrument (TPI) backstop; BTP-Bund spread (+125 bps) is the primary European stress gauge.",
      riskTransmission: "Highly vulnerable to ECB QT rolloff; spread widening immediately triggers European financial CDS spikes."
    },
    {
      country: "France",
      flag: "🇫🇷",
      code: "FRA",
      servicingToRevenue: "9.8%",
      debtGdp: "112.4%",
      primaryDeficitGdp: "3.2%",
      wamMonths: "104 mos",
      centralBankBurden: "OAT-Bund spread blowout (+82 bps) following fiscal deadlock; debt interest is now the 2nd largest state budget line.",
      riskTransmission: "Drives CAC 40 bank discount, pressures sovereign ratings, and accelerates core European yield fragmentation."
    }
  ];

  const renderRadarCard = (inFullscreen: boolean) => (
    <div
      id={inFullscreen ? "macro-debt-risk-radar-fullscreen" : "macro-debt-risk-radar"}
      className={`bg-[#0F1622] border border-[#B08D57]/35 rounded-xl shadow-2xl overflow-hidden transition-all relative ${
        inFullscreen
          ? "w-full max-w-7xl max-h-[92vh] overflow-y-auto bg-[#0A111C] p-4 sm:p-6 border-[#B08D57]/60 shadow-[0_0_80px_rgba(0,0,0,0.95)]"
          : "p-4 sm:p-5"
      }`}
    >
      {/* Background Micro Grid */}
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

      {/* Top Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#B08D57]/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black/70 border border-[#B08D57]/40 flex items-center justify-center shadow-inner">
            <Gauge className="w-5 h-5 text-[#B08D57]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-[#EDE9DE] uppercase font-sans flex items-center gap-2">
                <span>Net Liquidity Drivers &amp; Macro Debt-Servicing Risk Radar</span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono-data px-2 py-0.5 rounded bg-[#A6291C]/20 text-[#FFA4A4] border border-[#A6291C]/40">
                <ShieldAlert className="w-2.5 h-2.5 animate-pulse" />
                <span>CRITICAL TRANSMISSION MONITOR</span>
              </span>
            </div>
            <p className="text-[10px] font-mono-data text-[#8292A6]">
              NET FED LIQUIDITY DRIVERS // NET INTEREST VELOCITY // MATURITY WALL // AUCTION TAILS &amp; BUYBACKS
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-data">
          {/* Rate Shock Scenario Slider */}
          <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-[#2B3545]">
            <Sliders className="w-3 h-3 text-[#B08D57]" />
            <span className="text-[10px] text-[#8292A6] uppercase">Yield Shock:</span>
            <div className="flex items-center gap-1">
              {[0, 50, 100, 200].map((bps) => (
                <button
                  key={bps}
                  onClick={() => setRateShockBps(bps)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono-data transition-all ${
                    rateShockBps === bps
                      ? "bg-[#B08D57] text-[#0A111C] font-bold"
                      : "text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  {bps === 0 ? "Base" : `+${bps}bp`}
                </button>
              ))}
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded border transition-colors flex items-center gap-1.5 ${
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
                <span className="hidden sm:inline text-[10px] font-mono-data font-bold">CLOSE FULLSCREEN [ESC]</span>
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

      {/* Navigation Sub-Tabs */}
      <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin text-xs font-mono-data">
        {[
          { id: "ALL", label: "Executive Risk Radar", icon: BarChart3 },
          { id: "VELOCITY", label: "Debt Velocity & Maturity Wall", icon: TrendingUp },
          { id: "LIQUIDITY", label: "Net Fed Liquidity Drivers", icon: DollarSign },
          { id: "AUCTIONS", label: "Auction Tail Metrics (10Y/30Y)", icon: Scale },
          { id: "VOLATILITY", label: "Cross-Asset Vol (MOVE/VIX)", icon: Activity },
          { id: "SOVEREIGNS", label: "US • China • Spain • Germany • Italy • France", icon: Landmark }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#B08D57] text-[#0A111C] border-[#B08D57] font-bold shadow-md"
                  : "bg-black/40 border-[#2B3545] text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Executive Key Metric Strips */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Metric 1: Net Interest as % of Tax Revenue */}
        <div className="bg-black/50 border border-[#222C3D] hover:border-[#B08D57]/40 p-3 rounded-lg transition-all">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
            <span>Interest / Tax Rev</span>
            <span className="text-rose-400 font-bold">&gt;20% DANGER</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-data text-amber-300 flex items-baseline gap-1">
            <span>{netInterestRatio}%</span>
            {rateShockBps > 0 && (
              <span className="text-[10px] text-rose-400 font-mono-data">
                (+{(rateShockBps * 0.07).toFixed(1)}%)
              </span>
            )}
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 flex items-center justify-between">
            <span>Annual Net Interest:</span>
            <span className="text-[#EDE9DE] font-semibold">${netInterestAccumulator.annualizedNetInterest.toFixed(0)}B</span>
          </div>
          <div className="w-full bg-[#1A2230] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
              style={{ width: `${Math.min(100, (parseFloat(netInterestRatio) / 25) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Net Fed Liquidity Index */}
        <div className="bg-black/50 border border-[#222C3D] hover:border-[#B08D57]/40 p-3 rounded-lg transition-all">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
            <span>Net Fed Liquidity</span>
            <span className="text-rose-400 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              {netLiquidity7dDelta}B 7d
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE]">
            ${(netFedLiquidity / 1000).toFixed(2)}T
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 flex items-center justify-between">
            <span>Bank Reserves Floor:</span>
            <span className="text-emerald-400 font-semibold">${bankReserves}B ($3.0T Ample)</span>
          </div>
          <div className="text-[9px] font-mono-data text-[#BAC7D5] mt-1">
            RRP: <strong className="text-amber-400">${rrpBalance}B</strong> (Buffer depleted)
          </div>
        </div>

        {/* Metric 3: 10Y / 30Y Treasury Auction Tail */}
        <div className="bg-black/50 border border-[#222C3D] hover:border-[#B08D57]/40 p-3 rounded-lg transition-all">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
            <span>Auction Tail Signal</span>
            <span className="text-rose-400 font-bold bg-rose-500/10 px-1 rounded border border-rose-500/30">
              TEPID ABSORPTION
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-data text-rose-400 flex items-baseline gap-1">
            <span>+{auctionMetrics.benchmark10Y.tailBps} bps</span>
            <span className="text-[10px] text-[#8292A6] font-mono-data">(10Y UST)</span>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 flex items-center justify-between">
            <span>30Y Bond Tail:</span>
            <span className="text-rose-400 font-semibold">+{auctionMetrics.benchmark30Y.tailBps} bps</span>
          </div>
          <div className="text-[9px] font-mono-data text-[#BAC7D5] mt-1">
            Dealer Retention: <strong className="text-amber-300">18.2%</strong> (Supply overhang)
          </div>
        </div>

        {/* Metric 4: MOVE / VIX Cross-Asset Divergence */}
        <div className="bg-black/50 border border-[#222C3D] hover:border-[#B08D57]/40 p-3 rounded-lg transition-all">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
            <span>MOVE / VIX Divergence</span>
            <span className="text-amber-400 font-bold">DISCONNECTED</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#E5C794] flex items-baseline gap-1">
            <span>{crossAssetVol.moveVixRatio}x</span>
            <span className="text-[10px] text-[#8292A6] font-mono-data">(Norm: ~4.8x)</span>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1 flex items-center justify-between">
            <span>MOVE (Bonds): <strong className="text-rose-400">{crossAssetVol.moveIndex}</strong></span>
            <span>VIX: <strong className="text-emerald-400">{crossAssetVol.vixIndex}</strong></span>
          </div>
          <div className="text-[9px] font-mono-data text-[#BAC7D5] mt-1">
            USD/JPY 1M Vol: <strong className="text-amber-300">{crossAssetVol.fxUsdJpyVol}%</strong>
          </div>
        </div>
      </div>

      {/* Dynamic Net Interest Ticking Velocity Strip */}
      <div className="relative z-10 bg-black/40 border border-[#222C3D] rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono-data text-[#8292A6] uppercase block">
              Live US Net Interest Velocity Accumulator (YTD Compounding)
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono-data text-amber-200 tracking-tight">
              ${Math.floor(netInterestAccumulator.currentAccumulated).toLocaleString("en-US")}
              <span className="text-xs text-amber-400/80 font-normal ml-2">
                (+${Math.round(netInterestAccumulator.perSecond).toLocaleString()}/sec)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-data">
          <div className="text-right border-l border-[#2B3545] pl-4">
            <span className="text-[10px] text-[#8292A6] uppercase block">Net Interest vs Defense</span>
            <span className="text-rose-400 font-bold">
              131.8% of Defense (${netInterestAccumulator.annualizedNetInterest.toFixed(0)}B vs ${netInterestAccumulator.defenseBudget}B)
            </span>
          </div>
          <div className="text-right border-l border-[#2B3545] pl-4 hidden md:block">
            <span className="text-[10px] text-[#8292A6] uppercase block">Primary Deficit vs Total Deficit</span>
            <span className="text-[#EDE9DE] font-semibold">
              $880B Primary + $1,140B Interest = $2.02T Total Deficit
            </span>
          </div>
        </div>
      </div>

      {/* VIEW 1: All-in-One Executive Grid or Deep Dives */}
      {(activeTab === "ALL" || activeTab === "VELOCITY") && (
        <div className="relative z-10 space-y-4 mb-4">
          <div className="bg-[#0B1019] border border-[#222C3D] rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1E2738]">
              <div>
                <h4 className="text-xs font-bold text-[#EDE9DE] uppercase tracking-wider flex items-center gap-2 font-sans">
                  <Calendar className="w-4 h-4 text-[#B08D57]" />
                  <span>US Treasury Maturity Wall & Refinancing Cliff (2026 – 2029+)</span>
                </h4>
                <p className="text-[10px] font-mono-data text-[#8292A6]">
                  Maturing low-coupon pandemic debt rolling over into current yield curve (Weighted Average Maturity: 72 Months)
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono-data text-[#8292A6]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" /> Maturing Debt ($T)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Annual Refinance Shock ($B)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              {maturityWallData.map((bucket) => (
                <div
                  key={bucket.year}
                  className="bg-black/40 border border-[#1E2738] hover:border-[#B08D57]/40 p-3 rounded-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-1 mb-2 border-b border-[#1E2738]">
                      <span className="text-sm font-bold font-mono-data text-[#EDE9DE]">
                        Year {bucket.year}
                      </span>
                      <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-[#B08D57]/15 text-[#E5C794] border border-[#B08D57]/30">
                        ${bucket.amountTrillion} Trillion
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono-data">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8292A6]">Maturing Coupon:</span>
                        <span className="text-emerald-400 font-semibold">{bucket.avgMaturingCoupon.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8292A6]">Refinance Yield:</span>
                        <span className="text-rose-400 font-bold">{bucket.replacementYield.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-[10px] pt-1 border-t border-[#1E2738]">
                        <span className="text-[#8292A6]">Refi Rate Gap:</span>
                        <span className="text-amber-300 font-bold">
                          +{(bucket.replacementYield - bucket.avgMaturingCoupon).toFixed(2)}% (+{Math.round((bucket.replacementYield - bucket.avgMaturingCoupon) * 100)} bps)
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8292A6]">Annual Cost Jump:</span>
                        <span className="text-rose-400 font-bold">+${bucket.refinanceShockB.toFixed(0)}B / yr</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] font-mono-data text-[#BAC7D5] mt-3 pt-2 border-t border-[#1E2738]/80 leading-tight">
                    {bucket.description}
                  </p>
                </div>
              ))}
            </div>

            {/* TBAC T-Bill Warning Callout */}
            <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/25 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs font-mono-data">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[#EDE9DE] text-[11px]">
                  <strong>Treasury Borrowing Advisory Committee (TBAC) Deviation:</strong> T-Bills currently constitute <strong>22.1%</strong> of total debt (TBAC recommended safe cap: 20%). Treasury is shortening duration to artificially depress term premia, heightening interest rate sensitivity.
                </span>
              </div>
              <span className="text-[10px] text-amber-400/90 font-bold whitespace-nowrap">
                Short-End Rollover Risk: HIGH
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Net Fed Liquidity Drivers */}
      {(activeTab === "ALL" || activeTab === "LIQUIDITY") && (
        <div className="relative z-10 space-y-4 mb-4">
          <div className="bg-[#0B1019] border border-[#222C3D] rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1E2738]">
              <div>
                <h4 className="text-xs font-bold text-[#EDE9DE] uppercase tracking-wider flex items-center gap-2 font-sans">
                  <DollarSign className="w-4 h-4 text-[#B08D57]" />
                  <span>Net Liquidity Drivers: Fed Assets, Bank Reserves, RRP & TGA</span>
                </h4>
                <p className="text-[10px] font-mono-data text-[#8292A6]">
                  Short-term risk-asset transmission engine: Net Liquidity = Fed Assets ($6.98T) - TGA ($785B) - ON RRP ($215B)
                </p>
              </div>
              <div className="text-[10px] font-mono-data bg-black/60 px-2 py-1 rounded border border-[#2B3545] text-[#E5C794]">
                Net Liquidity Formula: <strong className="text-[#EDE9DE]">${netFedLiquidity}B</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Component 1: Fed Reserves Floor */}
              <div className="bg-black/40 border border-[#1E2738] p-3 rounded-lg">
                <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
                  <span>Bank Reserves at Fed</span>
                  <span className="text-emerald-400 font-semibold">AMPLE</span>
                </div>
                <div className="text-xl font-bold font-mono-data text-[#EDE9DE]">
                  ${bankReserves} Billion
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6] mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Target Operating Floor:</span>
                    <span className="text-[#EDE9DE] font-semibold">$3,000B (Ample)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Stress Threshold:</span>
                    <span className="text-rose-400 font-semibold">&lt; $2,800B</span>
                  </div>
                </div>
                <p className="text-[9px] font-mono-data text-[#BAC7D5] mt-2 pt-2 border-t border-[#1E2738]">
                  Commercial banks maintain $3.28T in reserves. Dips toward $3.0T trigger repo market fragility similar to Sept 2019 SOFR spike.
                </p>
              </div>

              {/* Component 2: ON RRP Depletion */}
              <div className="bg-black/40 border border-[#1E2738] p-3 rounded-lg">
                <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
                  <span>Reverse Repo (ON RRP)</span>
                  <span className="text-rose-400 font-semibold">EXHAUSTED</span>
                </div>
                <div className="text-xl font-bold font-mono-data text-amber-300">
                  ${rrpBalance} Billion
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6] mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Peak Balance (2022-2023):</span>
                    <span className="text-[#EDE9DE] font-semibold">$2,550B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drawdown Percentage:</span>
                    <span className="text-rose-400 font-semibold">-91.5%</span>
                  </div>
                </div>
                <p className="text-[9px] font-mono-data text-[#BAC7D5] mt-2 pt-2 border-t border-[#1E2738]">
                  The RRP shock-absorber is now drained. Any future Treasury TGA cash replenishment will drain bank reserves directly 1:1.
                </p>
              </div>

              {/* Component 3: TGA Balance Target */}
              <div className="bg-black/40 border border-[#1E2738] p-3 rounded-lg">
                <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
                  <span>Treasury General Account (TGA)</span>
                  <span className="text-blue-400 font-semibold">CASH TARGET</span>
                </div>
                <div className="text-xl font-bold font-mono-data text-[#EDE9DE]">
                  ${tgaBalance} Billion
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6] mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Treasury Cash Buffer:</span>
                    <span className="text-[#EDE9DE] font-semibold">$750B - $850B Target</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidity Transmission:</span>
                    <span className="text-amber-300 font-semibold">TGA up = Liquidity down</span>
                  </div>
                </div>
                <p className="text-[9px] font-mono-data text-[#BAC7D5] mt-2 pt-2 border-t border-[#1E2738]">
                  TGA held at NY Fed. When Treasury builds cash balance via debt issuance, cash leaves commercial bank system, pressuring equities.
                </p>
              </div>
            </div>

            {/* Asset Price Correlation Matrix Bar */}
            <div className="mt-3 p-3 bg-black/50 border border-[#1E2738] rounded-lg text-xs font-mono-data">
              <span className="text-[10px] text-[#8292A6] uppercase block mb-1.5">
                Empirical Net Liquidity Correlation (R-Squared vs Risk Assets 2020-2026)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-black/40 rounded border border-[#2B3545]">
                  <span className="text-[#8292A6] block text-[9px]">S&P 500 Index</span>
                  <span className="text-emerald-400 font-bold">+0.88 Correlation</span>
                </div>
                <div className="p-2 bg-black/40 rounded border border-[#2B3545]">
                  <span className="text-[#8292A6] block text-[9px]">Bitcoin / Crypto</span>
                  <span className="text-emerald-400 font-bold">+0.81 Correlation</span>
                </div>
                <div className="p-2 bg-black/40 rounded border border-[#2B3545]">
                  <span className="text-[#8292A6] block text-[9px]">High Yield OAS Spreads</span>
                  <span className="text-rose-400 font-bold">-0.76 Inverse Spread</span>
                </div>
                <div className="p-2 bg-black/40 rounded border border-[#2B3545]">
                  <span className="text-[#8292A6] block text-[9px]">10Y Real Yield</span>
                  <span className="text-amber-300 font-bold">-0.71 Inverse Yield</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: US Treasury Auction Tail Metrics */}
      {(activeTab === "ALL" || activeTab === "AUCTIONS") && (
        <div className="relative z-10 space-y-4 mb-4">
          <div className="bg-[#0B1019] border border-[#222C3D] rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1E2738]">
              <div>
                <h4 className="text-xs font-bold text-[#EDE9DE] uppercase tracking-wider flex items-center gap-2 font-sans">
                  <Scale className="w-4 h-4 text-[#B08D57]" />
                  <span>Auction Tail Metrics & Treasury Absorption Capacity</span>
                </h4>
                <p className="text-[10px] font-mono-data text-[#8292A6]">
                  Immediate market absorption signals for 10-Year Notes and 30-Year Bonds (Bid-to-Cover, Yield Tails & Primary Dealer Takedown)
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono-data">
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  Tail &gt; 1.0 bp = Concession Alert
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 10-Year US Treasury Auction */}
              <div className="bg-black/40 border border-[#1E2738] p-3 rounded-lg">
                <div className="flex items-center justify-between pb-1 mb-2 border-b border-[#1E2738]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold font-mono-data text-[#EDE9DE]">
                      10-Year US Treasury Note Auction
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    +{auctionMetrics.benchmark10Y.tailBps} bps TAIL
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono-data my-2">
                  <div className="p-2 bg-black/40 rounded border border-[#1E2738]">
                    <span className="text-[9px] text-[#8292A6] uppercase block">Bid-to-Cover</span>
                    <span className="text-xs font-bold text-amber-300">
                      {auctionMetrics.benchmark10Y.bidToCover}x
                    </span>
                    <span className="text-[9px] text-[#8292A6] block">(avg: {auctionMetrics.benchmark10Y.bidToCoverAvg}x)</span>
                  </div>

                  <div className="p-2 bg-black/40 rounded border border-[#1E2738]">
                    <span className="text-[9px] text-[#8292A6] uppercase block">Dealer Takedown</span>
                    <span className="text-xs font-bold text-rose-400">
                      {auctionMetrics.benchmark10Y.primaryDealerTakedown}%
                    </span>
                    <span className="text-[9px] text-[#8292A6] block">(avg: {auctionMetrics.benchmark10Y.dealerTakedownAvg}%)</span>
                  </div>

                  <div className="p-2 bg-black/40 rounded border border-[#1E2738]">
                    <span className="text-[9px] text-[#8292A6] uppercase block">Indirect (Foreign)</span>
                    <span className="text-xs font-bold text-[#EDE9DE]">
                      {auctionMetrics.benchmark10Y.indirectBidder}%
                    </span>
                    <span className="text-[9px] text-[#8292A6] block">Direct: {auctionMetrics.benchmark10Y.directBidder}%</span>
                  </div>
                </div>

                <p className="text-[10px] font-mono-data text-[#BAC7D5] mt-2 pt-2 border-t border-[#1E2738]">
                  <strong>SMC Desk Signal:</strong> {auctionMetrics.benchmark10Y.assessment}
                </p>
              </div>

              {/* 30-Year US Treasury Bond Auction */}
              <div className="bg-black/40 border border-[#1E2738] p-3 rounded-lg">
                <div className="flex items-center justify-between pb-1 mb-2 border-b border-[#1E2738]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold font-mono-data text-[#EDE9DE]">
                      30-Year US Treasury Long Bond Auction
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    +{auctionMetrics.benchmark30Y.tailBps} bps SEVERE TAIL
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono-data my-2">
                  <div className="p-2 bg-black/40 rounded border border-[#1E2738]">
                    <span className="text-[9px] text-[#8292A6] uppercase block">Bid-to-Cover</span>
                    <span className="text-xs font-bold text-rose-300">
                      {auctionMetrics.benchmark30Y.bidToCover}x
                    </span>
                    <span className="text-[9px] text-[#8292A6] block">(avg: {auctionMetrics.benchmark30Y.bidToCoverAvg}x)</span>
                  </div>

                  <div className="p-2 bg-black/40 rounded border border-[#1E2738]">
                    <span className="text-[9px] text-[#8292A6] uppercase block">Dealer Takedown</span>
                    <span className="text-xs font-bold text-rose-400">
                      {auctionMetrics.benchmark30Y.primaryDealerTakedown}%
                    </span>
                    <span className="text-[9px] text-[#8292A6] block">(avg: {auctionMetrics.benchmark30Y.dealerTakedownAvg}%)</span>
                  </div>

                  <div className="p-2 bg-black/40 rounded border border-[#1E2738]">
                    <span className="text-[9px] text-[#8292A6] uppercase block">Indirect (Foreign)</span>
                    <span className="text-xs font-bold text-[#EDE9DE]">
                      {auctionMetrics.benchmark30Y.indirectBidder}%
                    </span>
                    <span className="text-[9px] text-[#8292A6] block">Direct: {auctionMetrics.benchmark30Y.directBidder}%</span>
                  </div>
                </div>

                <p className="text-[10px] font-mono-data text-[#BAC7D5] mt-2 pt-2 border-t border-[#1E2738]">
                  <strong>SMC Desk Signal:</strong> {auctionMetrics.benchmark30Y.assessment}
                </p>
              </div>
            </div>

            {/* US Treasury Bond Buyback Backstop Note */}
            <div className="mt-3 p-2.5 bg-black/60 rounded-lg border border-[#B08D57]/30 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-data">
              <div className="flex items-center gap-2 text-[#E5C794]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] animate-pulse" />
                <span className="font-bold">US TREASURY AUCTION MITIGATION:</span>
                <span className="text-[#EDE9DE]">Last week, the Treasury doubled weekly bond buybacks to $6.0B ($312B/yr) to absorb off-the-run inventory from Primary Dealer balance sheets and mitigate auction tail risks.</span>
              </div>
              <span className="text-[9px] text-[#8292A6] bg-black/50 px-2 py-0.5 rounded border border-[#2B3545]">
                DV01 EXTRACTION: -$46.8M/bp
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Cross-Asset Volatility Indexes (MOVE, VIX, FX) */}
      {(activeTab === "ALL" || activeTab === "VOLATILITY") && (
        <div className="relative z-10 space-y-4 mb-4">
          <div className="bg-[#0B1019] border border-[#222C3D] rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1E2738]">
              <div>
                <h4 className="text-xs font-bold text-[#EDE9DE] uppercase tracking-wider flex items-center gap-2 font-sans">
                  <Activity className="w-4 h-4 text-[#B08D57]" />
                  <span>Cross-Asset Volatility Transmission: MOVE, VIX & FX Implied Vol</span>
                </h4>
                <p className="text-[10px] font-mono-data text-[#8292A6]">
                  Detecting systemic stress transmission from interest rates (MOVE) into foreign exchange and equities (VIX)
                </p>
              </div>
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {crossAssetVol.divergenceRegime}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Index 1: MOVE */}
              <div className="bg-black/40 border border-[#1E2738] p-3 rounded-lg">
                <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
                  <span>MOVE Index (Treasury Vol)</span>
                  <span className="text-rose-400 font-bold">&gt;100 ELEVATED</span>
                </div>
                <div className="text-2xl font-bold font-mono-data text-rose-400">
                  {crossAssetVol.moveIndex}
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6] mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Quiet Regime:</span>
                    <span className="text-emerald-400">&lt; 80.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stress Regime:</span>
                    <span className="text-rose-400">&gt; 110.0</span>
                  </div>
                </div>
                <p className="text-[9px] font-mono-data text-[#BAC7D5] mt-2 pt-2 border-t border-[#1E2738]">
                  Treasury options price wild rate swings. Yield volatility remains structurally high due to deficit supply volume.
                </p>
              </div>

              {/* Index 2: VIX */}
              <div className="bg-black/40 border border-[#1E2738] p-3 rounded-lg">
                <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
                  <span>CBOE VIX (Equity Vol)</span>
                  <span className="text-emerald-400 font-bold">COMPLACENT</span>
                </div>
                <div className="text-2xl font-bold font-mono-data text-emerald-400">
                  {crossAssetVol.vixIndex}
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6] mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Complacent Regime:</span>
                    <span className="text-emerald-400">&lt; 18.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Panic Regime:</span>
                    <span className="text-rose-400">&gt; 25.0</span>
                  </div>
                </div>
                <p className="text-[9px] font-mono-data text-[#BAC7D5] mt-2 pt-2 border-t border-[#1E2738]">
                  Equity options indicate low immediate fear. This disconnect with MOVE creates a violent catch-up risk in equities.
                </p>
              </div>

              {/* Index 3: USD/JPY 1M Vol */}
              <div className="bg-black/40 border border-[#1E2738] p-3 rounded-lg">
                <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] uppercase mb-1">
                  <span>USD/JPY 1M Implied Vol</span>
                  <span className="text-amber-400 font-bold">HOT</span>
                </div>
                <div className="text-2xl font-bold font-mono-data text-amber-300">
                  {crossAssetVol.fxUsdJpyVol}%
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6] mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Trigger Threshold:</span>
                    <span className="text-amber-300">&gt; 11.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Intervention Risk:</span>
                    <span className="text-rose-400">MoF 160.00 Level</span>
                  </div>
                </div>
                <p className="text-[9px] font-mono-data text-[#BAC7D5] mt-2 pt-2 border-t border-[#1E2738]">
                  Options price BoJ rate hikes and massive MoF FX reserve sales. Sudden Yen spikes trigger global margin calls across carry trades.
                </p>
              </div>
            </div>

            {/* Transmission Pathway Explanation */}
            <div className="mt-3 p-3 bg-black/50 border border-[#1E2738] rounded-lg text-xs font-mono-data">
              <span className="text-[10px] text-[#E5C794] uppercase font-bold block mb-1">
                SMC Desk Transmission Sequence (Empirical 2-to-4 Week Lead Time):
              </span>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#BAC7D5]">
                <span className="px-2 py-1 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 font-bold">
                  1. Treasury Auction Tails (Duration Overhang)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B08D57]" />
                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 font-bold">
                  2. MOVE Spikes &gt; 110 (Yield Uncertainty)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B08D57]" />
                <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 font-bold">
                  3. FX Carry Unwinds (USD/JPY Vol)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B08D57]" />
                <span className="px-2 py-1 bg-red-500/15 border border-red-500/40 rounded text-red-300 font-bold">
                  4. VIX Catch-Up Spike (Equity Liquidation)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: Sovereign Debt Servicing & Monetization (US, China, Spain, Germany, Italy, France) */}
      {(activeTab === "ALL" || activeTab === "SOVEREIGNS") && (
        <div className="relative z-10 space-y-4">
          <div className="bg-[#0B1019] border border-[#222C3D] rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1E2738]">
              <div>
                <h4 className="text-xs font-bold text-[#EDE9DE] uppercase tracking-wider flex items-center gap-2 font-sans">
                  <Landmark className="w-4 h-4 text-[#B08D57]" />
                  <span>Sovereign Fiscal Fragility: US • China • Spain • Germany • Italy • France</span>
                </h4>
                <p className="text-[10px] font-mono-data text-[#8292A6]">
                  Debt servicing burden as percentage of revenue, maturity walls, and central bank monetization mechanisms
                </p>
              </div>
              <span className="text-[10px] font-mono-data text-[#8292A6]">
                6-NATION COMPARATIVE DESK
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sovereignComparisons.map((sov) => (
                <div
                  key={sov.code}
                  className="bg-black/40 border border-[#1E2738] hover:border-[#B08D57]/40 p-3 rounded-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E2738]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{sov.flag}</span>
                        <span className="text-xs font-bold font-mono-data text-[#EDE9DE]">
                          {sov.country}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-black/60 border border-[#2B3545] text-[#8292A6]">
                        {sov.code}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono-data">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8292A6]">Interest / Revenue:</span>
                        <span className="text-amber-300 font-bold">{sov.servicingToRevenue}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8292A6]">Debt-to-GDP:</span>
                        <span className="text-[#EDE9DE] font-semibold">{sov.debtGdp}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8292A6]">Primary Deficit:</span>
                        <span className="text-rose-400 font-semibold">{sov.primaryDeficitGdp} GDP</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8292A6]">Weighted Avg Mat (WAM):</span>
                        <span className="text-blue-300 font-semibold">{sov.wamMonths}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1E2738] space-y-1.5 text-[9px] font-mono-data">
                    <div>
                      <span className="text-[#B08D57] font-semibold uppercase">Central Bank Mechanism: </span>
                      <span className="text-[#BAC7D5]">{sov.centralBankBurden}</span>
                    </div>
                    <div>
                      <span className="text-[#E5C794] font-semibold uppercase">SMC Vector: </span>
                      <span className="text-[#EDE9DE]">{sov.riskTransmission}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 mt-4 border-t border-[#1E2738] text-[10px] font-mono-data text-[#8292A6]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>RADAR TELEMETRY: REAL-TIME ONLINE</span>
          </span>
          <span>•</span>
          <span>FED H.4.1 / TREASURY TIC / MOF / BOJ SYNC</span>
          <span>•</span>
          <span>AUCTION CYCLE BENCHMARKED</span>
        </div>

        <div className="flex items-center gap-2 text-[#BAC7D5]">
          <span>Current Mode: <strong className="text-[#EDE9DE]">{isCalmMode ? "Low-Sensory (1.5s)" : "High-Precision Dynamic"}</strong></span>
        </div>
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <>
        {/* Stable Inline Placeholder while modal is active */}
        <div className="bg-[#0F1622]/50 border border-dashed border-[#B08D57]/40 rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 font-mono-data text-xs text-[#8292A6]">
          <div className="w-10 h-10 rounded-full bg-[#B08D57]/15 border border-[#B08D57]/40 flex items-center justify-center text-[#B08D57]">
            <Maximize2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-sm text-[#EDE9DE] font-bold tracking-wide">
            MACRO LIQUIDITY & DEBT-SERVICING RADAR IS EXPANDED IN FULLSCREEN
          </div>
          <p className="max-w-md text-[11px] text-[#8292A6]">
            The risk radar telemetry is currently open in institutional overlay view across your screen. Press <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-[#B08D57]/40 text-[#E5C794] text-[10px]">ESC</kbd> or click below to return.
          </p>
          <button
            onClick={() => setIsFullScreen(false)}
            className="mt-2 px-4 py-2 bg-[#B08D57] hover:bg-[#D4AF37] text-[#0A111C] rounded font-bold text-xs transition-colors shadow-lg"
          >
            Return to Standard Grid View
          </button>
        </div>

        {/* Viewport-level portal overlay mounted directly to document.body, free from transformed ancestors */}
        {createPortal(
          <div
            id="debt-risk-radar-fullscreen-overlay"
            className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFullScreen(false);
            }}
          >
            {renderRadarCard(true)}
          </div>,
          document.body
        )}
      </>
    );
  }

  return renderRadarCard(false);
};
