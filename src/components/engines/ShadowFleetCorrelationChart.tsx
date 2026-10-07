import React, { useState, useEffect } from "react";

export interface MonthlyCorrelationPoint {
  month: string;
  displayMonth: string;
  crudePrice: number; // in $/bbl (e.g. 54.2 to 81.5)
  iranWealth: number; // in $B (up to 77.0)
  russiaIndiaWealth: number; // in $B (up to 62.4B)
  cumulativeWealth: number; // in $B (Combined: up to 139.4B)
  milestone?: string;
  flowBpd?: string;
  russiaFlowBpd?: string;
}

export const correlation24mData: MonthlyCorrelationPoint[] = [
  { month: "2024-09", displayMonth: "09/24", crudePrice: 54.2, iranWealth: 5.2, russiaIndiaWealth: 3.8, cumulativeWealth: 9.0, milestone: "G7 price cap evasion expands; Russia-to-India shadow fleet hits 80% share", flowBpd: "1.42M bpd", russiaFlowBpd: "1.52M bpd" },
  { month: "2024-10", displayMonth: "10/24", crudePrice: 56.8, iranWealth: 8.4, russiaIndiaWealth: 6.9, cumulativeWealth: 15.3, flowBpd: "1.45M bpd", russiaFlowBpd: "1.54M bpd" },
  { month: "2024-11", displayMonth: "11/24", crudePrice: 55.4, iranWealth: 11.6, russiaIndiaWealth: 9.9, cumulativeWealth: 21.5, flowBpd: "1.44M bpd", russiaFlowBpd: "1.53M bpd" },
  { month: "2024-12", displayMonth: "12/24", crudePrice: 58.2, iranWealth: 15.0, russiaIndiaWealth: 13.1, cumulativeWealth: 28.1, milestone: "Red Sea crisis begins; Russian Urals reroutes around Cape, Greek STS expands", flowBpd: "1.48M bpd", russiaFlowBpd: "1.56M bpd" },
  { month: "2025-01", displayMonth: "01/25", crudePrice: 61.5, iranWealth: 18.5, russiaIndiaWealth: 16.5, cumulativeWealth: 35.0, flowBpd: "1.50M bpd", russiaFlowBpd: "1.58M bpd" },
  { month: "2025-02", displayMonth: "02/25", crudePrice: 63.2, iranWealth: 22.1, russiaIndiaWealth: 20.0, cumulativeWealth: 42.1, flowBpd: "1.52M bpd", russiaFlowBpd: "1.59M bpd" },
  { month: "2025-03", displayMonth: "03/25", crudePrice: 66.4, iranWealth: 26.0, russiaIndiaWealth: 23.7, cumulativeWealth: 49.7, milestone: "Riau & Lakonikos STS consolidation; Russian crude to India hits 85% shadow share", flowBpd: "1.55M bpd", russiaFlowBpd: "1.60M bpd" },
  { month: "2025-04", displayMonth: "04/25", crudePrice: 69.1, iranWealth: 30.1, russiaIndiaWealth: 27.6, cumulativeWealth: 57.7, flowBpd: "1.58M bpd", russiaFlowBpd: "1.62M bpd" },
  { month: "2025-05", displayMonth: "05/25", crudePrice: 67.2, iranWealth: 34.0, russiaIndiaWealth: 31.4, cumulativeWealth: 65.4, flowBpd: "1.56M bpd", russiaFlowBpd: "1.61M bpd" },
  { month: "2025-06", displayMonth: "06/25", crudePrice: 70.8, iranWealth: 38.3, russiaIndiaWealth: 35.4, cumulativeWealth: 73.7, milestone: "AED Dirham & INR Vostro de-dollarized settlement reaches 90% of India-Russia trade", flowBpd: "1.60M bpd", russiaFlowBpd: "1.63M bpd" },
  { month: "2025-07", displayMonth: "07/25", crudePrice: 71.9, iranWealth: 42.6, russiaIndiaWealth: 39.5, cumulativeWealth: 82.1, flowBpd: "1.61M bpd", russiaFlowBpd: "1.64M bpd" },
  { month: "2025-08", displayMonth: "08/25", crudePrice: 71.1, iranWealth: 46.8, russiaIndiaWealth: 43.5, cumulativeWealth: 90.3, flowBpd: "1.59M bpd", russiaFlowBpd: "1.62M bpd" },
  { month: "2025-09", displayMonth: "09/25", crudePrice: 73.4, iranWealth: 51.2, russiaIndiaWealth: 47.7, cumulativeWealth: 98.9, flowBpd: "1.62M bpd", russiaFlowBpd: "1.64M bpd" },
  { month: "2025-10", displayMonth: "10/25", crudePrice: 74.8, iranWealth: 55.7, russiaIndiaWealth: 52.0, cumulativeWealth: 107.7, milestone: "Dual-theater dark fleet sharing verified: 68 tankers alternate between Baltic & Kharg", flowBpd: "1.63M bpd", russiaFlowBpd: "1.65M bpd" },
  { month: "2025-11", displayMonth: "11/25", crudePrice: 73.9, iranWealth: 60.1, russiaIndiaWealth: 56.2, cumulativeWealth: 116.3, flowBpd: "1.60M bpd", russiaFlowBpd: "1.64M bpd" },
  { month: "2025-12", displayMonth: "12/25", crudePrice: 75.3, iranWealth: 64.6, russiaIndiaWealth: 60.5, cumulativeWealth: 125.1, flowBpd: "1.62M bpd", russiaFlowBpd: "1.65M bpd" },
  { month: "2026-01", displayMonth: "01/26", crudePrice: 77.2, iranWealth: 69.2, russiaIndiaWealth: 65.0, cumulativeWealth: 134.2, milestone: "Russia-India shadow fleet reaches structural peak: 88.0% of all Indian seaborne imports", flowBpd: "1.64M bpd", russiaFlowBpd: "1.66M bpd" },
  { month: "2026-02", displayMonth: "02/26", crudePrice: 79.1, iranWealth: 73.8, russiaIndiaWealth: 69.6, cumulativeWealth: 143.4, flowBpd: "1.65M bpd", russiaFlowBpd: "1.67M bpd" },
  { month: "2026-03", displayMonth: "03/26", crudePrice: 81.5, iranWealth: 78.6, russiaIndiaWealth: 74.4, cumulativeWealth: 153.0, milestone: "Peak geopolitical risk premium; Persian Gulf & Baltic export discounts compress", flowBpd: "1.68M bpd", russiaFlowBpd: "1.68M bpd" },
  { month: "2026-04", displayMonth: "04/26", crudePrice: 79.4, iranWealth: 77.8, russiaIndiaWealth: 72.8, cumulativeWealth: 150.6, flowBpd: "1.66M bpd", russiaFlowBpd: "1.67M bpd" },
  { month: "2026-05", displayMonth: "05/26", crudePrice: 77.5, iranWealth: 77.2, russiaIndiaWealth: 70.2, cumulativeWealth: 147.4, flowBpd: "1.63M bpd", russiaFlowBpd: "1.65M bpd" },
  { month: "2026-06", displayMonth: "06/26", crudePrice: 76.8, iranWealth: 76.8, russiaIndiaWealth: 67.5, cumulativeWealth: 144.3, milestone: "Automated circle-drift AIS spoofing adopted across Baltic & Persian Gulf fleets", flowBpd: "1.62M bpd", russiaFlowBpd: "1.65M bpd" },
  { month: "2026-07", displayMonth: "07/26", crudePrice: 76.2, iranWealth: 76.5, russiaIndiaWealth: 65.0, cumulativeWealth: 141.5, flowBpd: "1.62M bpd", russiaFlowBpd: "1.65M bpd" },
  { month: "2026-08", displayMonth: "08/26", crudePrice: 75.4, iranWealth: 77.0, russiaIndiaWealth: 62.4, cumulativeWealth: 139.4, milestone: "$139.4B Dual-Corridor Shadow Revenue ($77.0B Iran + $62.4B Russia to India)", flowBpd: "1.62M bpd", russiaFlowBpd: "1.65M bpd" }
];

