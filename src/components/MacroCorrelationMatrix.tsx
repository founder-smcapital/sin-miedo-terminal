import React, { useState, useMemo, useEffect } from "react";
import {
  Grid,
  TrendingUp,
  Activity,
  Layers,
  Info,
  Shield,
  Zap,
  Flame,
  Globe,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
  X
} from "lucide-react";
import { MacroDataState } from "../types";
import { ChartExportDropdown, ChartExportData } from "./ChartExportDropdown";
import { exportMatrix9x9Pdf, exportMatrix9x9Png } from "../utils/chartExportUtils";

interface MacroCorrelationMatrixProps {
  macroData: MacroDataState;
}

type MatrixTimeframe = "30D" | "90D" | "1Y" | "STRESS";

interface AssetDef {
  id: string;
  ticker: string;
  label: string;
  category: "Precious Metals" | "Energy" | "FX" | "Equities" | "Rates" | "Geopolitics" | "Digital Assets";
  badgeColor: string;
}

interface CorrelationPairDetail {
  r: number;
  shift30d: string;
  mechanism: string;
  tradingImplication: string;
  regime: "Strong Positive" | "Moderate Positive" | "Decoupled / Neutral" | "Moderate Inverse" | "Strong Inverse";
}

const ASSETS: AssetDef[] = [
  { id: "xau", ticker: "XAU/USD", label: "Gold Spot", category: "Precious Metals", badgeColor: "text-[#E5C794] border-[#B08D57]/40 bg-[#B08D57]/15" },
  { id: "btc", ticker: "BTC/USD", label: "Bitcoin Spot", category: "Digital Assets", badgeColor: "text-[#F7931A] border-[#F7931A]/40 bg-[#F7931A]/15" },
  { id: "brent", ticker: "BRENT", label: "Crude Oil", category: "Energy", badgeColor: "text-[#FF8585] border-[#A6291C]/40 bg-[#A6291C]/15" },
  { id: "usdjpy", ticker: "USD/JPY", label: "Dollar / Yen", category: "FX", badgeColor: "text-[#8292A6] border-[#253347] bg-black/40" },
  { id: "eurusd", ticker: "EUR/USD", label: "Euro / Dollar", category: "FX", badgeColor: "text-[#8292A6] border-[#253347] bg-black/40" },
  { id: "ibex", ticker: "IBEX 35", label: "Spanish Index", category: "Equities", badgeColor: "text-[#10B981] border-[#10B981]/30 bg-[#10B981]/15" },
  { id: "gpr", ticker: "GPR IDX", label: "Geopolitical Risk", category: "Geopolitics", badgeColor: "text-[#FF8585] border-[#A6291C]/50 bg-[#A6291C]/20" },
  { id: "ustjgb", ticker: "UST-JGB", label: "10Y Yield Spread", category: "Rates", badgeColor: "text-[#E5C794] border-[#B08D57]/30 bg-black/40" },
  { id: "shadow", ticker: "SHADOW-AIS", label: "Dark Fleet Flow", category: "Energy", badgeColor: "text-[#A6291C] border-[#A6291C]/40 bg-[#A6291C]/10" }
];

