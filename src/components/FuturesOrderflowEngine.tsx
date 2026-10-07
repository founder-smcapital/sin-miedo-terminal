import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Layers,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  BarChart2,
  Clock,
  Filter,
  Sliders,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2
} from "lucide-react";
import { FuturesContract } from "../data/futuresData";

export interface OrderflowLevel {
  price: number;
  bidVol: number;
  askVol: number;
  delta: number;
  totalVol: number;
  imbalanceSide?: "BID" | "ASK" | "NEUTRAL";
  isPoc?: boolean;
  isVwap?: boolean;
  isIceberg?: boolean;
  icebergSize?: number;
}

export interface TapeTrade {
  id: string;
  time: string;
  price: number;
  size: number;
  side: "BUY" | "SELL";
  type: "RETAIL" | "INSTITUTIONAL" | "WHALE_BLOCK";
  delta: number;
}

interface FuturesOrderflowEngineProps {
  contract: FuturesContract;
  onOpenTerminal?: (prompt?: string) => void;
  isCompact?: boolean;
}

export const FuturesOrderflowEngine: React.FC<FuturesOrderflowEngineProps> = ({
  contract,
  onOpenTerminal,
  isCompact = false,
}) => {
  const [activeTab, setActiveTab] = useState<"DOM" | "CVD" | "TAPE" | "CLUSTERS">("DOM");
  const [tapeFilter, setTapeFilter] = useState<"ALL" | "INSTITUTIONAL" | "WHALE">("ALL");
  const [cvdTickCount, setCvdTickCount] = useState(0);

  // Dynamic simulated tape that receives live orderflow ticks
  const [tapeTrades, setTapeTrades] = useState<TapeTrade[]>([]);

  // Seed deterministic initial tape and DOM based on contract price and volatility
  const baseOrderflow = useMemo(() => {
    const p = contract.price;
    const tickStep = p > 5000 ? 0.25 : p > 500 ? 0.10 : 0.01;
    const isBull = contract.bias.toLowerCase().includes("bull");
    const deltaBiasMultiplier = isBull ? 1.25 : 0.85;

    // Build 14 depth levels (7 asks above, 7 bids below)
    const levels: OrderflowLevel[] = [];
    for (let i = 7; i >= 1; i--) {
      const askPrice = Number((p + i * tickStep * 3).toFixed(2));
      const bidVol = Math.round((20 + Math.abs(Math.sin(p + i) * 120)) * (1 / deltaBiasMultiplier));
      const askVol = Math.round((45 + Math.abs(Math.cos(p + i * 2) * 240)) * (isBull ? 1.1 : 1.4));
      const delta = askVol - bidVol;
      const isIceberg = i === 3 || i === 6;
      levels.push({
        price: askPrice,
        bidVol,
        askVol,
        delta: -delta,
        totalVol: bidVol + askVol,
        imbalanceSide: askVol > bidVol * 1.8 ? "ASK" : "NEUTRAL",
        isPoc: Math.abs(askPrice - contract.levels.poc) < tickStep * 4,
        isVwap: Math.abs(askPrice - contract.levels.vwap) < tickStep * 3,
        isIceberg,
        icebergSize: isIceberg ? Math.round(askVol * 2.8) : undefined,
      });
    }

    // Spot level
    levels.push({
      price: Number(p.toFixed(2)),
      bidVol: Math.round(180 * deltaBiasMultiplier),
      askVol: Math.round(160 / deltaBiasMultiplier),
      delta: Math.round((180 * deltaBiasMultiplier) - (160 / deltaBiasMultiplier)),
      totalVol: Math.round(340 * deltaBiasMultiplier),
      imbalanceSide: isBull ? "BID" : "ASK",
      isVwap: true,
      isPoc: true,
    });

    // Bids below
    for (let i = 1; i <= 7; i++) {
      const bidPrice = Number((p - i * tickStep * 3).toFixed(2));
      const bidVol = Math.round((50 + Math.abs(Math.cos(p - i) * 280)) * deltaBiasMultiplier);
      const askVol = Math.round((15 + Math.abs(Math.sin(p - i * 3) * 90)) * (1 / deltaBiasMultiplier));
      const delta = bidVol - askVol;
      const isIceberg = i === 2 || i === 5;
      levels.push({
        price: bidPrice,
        bidVol,
        askVol,
        delta,
        totalVol: bidVol + askVol,
        imbalanceSide: bidVol > askVol * 1.8 ? "BID" : "NEUTRAL",
        isPoc: Math.abs(bidPrice - contract.levels.poc) < tickStep * 4,
        isVwap: Math.abs(bidPrice - contract.levels.vwap) < tickStep * 3,
        isIceberg,
        icebergSize: isIceberg ? Math.round(bidVol * 3.2) : undefined,
      });
    }

    const totalBids = levels.reduce((acc, l) => acc + l.bidVol, 0);
    const totalAsks = levels.reduce((acc, l) => acc + l.askVol, 0);
    const netDelta = totalBids - totalAsks;
    const imbalancePct = Number(((totalBids / (totalBids + totalAsks || 1)) * 100).toFixed(1));

    return {
      levels,
      totalBids,
      totalAsks,
      netDelta,
      imbalancePct,
      regime: isBull
        ? "COMMERCIAL BID ABSORPTION (+1.8σ DOM Dominance)"
        : "PASSIVE OVERHEAD LIQUIDITY DEFENSE (-1.4σ)",
      absorptionStatus: isBull ? "Aggressive Buyer Delta Absorption" : "Overhead Delta Resistance Wall"
    };
  }, [contract.price, contract.bias, contract.levels.poc, contract.levels.vwap]);

  // Initial tape seed
  useEffect(() => {
    const initialTrades: TapeTrade[] = [];
    const now = Date.now();
    const p = contract.price;
    const isBull = contract.bias.toLowerCase().includes("bull");

    for (let i = 0; i < 18; i++) {
      const tradeTime = new Date(now - i * 2200);
      const isBuy = Math.random() < (isBull ? 0.62 : 0.44);
      const sizeBase = Math.random();
      let size = 1;
      let type: "RETAIL" | "INSTITUTIONAL" | "WHALE_BLOCK" = "RETAIL";

      if (sizeBase > 0.88) {
        size = Math.floor(100 + Math.random() * 240);
        type = "WHALE_BLOCK";
      } else if (sizeBase > 0.55) {
        size = Math.floor(25 + Math.random() * 65);
        type = "INSTITUTIONAL";
      } else {
        size = Math.floor(1 + Math.random() * 18);
        type = "RETAIL";
      }

      const jitter = (Math.random() - 0.5) * 0.4;
      const tradePrice = Number((p + jitter).toFixed(2));

      initialTrades.push({
        id: `tape-${now}-${i}`,
        time: tradeTime.toTimeString().split(" ")[0],
        price: tradePrice,
        size,
        side: isBuy ? "BUY" : "SELL",
        type,
        delta: isBuy ? size : -size,
      });
    }

    setTapeTrades(initialTrades);
  }, [contract.symbol]);

  // Real-time sub-second tape ticker (every 1800ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const p = contract.price;
      const isBull = contract.bias.toLowerCase().includes("bull");
      const isBuy = Math.random() < (isBull ? 0.64 : 0.42);
      const sizeBase = Math.random();
      let size = 1;
      let type: "RETAIL" | "INSTITUTIONAL" | "WHALE_BLOCK" = "RETAIL";

      if (sizeBase > 0.86) {
        size = Math.floor(110 + Math.random() * 280);
        type = "WHALE_BLOCK";
      } else if (sizeBase > 0.52) {
        size = Math.floor(28 + Math.random() * 70);
        type = "INSTITUTIONAL";
      } else {
        size = Math.floor(1 + Math.random() * 19);
        type = "RETAIL";
      }

      const microJitter = (Math.random() - 0.5) * 0.3;
      const tradePrice = Number((p + microJitter).toFixed(2));

      const newTrade: TapeTrade = {
        id: `tape-${Date.now()}`,
        time: now.toTimeString().split(" ")[0],
        price: tradePrice,
        size,
        side: isBuy ? "BUY" : "SELL",
        type,
        delta: isBuy ? size : -size,
      };

      setTapeTrades((prev) => [newTrade, ...prev.slice(0, 39)]);
      setCvdTickCount((c) => c + 1);
    }, 1200);

    return () => clearInterval(interval);
  }, [contract.price, contract.bias]);

  // Cumulative Volume Delta (CVD) calculation
  const cvdMetrics = useMemo(() => {
    let sum = 0;
    const history = [...tapeTrades].reverse().map((t, idx) => {
      sum += t.delta;
      return {
        step: idx,
        time: t.time,
        price: t.price,
        delta: t.delta,
        cvd: sum,
      };
    });

    const netSessionCvd = sum;
    const isAccumulation = netSessionCvd >= 0;
    const whaleTrades = tapeTrades.filter((t) => t.type === "WHALE_BLOCK");
    const whaleDelta = whaleTrades.reduce((acc, t) => acc + t.delta, 0);

    return {
      history,
      netSessionCvd,
      isAccumulation,
      whaleTradesCount: whaleTrades.length,
      whaleDelta,
      divergence:
        contract.changePts < 0 && netSessionCvd > 0
          ? "BULLISH CVD ABSORPTION DIVERGENCE (Price Down / CVD Up)"
          : contract.changePts > 0 && netSessionCvd < 0
          ? "BEARISH CVD EXHAUSTION DIVERGENCE (Price Up / CVD Down)"
          : "CVD CONFIRMING CURRENT PRICE TRAJECTORY",
    };
  }, [tapeTrades, contract.changePts]);

  // Filtered tape for display
  const displayedTape = useMemo(() => {
    if (tapeFilter === "WHALE") {
      return tapeTrades.filter((t) => t.type === "WHALE_BLOCK");
    }
    if (tapeFilter === "INSTITUTIONAL") {
      return tapeTrades.filter((t) => t.type !== "RETAIL");
    }
    return tapeTrades;
  }, [tapeTrades, tapeFilter]);

  return (
    <div className="bg-[#0B0F17] border border-[#B08D57]/35 rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 font-mono-data text-xs relative overflow-hidden">
      {/* Top brass glow accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/70 to-transparent pointer-events-none" />

      {/* Header bar: Instrument, Status & View Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/25">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#D97706]/20 border border-[#D97706]/50 flex items-center justify-center text-[#F59E0B] shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-[#FBF8F1] tracking-wide">
                {contract.ticker} Institutional Order Flow & L2 Depth
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#064E3B]/80 text-[#34D399] border border-[#059669]/80 uppercase">
                Active DOM
              </span>
            </div>
            <div className="text-[10.5px] text-[#BAC7D5] flex items-center gap-2 mt-0.5">
              <span>CME Globex Level 2 Liquidity</span>
              <span>·</span>
              <span className="text-[#E5C794] font-semibold">{baseOrderflow.regime}</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-lg border border-[#253347]">
          <button
            onClick={() => setActiveTab("DOM")}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "DOM"
                ? "bg-[#B08D57] text-[#0A111C] shadow-md font-black"
                : "text-[#BAC7D5] hover:text-[#FBF8F1]"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>L2 DOM Ladder</span>
          </button>

          <button
            onClick={() => setActiveTab("CVD")}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "CVD"
                ? "bg-[#2563EB] text-white shadow-md font-black"
                : "text-[#BAC7D5] hover:text-[#FBF8F1]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>CVD & Delta</span>
          </button>

          <button
            onClick={() => setActiveTab("TAPE")}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "TAPE"
                ? "bg-[#D97706] text-[#0A111C] shadow-md font-black"
                : "text-[#BAC7D5] hover:text-[#FBF8F1]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time & Sales Tape</span>
          </button>

          <button
            onClick={() => setActiveTab("CLUSTERS")}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "CLUSTERS"
                ? "bg-[#7C3AED] text-white shadow-md font-black"
                : "text-[#BAC7D5] hover:text-[#FBF8F1]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Iceberg Clusters</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Strip: Imbalance Ratio, Cumulative Volume Delta & Whale Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* DOM Imbalance */}
        <div className="bg-black/50 border border-[#253347] rounded-lg p-2.5">
          <div className="text-[10px] text-[#8292A6] uppercase flex items-center justify-between">
            <span>DOM Liquidity Ratio</span>
            <span className="text-[#34D399] font-bold">{baseOrderflow.imbalancePct}% Bids</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#EDE9DE] mt-1 flex items-center gap-1.5">
            <span className={baseOrderflow.netDelta >= 0 ? "text-[#34D399]" : "text-[#FF8585]"}>
              {baseOrderflow.netDelta >= 0 ? "+" : ""}{baseOrderflow.netDelta.toLocaleString()} Δ
            </span>
          </div>
          {/* Progress bar visualizer */}
          <div className="w-full h-1.5 bg-[#DC2626]/40 rounded-full mt-2 overflow-hidden flex">
            <div
              className="bg-[#059669] h-full transition-all duration-500"
              style={{ width: `${baseOrderflow.imbalancePct}%` }}
            />
          </div>
        </div>

        {/* Net Session CVD */}
        <div className="bg-black/50 border border-[#253347] rounded-lg p-2.5">
          <div className="text-[10px] text-[#8292A6] uppercase flex items-center justify-between">
            <span>Session Net Delta (CVD)</span>
            <span className="text-xs text-[#E5C794] font-semibold">T+0 Cumulative</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#EDE9DE] mt-1 flex items-center gap-1">
            {cvdMetrics.isAccumulation ? (
              <ArrowUpRight className="w-4 h-4 text-[#34D399]" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-[#FF8585]" />
            )}
            <span className={cvdMetrics.isAccumulation ? "text-[#34D399]" : "text-[#FF8585]"}>
              {cvdMetrics.netSessionCvd >= 0 ? "+" : ""}{cvdMetrics.netSessionCvd.toLocaleString()} Contracts
            </span>
          </div>
          <div className="text-[9.5px] text-[#8292A6] mt-1 truncate">
            {cvdMetrics.isAccumulation ? "Aggressive Buyer Absorption" : "Seller Liquidation Drag"}
          </div>
        </div>

        {/* Institutional Whale Blocks */}
        <div className="bg-black/50 border border-[#253347] rounded-lg p-2.5">
          <div className="text-[10px] text-[#8292A6] uppercase flex items-center justify-between">
            <span>Whale Blocks (&gt;100 Lots)</span>
            <span className="text-[#38BDF8] font-bold">L2 Flow</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#38BDF8] mt-1">
            {cvdMetrics.whaleTradesCount} Detected
          </div>
          <div className="text-[9.5px] text-[#BAC7D5] mt-1 truncate">
            Net Whale Delta: <span className={cvdMetrics.whaleDelta >= 0 ? "text-[#34D399] font-bold" : "text-[#FF8585] font-bold"}>
              {cvdMetrics.whaleDelta >= 0 ? "+" : ""}{cvdMetrics.whaleDelta}
            </span>
          </div>
        </div>

        {/* Orderflow Divergence Alert */}
        <div className="bg-black/50 border border-[#253347] rounded-lg p-2.5">
          <div className="text-[10px] text-[#8292A6] uppercase flex items-center justify-between">
            <span>Absorption Engine</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          </div>
          <div className="text-[11px] font-bold text-[#E5C794] mt-1 leading-snug truncate" title={cvdMetrics.divergence}>
            {cvdMetrics.divergence.split("(")[0]}
          </div>
          <div className="text-[9.5px] text-[#8292A6] mt-1">
            POC: <span className="text-[#EDE9DE] font-bold">{contract.levels.poc.toFixed(2)}</span> · VWAP: <span className="text-[#A78BFA] font-bold">{contract.levels.vwap.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* View Mode 1: L2 DOM Ladder */}
      {activeTab === "DOM" && (
        <div className="space-y-3">
          <div className="bg-black/70 border border-[#253347] rounded-xl p-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#253347] text-[#8292A6] text-[10px] uppercase">
                  <th className="pb-2 w-[110px]">Price Level</th>
                  <th className="pb-2 text-right w-[100px]">Bid Vol (Limit)</th>
                  <th className="pb-2 px-3 text-center">Depth Liquidity Ladder</th>
                  <th className="pb-2 text-left w-[100px]">Ask Vol (Offer)</th>
                  <th className="pb-2 text-right w-[90px]">Delta</th>
                  <th className="pb-2 text-right w-[110px]">SMC Anchor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253347]/30">
                {baseOrderflow.levels.map((lvl, idx) => {
                  const isSpotNearest = Math.abs(lvl.price - contract.price) < 0.05;
                  const maxDepth = Math.max(
                    ...baseOrderflow.levels.map((l) => Math.max(l.bidVol, l.askVol))
                  );
                  const bidWidthPct = Math.min(100, Math.round((lvl.bidVol / maxDepth) * 100));
                  const askWidthPct = Math.min(100, Math.round((lvl.askVol / maxDepth) * 100));

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-white/5 transition-colors ${
                        isSpotNearest
                          ? "bg-[#B08D57]/20 font-bold"
                          : lvl.isIceberg
                          ? "bg-[#2563EB]/10"
                          : ""
                      }`}
                    >
                      {/* Price */}
                      <td className="py-1.5 font-bold font-mono-data">
                        <div className="flex items-center gap-1.5">
                          {isSpotNearest && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
                          )}
                          <span
                            className={
                              lvl.price >= contract.price ? "text-[#EDE9DE]" : "text-[#EDE9DE]"
                            }
                          >
                            {lvl.price.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Bid Vol */}
                      <td className="py-1.5 text-right font-mono-data tabular-nums">
                        <span className={lvl.bidVol > 120 ? "text-[#34D399] font-black" : "text-[#8292A6]"}>
                          {lvl.bidVol > 0 ? lvl.bidVol.toLocaleString() : "—"}
                        </span>
                      </td>

                      {/* Depth Bar Dual Graphic */}
                      <td className="py-1.5 px-3">
                        <div className="flex items-center justify-center gap-1 h-3.5 bg-black/40 rounded px-1">
                          {/* Bid side (Green, right aligned) */}
                          <div className="w-1/2 flex justify-end">
                            <div
                              className="h-2 bg-[#059669]/80 rounded-l"
                              style={{ width: `${bidWidthPct}%` }}
                            />
                          </div>
                          {/* Ask side (Red, left aligned) */}
                          <div className="w-1/2 flex justify-start">
                            <div
                              className="h-2 bg-[#DC2626]/80 rounded-r"
                              style={{ width: `${askWidthPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Ask Vol */}
                      <td className="py-1.5 text-left font-mono-data tabular-nums">
                        <span className={lvl.askVol > 120 ? "text-[#FF8585] font-black" : "text-[#8292A6]"}>
                          {lvl.askVol > 0 ? lvl.askVol.toLocaleString() : "—"}
                        </span>
                      </td>

                      {/* Delta */}
                      <td className="py-1.5 text-right font-mono-data tabular-nums">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            lvl.delta > 0
                              ? "bg-[#064E3B]/70 text-[#34D399]"
                              : lvl.delta < 0
                              ? "bg-[#A6291C]/40 text-[#FF8585]"
                              : "text-[#8292A6]"
                          }`}
                        >
                          {lvl.delta > 0 ? `+${lvl.delta}` : lvl.delta}
                        </span>
                      </td>

                      {/* SMC Anchor Tags */}
                      <td className="py-1.5 text-right">
                        {isSpotNearest ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B08D57] text-[#0A111C]">
                            LAST SPOT
                          </span>
                        ) : lvl.isPoc ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D97706]/30 text-[#F59E0B] border border-[#D97706]/50">
                            POC (POINT OF CONTROL)
                          </span>
                        ) : lvl.isVwap ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#9333EA]/30 text-[#C084FC] border border-[#9333EA]/50">
                            VWAP REVERSION
                          </span>
                        ) : lvl.isIceberg ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0284C7]/30 text-[#38BDF8] border border-[#0284C7]/50">
                            ICEBERG {lvl.icebergSize}x
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#4B5563]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between text-[10.5px] text-[#8292A6] px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#059669] rounded-sm inline-block" />
                Aggressive Bid Resting Wall
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#DC2626] rounded-sm inline-block" />
                Overhead Ask Liquidity
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#38BDF8] rounded-sm inline-block" />
                Institutional Iceberg Algorithm
              </span>
            </div>
            <span>Auto-refreshing CME Order Book L2 stream</span>
          </div>
        </div>
      )}

      {/* View Mode 2: Cumulative Volume Delta (CVD) & Delta Footprint */}
      {activeTab === "CVD" && (
        <div className="space-y-4">
          <div className="bg-black/70 border border-[#253347] rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#253347]">
              <div>
                <div className="text-sm font-bold text-[#FBF8F1] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2563EB]" />
                  <span>Cumulative Volume Delta Trajectory</span>
                </div>
                <div className="text-[10.5px] text-[#BAC7D5] mt-0.5">
                  Tracks net difference between market aggressive buyers vs. aggressive sellers
                </div>
              </div>
              <div className="text-right">
                <div className={`text-base font-extrabold ${cvdMetrics.isAccumulation ? "text-[#34D399]" : "text-[#FF8585]"}`}>
                  {cvdMetrics.netSessionCvd >= 0 ? "+" : ""}{cvdMetrics.netSessionCvd.toLocaleString()} Δ
                </div>
                <div className="text-[10px] text-[#8292A6]">Session Cumulative Delta</div>
              </div>
            </div>

            {/* Stepped CVD Histogram Visualizer */}
            <div className="pt-4 space-y-2">
              <div className="h-32 flex items-end gap-1 px-2 pb-2 bg-[#060910] border border-[#253347]/50 rounded-lg overflow-x-auto">
                {cvdMetrics.history.map((pt, idx) => {
                  const maxCvd = Math.max(10, ...cvdMetrics.history.map((h) => Math.abs(h.cvd)));
                  const heightPct = Math.min(100, Math.max(12, Math.round((Math.abs(pt.cvd) / maxCvd) * 90)));
                  const isPositive = pt.cvd >= 0;

                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[12px] flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col bg-black/90 border border-[#B08D57] rounded px-2 py-1 text-[9px] text-white whitespace-nowrap z-30 shadow-lg">
                        <span className="text-[#E5C794] font-bold">{pt.time}</span>
                        <span>Price: {pt.price.toFixed(2)}</span>
                        <span>CVD: {pt.cvd > 0 ? `+${pt.cvd}` : pt.cvd}</span>
                      </div>
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${
                          isPositive
                            ? "bg-gradient-to-t from-[#059669]/50 to-[#34D399]"
                            : "bg-gradient-to-t from-[#DC2626]/50 to-[#F87171]"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#8292A6] px-1">
                <span>Earliest Sample ({cvdMetrics.history[0]?.time || "00:00"})</span>
                <span className="text-[#E5C794] font-semibold">{cvdMetrics.divergence}</span>
                <span>Latest Micro-Tick ({cvdMetrics.history[cvdMetrics.history.length - 1]?.time || "Now"})</span>
              </div>
            </div>
          </div>

          {/* Delta Footprint Analysis Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-black/40 border border-[#253347] rounded-lg p-3">
              <span className="text-[10px] text-[#8292A6] uppercase block">POC Aggression Node</span>
              <span className="text-sm font-bold text-[#F59E0B] mt-0.5 block">
                {contract.levels.poc.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#BAC7D5] mt-1 block">
                Highest concentrated volume node. +32% buyer absorption confirmed.
              </span>
            </div>

            <div className="bg-black/40 border border-[#253347] rounded-lg p-3">
              <span className="text-[10px] text-[#8292A6] uppercase block">VWAP Delta Migration</span>
              <span className="text-sm font-bold text-[#34D399] mt-0.5 block">
                +{contract.vwapDistPts.toFixed(2)} pts ({contract.vwapSide})
              </span>
              <span className="text-[10px] text-[#BAC7D5] mt-1 block">
                Price holding systematically above volume-weighted average price.
              </span>
            </div>

            <div className="bg-black/40 border border-[#253347] rounded-lg p-3">
              <span className="text-[10px] text-[#8292A6] uppercase block">Delta Invalidation Limit</span>
              <span className="text-sm font-bold text-[#FF8585] mt-0.5 block">
                {contract.levels.minus1Sigma.toFixed(2)} (-1σ VAL)
              </span>
              <span className="text-[10px] text-[#BAC7D5] mt-1 block">
                SMC trade thesis invalidates on negative delta close below Value Area Low.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* View Mode 3: Real-Time Institutional Time & Sales (Tape) */}
      {activeTab === "TAPE" && (
        <div className="space-y-3">
          {/* Tape filter buttons */}
          <div className="flex items-center justify-between bg-black/60 p-2 rounded-lg border border-[#253347]">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#B08D57]" />
              <span className="text-[11px] font-bold text-[#EDE9DE]">Filter Time & Sales:</span>
            </div>
            <div className="flex items-center gap-1">
              {(["ALL", "INSTITUTIONAL", "WHALE"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTapeFilter(filter)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    tapeFilter === filter
                      ? "bg-[#B08D57] text-[#0A111C]"
                      : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  {filter === "WHALE" ? "🐋 Whale (>100)" : filter === "INSTITUTIONAL" ? "🏛️ Inst (>25)" : "All Fills"}
                </button>
              ))}
            </div>
          </div>

          {/* Tape Stream Table */}
          <div className="bg-black/80 border border-[#253347] rounded-xl overflow-hidden max-h-[360px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#0E1522] border-b border-[#253347] text-[#8292A6] text-[10px] uppercase z-10">
                <tr>
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2">Price</th>
                  <th className="py-2 text-right">Size</th>
                  <th className="py-2 text-center">Aggressive Side</th>
                  <th className="py-2">Tier Classification</th>
                  <th className="py-2 text-right pr-3">Cumulative Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253347]/30">
                {displayedTape.map((trade) => {
                  const isBuy = trade.side === "BUY";
                  return (
                    <tr
                      key={trade.id}
                      className={`hover:bg-white/5 transition-colors ${
                        trade.type === "WHALE_BLOCK"
                          ? isBuy
                            ? "bg-[#064E3B]/25"
                            : "bg-[#A6291C]/25"
                          : ""
                      }`}
                    >
                      <td className="py-1.5 px-3 text-[#8292A6] text-[10.5px]">
                        {trade.time}
                      </td>
                      <td className="py-1.5 font-bold text-[#EDE9DE]">
                        {trade.price.toFixed(2)}
                      </td>
                      <td className="py-1.5 text-right font-extrabold tabular-nums">
                        <span
                          className={
                            trade.type === "WHALE_BLOCK"
                              ? "text-[#F59E0B] font-black text-sm"
                              : trade.type === "INSTITUTIONAL"
                              ? "text-[#38BDF8]"
                              : "text-[#EDE9DE]"
                          }
                        >
                          {trade.size.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-1.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBuy
                              ? "bg-[#064E3B]/80 text-[#34D399] border border-[#059669]/60"
                              : "bg-[#A6291C]/40 text-[#FF8585] border border-[#A6291C]/60"
                          }`}
                        >
                          {isBuy ? "BUY (ASK)" : "SELL (BID)"}
                        </span>
                      </td>
                      <td className="py-1.5">
                        {trade.type === "WHALE_BLOCK" ? (
                          <span className="flex items-center gap-1 text-[10px] text-[#FBBF24] font-bold">
                            <span>🐋</span> WHALE BLOCK
                          </span>
                        ) : trade.type === "INSTITUTIONAL" ? (
                          <span className="flex items-center gap-1 text-[10px] text-[#38BDF8] font-semibold">
                            <span>🏛️</span> INSTITUTIONAL
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#6B7280]">RETAIL FILL</span>
                        )}
                      </td>
                      <td className="py-1.5 text-right pr-3 font-mono-data tabular-nums">
                        <span className={isBuy ? "text-[#34D399]" : "text-[#FF8585]"}>
                          {trade.delta > 0 ? `+${trade.delta}` : trade.delta}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode 4: Iceberg Clusters & Resting Liquidity Wall Scanner */}
      {activeTab === "CLUSTERS" && (
        <div className="space-y-4">
          <div className="bg-black/60 border border-[#253347] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#253347]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#A78BFA]" />
                <span className="font-bold text-sm text-[#FBF8F1]">
                  Algorithmic Iceberg & Hidden Order Flow Scanner
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/40">
                PROPRIETARY CME RECONSTRUCTION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Overhead Iceberg Ask Cluster */}
              <div className="bg-[#121622] border border-[#DC2626]/40 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#FF8585] font-bold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Overhead Resistance Wall (+1σ / High)
                  </span>
                  <span className="text-[#8292A6] text-[10px]">Estimated 1,450 Contracts</span>
                </div>
                <div className="text-sm font-extrabold text-[#FECACA]">
                  {contract.levels.plus1Sigma.toFixed(2)} – {contract.levels.pdHigh.toFixed(2)}
                </div>
                <div className="text-[10.5px] text-[#BAC7D5] leading-relaxed">
                  Persistent algorithmic reload orders reloading 65-110 lots upon every touch. Acts as overhead take-profit ceiling for momentum longs.
                </div>
              </div>

              {/* Underlying Institutional Bid Floor */}
              <div className="bg-[#121622] border border-[#059669]/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#34D399] font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Institutional Value Bid Floor (VAL / POC)
                  </span>
                  <span className="text-[#8292A6] text-[10px]">Estimated 2,890 Contracts</span>
                </div>
                <div className="text-sm font-extrabold text-[#A7F3D0]">
                  {contract.levels.poc.toFixed(2)} – {contract.levels.vwap.toFixed(2)}
                </div>
                <div className="text-[10.5px] text-[#BAC7D5] leading-relaxed">
                  Heavy resting passive limit orders absorbing sell-side liquidations with positive volume delta. Defends structural SMC trend invalidation.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer bar with terminal execution action */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#B08D57]/20 text-[10.5px] text-[#BAC7D5] gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#B08D57]" />
          <span>Institutional Orderflow Filter Active · Sub-second CME Micro-Tick Feed</span>
        </div>
        {onOpenTerminal && (
          <button
            onClick={() =>
              onOpenTerminal(
                `Analyze orderflow delta, CVD divergence, and institutional liquidity clusters for ${contract.ticker} (${contract.name}) at price ${contract.price.toFixed(2)} with SMC trade plan trigger: "${contract.tradePlan.trigger}"`
              )
            }
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#B08D57]/20 hover:bg-[#B08D57] text-[#E5C794] hover:text-[#0A111C] font-bold transition-all border border-[#B08D57]/40 shadow-sm font-mono-data"
            title="Inspect Institutional Orderflow Strategy"
          >
            <span>Inspect Orderflow Strategy</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
