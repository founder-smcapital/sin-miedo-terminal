import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Activity, TrendingUp, Layers, Clock, Zap, Calendar } from "lucide-react";
import { FuturesContract, getAsset5dHistory } from "../data/futuresData";
import { ChartExportDropdown } from "./ChartExportDropdown";

interface FuturesContractChartProps {
  contract: FuturesContract;
}

export const FuturesContractChart: React.FC<FuturesContractChartProps> = ({ contract }) => {
  const [timeframe, setTimeframe] = useState<"1D" | "5D">("1D");
  const [showVwap, setShowVwap] = useState<boolean>(true);
  const [showSigmaBands, setShowSigmaBands] = useState<boolean>(true);
  const [showPoc, setShowPoc] = useState<boolean>(true);

  // 1-Day Intraday 15M structure
  const intraday1DData = useMemo(() => {
    const raw = contract.priceHistory15m || [];
    const vwap = contract.levels.vwap;
    const plus1 = contract.levels.plus1Sigma;
    const minus1 = contract.levels.minus1Sigma;
    const poc = contract.levels.poc;

    return raw.map((pt, idx) => {
      return {
        minute: pt.minute,
        price: pt.price,
        vwap: vwap,
        plus1Sigma: plus1,
        minus1Sigma: minus1,
        poc: poc,
        isAboveVwap: pt.price >= vwap,
        sessionLabel: "Intraday 15M",
      };
    });
  }, [contract]);

  // 5-Day Swing structure: uses contract.priceHistory5d if present, or asset-specific historical curve
  const fiveDayStructure = useMemo(() => {
    const raw5d = (contract.priceHistory5d && contract.priceHistory5d.length >= 4)
      ? contract.priceHistory5d
      : getAsset5dHistory(contract.symbol, contract.price);

    // Ensure the terminal point always tracks the live dynamic spot price seamlessly
    const syncedRaw5d = raw5d.map((pt, idx) => {
      if (idx === raw5d.length - 1) {
        return {
          ...pt,
          minute: "LIVE NOW",
          price: Number(contract.price.toFixed(2)),
          sessionLabel: "Active Feed",
        };
      }
      return pt;
    });

    const prices = syncedRaw5d.map((p) => p.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const stdDev = Math.sqrt(
      prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
    );

    const fiveDayVwap = Number(avgPrice.toFixed(2));
    const fiveDayVah = Number((avgPrice + stdDev).toFixed(2));
    const fiveDayVal = Number((avgPrice - stdDev).toFixed(2));

    // Calculate institutional modal POC (Point of Control) across trading distribution
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const bucketCount = 10;
    const bucketSize = (maxP - minP) / bucketCount || 1;
    const buckets = new Array(bucketCount).fill(0);
    prices.forEach((p) => {
      const bIdx = Math.min(bucketCount - 1, Math.floor((p - minP) / bucketSize));
      buckets[bIdx]++;
    });
    let maxBucketIdx = 0;
    let maxBucketCount = 0;
    buckets.forEach((count, idx) => {
      if (count > maxBucketCount) {
        maxBucketCount = count;
        maxBucketIdx = idx;
      }
    });
    const fiveDayPoc = Number((minP + (maxBucketIdx + 0.5) * bucketSize).toFixed(2));

    const enrichedPoints = syncedRaw5d.map((pt) => ({
      minute: pt.minute,
      price: pt.price,
      vwap: fiveDayVwap,
      plus1Sigma: fiveDayVah,
      minus1Sigma: fiveDayVal,
      poc: fiveDayPoc,
      isAboveVwap: pt.price >= fiveDayVwap,
      sessionLabel: pt.sessionLabel || "5D Auction",
    }));

    const firstPrice = prices[0] || contract.price;
    const high5d = Number(Math.max(...prices).toFixed(2));
    const low5d = Number(Math.min(...prices).toFixed(2));
    const net5dChange = Number((contract.price - firstPrice).toFixed(2));
    const net5dPct = Number(((net5dChange / firstPrice) * 100).toFixed(2));

    return {
      points: enrichedPoints,
      levels: {
        vwap: fiveDayVwap,
        plus1Sigma: fiveDayVah,
        minus1Sigma: fiveDayVal,
        poc: fiveDayPoc,
      },
      stats: {
        startPrice: firstPrice,
        high5d,
        low5d,
        net5dChange,
        net5dPct,
      },
    };
  }, [contract]);

  // Active dataset based on timeframe
  const chartData = useMemo(() => {
    return timeframe === "5D" ? fiveDayStructure.points : intraday1DData;
  }, [timeframe, fiveDayStructure, intraday1DData]);

  // Active key price levels based on timeframe
  const activeLevels = useMemo(() => {
    return timeframe === "5D" ? fiveDayStructure.levels : contract.levels;
  }, [timeframe, fiveDayStructure, contract]);

  const minPrice = useMemo(() => {
    const prices = chartData.map((d) => d.price);
    const lowBound = Math.min(...prices, activeLevels.minus1Sigma);
    return Math.floor(lowBound * 0.998);
  }, [chartData, activeLevels]);

  const maxPrice = useMemo(() => {
    const prices = chartData.map((d) => d.price);
    const highBound = Math.max(...prices, activeLevels.plus1Sigma);
    return Math.ceil(highBound * 1.002);
  }, [chartData, activeLevels]);

  const isPositive = contract.changePts >= 0;
  const isChartPositive = timeframe === "5D" ? ((fiveDayStructure.stats.net5dChange ?? 0) >= 0) : isPositive;

  return (
    <div
      id={`futures-contract-${contract.symbol.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className="bg-[#0A101D] border border-[#B08D57]/30 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden"
    >
      {/* Chart Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#253347]/80">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-2 py-0.5 rounded bg-[#B08D57]/20 border border-[#B08D57]/40 text-[#E5C794] font-mono-data font-bold text-xs">
            {contract.ticker}
          </div>
          <div>
            <div className="text-xs font-mono-data uppercase font-bold text-[#FBF8F1] tracking-wider flex items-center gap-2">
              <span>{contract.name} {timeframe === "5D" ? "5-Day Swing Value Area" : "Intraday Value Area"}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/50 border border-[#253347] text-[#BAC7D5]">
                {contract.contractSpecs.exchange}
              </span>
            </div>
          </div>

          {/* Timeframe Switcher (1D vs 5D) */}
          <div className="flex items-center bg-black/70 p-0.5 rounded-lg border border-[#B08D57]/30 text-[10px] font-mono-data shadow-inner shrink-0 ml-1">
            <button
              id={`tf-1d-${contract.symbol}`}
              onClick={() => setTimeframe("1D")}
              className={`px-2.5 py-1 rounded transition-all font-bold uppercase flex items-center gap-1 ${
                timeframe === "1D"
                  ? "bg-[#B08D57] text-[#0A111C] shadow"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>1D (15M)</span>
            </button>
            <button
              id={`tf-5d-${contract.symbol}`}
              onClick={() => setTimeframe("5D")}
              className={`px-2.5 py-1 rounded transition-all font-bold uppercase flex items-center gap-1 ${
                timeframe === "5D"
                  ? "bg-[#B08D57] text-[#0A111C] shadow"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>5D Swings</span>
            </button>
          </div>
        </div>

        {/* Legend / Overlay Toggles & Export */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono-data">
          {(() => {
            const fmtLevel = (val: number) =>
              val >= 10000
                ? Math.round(val).toLocaleString("en-US")
                : val >= 1000
                ? val.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                : val.toFixed(2);

            return (
              <>
                <button
                  onClick={() => setShowVwap(!showVwap)}
                  className={`px-2 py-1 rounded border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    showVwap
                      ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#F3E5AB]"
                      : "bg-black/40 border-[#253347] text-[#8292A6]"
                  }`}
                >
                  <span className="w-2 h-0.5 bg-[#D4AF37]" />
                  <span>{timeframe === "5D" ? "5D AVWAP" : "VWAP"} ({fmtLevel(activeLevels.vwap)})</span>
                </button>

                <button
                  onClick={() => setShowSigmaBands(!showSigmaBands)}
                  className={`px-2 py-1 rounded border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    showSigmaBands
                      ? "bg-[#38BDF8]/20 border-[#38BDF8] text-[#BAE6FD]"
                      : "bg-black/40 border-[#253347] text-[#8292A6]"
                  }`}
                >
                  <span className="w-2 h-0.5 bg-[#38BDF8] border-b border-dashed" />
                  <span>±1σ Value Area</span>
                </button>

                <button
                  onClick={() => setShowPoc(!showPoc)}
                  className={`px-2 py-1 rounded border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    showPoc
                      ? "bg-[#A78BFA]/20 border-[#A78BFA] text-[#DDD6FE]"
                      : "bg-black/40 border-[#253347] text-[#8292A6]"
                  }`}
                >
                  <span className="w-2 h-0.5 bg-[#A78BFA]" />
                  <span>{timeframe === "5D" ? "5D POC" : "POC"} ({fmtLevel(activeLevels.poc)})</span>
                </button>
              </>
            );
          })()}

          {/* Export Dropdown */}
          <ChartExportDropdown
            chartTitle={`${contract.name} (${contract.ticker}) ${timeframe === "5D" ? "5-Day Swings" : "Intraday"}`}
            chartContainerId={`futures-contract-${contract.symbol.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            subtitle={`LAST: ${contract.price.toFixed(2)} // ${timeframe === "5D" ? "5D AVWAP" : "VWAP"}: ${activeLevels.vwap.toFixed(2)} // POC: ${activeLevels.poc.toFixed(2)}`}
            getCsvData={() => {
              const headers = [
                timeframe === "5D" ? "Day / Session" : "Minute / Bar",
                "Price",
                timeframe === "5D" ? "5D Anchored VWAP" : "Session VWAP",
                "VAH (+1 Sigma)",
                "VAL (-1 Sigma)",
                "POC (Point of Control)",
                "Above VWAP",
              ];
              const rows = chartData.map((d) => [
                d.minute,
                d.price.toFixed(2),
                d.vwap.toFixed(2),
                d.plus1Sigma.toFixed(2),
                d.minus1Sigma.toFixed(2),
                d.poc.toFixed(2),
                d.isAboveVwap ? "YES" : "NO",
              ]);

              return {
                filename: `smc-futures-${contract.symbol.toLowerCase()}-${timeframe.toLowerCase()}`,
                headers,
                rows,
                metaComments: [
                  `SIN MIEDO CAPITAL // ${contract.name} (${contract.ticker})`,
                  `Timeframe: ${timeframe === "5D" ? "5-Day Multi-Session Swings" : "1D Intraday 15M Auction"}`,
                  `Last: ${contract.price.toFixed(2)} (${contract.changePct >= 0 ? "+" : ""}${contract.changePct.toFixed(2)}%)`,
                  `Exchange: ${contract.contractSpecs.exchange} | Multiplier: ${contract.multiplier}`,
                  `Value Area: VAL ${activeLevels.minus1Sigma.toFixed(2)} - VAH ${activeLevels.plus1Sigma.toFixed(2)}`,
                ],
              };
            }}
          />
        </div>
      </div>

      {/* Contract Chart Visualizer */}
      <div className="h-64 sm:h-72 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 14, left: 6, bottom: 4 }}>
            <defs>
              <linearGradient id={`grad-${contract.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isChartPositive ? "#10B981" : "#F87171"}
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor={isChartPositive ? "#10B981" : "#F87171"}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="minute"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#253347" }}
              interval="preserveStartEnd"
            />

            <YAxis
              width={56}
              domain={[minPrice, maxPrice]}
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#253347" }}
              tickFormatter={(val: number) =>
                val >= 1000
                  ? val.toLocaleString("en-US", { maximumFractionDigits: 0 })
                  : val.toFixed(1)
              }
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                const distVwap = d.price - d.vwap;
                return (
                  <div className="bg-[#0E1726] border border-[#B08D57]/50 p-2.5 rounded-lg shadow-2xl font-mono-data text-xs space-y-1 z-50">
                    <div className="text-[10px] text-[#8292A6] pb-1 border-b border-[#253347] flex justify-between gap-4">
                      <span>{timeframe === "5D" ? "SESSION" : "TIME"}: {label}</span>
                      <span className="text-[#E5C794] font-bold">{contract.ticker}</span>
                    </div>
                    {d.sessionLabel && (
                      <div className="text-[9px] text-[#38BDF8] pb-0.5">
                        {d.sessionLabel}
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <span className="text-[#BAC7D5]">Spot Price:</span>
                      <span className="font-bold text-[#FBF8F1]">
                        {d.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[#D4AF37]">{timeframe === "5D" ? "5D Anchored VWAP:" : "Session VWAP:"}</span>
                      <span className="font-bold text-[#F3E5AB]">
                        {d.vwap.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[#8292A6]">VWAP Delta:</span>
                      <span className={`font-bold ${distVwap >= 0 ? "text-[#34D399]" : "text-[#F87171]"}`}>
                        {distVwap >= 0 ? "+" : ""}{distVwap.toFixed(2)} pts
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 pt-1 border-t border-[#253347]/60 text-[9px] text-[#8292A6]">
                      <span>Value Area:</span>
                      <span className="text-[#38BDF8]">
                        VAL {d.minus1Sigma.toFixed(1)} — VAH {d.plus1Sigma.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {/* Value Area Bands */}
            {showSigmaBands && (
              <>
                <ReferenceLine
                  y={activeLevels.plus1Sigma}
                  stroke="#38BDF8"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: timeframe === "5D" ? "5D VAH (+1σ)" : "+1σ (VAH)",
                    fill: "#38BDF8",
                    fontSize: 9,
                    position: "insideTopLeft",
                  }}
                />
                <ReferenceLine
                  y={activeLevels.minus1Sigma}
                  stroke="#38BDF8"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: timeframe === "5D" ? "5D VAL (-1σ)" : "-1σ (VAL)",
                    fill: "#38BDF8",
                    fontSize: 9,
                    position: "insideBottomLeft",
                  }}
                />
              </>
            )}

            {/* POC Reference Line */}
            {showPoc && (
              <ReferenceLine
                y={activeLevels.poc}
                stroke="#A78BFA"
                strokeWidth={1}
                label={{
                  value: timeframe === "5D" ? "5D POC" : "POC",
                  fill: "#A78BFA",
                  fontSize: 9,
                  position: Math.abs(activeLevels.poc - activeLevels.vwap) < (maxPrice - minPrice) * 0.08 ? "insideTopLeft" : "insideTopRight",
                }}
              />
            )}

            {/* VWAP Reference Line */}
            {showVwap && (
              <ReferenceLine
                y={activeLevels.vwap}
                stroke="#D4AF37"
                strokeWidth={1.5}
                label={{
                  value: timeframe === "5D" ? "5D AVWAP" : "VWAP",
                  fill: "#D4AF37",
                  fontSize: 9,
                  position: "insideBottomRight",
                }}
              />
            )}

            {/* Primary Price Area */}
            <Area
              type="monotone"
              dataKey="price"
              stroke={isChartPositive ? "#10B981" : "#F87171"}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#grad-${contract.symbol})`}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Footnote Bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 pt-2 border-t border-[#253347]/60 text-[10px] font-mono-data text-[#8292A6]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="whitespace-nowrap">
            Spot:{" "}
            <strong className="text-[#EDE9DE]">
              {contract.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </span>
          {timeframe === "5D" ? (
            <>
              <span className="whitespace-nowrap">
                5D Range:{" "}
                <strong className="text-[#EDE9DE]">
                  {fiveDayStructure.stats.low5d.toLocaleString("en-US", { minimumFractionDigits: 2 })} - {fiveDayStructure.stats.high5d.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </strong>
              </span>
              <span className="whitespace-nowrap">
                5D Net:{" "}
                <strong className={fiveDayStructure.stats.net5dChange >= 0 ? "text-[#34D399]" : "text-[#F87171]"}>
                  {fiveDayStructure.stats.net5dChange >= 0 ? "+" : ""}{fiveDayStructure.stats.net5dChange.toFixed(2)} pts ({fiveDayStructure.stats.net5dPct >= 0 ? "+" : ""}{fiveDayStructure.stats.net5dPct.toFixed(2)}%)
                </strong>
              </span>
              <span className="whitespace-nowrap">
                5D Open:{" "}
                <strong className="text-[#BAE6FD]">{fiveDayStructure.stats.startPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
              </span>
            </>
          ) : (
            <>
              <span className="whitespace-nowrap">
                24h Range:{" "}
                <strong className="text-[#EDE9DE]">
                  {contract.rangePts.toFixed(2)} pts ($
                  {(contract.rangePts * contract.multiplier).toLocaleString("en-US", { maximumFractionDigits: 2 })})
                </strong>
              </span>
              <span className="whitespace-nowrap">
                Tick: <strong className="text-[#34D399]">{contract.contractSpecs.tickSize}</strong> ({contract.contractSpecs.tickValue})
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-[#E5C794] whitespace-nowrap">
          {timeframe === "5D" ? (
            <>
              <Calendar className="w-3 h-3 text-[#B08D57]" />
              <span>5-Day Multi-Session Auction & Anchored VWAP Channels</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-[#34D399]" />
              <span>Real-time Intraday 15M Auction Feed</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
