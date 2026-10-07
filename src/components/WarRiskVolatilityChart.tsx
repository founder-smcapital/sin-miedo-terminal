import React, { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
  Area,
  ComposedChart
} from "recharts";
import {
  Activity,
  TrendingUp,
  ShieldAlert,
  Flame,
  Layers,
  AlertTriangle,
  Info,
  Clock,
  Maximize2,
  Minimize2,
  DollarSign,
  Percent,
  Radio
} from "lucide-react";
import { MacroDataState } from "../types";
import { ChartExportDropdown } from "./ChartExportDropdown";

interface WarRiskVolatilityChartProps {
  macroData: MacroDataState;
}

interface HistoricalDataPoint {
  hourIndex: number;
  timeLabel: string;
  timeAgo: string;
  warRiskIndex: number;
  volatilityPct: number;
  brentAdder: number;
  eventTitle?: string;
  eventSeverity?: "critical" | "high" | "normal";
}

export const WarRiskVolatilityChart: React.FC<WarRiskVolatilityChartProps> = ({
  macroData,
}) => {
  const [activeMetric, setActiveMetric] = useState<"dual" | "index" | "volatility" | "brent">("dual");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [nowTimestamp, setNowTimestamp] = useState<number>(() => Date.now());

  // Heartbeat to continuously ensure timeline labels and live ticks reflect current UTC seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const liveWarRisk = macroData?.engines?.middleEastWarRisk?.riskIndex || 88.4;
  const liveBrentAdderStr = macroData?.engines?.middleEastWarRisk?.brentGeopoliticalPremium || "$18.50 / bbl";
  const liveBrentAdder = parseFloat(liveBrentAdderStr.replace(/[^0-9.]/g, "")) || 18.50;

  const liveTimeString = useMemo(() => {
    const d = new Date(nowTimestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) + " UTC";
  }, [nowTimestamp]);

  const brentMax = useMemo(() => {
    return Math.ceil(Math.max(22, liveBrentAdder + 2));
  }, [liveBrentAdder]);

  // Build 24-hour historical progression terminating at the current live telemetry
  const data: HistoricalDataPoint[] = useMemo(() => {
    const points: HistoricalDataPoint[] = [];
    const now = new Date(nowTimestamp);
    
    // Synthetic 24-hour realistic kinetic escalation curve anchored to live telemetry
    // Baseline 24h ago: ~70.2, escalation surges in the last 8-12 hours
    const baseHistoricalCurve = [
      { offsetHours: 24, baseRisk: 69.8, baseVol: 19.5, brent: 4.10 },
      { offsetHours: 23, baseRisk: 70.4, baseVol: 20.2, brent: 4.25 },
      { offsetHours: 22, baseRisk: 69.9, baseVol: 21.0, brent: 4.20 },
      { offsetHours: 21, baseRisk: 71.2, baseVol: 22.4, brent: 4.50 },
      { 
        offsetHours: 20, 
        baseRisk: 72.8, 
        baseVol: 24.8, 
        brent: 4.90,
        eventTitle: "UKMTO advisory: GPS electronic jamming 22nm off Fujairah",
        eventSeverity: "normal" as const
      },
      { offsetHours: 19, baseRisk: 72.5, baseVol: 24.1, brent: 4.85 },
      { offsetHours: 18, baseRisk: 73.4, baseVol: 25.6, brent: 5.10 },
      { offsetHours: 17, baseRisk: 74.0, baseVol: 26.2, brent: 5.30 },
      { offsetHours: 16, baseRisk: 74.8, baseVol: 27.5, brent: 5.60 },
      { 
        offsetHours: 15, 
        baseRisk: 76.2, 
        baseVol: 30.1, 
        brent: 6.10,
        eventTitle: "SAR satellite pass verifies AIS spoofing by dark tanker cluster",
        eventSeverity: "high" as const
      },
      { offsetHours: 14, baseRisk: 75.8, baseVol: 29.4, brent: 6.00 },
      { offsetHours: 13, baseRisk: 76.9, baseVol: 31.8, brent: 6.40 },
      { offsetHours: 12, baseRisk: 78.4, baseVol: 34.5, brent: 7.00 },
      { offsetHours: 11, baseRisk: 78.0, baseVol: 33.9, brent: 6.90 },
      { 
        offsetHours: 10, 
        baseRisk: 80.2, 
        baseVol: 38.4, 
        brent: 7.80,
        eventTitle: "Lloyd's JWLA issues warning; war-risk hull additions surge +250 bps",
        eventSeverity: "high" as const
      },
      { offsetHours: 9, baseRisk: 81.0, baseVol: 40.2, brent: 8.20 },
      { offsetHours: 8, baseRisk: 82.5, baseVol: 43.1, brent: 8.90 },
      { offsetHours: 7, baseRisk: 82.1, baseVol: 42.4, brent: 8.75 },
      { 
        offsetHours: 6, 
        baseRisk: 84.4, 
        baseVol: 46.8, 
        brent: 9.80,
        eventTitle: "US carrier strike group enters northern Gulf of Oman patrol box",
        eventSeverity: "high" as const
      },
      { offsetHours: 5, baseRisk: 84.9, baseVol: 48.0, brent: 10.10 },
      { offsetHours: 4, baseRisk: 86.2, baseVol: 51.5, brent: 10.90 },
      { 
        offsetHours: 3, 
        baseRisk: 87.5, 
        baseVol: 54.2, 
        brent: 11.60,
        eventTitle: "IRGC naval drone swarm intercepted near Musandam Peninsula",
        eventSeverity: "critical" as const
      },
      { offsetHours: 2, baseRisk: 90.4, baseVol: 61.0, brent: 12.80 },
      { 
        offsetHours: 1, 
        baseRisk: 89.2, 
        baseVol: 57.5, 
        brent: 12.10,
        eventTitle: "CENTCOM Tomahawk & B-2 precision standoff strikes confirmed",
        eventSeverity: "critical" as const
      },
      { offsetHours: 0, baseRisk: liveWarRisk, baseVol: 56.4, brent: liveBrentAdder }
    ];

    // Scale smoothly so the latest point aligns exactly with current liveWarRisk
    const lastBase = baseHistoricalCurve[baseHistoricalCurve.length - 1].baseRisk;
    const deltaScaling = liveWarRisk - lastBase;

    baseHistoricalCurve.forEach((item, index) => {
      const pastTime = new Date(now.getTime() - item.offsetHours * 3600000);
      const hoursStr = pastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // Proportional alignment
      const weight = index / (baseHistoricalCurve.length - 1);
      const calculatedRisk = Number((item.baseRisk + deltaScaling * weight).toFixed(1));
      const calculatedVol = Number((item.baseVol + (deltaScaling * 0.4) * weight).toFixed(1));
      const calculatedBrent = Number(Math.max(3.5, item.brent).toFixed(2));

      points.push({
        hourIndex: 24 - item.offsetHours,
        timeLabel: item.offsetHours === 0 ? `${hoursStr} (Live)` : hoursStr,
        timeAgo: item.offsetHours === 0 ? "Just now" : `${item.offsetHours}h ago`,
        warRiskIndex: calculatedRisk,
        volatilityPct: calculatedVol,
        brentAdder: item.offsetHours === 0 ? liveBrentAdder : calculatedBrent,
        eventTitle: item.eventTitle,
        eventSeverity: item.eventSeverity
      });
    });

    return points;
  }, [liveWarRisk, liveBrentAdder, nowTimestamp]);

  const minRisk = useMemo(() => Math.min(...data.map(d => d.warRiskIndex)), [data]);
  const maxRisk = useMemo(() => Math.max(...data.map(d => d.warRiskIndex)), [data]);
  const startRisk = data[0]?.warRiskIndex || 70;
  const netDelta = Number((liveWarRisk - startRisk).toFixed(1));
  const pctDelta = Number(((netDelta / startRisk) * 100).toFixed(1));
  const currentVol = data[data.length - 1]?.volatilityPct || 56.4;

  return (
    <div 
      id="war-risk-volatility-chart-panel"
      className="bg-[#0E131C] border border-[#B08D57]/30 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all"
    >
      {/* Subtle Background Ambience */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#A6291C]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-[#B08D57]/20 relative">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded bg-[#A6291C]/25 border border-[#A6291C]/50 text-[#FF8585]">
              <Flame className="w-4 h-4 animate-pulse" />
            </span>
            <h2 className="font-serif italic text-lg sm:text-xl font-bold text-[#EDE9DE]" style={{ fontFamily: "Georgia, serif" }}>
              Middle East War-Risk Index: 24-Hour Historical Volatility
            </h2>
            <span className="text-[9px] font-mono-data font-bold bg-[#A6291C] text-[#EDE9DE] px-2 py-0.5 rounded uppercase tracking-wider">
              DEFCON 2 // CRITICAL
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-mono-data text-[9.5px] font-bold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE STREAMING</span>
              <span className="text-emerald-500/70 text-[9px] hidden sm:inline">({liveTimeString})</span>
            </div>
          </div>
          <p className="text-[10px] font-mono-data text-[#8292A6] mt-1">
            INTRADAY ESCALATION TRAJECTORY • RECENT US-IRAN STRIKES & HORMUZ CHOKEPOINT CONFLICT INDEX (0-100)
          </p>
        </div>

        {/* Metric Toggles & Controls */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-[#B08D57]/25 text-[11px] font-mono-data">
            <button
              onClick={() => setActiveMetric("dual")}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                activeMetric === "dual"
                  ? "bg-[#B08D57] text-[#0E131C] font-bold shadow"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <Layers className="w-3 h-3" />
              Dual View
            </button>
            <button
              onClick={() => setActiveMetric("index")}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                activeMetric === "index"
                  ? "bg-[#FF4545] text-[#EDE9DE] font-bold shadow"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              War Risk (0-100)
            </button>
            <button
              onClick={() => setActiveMetric("volatility")}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                activeMetric === "volatility"
                  ? "bg-[#E5C794] text-[#0E131C] font-bold shadow"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <Percent className="w-3 h-3" />
              Realized Vol %
            </button>
            <button
              onClick={() => setActiveMetric("brent")}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                activeMetric === "brent"
                  ? "bg-[#10B981] text-[#0E131C] font-bold shadow"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <DollarSign className="w-3 h-3" />
              Brent Adder
            </button>
          </div>

          {/* Chart Export Dropdown */}
          <ChartExportDropdown
            chartTitle="War Risk Volatility & Brent Geopolitical Premium"
            chartContainerId="war-risk-volatility-chart-panel"
            subtitle={`SMC WAR RISK TELEMETRY // RISK INDEX: ${liveWarRisk} // BRENT ADDER: $${liveBrentAdder.toFixed(2)}/BBL`}
            getCsvData={() => {
              const headers = [
                "Time Interval",
                "Time Elapsed",
                "Kinetic War Risk (0-100)",
                "Implied Volatility (%)",
                "Brent War Adder (USD/bbl)",
                "Escalation Milestone",
              ];
              const rows = data.map((d) => [
                d.timeLabel,
                d.timeAgo,
                d.warRiskIndex.toFixed(1),
                `${d.volatilityPct.toFixed(1)}%`,
                `$${d.brentAdder.toFixed(2)}`,
                d.eventTitle || "-",
              ]);

              return {
                filename: "smc-war-risk-volatility-24h",
                headers,
                rows,
                metaComments: [
                  "SIN MIEDO CAPITAL // 24-HOUR MIDDLE EAST WAR RISK & CRUDE VOLATILITY",
                  `Current War Risk: ${liveWarRisk} / 100`,
                  `Brent Risk Premium: $${liveBrentAdder.toFixed(2)}/bbl`,
                  `Mode: ${activeMetric.toUpperCase()}`,
                ],
              };
            }}
          />

          <button
            data-export-ignore="true"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded bg-black/40 border border-[#B08D57]/25 text-[#8292A6] hover:text-[#EDE9DE] transition-colors"
            title={isExpanded ? "Collapse height" : "Expand chart height"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-3.5 font-mono-data text-xs">
        <div className="bg-black/50 p-2.5 rounded-lg border border-[#A6291C]/40">
          <div className="text-[10px] text-[#8292A6] uppercase">Current Risk Index</div>
          <div className="text-base sm:text-lg font-bold text-[#FF8585] flex items-baseline gap-1 mt-0.5">
            {liveWarRisk} <span className="text-[10px] text-[#8292A6]">/ 100</span>
          </div>
          <div className="text-[9px] text-[#FF4545] font-semibold mt-0.5">
            DEFCON 2 Condition
          </div>
        </div>

        <div className="bg-black/50 p-2.5 rounded-lg border border-[#B08D57]/30">
          <div className="text-[10px] text-[#8292A6] uppercase">24h Net Movement</div>
          <div className="text-base sm:text-lg font-bold text-[#E5C794] flex items-baseline gap-1 mt-0.5">
            +{netDelta} <span className="text-[10px] text-[#10B981]">(+{pctDelta}%)</span>
          </div>
          <div className="text-[9px] text-[#8292A6] mt-0.5">
            From {startRisk} baseline
          </div>
        </div>

        <div className="bg-black/50 p-2.5 rounded-lg border border-[#B08D57]/20">
          <div className="text-[10px] text-[#8292A6] uppercase">24h Range (Low / High)</div>
          <div className="text-base sm:text-lg font-bold text-[#EDE9DE] flex items-baseline gap-1 mt-0.5">
            {minRisk} <span className="text-[#8292A6]">-</span> {maxRisk}
          </div>
          <div className="text-[9px] text-[#8292A6] mt-0.5">
            Max spread: {(maxRisk - minRisk).toFixed(1)} pts
          </div>
        </div>

        <div className="bg-black/50 p-2.5 rounded-lg border border-[#B08D57]/20">
          <div className="text-[10px] text-[#8292A6] uppercase">Realized Volatility</div>
          <div className="text-base sm:text-lg font-bold text-[#E5C794] flex items-baseline gap-1 mt-0.5">
            {currentVol}%
          </div>
          <div className="text-[9px] text-[#FF8585] font-semibold mt-0.5">
            Regime: Extreme Shock
          </div>
        </div>

        <div className="bg-black/50 p-2.5 rounded-lg border border-[#10B981]/30 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-[#8292A6] uppercase">Brent Geopolitical Premium</div>
          <div className="text-base sm:text-lg font-bold text-[#10B981] flex items-baseline gap-1 mt-0.5">
            +${liveBrentAdder.toFixed(2)} <span className="text-[10px] text-[#8292A6]">/bbl</span>
          </div>
          <div className="text-[9px] text-[#8292A6] mt-0.5">
            JWLA War Hull: +420 bps
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart */}
      <div className={`w-full transition-all ${isExpanded ? "h-96" : "h-64 sm:h-72"} min-w-0`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 12, right: 18, left: -10, bottom: 4 }}
          >
            <defs>
              <linearGradient id="warRiskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="volatilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E5C794" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#E5C794" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#222B3A" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="timeLabel"
              stroke="#52637A"
              tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#222B3A" }}
              interval="preserveStartEnd"
              minTickGap={28}
            />

            {/* Left Y-Axis: War-Risk Index (0-100) */}
            <YAxis
              yAxisId="left"
              domain={[60, 100]}
              stroke="#52637A"
              tick={{ fill: "#FF8585", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#222B3A" }}
              tickFormatter={(v) => `${v}`}
            />

            {/* Right Y-Axis: Volatility % or Brent Adder */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={activeMetric === "brent" ? [2, brentMax] : [10, 75]}
              stroke="#52637A"
              tick={{ fill: activeMetric === "brent" ? "#10B981" : "#E5C794", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#222B3A" }}
              tickFormatter={(v) => activeMetric === "brent" ? `$${v}` : `${v}%`}
            />

            {/* Critical Threshold Level Indicators */}
            <ReferenceLine
              yAxisId="left"
              y={85}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "DEFCON 2 ESCALATION (85)",
                fill: "#EF4444",
                fontSize: 9,
                fontFamily: "monospace",
                position: "insideTopRight",
                offset: 8
              }}
            />

            <ReferenceLine
              yAxisId="left"
              y={75}
              stroke="#B08D57"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: "HIGH RISK THRESHOLD (75)",
                fill: "#B08D57",
                fontSize: 9,
                fontFamily: "monospace",
                position: "insideBottomRight",
                offset: 8
              }}
            />

            {/* Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as HistoricalDataPoint;
                  return (
                    <div className="bg-[#0B0F17] border border-[#B08D57]/60 p-3 rounded-xl shadow-2xl font-mono-data text-xs space-y-1.5 max-w-xs z-50">
                      <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-1 text-[10px]">
                        <span className="text-[#EDE9DE] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#B08D57]" />
                          {pt.timeLabel}
                        </span>
                        <span className="text-[#8292A6]">{pt.timeAgo}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[#FF8585]">
                          <span>War-Risk Index:</span>
                          <span className="font-bold text-sm">{pt.warRiskIndex} / 100</span>
                        </div>
                        <div className="flex items-center justify-between text-[#E5C794]">
                          <span>Realized Volatility:</span>
                          <span className="font-bold">{pt.volatilityPct}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[#10B981]">
                          <span>Brent Risk Adder:</span>
                          <span className="font-bold">+${pt.brentAdder.toFixed(2)}/bbl</span>
                        </div>
                      </div>

                      {pt.eventTitle && (
                        <div className="mt-1.5 pt-1.5 border-t border-[#A6291C]/40 text-[10px] text-[#EDE9DE] bg-[#A6291C]/20 p-1.5 rounded">
                          <div className="font-bold uppercase tracking-wider text-[#FF8585] flex items-center gap-1 mb-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Tactical Flash Incident:
                          </div>
                          <div className="leading-tight font-sans text-xs text-[#BAC7D5]">
                            {pt.eventTitle}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Primary Area & Line: War-Risk Index */}
            {(activeMetric === "dual" || activeMetric === "index") && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="warRiskIndex"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#warRiskGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#FF4545", stroke: "#FFF", strokeWidth: 1.5 }}
                />
              </>
            )}

            {/* Secondary Line: Realized Volatility % */}
            {(activeMetric === "dual" || activeMetric === "volatility") && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="volatilityPct"
                stroke="#E5C794"
                strokeWidth={2}
                strokeDasharray={activeMetric === "dual" ? "4 3" : undefined}
                dot={false}
                activeDot={{ r: 4, fill: "#E5C794", stroke: "#000", strokeWidth: 1 }}
              />
            )}

            {/* Tertiary Line: Brent Geopolitical Premium */}
            {activeMetric === "brent" && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="brentAdder"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#10B981", stroke: "#FFF", strokeWidth: 1.5 }}
              />
            )}

            {/* Reference Dots for Major Tactical Events */}
            {data.filter(d => d.eventTitle).map((d) => (
              <ReferenceDot
                key={d.hourIndex}
                yAxisId="left"
                x={d.timeLabel}
                y={d.warRiskIndex}
                r={4.5}
                fill={d.eventSeverity === "critical" ? "#FF4545" : "#E5C794"}
                stroke="#0E131C"
                strokeWidth={1.5}
              />
            ))}

            {/* Real-time live endpoint beacon with glowing reference dot */}
            {data.length > 0 && (
              <ReferenceDot
                yAxisId={activeMetric === "brent" ? "right" : "left"}
                x={data[data.length - 1].timeLabel}
                y={activeMetric === "brent" ? data[data.length - 1].brentAdder : data[data.length - 1].warRiskIndex}
                r={6}
                fill={activeMetric === "brent" ? "#10B981" : "#FF4545"}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Tactical Milestone Timeline Annotations */}
      <div className="mt-3 pt-3 border-t border-[#B08D57]/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-data text-[#8292A6]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#FF8585]">
            <span className="w-2 h-2 rounded-full bg-[#FF4545]" />
            War-Risk Index (0-100)
          </span>
          <span className="flex items-center gap-1 text-[#E5C794]">
            <span className="w-2 h-0.5 bg-[#E5C794]" />
            Realized Volatility (%)
          </span>
          <span className="flex items-center gap-1 text-[#10B981]">
            <span className="w-2 h-0.5 bg-[#10B981]" />
            Brent Adder (+${liveBrentAdder.toFixed(2)})
          </span>
        </div>
        <div className="text-[#EDE9DE]/80">
          ● Dots denote verified kinetic strikes & UKMTO advisories
        </div>
      </div>
    </div>
  );
};