export const MacroCorrelationMatrix: React.FC<MacroCorrelationMatrixProps> = ({ macroData }) => {
  const [timeframe, setTimeframe] = useState<MatrixTimeframe>("30D");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string } | null>(null);
  const [pinnedCell, setPinnedCell] = useState<{ row: string; col: string } | null>({ row: "btc", col: "xau" });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Handle ESC key to exit fullscreen and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  // Correlation Matrices across regimes
  const matrixData: Record<MatrixTimeframe, Record<string, Record<string, number>>> = useMemo(() => ({
    "30D": {
      xau:    { xau: 1.00, btc: 0.56, brent: 0.74, usdjpy: -0.62, eurusd: 0.48, ibex: -0.42, gpr: 0.82, ustjgb: -0.68, shadow: 0.58 },
      btc:    { xau: 0.56, btc: 1.00, brent: 0.28, usdjpy: -0.42, eurusd: 0.46, ibex: 0.52, gpr: 0.24, ustjgb: -0.48, shadow: 0.22 },
      brent:  { xau: 0.74, btc: 0.28, brent: 1.00, usdjpy: 0.64, eurusd: -0.56, ibex: -0.58, gpr: 0.79, ustjgb: 0.44, shadow: 0.68 },
      usdjpy: { xau: -0.62, btc: -0.42, brent: 0.64, usdjpy: 1.00, eurusd: -0.84, ibex: 0.28, gpr: 0.32, ustjgb: 0.76, shadow: 0.45 },
      eurusd: { xau: 0.48, btc: 0.46, brent: -0.56, usdjpy: -0.84, eurusd: 1.00, ibex: 0.45, gpr: -0.38, ustjgb: -0.72, shadow: -0.34 },
      ibex:   { xau: -0.42, btc: 0.52, brent: -0.58, usdjpy: 0.28, eurusd: 0.45, ibex: 1.00, gpr: -0.64, ustjgb: 0.18, shadow: -0.48 },
      gpr:    { xau: 0.82, btc: 0.24, brent: 0.79, usdjpy: 0.32, eurusd: -0.38, ibex: -0.64, gpr: 1.00, ustjgb: -0.22, shadow: 0.86 },
      ustjgb: { xau: -0.68, btc: -0.48, brent: 0.44, usdjpy: 0.76, eurusd: -0.72, ibex: 0.18, gpr: -0.22, ustjgb: 1.00, shadow: 0.15 },
      shadow: { xau: 0.58, btc: 0.22, brent: 0.68, usdjpy: 0.45, eurusd: -0.34, ibex: -0.48, gpr: 0.86, ustjgb: 0.15, shadow: 1.00 }
    },
    "90D": {
      xau:    { xau: 1.00, btc: 0.48, brent: 0.65, usdjpy: -0.54, eurusd: 0.52, ibex: -0.34, gpr: 0.76, ustjgb: -0.61, shadow: 0.52 },
      btc:    { xau: 0.48, btc: 1.00, brent: 0.22, usdjpy: -0.38, eurusd: 0.50, ibex: 0.46, gpr: 0.18, ustjgb: -0.42, shadow: 0.18 },
      brent:  { xau: 0.65, btc: 0.22, brent: 1.00, usdjpy: 0.58, eurusd: -0.48, ibex: -0.51, gpr: 0.71, ustjgb: 0.38, shadow: 0.62 },
      usdjpy: { xau: -0.54, btc: -0.38, brent: 0.58, usdjpy: 1.00, eurusd: -0.88, ibex: 0.32, gpr: 0.26, ustjgb: 0.82, shadow: 0.38 },
      eurusd: { xau: 0.52, btc: 0.50, brent: -0.48, usdjpy: -0.88, eurusd: 1.00, ibex: 0.48, gpr: -0.32, ustjgb: -0.76, shadow: -0.28 },
      ibex:   { xau: -0.34, btc: 0.46, brent: -0.51, usdjpy: 0.32, eurusd: 0.48, ibex: 1.00, gpr: -0.56, ustjgb: 0.22, shadow: -0.41 },
      gpr:    { xau: 0.76, btc: 0.18, brent: 0.71, usdjpy: 0.26, eurusd: -0.32, ibex: -0.56, gpr: 1.00, ustjgb: -0.18, shadow: 0.81 },
      ustjgb: { xau: -0.61, btc: -0.42, brent: 0.38, usdjpy: 0.82, eurusd: -0.76, ibex: 0.22, gpr: -0.18, ustjgb: 1.00, shadow: 0.12 },
      shadow: { xau: 0.52, btc: 0.18, brent: 0.62, usdjpy: 0.38, eurusd: -0.28, ibex: -0.41, gpr: 0.81, ustjgb: 0.12, shadow: 1.00 }
    },
    "1Y": {
      xau:    { xau: 1.00, btc: 0.42, brent: 0.48, usdjpy: -0.38, eurusd: 0.62, ibex: -0.18, gpr: 0.68, ustjgb: -0.52, shadow: 0.42 },
      btc:    { xau: 0.42, btc: 1.00, brent: 0.18, usdjpy: -0.32, eurusd: 0.54, ibex: 0.42, gpr: 0.12, ustjgb: -0.38, shadow: 0.12 },
      brent:  { xau: 0.48, btc: 0.18, brent: 1.00, usdjpy: 0.42, eurusd: -0.35, ibex: -0.38, gpr: 0.58, ustjgb: 0.28, shadow: 0.54 },
      usdjpy: { xau: -0.38, btc: -0.32, brent: 0.42, usdjpy: 1.00, eurusd: -0.92, ibex: 0.41, gpr: 0.15, ustjgb: 0.88, shadow: 0.26 },
      eurusd: { xau: 0.62, btc: 0.54, brent: -0.35, usdjpy: -0.92, eurusd: 1.00, ibex: 0.52, gpr: -0.21, ustjgb: -0.84, shadow: -0.18 },
      ibex:   { xau: -0.18, btc: 0.42, brent: -0.38, usdjpy: 0.41, eurusd: 0.52, ibex: 1.00, gpr: -0.42, ustjgb: 0.31, shadow: -0.32 },
      gpr:    { xau: 0.68, btc: 0.12, brent: 0.58, usdjpy: 0.15, eurusd: -0.21, ibex: -0.42, gpr: 1.00, ustjgb: -0.09, shadow: 0.74 },
      ustjgb: { xau: -0.52, btc: -0.38, brent: 0.28, usdjpy: 0.88, eurusd: -0.84, ibex: 0.31, gpr: -0.09, ustjgb: 1.00, shadow: 0.08 },
      shadow: { xau: 0.42, btc: 0.12, brent: 0.54, usdjpy: 0.26, eurusd: -0.18, ibex: -0.32, gpr: 0.74, ustjgb: 0.08, shadow: 1.00 }
    },
    "STRESS": {
      xau:    { xau: 1.00, btc: 0.35, brent: 0.88, usdjpy: -0.74, eurusd: 0.22, ibex: -0.72, gpr: 0.94, ustjgb: -0.78, shadow: 0.76 },
      btc:    { xau: 0.35, btc: 1.00, brent: 0.42, usdjpy: -0.68, eurusd: 0.25, ibex: 0.65, gpr: 0.15, ustjgb: -0.62, shadow: 0.18 },
      brent:  { xau: 0.88, btc: 0.42, brent: 1.00, usdjpy: 0.78, eurusd: -0.74, ibex: -0.84, gpr: 0.91, ustjgb: 0.58, shadow: 0.84 },
      usdjpy: { xau: -0.74, btc: -0.68, brent: 0.78, usdjpy: 1.00, eurusd: -0.81, ibex: 0.12, gpr: 0.51, ustjgb: 0.68, shadow: 0.62 },
      eurusd: { xau: 0.22, btc: 0.25, brent: -0.74, usdjpy: -0.81, eurusd: 1.00, ibex: 0.38, gpr: -0.55, ustjgb: -0.64, shadow: -0.49 },
      ibex:   { xau: -0.72, btc: 0.65, brent: -0.84, usdjpy: 0.12, eurusd: 0.38, ibex: 1.00, gpr: -0.82, ustjgb: 0.05, shadow: -0.68 },
      gpr:    { xau: 0.94, btc: 0.15, brent: 0.91, usdjpy: 0.51, eurusd: -0.55, ibex: -0.82, gpr: 1.00, ustjgb: -0.34, shadow: 0.95 },
      ustjgb: { xau: -0.78, btc: -0.62, brent: 0.58, usdjpy: 0.68, eurusd: -0.64, ibex: 0.05, gpr: -0.34, ustjgb: 1.00, shadow: 0.28 },
      shadow: { xau: 0.76, btc: 0.18, brent: 0.84, usdjpy: 0.62, eurusd: -0.49, ibex: -0.68, gpr: 0.95, ustjgb: 0.28, shadow: 1.00 }
    }
  }), []);

  // Qualitative analysis for clicked or hovered pair
  const activePairDetail = useMemo((): { rowAsset: AssetDef; colAsset: AssetDef; detail: CorrelationPairDetail } => {
    const active = hoveredCell || pinnedCell || { row: "xau", col: "gpr" };
    const rowAsset = ASSETS.find(a => a.id === active.row) || ASSETS[0];
    const colAsset = ASSETS.find(a => a.id === active.col) || ASSETS[5];
    const r = matrixData[timeframe][rowAsset.id]?.[colAsset.id] ?? 1.00;

    let regime: CorrelationPairDetail["regime"] = "Decoupled / Neutral";
    if (r >= 0.70) regime = "Strong Positive";
    else if (r >= 0.30) regime = "Moderate Positive";
    else if (r <= -0.70) regime = "Strong Inverse";
    else if (r <= -0.30) regime = "Moderate Inverse";

    // Macro narrative lookups
    const pairKey = [rowAsset.id, colAsset.id].sort().join("-");
    let mechanism = "Statistical cross-asset covariance driven by global liquidity conditions and macro factor betas.";
    let tradingImplication = "Maintain risk-parity position sizing and evaluate tail-risk variance.";
    let shift30d = "+0.04 (Steady)";

    if (pairKey === "btc-xau") {
      mechanism = "Dual monetary debasement and fiat liquidity expansion hedge. Both physical Gold and Bitcoin capture institutional reserve reallocation away from sovereign debt degradation.";
      tradingImplication = "Barbell long XAU + long BTC allocation optimizes monetary debasement capture while dampening volatility.";
      shift30d = "+0.14 (Expanding)";
    } else if (pairKey === "btc-usdjpy") {
      mechanism = "Global Yen carry trade transmission. Rapid JPY appreciation triggers mechanical margin deleveraging across institutional crypto perpetuals.";
      tradingImplication = "BoJ rate check jawboning at 160.50 acts as an early warning leading indicator for sudden crypto leverage flushes.";
      shift30d = "-0.08 (Tightening)";
    } else if (pairKey === "btc-gpr") {
      mechanism = "Biphasic reaction during acute Middle East kinetic events: initial algorithmic 1-3h leverage liquidation followed by flight to non-sovereign collateral.";
      tradingImplication = "Accumulate post-liquidation dip once perpetual funding rates reset negative rather than buying initial kinetic headline spike.";
      shift30d = "+0.08 (Adaptive)";
    } else if (pairKey === "brent-btc") {
      mechanism = "Macro commodity supply shock beta. Sustained crude inflation delays central bank rate cuts, temporarily tightening high-beta asset valuations.";
      tradingImplication = "Monitor Brent $90+ barrier as an overhead hurdle for speculative crypto risk appetite.";
      shift30d = "+0.05 (Reflationary)";
    } else if (pairKey === "gpr-xau") {
      mechanism = "Flight to unencumbered physical sovereign reserves during geopolitical kinetic escalation in Hormuz & Red Sea corridors.";
      tradingImplication = "Long XAU/USD serves as prime direct macro delta hedge against GPR spikes >360.";
      shift30d = "+0.14 (Surging)";
    } else if (pairKey === "brent-xau") {
      mechanism = "Simultaneous pricing of geopolitical supply disruptions (Brent) and monetary debasement safe-haven demand (Gold).";
      tradingImplication = "Positive co-movement allows barbell momentum strategies during stagflationary geopolitical shocks.";
      shift30d = "+0.09 (Expanding)";
    } else if (pairKey === "brent-usdjpy") {
      mechanism = "Japan imports 99.7% of crude requirements; Brent price increases directly deteriorate Japan's terms of trade, weakening JPY.";
      tradingImplication = "Rising oil places additional depreciation pressure on USD/JPY toward MoF intervention thresholds.";
      shift30d = "+0.06 (Elevated)";
    } else if (pairKey === "brent-ibex") {
      mechanism = "Crude spikes introduce energy input cost inflation, squeezing European industrial margins and discretionary spending.";
      tradingImplication = "IBEX 35 short overlay provides robust beta hedge against acute Middle East energy supply disruptions.";
      shift30d = "-0.07 (Deepening)";
    } else if (pairKey === "usdjpy-ustjgb") {
      mechanism = "Core interest rate differential between US 10Y Treasuries and Japanese JGBs governs FX carry-trade momentum.";
      tradingImplication = "Track BoJ rate hike timing & 10Y yield caps to anticipate structural USD/JPY trend reversals.";
      shift30d = "-0.06 (Tightening)";
    } else if (pairKey === "gpr-shadow") {
      mechanism = "Escalated geopolitical friction increases dark fleet STS transshipment velocity and sanction arbitrage premiums.";
      tradingImplication = "Shadow fleet dark volume serves as a leading indicator of actual physical supply circumventing Western sanctions.";
      shift30d = "+0.12 (High Beta)";
    } else if (pairKey === "eurusd-usdjpy") {
      mechanism = "Broad US Dollar Index (DXY) directional strength across major G10 currency reserve pairs.";
      tradingImplication = "Strong inverse correlation enables cross-currency volatility arbitrage.";
      shift30d = "+0.04 (Consistent)";
    }

    return {
      rowAsset,
      colAsset,
      detail: {
        r,
        shift30d,
        mechanism,
        tradingImplication,
        regime
      }
    };
  }, [hoveredCell, pinnedCell, timeframe, matrixData]);

  // Color generator for correlation cell
  const getCellStyling = (r: number, isDiagonal: boolean, isSelected: boolean) => {
    if (isDiagonal) {
      return "bg-[#B08D57]/20 text-[#EDE9DE] font-bold border-[#B08D57]/30";
    }

    let bgClass = "bg-black/40 text-[#8292A6] border-[#253347]/40";
    if (r >= 0.70) {
      bgClass = "bg-[#B08D57]/35 text-[#F5E5C9] font-bold border-[#B08D57]/60 shadow-[inset_0_0_10px_rgba(176,141,87,0.2)]";
    } else if (r >= 0.30) {
      bgClass = "bg-[#B08D57]/15 text-[#E5C794] font-medium border-[#B08D57]/30";
    } else if (r <= -0.70) {
      bgClass = "bg-[#A6291C]/40 text-[#FFA4A4] font-bold border-[#A6291C]/60 shadow-[inset_0_0_10px_rgba(166,41,28,0.25)]";
    } else if (r <= -0.30) {
      bgClass = "bg-[#A6291C]/20 text-[#FF8585] font-medium border-[#A6291C]/30";
    }

    if (isSelected) {
      return `${bgClass} ring-2 ring-[#B08D57] scale-105 z-20 shadow-lg`;
    }

    return bgClass;
  };

  return (
    <>
      {/* Modal backdrop when expanded full-screen */}
      {isExpanded && (
        <div
          id="macro-correlation-matrix-backdrop"
          className="fixed inset-0 z-50 bg-[#070D18]/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div
        id="macro-correlation-matrix-card"
        className={
          isExpanded
            ? "fixed inset-2 sm:inset-4 lg:inset-6 z-50 bg-[#0A101C] border-2 border-[#B08D57]/70 rounded-2xl p-4 sm:p-6 shadow-[0_0_90px_rgba(0,0,0,0.95)] overflow-y-auto flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200"
            : "bg-[#101622] border border-[#B08D57]/35 hover:border-[#B08D57]/55 rounded-xl p-4 sm:p-6 transition-all shadow-2xl relative overflow-hidden"
        }
      >
        {/* Subtle top brass highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent pointer-events-none" />

        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#B08D57]/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#B08D57]/30 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-black/70 border border-[#B08D57]/45 text-[#E5C794] shadow-inner">
              <Grid className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif italic text-xl sm:text-2xl font-bold tracking-tight text-[#FBF8F1]" style={{ fontFamily: "Georgia, 'Newsreader', serif" }}>
                  Cross-Asset Macro Correlation & Transmission Matrix
                </h3>
                <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/50 px-2.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  WAR-RISK COVARIANCE
                </span>
                {isExpanded && (
                  <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 px-2 py-0.5 rounded">
                    EXPANDED FULL SCREEN
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono-data text-[#BAC7D5] mt-0.5 tracking-wider uppercase font-semibold">
                CROSS-ASSET ELASTICITY // GOLD, BRENT, USD/JPY, IBEX & GEOPOLITICAL BETA RELATIONSHIPS
              </p>
            </div>
          </div>

          {/* Timeframe selector & Filter controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-black/70 p-1 rounded-lg border border-[#B08D57]/30 text-[10px] font-mono-data shadow-inner">
              {(
                [
                  { id: "30D", label: "30D Rolling" },
                  { id: "90D", label: "90D Rolling" },
                  { id: "1Y", label: "1Y Regime" },
                  { id: "STRESS", label: "Crisis Stress" }
                ] as const
              ).map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-2.5 py-1 rounded transition-all uppercase font-medium ${
                    timeframe === tf.id
                      ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md scale-105"
                      : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Chart Export Dropdown (CSV, PDF, PNG, Copy) */}
            <ChartExportDropdown
              chartTitle="Cross-Asset 9x9 Macro Correlation Matrix"
              chartContainerId="macro-correlation-matrix-card"
              subtitle={`SMC 9X9 TRANSMISSION MATRIX // ${timeframe} REGIME`}
              getCsvData={() => {
                const currentMatrix = matrixData[timeframe];
                const headers = ["Asset ID", "Ticker", "Asset Name", "Category", ...ASSETS.map((a) => a.ticker)];
                const rows = ASSETS.map((rowAsset) => {
                  const assetRowValues = ASSETS.map((colAsset) => {
                    const val = currentMatrix[rowAsset.id]?.[colAsset.id] ?? (rowAsset.id === colAsset.id ? 1.0 : 0.0);
                    return val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
                  });
                  return [
                    rowAsset.id.toUpperCase(),
                    rowAsset.ticker,
                    rowAsset.label,
                    rowAsset.category,
                    ...assetRowValues,
                  ];
                });
                return {
                  filename: `smc-macro-matrix-9x9-${timeframe.toLowerCase()}`,
                  headers,
                  rows,
                  metaComments: [
                    "SIN MIEDO CAPITAL // 9X9 CROSS-ASSET MACRO CORRELATION MATRIX",
                    `Regime Timeframe: ${timeframe} Rolling Covariance`,
                    "Instruments: Gold, Bitcoin, Brent, USD/JPY, EUR/USD, IBEX 35, GPR Index, UST-JGB, Dark Fleet",
                  ],
                };
              }}
              onExportPdf={() => {
                exportMatrix9x9Pdf(matrixData[timeframe], timeframe);
              }}
              onExportPng={() => {
                exportMatrix9x9Png(matrixData[timeframe], timeframe);
              }}
            />

            {/* Full Screen Toggle Button */}
            <button
              id="macro-correlation-fullscreen-btn"
              data-export-ignore="true"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Exit Full Screen [ESC]" : "Open Macro Correlation Matrix in Full Screen"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono-data font-bold transition-all shadow-sm ${
                isExpanded
                  ? "bg-[#B08D57] text-[#0A111C] border-[#B08D57] shadow-[0_0_15px_rgba(176,141,87,0.4)]"
                  : "bg-black/70 hover:bg-[#B08D57]/20 text-[#E5C794] border-[#B08D57]/35 hover:border-[#B08D57] hover:text-[#EDE9DE]"
              }`}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>EXIT FULL SCREEN</span>
                  <span className="text-[9px] opacity-75 font-normal ml-0.5">[ESC]</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span className="hidden sm:inline">FULL SCREEN</span>
                </>
              )}
            </button>

            {isExpanded && (
              <button
                id="close-matrix-fullscreen-btn"
                data-export-ignore="true"
                onClick={() => setIsExpanded(false)}
                title="Close Full Screen [ESC]"
                className="p-1.5 rounded-lg bg-black/70 border border-[#B08D57]/40 text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#B08D57] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      {/* Asset Focus Quick Filters */}
      <div className="flex flex-wrap items-center gap-1.5 my-3 text-[10px] font-mono-data">
        <span className="text-[#8292A6] uppercase mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3 text-[#B08D57]" />
          Filter Asset:
        </span>
        <button
          onClick={() => setSelectedAssetId(null)}
          className={`px-2 py-0.5 rounded border transition-all ${
            selectedAssetId === null
              ? "bg-[#B08D57]/25 text-[#E5C794] border-[#B08D57]/50 font-bold"
              : "bg-black/40 text-[#8292A6] border-[#253347] hover:text-[#EDE9DE]"
          }`}
        >
          All (9x9)
        </button>
        {ASSETS.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setSelectedAssetId(selectedAssetId === asset.id ? null : asset.id)}
            className={`px-2 py-0.5 rounded border transition-all ${
              selectedAssetId === asset.id
                ? "bg-[#B08D57] text-[#0E1A2B] font-bold border-[#B08D57]"
                : `${asset.badgeColor} hover:brightness-125`
            }`}
          >
            {asset.ticker}
          </button>
        ))}
      </div>

      {/* Main Grid + Inspector Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-2">
        {/* Left Side: CSS Grid Correlation Matrix (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-black/50 border border-[#B08D57]/20 rounded-xl p-3 sm:p-4 overflow-x-auto">
          <div className="min-w-[540px]">
            {/* Column Headers */}
            <div className="grid grid-cols-10 gap-1.5 pb-2 text-[10px] font-mono-data font-bold text-center border-b border-[#B08D57]/15">
              <div className="text-left text-[#8292A6] pl-1 font-normal">Asset</div>
              {ASSETS.map((col) => {
                const isColActive =
                  (hoveredCell && hoveredCell.col === col.id) ||
                  (pinnedCell && pinnedCell.col === col.id) ||
                  selectedAssetId === col.id;
                return (
                  <div
                    key={col.id}
                    className={`truncate p-1 rounded transition-colors ${
                      isColActive ? "bg-[#B08D57]/20 text-[#E5C794] ring-1 ring-[#B08D57]/50" : "text-[#8292A6]"
                    }`}
                  >
                    {col.ticker}
                  </div>
                );
              })}
            </div>

            {/* Matrix Rows */}
            <div className="space-y-1.5 pt-2">
              {ASSETS.map((row) => {
                const isRowDimmed = selectedAssetId !== null && selectedAssetId !== row.id;
                const isRowActive =
                  (hoveredCell && hoveredCell.row === row.id) ||
                  (pinnedCell && pinnedCell.row === row.id) ||
                  selectedAssetId === row.id;

                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-10 gap-1.5 items-center transition-opacity ${
                      isRowDimmed ? "opacity-35" : "opacity-100"
                    }`}
                  >
                    {/* Row Label Header */}
                    <div
                      className={`text-[10px] font-mono-data font-bold truncate pl-1 py-1 rounded cursor-pointer transition-colors ${
                        isRowActive ? "text-[#E5C794] bg-[#B08D57]/15" : "text-[#8292A6] hover:text-[#EDE9DE]"
                      }`}
                      onClick={() => setSelectedAssetId(selectedAssetId === row.id ? null : row.id)}
                    >
                      {row.ticker}
                    </div>

                    {/* Cells */}
                    {ASSETS.map((col) => {
                      const r = matrixData[timeframe][row.id]?.[col.id] ?? 1.00;
                      const isDiagonal = row.id === col.id;
                      const isSelected =
                        (hoveredCell && hoveredCell.row === row.id && hoveredCell.col === col.id) ||
                        (pinnedCell && pinnedCell.row === row.id && pinnedCell.col === col.id);

                      return (
                        <button
                          key={col.id}
                          onMouseEnter={() => setHoveredCell({ row: row.id, col: col.id })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => setPinnedCell({ row: row.id, col: col.id })}
                          className={`h-9 sm:h-10 rounded border flex flex-col items-center justify-center font-mono-data text-[11px] transition-all cursor-pointer ${getCellStyling(
                            r,
                            isDiagonal,
                            !!isSelected
                          )}`}
                        >
                          <span className="leading-none">
                            {r > 0 && !isDiagonal ? `+${r.toFixed(2)}` : r.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Matrix Legend Footer */}
            <div className="mt-4 pt-3 border-t border-[#B08D57]/15 flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono-data text-[#8292A6]">
              <span className="uppercase text-[#B08D57]">Pearson (r) Scale:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#A6291C]/50 border border-[#A6291C]" />
                  &lt; -0.70 Strong Inv.
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-black/40 border border-[#253347]" />
                  -0.30 to +0.30 Neutral
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#B08D57]/50 border border-[#B08D57]" />
                  &gt; +0.70 Strong Pos.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Transmission Inspector & Deep-Dive Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Pair Card */}
          <div className="bg-black/60 border border-[#B08D57]/30 rounded-xl p-4 sm:p-5 relative shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#B08D57]/15 text-[10px] font-mono-data">
              <span className="text-[#8292A6] uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#B08D57]" />
                Pair Transmission Inspector
              </span>
              <span className="text-[#E5C794] font-bold uppercase tracking-wider bg-[#B08D57]/15 px-2 py-0.5 rounded border border-[#B08D57]/30">
                {timeframe} Mode
              </span>
            </div>

            {/* Pair Headline & Big Coefficient */}
            <div className="my-3 flex items-center justify-between">
              <div>
                <div className="text-base sm:text-lg font-bold font-mono-data text-[#EDE9DE] flex items-center gap-2">
                  <span className="text-[#E5C794]">{activePairDetail.rowAsset.ticker}</span>
                  <span className="text-[#8292A6] text-xs font-normal">↔</span>
                  <span className="text-[#E5C794]">{activePairDetail.colAsset.ticker}</span>
                </div>
                <div className="text-[10px] font-mono-data text-[#8292A6] mt-0.5">
                  {activePairDetail.rowAsset.label} vs {activePairDetail.colAsset.label}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-2xl sm:text-3xl font-bold font-mono-data leading-none ${
                    activePairDetail.detail.r >= 0.70
                      ? "text-[#E5C794]"
                      : activePairDetail.detail.r <= -0.70
                      ? "text-[#FF8585]"
                      : "text-[#EDE9DE]"
                  }`}
                >
                  {activePairDetail.detail.r > 0 ? `+${activePairDetail.detail.r.toFixed(2)}` : activePairDetail.detail.r.toFixed(2)}
                </div>
                <span className="text-[9px] font-mono-data uppercase font-bold tracking-wider text-[#8292A6] mt-1 inline-block">
                  {activePairDetail.detail.regime}
                </span>
              </div>
            </div>

            {/* 30-Day Momentum Shift Bar */}
            <div className="bg-black/40 border border-[#B08D57]/15 rounded p-2.5 text-[10px] font-mono-data flex items-center justify-between">
              <span className="text-[#8292A6]">30D Correlation Delta:</span>
              <span className="text-[#10B981] font-semibold">{activePairDetail.detail.shift30d}</span>
            </div>

            {/* Macroeconomic Transmission Mechanism */}
            <div className="mt-3 space-y-2 text-[11px] font-mono-data">
              <div className="p-3 rounded-lg bg-[#0E1A2B] border border-[#B08D57]/20 text-[#EDE9DE] leading-relaxed">
                <div className="text-[9px] uppercase tracking-wider text-[#B08D57] font-bold mb-1 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#B08D57]" />
                  Macro Transmission Channel:
                </div>
                {activePairDetail.detail.mechanism}
              </div>

              <div className="p-3 rounded-lg bg-[#0E1A2B] border border-[#10B981]/20 text-[#EDE9DE] leading-relaxed">
                <div className="text-[9px] uppercase tracking-wider text-[#10B981] font-bold mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#10B981]" />
                  SMC Execution & Delta Hedge Implication:
                </div>
                {activePairDetail.detail.tradingImplication}
              </div>
            </div>
          </div>

          {/* Key Regime Takeaway Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono-data">
            <div className="bg-black/40 border border-[#B08D57]/15 rounded p-2.5">
              <div className="text-[#8292A6] uppercase text-[9px]">Top Beta Safe-Haven</div>
              <div className="text-[#E5C794] font-bold mt-0.5">XAU ↔ GPR (+0.82)</div>
              <div className="text-[9px] text-[#8292A6] mt-0.5">Physical hedge against war</div>
            </div>

            <div className="bg-black/40 border border-[#B08D57]/15 rounded p-2.5">
              <div className="text-[#8292A6] uppercase text-[9px]">Digital Gold Beta</div>
              <div className="text-[#F7931A] font-bold mt-0.5">BTC ↔ XAU (+0.56)</div>
              <div className="text-[9px] text-[#8292A6] mt-0.5">M2 liquidity expansion hedge</div>
            </div>

            <div className="bg-black/40 border border-[#B08D57]/15 rounded p-2.5">
              <div className="text-[#8292A6] uppercase text-[9px]">Sharpest Energy Drag</div>
              <div className="text-[#FF8585] font-bold mt-0.5">IBEX ↔ Brent (-0.58)</div>
              <div className="text-[9px] text-[#8292A6] mt-0.5">European equity input shock</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
