import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  SlidersHorizontal,
  Maximize2
} from "lucide-react";
import { MacroDataState } from "../../types";
import { EquityIndexKey } from "./IbexPropEngine";

interface PropAssetChartProps {
  symbol: string;
  name: string;
  flag: string;
  exchange: string;
  spot: number;
  dailyChange: string;
  isPositive: boolean;
  centralPivot: number;
  r1: number;
  r2: number;
  s1: number;
  s2: number;
  vah: number;
  vpoc: number;
  val: number;
  unfinishedAuction: string;
  assetKey: EquityIndexKey;
  macroData?: MacroDataState;
  isExpanded?: boolean;
  atrPts?: string;
  volumeDeltaLots?: string;
}

interface ChartDataPoint {
  time: string;
  price: number;
  vwap: number;
  volume: number;
  volumeDelta: number;
  isBuyVolume: boolean;
  high: number;
  low: number;
  status: string;
}

export const PropAssetChart: React.FC<PropAssetChartProps> = ({
  symbol,
  name,
  flag,
  exchange,
  spot,
  dailyChange,
  isPositive,
  centralPivot,
  r1,
  r2,
  s1,
  s2,
  vah,
  vpoc,
  val,
  unfinishedAuction,
  assetKey,
  macroData,
  isExpanded = false,
  atrPts,
  volumeDeltaLots
}) => {
  const [timeframe, setTimeframe] = useState<"15M" | "1H" | "4H" | "24H">("24H");
  const [showVwap, setShowVwap] = useState<boolean>(true);
  const [showPivots, setShowPivots] = useState<boolean>(true);
  const [showVolumeDelta, setShowVolumeDelta] = useState<boolean>(true);
  const [showValueArea, setShowValueArea] = useState<boolean>(false);

  // Asset color mapping
  const theme = useMemo(() => {
    switch (assetKey) {
      case "btc":
        return {
          stroke: "#F7931A",
          fillStart: "rgba(247, 147, 26, 0.45)",
          fillEnd: "rgba(247, 147, 26, 0.02)",
          accent: "#F7931A",
          glow: "rgba(247, 147, 26, 0.3)",
          badgeBg: "bg-[#F7931A]/15 text-[#F7931A] border-[#F7931A]/40"
        };
      case "sp500":
        return {
          stroke: "#3B82F6",
          fillStart: "rgba(59, 130, 246, 0.40)",
          fillEnd: "rgba(59, 130, 246, 0.02)",
          accent: "#60A5FA",
          glow: "rgba(59, 130, 246, 0.3)",
          badgeBg: "bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/40"
        };
      case "dax":
        return {
          stroke: "#10B981",
          fillStart: "rgba(16, 185, 129, 0.40)",
          fillEnd: "rgba(16, 185, 129, 0.02)",
          accent: "#34D399",
          glow: "rgba(16, 185, 129, 0.3)",
          badgeBg: "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/40"
        };
      case "nikkei":
        return {
          stroke: "#F43F5E",
          fillStart: "rgba(244, 63, 94, 0.40)",
          fillEnd: "rgba(244, 63, 94, 0.02)",
          accent: "#FB7185",
          glow: "rgba(244, 63, 94, 0.3)",
          badgeBg: "bg-[#F43F5E]/15 text-[#FB7185] border-[#F43F5E]/40"
        };
      case "kospi":
        return {
          stroke: "#06B6D4",
          fillStart: "rgba(6, 182, 212, 0.40)",
          fillEnd: "rgba(6, 182, 212, 0.02)",
          accent: "#22D3EE",
          glow: "rgba(6, 182, 212, 0.3)",
          badgeBg: "bg-[#06B6D4]/15 text-[#22D3EE] border-[#06B6D4]/40"
        };
      case "hangseng":
        return {
          stroke: "#10B981",
          fillStart: "rgba(16, 185, 129, 0.40)",
          fillEnd: "rgba(16, 185, 129, 0.02)",
          accent: "#34D399",
          glow: "rgba(16, 185, 129, 0.3)",
          badgeBg: "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/40"
        };
      case "ibex":
      default:
        return {
          stroke: "#B08D57",
          fillStart: "rgba(176, 141, 87, 0.40)",
          fillEnd: "rgba(176, 141, 87, 0.02)",
          accent: "#E5C794",
          glow: "rgba(176, 141, 87, 0.3)",
          badgeBg: "bg-[#B08D57]/15 text-[#E5C794] border-[#B08D57]/40"
        };
    }
  }, [assetKey]);

  // Generate enriched high-resolution intraday curve for selected asset
  const chartData: ChartDataPoint[] = useMemo(() => {
    // 24-hour timeline points with realistic micro-structure
    const points24h = [
      { t: "00:00", factor: 0.965, vol: 180, isBuy: true, status: "Overnight Session Open" },
      { t: "01:30", factor: 0.968, vol: 240, isBuy: true, status: "Tokyo/Asian Accumulation" },
      { t: "03:00", factor: 0.972, vol: 310, isBuy: true, status: "Asian Session High" },
      { t: "04:30", factor: 0.970, vol: 190, isBuy: false, status: "Asian Lunch Pullback" },
      { t: "06:00", factor: 0.976, vol: 290, isBuy: true, status: "Pre-London Bid Shift" },
      { t: "07:30", factor: 0.981, vol: 450, isBuy: true, status: "European Cash Open Cross" },
      { t: "09:00", factor: 0.986, vol: 520, isBuy: true, status: "London Morning Breakout" },
      { t: "10:30", factor: 0.991, vol: 480, isBuy: true, status: "Macro Yield Relief Bids" },
      { t: "12:00", factor: 0.988, vol: 320, isBuy: false, status: "Mid-day Value Consolidation" },
      { t: "13:30", factor: 0.993, vol: 780, isBuy: true, status: "US Cash Open / ETF Inflows" },
      { t: "15:00", factor: 0.997, vol: 690, isBuy: true, status: "Institutional TWAP Program" },
      { t: "16:30", factor: 0.995, vol: 410, isBuy: false, status: "European Close Fixing" },
      { t: "18:00", factor: 0.998, vol: 510, isBuy: true, status: "US Afternoon Squeeze" },
      { t: "19:30", factor: 0.999, vol: 440, isBuy: true, status: "MOC Imbalance Buying" },
      { t: "21:00", factor: 0.998, vol: 380, isBuy: true, status: "Post-Close Liquidity Hold" },
      { t: "LIVE", factor: 1.000, vol: 620, isBuy: true, status: "Active Auction Shelf" }
    ];

    // Filter by timeframe
    let slicePoints = points24h;
    if (timeframe === "15M") slicePoints = points24h.slice(-6);
    else if (timeframe === "1H") slicePoints = points24h.slice(-8);
    else if (timeframe === "4H") slicePoints = points24h.slice(-12);

    const isCrypto = assetKey === "btc";
    const roundDec = isCrypto ? 0 : (spot < 1000 ? 2 : (spot >= 10000 ? 0 : 1));

    return slicePoints.map((pt, idx) => {
      // Calculate realistic price relative to current live spot
      const currentPtPrice = Number((spot * pt.factor).toFixed(roundDec));
      // Dynamic rolling VWAP
      const progress = (idx + 1) / slicePoints.length;
      const rollingVwap = Number((spot * (0.978 + 0.018 * progress)).toFixed(roundDec));
      const deltaMultiplier = isCrypto ? 8.5 : (spot >= 10000 ? 4.2 : 1.5);
      const volDelta = Math.round(pt.vol * deltaMultiplier * (pt.isBuy ? 1 : -0.75));
      const numericLots = volumeDeltaLots ? parseInt(volumeDeltaLots.replace(/[^0-9-]/g, ""), 10) : NaN;
      const liveVolumeDelta = !isNaN(numericLots) ? numericLots : volDelta;

      return {
        time: pt.t,
        price: idx === slicePoints.length - 1 ? spot : currentPtPrice,
        vwap: rollingVwap,
        volume: Math.round(pt.vol * deltaMultiplier),
        volumeDelta: idx === slicePoints.length - 1 ? liveVolumeDelta : volDelta,
        isBuyVolume: pt.isBuy,
        high: Number((currentPtPrice * 1.002).toFixed(roundDec)),
        low: Number((currentPtPrice * 0.998).toFixed(roundDec)),
        status: pt.status
      };
    });
  }, [spot, timeframe, assetKey, volumeDeltaLots]);

  // Compute min/max for chart y-axis
  const { minVal, maxVal, highPrice, lowPrice } = useMemo(() => {
    const prices = chartData.map((d) => d.price);
    const vwapList = chartData.map((d) => d.vwap);
    const all = [...prices, ...vwapList, s1, r1];
    const minP = Math.min(...all);
    const maxP = Math.max(...all);
    const pad = (maxP - minP) * 0.08 || spot * 0.01;
    return {
      minVal: Number((minP - pad).toFixed(spot < 1000 ? 2 : 0)),
      maxVal: Number((maxP + pad).toFixed(spot < 1000 ? 2 : 0)),
      highPrice: Math.max(...prices),
      lowPrice: Math.min(...prices)
    };
  }, [chartData, s1, r1, spot]);

  const formatTick = (val: number) => {
    if (val >= 10000) return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (val >= 1000) return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
    return val.toFixed(2);
  };

  return (
    <div
      id={`prop-asset-chart-${assetKey}`}
      className="bg-black/50 border border-[#B08D57]/25 rounded-xl p-3 sm:p-4 shadow-2xl relative overflow-hidden"
    >
      {/* Top Chart Header & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#B08D57]/20">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl p-1 bg-black/60 rounded border border-[#222C3D] flex items-center justify-center">
            {flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base font-mono-data text-[#FBF8F1] tracking-tight">
                {symbol}
              </span>
              <span className="text-[10px] text-[#8292A6] font-mono-data hidden sm:inline">
                {exchange}
              </span>
              <span className={`text-[9px] font-mono-data font-bold px-2 py-0.5 rounded border ${theme.badgeBg}`}>
                {dailyChange}
              </span>
            </div>
            <div className="text-[10px] text-[#8292A6] font-mono-data">
              {name} • Institutional Prop Profile
            </div>
          </div>
        </div>

        {/* Spot & 24h Metrics */}
        <div className="flex items-center gap-3 font-mono-data">
          <div className="text-right">
            <div className="text-xs text-[#8292A6] uppercase tracking-wider text-[9px]">
              Live Spot
            </div>
            <div className="text-base sm:text-lg font-bold text-[#EDE9DE] flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>{spot >= 10000 ? spot.toLocaleString(undefined, { maximumFractionDigits: 1 }) : spot.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] border-l border-[#B08D57]/20 pl-3">
            <div>
              <span className="text-[#8292A6] block text-[8.5px]">24H HIGH</span>
              <span className="text-[#10B981] font-bold">{formatTick(highPrice)}</span>
            </div>
            <div>
              <span className="text-[#8292A6] block text-[8.5px]">24H LOW</span>
              <span className="text-[#FF8585] font-bold">{formatTick(lowPrice)}</span>
            </div>
            <div>
              <span className="text-[#8292A6] block text-[8.5px]">VWAP</span>
              <span className="text-[#E5C794] font-bold">{formatTick(vpoc || spot * 0.995)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Timeframes & Indicator Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-[10px] font-mono-data">
        {/* Timeframe selector */}
        <div className="flex items-center bg-black/60 rounded-lg p-0.5 border border-[#222C3D]">
          {(["15M", "1H", "4H", "24H"] as const).map((tf) => (
            <button
              key={tf}
              id={`tf-btn-${assetKey}-${tf}`}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded transition-all font-bold ${
                timeframe === tf
                  ? "bg-[#B08D57] text-[#0A111C] shadow-sm"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowVwap(!showVwap)}
            className={`px-2 py-0.5 rounded border text-[9px] transition-all flex items-center gap-1 ${
              showVwap
                ? "bg-[#E5C794]/20 border-[#E5C794] text-[#E5C794]"
                : "bg-black/40 border-[#222C3D] text-[#8292A6]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5C794]" />
            <span>VWAP</span>
          </button>

          <button
            onClick={() => setShowPivots(!showPivots)}
            className={`px-2 py-0.5 rounded border text-[9px] transition-all flex items-center gap-1 ${
              showPivots
                ? "bg-[#60A5FA]/20 border-[#60A5FA] text-[#60A5FA]"
                : "bg-black/40 border-[#222C3D] text-[#8292A6]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
            <span>PIVOTS (R1/S1)</span>
          </button>

          <button
            onClick={() => setShowVolumeDelta(!showVolumeDelta)}
            className={`px-2 py-0.5 rounded border text-[9px] transition-all flex items-center gap-1 ${
              showVolumeDelta
                ? "bg-[#10B981]/20 border-[#10B981] text-[#34D399]"
                : "bg-black/40 border-[#222C3D] text-[#8292A6]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>VOLUME DELTA</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Composed Chart */}
      <div className={`w-full ${isExpanded ? "h-[360px]" : "h-[220px]"} relative`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`propAssetGrad-${assetKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.stroke} stopOpacity={0.4} />
                <stop offset="95%" stopColor={theme.stroke} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke="#5A687C"
              fontSize={9}
              tickLine={false}
              axisLine={{ stroke: "#222C3D" }}
            />
            <YAxis
              domain={[minVal, maxVal]}
              stroke="#5A687C"
              fontSize={9}
              orientation="right"
              tickLine={false}
              axisLine={{ stroke: "#222C3D" }}
              tickFormatter={formatTick}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ChartDataPoint;
                  const spreadToVwap = d.price - d.vwap;
                  const spreadPct = ((spreadToVwap / d.vwap) * 100).toFixed(2);
                  return (
                    <div className="bg-[#0E1522] border border-[#B08D57]/40 rounded-lg p-2.5 shadow-2xl text-[10px] font-mono-data space-y-1 z-50">
                      <div className="flex items-center justify-between gap-3 border-b border-[#B08D57]/20 pb-1">
                        <span className="font-bold text-[#EDE9DE]">{symbol} • {d.time}</span>
                        <span className="text-[#8292A6] text-[8.5px]">{d.status}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#8292A6]">Spot Price:</span>
                        <span className="text-[#FBF8F1] font-bold">{formatTick(d.price)}</span>
                      </div>
                      {showVwap && (
                        <div className="flex justify-between gap-4">
                          <span className="text-[#E5C794]">Rolling VWAP:</span>
                          <span className="text-[#E5C794] font-semibold">{formatTick(d.vwap)}</span>
                        </div>
                      )}
                      <div className="flex justify-between gap-4">
                        <span className="text-[#8292A6]">VWAP Spread:</span>
                        <span className={`font-bold ${spreadToVwap >= 0 ? "text-[#10B981]" : "text-[#FF8585]"}`}>
                          {spreadToVwap >= 0 ? "+" : ""}{formatTick(spreadToVwap)} ({spreadPct}%)
                        </span>
                      </div>
                      {showVolumeDelta && (
                        <div className="flex justify-between gap-4 border-t border-[#B08D57]/10 pt-1">
                          <span className="text-[#8292A6]">Volume Delta:</span>
                          <span className={d.volumeDelta >= 0 ? "text-[#10B981] font-bold" : "text-[#FF8585] font-bold"}>
                            {d.volumeDelta >= 0 ? "+" : ""}{d.volumeDelta.toLocaleString()} lots
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Central Pivot & Resistance/Support Reference Lines */}
            {showPivots && (
              <>
                <ReferenceLine
                  y={centralPivot}
                  stroke="#60A5FA"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  label={{
                    value: `Pivot ${formatTick(centralPivot)}`,
                    fill: "#60A5FA",
                    fontSize: 8,
                    position: "insideBottomLeft"
                  }}
                />
                <ReferenceLine
                  y={r1}
                  stroke="#FF8585"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                  label={{
                    value: `R1 ${formatTick(r1)}`,
                    fill: "#FF8585",
                    fontSize: 8,
                    position: "insideTopLeft"
                  }}
                />
                <ReferenceLine
                  y={s1}
                  stroke="#10B981"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                  label={{
                    value: `S1 ${formatTick(s1)}`,
                    fill: "#10B981",
                    fontSize: 8,
                    position: "insideBottomLeft"
                  }}
                />
              </>
            )}

            {/* Main Price Area with glow */}
            <Area
              type="monotone"
              dataKey="price"
              stroke={theme.stroke}
              strokeWidth={2.2}
              fillOpacity={1}
              fill={`url(#propAssetGrad-${assetKey})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: theme.stroke,
                stroke: "#FFFFFF",
                strokeWidth: 1.5
              }}
            />

            {/* VWAP Line Overlay */}
            {showVwap && (
              <Line
                type="monotone"
                dataKey="vwap"
                stroke="#E5C794"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="VWAP"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Auction Magnet & Indicator Status Strip */}
      <div className="mt-3 pt-2.5 border-t border-[#B08D57]/15 flex flex-wrap items-center justify-between text-[9.5px] font-mono-data gap-2 text-[#8292A6]">
        <div className="flex items-center gap-1.5 text-[#EDE9DE]">
          <Zap className="w-3 h-3 text-[#B08D57]" />
          <span>
            <strong className="text-[#B08D57]">AUCTION MAGNET:</strong> {unfinishedAuction}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {(() => {
            const rawRsi = 56 + (spot - (centralPivot || spot)) / (spot * 0.015) * 4.5;
            const dynamicRsi = Math.min(88, Math.max(30, Number(rawRsi.toFixed(1))));
            const dynamicAtr = atrPts || (spot >= 10000 ? `${(spot * 0.0085).toFixed(0)} pts ATR` : `${(spot * 0.0085).toFixed(1)} pts ATR`);
            return (
              <>
                <span>
                  RSI(14):{" "}
                  <strong className={dynamicRsi >= 60 ? "text-[#34D399]" : dynamicRsi <= 45 ? "text-[#FF8585]" : "text-[#E5C794]"}>
                    {dynamicRsi} ({dynamicRsi >= 60 ? "Momentum Expansion" : dynamicRsi <= 45 ? "Oversold Absorption" : "Neutral Equilibrium"})
                  </strong>
                </span>
                <span className="hidden sm:inline">
                  ATR: <strong className="text-[#EDE9DE]">{dynamicAtr}</strong>
                </span>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