interface ShadowFleetCorrelationChartProps {
  isExpanded?: boolean;
  externalCorridor?: "all" | "iran" | "russia" | "syndicate";
}

export type CorrelationCorridor = "combined" | "iran" | "russia";

export const ShadowFleetCorrelationChart: React.FC<ShadowFleetCorrelationChartProps> = ({
  isExpanded = false,
  externalCorridor = "all",
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [corridorView, setCorridorView] = useState<CorrelationCorridor>(() => {
    if (externalCorridor === "iran") return "iran";
    if (externalCorridor === "russia") return "russia";
    return "combined";
  });

  // Keep internal corridor view synchronized whenever external corridor changes
  useEffect(() => {
    if (externalCorridor === "iran") {
      setCorridorView("iran");
    } else if (externalCorridor === "russia") {
      setCorridorView("russia");
    } else {
      setCorridorView("combined");
    }
  }, [externalCorridor]);

  // SVG coordinate dimensions with generous padding to prevent any clipping of text or axes
  const width = 900;
  const height = isExpanded ? 440 : 380;
  const paddingLeft = 65;
  const paddingRight = 80;
  const paddingTop = 32;
  const paddingBottom = 55;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scales
  // Price: $50 to $100
  const minPrice = 50;
  const maxPrice = 100;
  const priceRange = maxPrice - minPrice;

  // Wealth max depending on view
  const maxWealth = corridorView === "combined" ? 160 : 85;
  const minWealth = 0;
  const wealthRange = maxWealth - minWealth;

  const getWealthVal = (d: MonthlyCorrelationPoint) => {
    if (corridorView === "iran") return d.iranWealth;
    if (corridorView === "russia") return d.russiaIndiaWealth;
    return d.cumulativeWealth;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (correlation24mData.length - 1)) * chartWidth;
  };

  const getYPrice = (price: number) => {
    const norm = (price - minPrice) / priceRange;
    return paddingTop + chartHeight - norm * chartHeight;
  };

  const getYWealth = (wealth: number) => {
    const norm = Math.min(1, Math.max(0, (wealth - minWealth) / wealthRange));
    return paddingTop + chartHeight - norm * chartHeight;
  };

  // Build price line path and wealth line path
  const pricePoints = correlation24mData.map((d, i) => `${getX(i)},${getYPrice(d.crudePrice)}`);
  const pricePath = `M ${pricePoints.join(" L ")}`;

  const wealthPoints = correlation24mData.map((d, i) => `${getX(i)},${getYWealth(getWealthVal(d))}`);
  const wealthPath = `M ${wealthPoints.join(" L ")}`;

  // Area paths for subtle glowing fills
  const priceAreaPath = `${pricePath} L ${getX(correlation24mData.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;
  const wealthAreaPath = `${wealthPath} L ${getX(correlation24mData.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  // Filtered X-axis ticks to display with clean spacing
  const displayTickIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 23];

  const priceYGridTicks = [50, 60, 70, 80, 90, 100];
  const wealthYGridTicks = corridorView === "combined" ? [0, 40, 80, 120, 160] : [0, 20, 40, 60, 80];

  const activePoint = hoveredIdx !== null ? correlation24mData[hoveredIdx] : null;

  // Active metrics based on corridor
  const kpiCumulative = corridorView === "combined" ? "$139.4B" : corridorView === "iran" ? "$77.0B" : "$62.4B";
  const kpiSublabel = corridorView === "combined" ? "Iran $77.0B + Russia/India $62.4B" : corridorView === "iran" ? "CIPS / RMB / Gold Net" : "AED Dirhams & INR Vostro (88%)";
  const kpiMonthly = corridorView === "combined" ? "$5.81B" : corridorView === "iran" ? "$3.21B" : "$2.60B";
  const kpiBpd = corridorView === "combined" ? "~3.27M bpd combined" : corridorView === "iran" ? "~1.62M bpd" : "~1.65M bpd (88% share)";

  return (
    <div className="space-y-4">
      {/* Corridor Scope Selector for the Chart */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 border border-[#B08D57]/30 rounded-lg p-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B08D57] animate-pulse" />
          <span className="text-[10px] font-mono-data text-[#E5C794] uppercase tracking-wider font-bold">
            24M Sanctions Revenue Correlation Scope:
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono-data text-[10px]">
          <button
            onClick={() => setCorridorView("combined")}
            className={`px-2.5 py-1 rounded transition-all uppercase font-medium ${
              corridorView === "combined"
                ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md"
                : "text-[#BAC7D5] hover:text-[#EDE9DE] bg-black/40 border border-[#B08D57]/20"
            }`}
          >
            Dual-Corridor Combined ($139.4B)
          </button>
          <button
            onClick={() => setCorridorView("iran")}
            className={`px-2.5 py-1 rounded transition-all uppercase font-medium ${
              corridorView === "iran"
                ? "bg-[#10B981] text-[#0A111C] font-bold shadow-md"
                : "text-[#BAC7D5] hover:text-[#EDE9DE] bg-black/40 border border-[#B08D57]/20"
            }`}
          >
            Iran Corridor ($77.0B)
          </button>
          <button
            onClick={() => setCorridorView("russia")}
            className={`px-2.5 py-1 rounded transition-all uppercase font-medium ${
              corridorView === "russia"
                ? "bg-[#EF4444] text-white font-bold shadow-md"
                : "text-[#BAC7D5] hover:text-[#EDE9DE] bg-black/40 border border-[#B08D57]/20"
            }`}
          >
            Russia ↔ India Corridor ($62.4B / 88%)
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Pearson Correlation (R) */}
        <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-3 sm:p-3.5 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium truncate">
            PEARSON CORRELATION (R)
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#10B981] leading-tight truncate">
              +0.983
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
              <span className="text-[#10B981] font-semibold truncate">Strong Direct</span>
              <span className="text-[#8292A6] truncate">R-Score</span>
            </div>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 truncate">
            Price ↔ Inflow Velocity
          </div>
        </div>

        {/* 2. 24M Cumulative Inflow */}
        <div className="bg-black/50 border border-[#B08D57]/45 rounded-lg p-3 sm:p-3.5 relative shadow-[0_0_15px_rgba(176,141,87,0.15)] flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="text-[10px] font-mono-data text-[#E5C794] uppercase tracking-wider font-medium truncate">
            24M CUMULATIVE INFLOW
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#E5C794] leading-tight truncate">
              {kpiCumulative}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
              <span className="text-[#B08D57] font-semibold truncate">Cumulative Net</span>
              <span className="text-[#EDE9DE]/70 truncate">24 Months</span>
            </div>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/20 pt-1 truncate">
            {kpiSublabel}
          </div>
        </div>

        {/* 3. 24M Realized Price Delta */}
        <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-3 sm:p-3.5 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium truncate">
            24M REALIZED PRICE DELTA
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#10B981] leading-tight truncate">
              +$21.20
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
              <span className="text-[#10B981] font-semibold truncate">+39.1% Growth</span>
              <span className="text-[#8292A6] font-mono truncate">$54.2 → $75.4</span>
            </div>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 truncate">
            Sanctioned Netback Realization
          </div>
        </div>

        {/* 4. Avg Monthly Intake */}
        <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-3 sm:p-3.5 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium truncate">
            AVG MONTHLY INTAKE
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-bold font-mono-data text-[#EDE9DE] leading-tight truncate">
              {kpiMonthly}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
              <span className="text-[#8292A6] truncate">per month</span>
              <span className="text-[#B08D57] font-semibold truncate">{kpiBpd}</span>
            </div>
          </div>
          <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 truncate">
            Dark Fleet Velocity
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="bg-[#0E1A2B]/90 border border-[#B08D57]/20 rounded-lg p-3 sm:p-5 relative shadow-inner">
        {/* Hover Tooltip Overlay with smart directional flip to prevent any clipping */}
        {activePoint && hoveredIdx !== null && (() => {
          const xPct = (getX(hoveredIdx) / width) * 100;
          const isRightSide = xPct > 52;

          return (
            <div
              className="absolute z-30 pointer-events-none bg-[#131720]/95 backdrop-blur-sm border border-[#B08D57]/50 rounded-lg p-3 shadow-2xl font-mono-data text-xs max-w-[310px] sm:max-w-xs w-max transition-transform duration-75"
              style={{
                left: `${xPct}%`,
                transform: isRightSide ? "translateX(calc(-100% - 14px))" : "translateX(14px)",
                top: "14px",
              }}
            >
              <div className="text-[#B08D57] font-bold border-b border-[#B08D57]/25 pb-1 mb-1.5 flex items-center justify-between gap-4">
                <span className="text-[12px]">{activePoint.displayMonth} ({activePoint.month})</span>
                <span className="text-[#8292A6] text-[10px] bg-black/60 px-1.5 py-0.5 rounded border border-[#B08D57]/20">
                  {corridorView === "russia" ? activePoint.russiaFlowBpd : activePoint.flowBpd}
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[#10B981] font-medium">Sanctioned Price:</span>
                  <span className="text-[#EDE9DE] font-bold">${activePoint.crudePrice.toFixed(2)}/bbl</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[#E5C794] font-medium">
                    {corridorView === "combined" ? "Combined Dark Wealth:" : corridorView === "iran" ? "Iran Cumulative Wealth:" : "Russia → India Wealth:"}
                  </span>
                  <span className="text-[#E5C794] font-bold">
                    ${getWealthVal(activePoint).toFixed(1)}B
                  </span>
                </div>
                {corridorView === "combined" && (
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-[#8292A6] pt-1 border-t border-[#B08D57]/15">
                    <div>Iran: <span className="text-[#10B981] font-bold">${activePoint.iranWealth.toFixed(1)}B</span></div>
                    <div>Russia/India: <span className="text-[#EF4444] font-bold">${activePoint.russiaIndiaWealth.toFixed(1)}B</span></div>
                  </div>
                )}
                {activePoint.milestone && (
                  <div className="text-[#F59E0B] text-[10px] pt-1.5 border-t border-[#B08D57]/20 mt-1 leading-snug whitespace-normal break-words">
                    ◆ {activePoint.milestone}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div className="w-full overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-full h-auto select-none font-mono-data block min-w-[500px] sm:min-w-0"
          >
            <defs>
              {/* Gradient for Cumulative Wealth */}
              <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B08D57" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#B08D57" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradient for Crude Price */}
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines - Horizontal */}
            {priceYGridTicks.map((val) => {
              const y = getYPrice(val);
              return (
                <g key={`grid-${val}`}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#222C3D"
                    strokeWidth="1"
                    strokeDasharray={val === minPrice ? "none" : "3,3"}
                  />
                  {/* Left Axis Tick Text: CRUDE PRICE ($/BBL) */}
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#10B981"
                    fontSize="10"
                    fontWeight="500"
                  >
                    ${val}
                  </text>
                </g>
              );
            })}

            {/* Right Axis Tick Text & Ticks: CUMULATIVE WEALTH ($B) */}
            {wealthYGridTicks.map((val) => {
              const y = getYWealth(val);
              return (
                <g key={`wealth-tick-grp-${val}`}>
                  <line
                    x1={width - paddingRight}
                    y1={y}
                    x2={width - paddingRight + 4}
                    y2={y}
                    stroke="#B08D57"
                    strokeWidth="1"
                  />
                  <text
                    x={width - paddingRight + 8}
                    y={y + 4}
                    textAnchor="start"
                    fill="#E5C794"
                    fontSize="10"
                    fontWeight="500"
                  >
                    ${val}B
                  </text>
                </g>
              );
            })}

            {/* Area Fills */}
            <path d={wealthAreaPath} fill="url(#wealthGradient)" />
            <path d={priceAreaPath} fill="url(#priceGradient)" />

            {/* Lines */}
            <path
              d={wealthPath}
              fill="none"
              stroke="#B08D57"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pricePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="4,3"
              strokeLinecap="round"
            />

            {/* Data Points */}
            {correlation24mData.map((d, i) => {
              const cx = getX(i);
              const cyWealth = getYWealth(getWealthVal(d));
              const cyPrice = getYPrice(d.crudePrice);
              const isHovered = hoveredIdx === i;

              return (
                <g key={`point-${i}`} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                  {/* Invisible hit box for comfortable hovering */}
                  <rect
                    x={cx - 14}
                    y={paddingTop}
                    width={28}
                    height={chartHeight}
                    fill="transparent"
                  />

                  {/* Vertical Guide Line on Hover */}
                  {isHovered && (
                    <line
                      x1={cx}
                      y1={paddingTop}
                      x2={cx}
                      y2={paddingTop + chartHeight}
                      stroke="#B08D57"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                      opacity="0.75"
                    />
                  )}

                  {/* Wealth Circle */}
                  <circle
                    cx={cx}
                    cy={cyWealth}
                    r={isHovered ? 5.5 : 3}
                    fill="#101622"
                    stroke="#B08D57"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                  />

                  {/* Price Circle */}
                  <circle
                    cx={cx}
                    cy={cyPrice}
                    r={isHovered ? 4.5 : 2.5}
                    fill="#101622"
                    stroke="#10B981"
                    strokeWidth={isHovered ? 2 : 1}
                  />

                  {/* Milestone Marker Diamond */}
                  {d.milestone && (
                    <polygon
                      points={`${cx},${cyWealth - 8} ${cx + 4},${cyWealth - 4} ${cx},${cyWealth} ${cx - 4},${cyWealth - 4}`}
                      fill="#F59E0B"
                      stroke="#0E1A2B"
                      strokeWidth="1"
                    />
                  )}
                </g>
              );
            })}

            {/* X-Axis Horizontal Base Line */}
            <line
              x1={paddingLeft}
              y1={paddingTop + chartHeight}
              x2={width - paddingRight}
              y2={paddingTop + chartHeight}
              stroke="#222C3D"
              strokeWidth="1.5"
            />

            {/* X-Axis Date Labels */}
            {displayTickIndices.map((idx) => {
              const d = correlation24mData[idx];
              if (!d) return null;
              const x = getX(idx);
              const y = paddingTop + chartHeight;
              return (
                <g key={`xtick-${idx}`}>
                  <line x1={x} y1={y} x2={x} y2={y + 5} stroke="#8292A6" strokeWidth="1" />
                  <text
                    x={x}
                    y={y + 18}
                    textAnchor="middle"
                    fill="#8292A6"
                    fontSize="10"
                  >
                    {d.displayMonth}
                  </text>
                </g>
              );
            })}

            {/* Axis Title Labels */}
            {/* Left Axis Title: Crude Price */}
            <text
              x={paddingLeft - 32}
              y={paddingTop - 12}
              textAnchor="start"
              fill="#10B981"
              fontSize="9.5"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              CRUDE PRICE ($/BBL)
            </text>

            {/* Right Axis Title: Cumulative Wealth */}
            <text
              x={width - paddingRight + 6}
              y={paddingTop - 12}
              textAnchor="start"
              fill="#E5C794"
              fontSize="9.5"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              {corridorView === "combined" ? "COMBINED WEALTH ($B)" : corridorView === "iran" ? "IRAN CUMULATIVE ($B)" : "RUSSIA-INDIA INTAKE ($B)"}
            </text>
          </svg>
        </div>

        {/* Bottom Legend Row */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono-data pt-3 mt-2 border-t border-[#B08D57]/15 text-[#8292A6]">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-[#10B981] inline-block" />
              <span className="text-[#10B981]">Sanctioned Crude Spot ($/bbl)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-[#B08D57] inline-block" />
              <span className="text-[#E5C794]">Cumulative Sanction Inflow ($B USD)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#F59E0B] text-[11px]">
            <span>◆</span>
            <span>Geopolitical Dark Fleet Milestone</span>
          </div>
        </div>
      </div>
    </div>
  );
};
